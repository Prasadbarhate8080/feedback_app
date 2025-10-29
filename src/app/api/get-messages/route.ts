import { dbConnect } from '@/lib/dbConnect';
import { userModel } from '@/models/user.model';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user as User
  // console.log("session:",session,"_user:",_user)

  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  console.log(_user._id)
  const userId = new mongoose.Types.ObjectId(_user._id);
  try {
    const messages = await userModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$messages' },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: { _id: '$_id', messages: { $push: '$messages' } } },
    ]).exec();

    if (!messages || messages.length === 0) {
      return Response.json(
        { message: 'No messages to display', success: false },
        { status: 200 }
      );
    }
    return Response.json(
      { messages: messages[0].messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}