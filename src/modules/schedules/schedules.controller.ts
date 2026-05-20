import { Request, Response, NextFunction } from 'express';
import SchedulesService from './schedules.service';
import { AppError } from '../../utils/AppError';

class SchedulesController {
  private schedulesService: SchedulesService;

  constructor({ schedulesService }: { schedulesService: SchedulesService }) {
    this.schedulesService = schedulesService;
  }

  getStationSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stationId = req.params.stationId as string;
      const dayType = req.query.dayType as 'weekday' | 'weekend' | undefined;
      const upcomingOnly = req.query.upcomingOnly === 'false' || req.query.upcomingOnly === '0'
        ? false
        : true; // defaults to true when param is absent

      const scheduleData = await this.schedulesService.getStationSchedule(
        stationId,
        dayType,
        upcomingOnly,
      );

      res.status(200).json({
        success: true,
        message: 'Schedule retrieved successfully',
        data: scheduleData,
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          data: null,
        });
      }
      next(error);
    }
  };
}

export default SchedulesController;
