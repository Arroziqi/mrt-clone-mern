import { Request, Response, NextFunction } from 'express';
import UsersService from './users.service';

class UsersController {
  private usersService: UsersService;

  constructor({ usersService }: { usersService: UsersService }) {
    this.usersService = usersService;
  }

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.user is set by the requireAuth middleware
      const profile = await this.usersService.getProfile((req as any).user._id);
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: profile
      });
    } catch (error: any) {
      if (error.message === 'User not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await this.usersService.updateProfile((req as any).user._id, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: profile
      });
    } catch (error: any) {
      next(error);
    }
  };

  getActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activities = await this.usersService.getActivities((req as any).user._id);
      res.status(200).json({ success: true, data: activities });
    } catch (error: any) {
      next(error);
    }
  };

  getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await this.usersService.getNotifications((req as any).user._id);
      res.status(200).json({ success: true, data: notifications });
    } catch (error: any) {
      next(error);
    }
  };

  getPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentMethods = await this.usersService.getPaymentMethods((req as any).user._id);
      res.status(200).json({ success: true, data: paymentMethods });
    } catch (error: any) {
      next(error);
    }
  };
}

export default UsersController;
