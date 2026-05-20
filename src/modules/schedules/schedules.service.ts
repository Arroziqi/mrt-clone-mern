import { Model } from 'mongoose';
import { IStation } from '../../models/Station';

class SchedulesService {
  private StationModel: Model<IStation>;

  constructor({ StationModel }: { StationModel: Model<IStation> }) {
    this.StationModel = StationModel;
  }

  async getStationSchedule(stationId: string) {
    const station = await this.StationModel.findOne({ stationId, isActive: true });
    
    if (!station) {
      throw new Error('Station not found');
    }

    // Mock schedule generation based on current time to make it look realistic
    const now = new Date();
    // const currentHour = now.getHours();
    // const currentMinute = now.getMinutes();

    const generateTimes = (startOffsetMin: number) => {
      let times: string[] = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getTime() + (startOffsetMin + i * 10) * 60000);
        times.push(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      }
      return times;
    };

    return {
      station: {
        id: station.stationId,
        name: station.name
      },
      schedules: {
        northBound: {
          direction: 'To Bundaran HI',
          upcoming: generateTimes(5) // next train in 5 mins, then every 10
        },
        southBound: {
          direction: 'To Lebak Bulus',
          upcoming: generateTimes(8) // next train in 8 mins, then every 10
        }
      }
    };
  }
}

export default SchedulesService;
