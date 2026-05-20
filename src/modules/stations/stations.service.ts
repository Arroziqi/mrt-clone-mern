import { Model } from 'mongoose';
import { IStation } from '../../models/Station';

export const formatRp = (amount: number): string => {
  const s = amount.toString();
  let result = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) {
      result += '.';
    }
    result += s[i];
  }
  return `Rp ${result}`;
};

class StationsService {
  private StationModel: Model<IStation>;

  constructor({ StationModel }: { StationModel: Model<IStation> }) {
    this.StationModel = StationModel;
  }

  async getAllStations() {
    return await this.StationModel.find({ isActive: true }).sort({ orderIndex: 1 });
  }

  async getStationById(stationId: string) {
    return await this.StationModel.findOne({ stationId, isActive: true });
  }

  async getAllStationsPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const totalItems = await this.StationModel.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalItems / limit);
    const stations = await this.StationModel.find({ isActive: true })
      .sort({ orderIndex: 1 })
      .skip(skip)
      .limit(limit);

    return {
      stations,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async searchStationsPaginated(
    query: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    const regexPattern = query
      .split('')
      .map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');

    const filter = {
      isActive: true,
      name: {
        $regex: regexPattern,
        $options: 'i',
      },
    };

    const totalItems = await this.StationModel.countDocuments(filter);

    const totalPages = Math.ceil(totalItems / limit);

    const stations = await this.StationModel.find(filter)
      .sort({ orderIndex: 1 })
      .skip(skip)
      .limit(limit);

    return {
      stations,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async calculateFare(fromId: string, toId?: string) {
    const fromStation = await this.StationModel.findOne({ stationId: fromId, isActive: true });
    if (!fromStation) {
      throw new Error(`Departure station with ID ${fromId} not found`);
    }

    if (toId) {
      const toStation = await this.StationModel.findOne({ stationId: toId, isActive: true });
      if (!toStation) {
        throw new Error(`Destination station with ID ${toId} not found`);
      }

      const hops = Math.abs(fromStation.orderIndex - toStation.orderIndex);
      const fare = hops <= 1 ? 3000 : hops * 1000;

      return {
        from: {
          stationId: fromStation.stationId,
          name: fromStation.name,
          orderIndex: fromStation.orderIndex,
        },
        to: {
          stationId: toStation.stationId,
          name: toStation.name,
          orderIndex: toStation.orderIndex,
        },
        hops,
        fare,
        formattedFare: formatRp(fare),
      };
    } else {
      // Calculate fares to all other active stations except current
      const allStations = await this.StationModel.find({
        isActive: true,
        stationId: { $ne: fromId },
      }).sort({ orderIndex: 1 });

      return allStations.map((station) => {
        const hops = Math.abs(fromStation.orderIndex - station.orderIndex);
        const fare = hops <= 1 ? 3000 : hops * 1000;

        return {
          from: {
            stationId: fromStation.stationId,
            name: fromStation.name,
            orderIndex: fromStation.orderIndex,
          },
          to: {
            stationId: station.stationId,
            name: station.name,
            orderIndex: station.orderIndex,
          },
          hops,
          fare,
          formattedFare: formatRp(fare),
        };
      });
    }
  }

  async getRouteDetail(fromId: string, toId: string) {
    const fromStation = await this.StationModel.findOne({ stationId: fromId, isActive: true });
    if (!fromStation) {
      throw new Error(`Departure station with ID ${fromId} not found`);
    }

    const toStation = await this.StationModel.findOne({ stationId: toId, isActive: true });
    if (!toStation) {
      throw new Error(`Destination station with ID ${toId} not found`);
    }

    const minIdx = Math.min(fromStation.orderIndex, toStation.orderIndex);
    const maxIdx = Math.max(fromStation.orderIndex, toStation.orderIndex);

    // Fetch stations along path
    const stationsAlongPath = await this.StationModel.find({
      isActive: true,
      orderIndex: { $gte: minIdx, $lte: maxIdx },
    });

    // Sort matching direction of travel
    const sortedStations = stationsAlongPath.sort((a, b) => {
      if (fromStation.orderIndex <= toStation.orderIndex) {
        return a.orderIndex - b.orderIndex; // Southbound
      } else {
        return b.orderIndex - a.orderIndex; // Northbound
      }
    });

    const hops = Math.abs(fromStation.orderIndex - toStation.orderIndex);
    const fare = hops <= 1 ? 3000 : hops * 1000;

    return {
      from: {
        stationId: fromStation.stationId,
        name: fromStation.name,
        orderIndex: fromStation.orderIndex,
      },
      to: {
        stationId: toStation.stationId,
        name: toStation.name,
        orderIndex: toStation.orderIndex,
      },
      hops,
      fare,
      formattedFare: formatRp(fare),
      route: sortedStations.map((station) => ({
        stationId: station.stationId,
        name: station.name,
        orderIndex: station.orderIndex,
      })),
    };
  }
}

export default StationsService;
