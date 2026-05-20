import { Request, Response, NextFunction } from 'express';
import StationsService from './stations.service';

class StationsController {
  private stationsService: StationsService;

  constructor({ stationsService }: { stationsService: StationsService }) {
    this.stationsService = stationsService;
  }

  getAllStations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await this.stationsService.getAllStationsPaginated(page, limit);

      res.status(200).json({
        success: true,
        message: 'Stations retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  searchStations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query.q as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const result = await this.stationsService.searchStationsPaginated(q, page, limit);

      res.status(200).json({
        success: true,
        message: 'Stations searched successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  calculateFare = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string | undefined;

      const result = await this.stationsService.calculateFare(from, to);

      res.status(200).json({
        success: true,
        message: 'Fare calculated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getRouteDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string;

      const result = await this.stationsService.getRouteDetail(from, to);

      res.status(200).json({
        success: true,
        message: 'Route details retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default StationsController;
