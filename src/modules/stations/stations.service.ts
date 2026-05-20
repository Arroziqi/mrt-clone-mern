import { Model } from 'mongoose';
import { IStation } from '../../models/Station';

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
}

export default StationsService;
