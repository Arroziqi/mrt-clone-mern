import { Model } from 'mongoose';
import { IUser } from '../../models/User';
import { IActivity } from '../../models/Activity';
import { INotification } from '../../models/Notification';
import { IPaymentMethod } from '../../models/PaymentMethod';

class UsersService {
  private UserModel: Model<IUser>;
  private ActivityModel: Model<IActivity>;
  private NotificationModel: Model<INotification>;
  private PaymentMethodModel: Model<IPaymentMethod>;

  constructor({ UserModel, ActivityModel, NotificationModel, PaymentMethodModel }: any) {
    this.UserModel = UserModel;
    this.ActivityModel = ActivityModel;
    this.NotificationModel = NotificationModel;
    this.PaymentMethodModel = PaymentMethodModel;
  }

  async getProfile(userId: string) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, data: any) {
    const { fullName, phoneNumber } = data;
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      { fullName, phoneNumber },
      { returnDocument: 'after', runValidators: true }
    );
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getActivities(userId: string) {
    return await this.ActivityModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getNotifications(userId: string) {
    return await this.NotificationModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getPaymentMethods(userId: string) {
    return await this.PaymentMethodModel.find({ userId });
  }
}

export default UsersService;
