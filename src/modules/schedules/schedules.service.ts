import { Model } from 'mongoose';
import { IStation } from '../../models/Station';
import { ISchedule } from '../../models/Schedule';
import { AppError } from '../../utils/AppError';

/** Number of upcoming departure times to return by default */
const DEFAULT_UPCOMING_COUNT = 6;

class SchedulesService {
  private StationModel: Model<IStation>;
  private ScheduleModel: Model<ISchedule>;

  constructor({
    StationModel,
    ScheduleModel,
  }: {
    StationModel: Model<IStation>;
    ScheduleModel: Model<ISchedule>;
  }) {
    this.StationModel = StationModel;
    this.ScheduleModel = ScheduleModel;
  }

  /**
   * Get the current time in Asia/Jakarta (WIB, UTC+7) as "HH:mm".
   */
  private getJakartaTime(): { timeStr: string; dayOfWeek: number } {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const timeStr = formatter.format(now); // "HH:mm"

    // Get the day of week in Jakarta timezone
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
    });
    const dayStr = dayFormatter.format(now); // "Mon", "Tue", …, "Sat", "Sun"
    const dayMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    const dayOfWeek = dayMap[dayStr] ?? new Date().getDay();

    return { timeStr, dayOfWeek };
  }

  /**
   * Determine dayType from the day of the week.
   */
  private inferDayType(dayOfWeek: number): 'weekday' | 'weekend' {
    return dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday';
  }

  /**
   * Find the next departure and upcoming departures from a sorted list of "HH:mm" times.
   */
  private computeDepartures(
    departures: string[],
    currentTime: string,
    upcomingOnly: boolean,
  ): { nextDeparture: string | null; upcoming: string[] } {
    // Find the index of the first departure at or after currentTime
    const idx = departures.findIndex((t) => t >= currentTime);

    if (idx === -1) {
      // No more departures today
      return { nextDeparture: null, upcoming: [] };
    }

    const nextDeparture = departures[idx];

    // upcoming = the departures AFTER the next one
    const upcomingStart = idx + 1;

    let upcoming: string[];
    if (upcomingOnly) {
      // Return only the next DEFAULT_UPCOMING_COUNT items
      upcoming = departures.slice(upcomingStart, upcomingStart + DEFAULT_UPCOMING_COUNT);
    } else {
      // Return all remaining departures for the day
      upcoming = departures.slice(upcomingStart);
    }

    return { nextDeparture, upcoming };
  }

  /**
   * Main endpoint handler — returns full schedule for a station.
   */
  async getStationSchedule(
    stationId: string,
    dayTypeParam?: 'weekday' | 'weekend',
    upcomingOnly: boolean = true,
  ) {
    // 1. Validate station exists
    const station = await this.StationModel.findOne({ stationId, isActive: true });
    if (!station) {
      throw new AppError('Station not found', 404);
    }

    // 2. Determine dayType and current time
    const { timeStr: serverTime, dayOfWeek } = this.getJakartaTime();
    const dayType = dayTypeParam ?? this.inferDayType(dayOfWeek);

    // 3. Determine terminus stations from DB
    const southTerminus = await this.StationModel.findOne({ isActive: true }).sort({ orderIndex: 1 });
    const northTerminus = await this.StationModel.findOne({ isActive: true }).sort({ orderIndex: -1 });

    if (!southTerminus || !northTerminus) {
      throw new AppError('No active stations found in the system', 500);
    }

    // 4. Build response for each direction
    const result: Record<string, any> = {
      station: {
        stationId: station.stationId,
        name: station.name,
      },
      dayType,
      serverTime,
    };

    // Northbound: toward the north terminus (highest orderIndex)
    // Only available if the station is NOT the north terminus itself
    if (station.orderIndex < northTerminus.orderIndex) {
      const schedule = await this.ScheduleModel.findOne({
        stationId,
        direction: 'northbound',
        dayType,
      });

      if (schedule) {
        const { nextDeparture, upcoming } = this.computeDepartures(
          schedule.departures,
          serverTime,
          upcomingOnly,
        );
        result.northbound = {
          direction: `To ${northTerminus.name}`,
          nextDeparture: nextDeparture ?? 'Service ended',
          upcoming,
        };
      }
    }

    // Southbound: toward the south terminus (lowest orderIndex)
    // Only available if the station is NOT the south terminus itself
    if (station.orderIndex > southTerminus.orderIndex) {
      const schedule = await this.ScheduleModel.findOne({
        stationId,
        direction: 'southbound',
        dayType,
      });

      if (schedule) {
        const { nextDeparture, upcoming } = this.computeDepartures(
          schedule.departures,
          serverTime,
          upcomingOnly,
        );
        result.southbound = {
          direction: `To ${southTerminus.name}`,
          nextDeparture: nextDeparture ?? 'Service ended',
          upcoming,
        };
      }
    }

    return result;
  }
}

export default SchedulesService;
