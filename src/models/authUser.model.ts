import mongoose, { Schema, Document } from 'mongoose';
import { Message } from './user.model';

export interface AuthUser extends Document {
  userName: string;
  email: string;
  password: string;
  verifyCode: string;
  isVerified: boolean;
  verifyCodeExpiry: Date;
  isAcceptingMessages: boolean;
  messages: Message[];
}

const authUserSchema: Schema<AuthUser> = new Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const authUserModel =
  (mongoose.models.AuthUser as mongoose.Model<AuthUser>) ||
  mongoose.model<AuthUser>('AuthUser', authUserSchema);
export { authUserModel };
