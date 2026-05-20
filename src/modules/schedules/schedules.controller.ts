import { Request, Response, NextFunction } from 'express';
import SchedulesService from './schedules.service';

class SchedulesController {
  private schedulesService: SchedulesService;

  constructor({ schedulesService }: { schedulesService: SchedulesService }) {
    this.schedulesService = schedulesService;
  }

  getStationSchedule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stationId = req.params.stationId as string;
      const scheduleData = await this.schedulesService.getStationSchedule(stationId);
      
      res.status(200).json({
        success: true,
        message: 'Schedule retrieved successfully',
        data: scheduleData
      });
    } catch (error: any) {
      if (error.message === 'Station not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  };
}

export default SchedulesController;
