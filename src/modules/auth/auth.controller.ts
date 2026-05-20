import { Request, Response, NextFunction } from 'express';
import AuthService from './auth.service';

class AuthController {
  private authService: AuthService;

  constructor({ authService }: { authService: AuthService }) {
    this.authService = authService;
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data
      });
    } catch (error: any) {
      if (error.message === 'Email already in use' || error.message === 'Phone number already in use') {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data
      });
    } catch (error: any) {
      if (error.message.includes('Incorrect') || error.message.includes('provide')) {
        return res.status(401).json({ success: false, message: error.message });
      }
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const data = await this.authService.updateProfile(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data
      });
    } catch (error: any) {
      next(error);
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      await this.authService.deleteAccount(userId);
      res.status(200).json({
        success: true,
        message: 'Account successfully deleted'
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export default AuthController;
