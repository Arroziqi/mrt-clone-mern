import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';
import { IUser } from '../../models/User';

class AuthService {
  private UserModel: Model<IUser>;

  constructor({ UserModel }: { UserModel: Model<IUser> }) {
    this.UserModel = UserModel;
  }

  generateToken(id: string) {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
      expiresIn: '30d'
    });
  }

  async register(data: any) {
    const { fullName, email, phoneNumber, pin } = data;
    
    // Check if user exists by email or phoneNumber
    const existingEmail = await this.UserModel.findOne({ email });
    if (existingEmail) {
      throw new Error('Email already in use');
    }
    const existingPhone = await this.UserModel.findOne({ phoneNumber });
    if (existingPhone) {
      throw new Error('Phone number already in use');
    }

    const user = await this.UserModel.create({
      fullName,
      email,
      phoneNumber,
      pin
    });

    const token = this.generateToken(user._id.toString());

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        balance: user.balance
      },
      token
    };
  }

  async login(data: any) {
    const { phoneNumber, pin } = data;
    
    if (!phoneNumber || !pin) {
      throw new Error('Please provide phone number and PIN');
    }

    const user = await this.UserModel.findOne({ phoneNumber }).select('+pin');
    if (!user || !(await user.correctPin(pin, user.pin))) {
      throw new Error('Incorrect phone number or PIN');
    }

    const token = this.generateToken(user._id.toString());

    return {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        age: user.age,
        balance: user.balance
      },
      token
    };
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.UserModel.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      age: user.age,
      balance: user.balance
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.UserModel.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return { message: 'Account successfully deleted' };
  }
}

export default AuthService;
