import { Request, Response, NextFunction } from 'express';
import StationsService from './stations.service';

class StationsController {
  private stationsService: StationsService;

  constructor({ stationsService }: { stationsService: StationsService }) {
    this.stationsService = stationsService;
  }

  getAllStations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stations = await this.stationsService.getAllStations();
      res.status(200).json({
        success: true,
        message: 'Stations retrieved successfully',
        data: stations
      });
    } catch (error) {
      next(error);
    }
  };
}

export default StationsController;
