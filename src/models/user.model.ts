import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document
{
    _id: string;
    content:string;
    createdAt:Date;
}


const messageSchema:Schema<Message> = new Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    }
})

export interface User extends Document
{
   userName: string,
   email: string,
   password: string,
   verifyCode: string,
   isVerified: boolean,
   verifyCodeExpiry: Date,
   isAcceptingMessages: boolean,
   messages: Message[]
}


const userSchema:Schema<User> = new Schema({
   userName: {
    type:String,
    required: [true, "Username is required"],
    unique: true,
    trim: true
   },
   email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "please use a valid email address"],
   },
   password: {
    type: String,
    required: [true, "password is required"],
    unique: true,
   },
   verifyCode: {
    type: String,
    required: [true, "verifyCode is required"],
   },
   verifyCodeExpiry: {
    type: Date,
    required: [true, "verifyCode expiry is required"],
   },
   isVerified: {
    type: Boolean,
    default: false
   },
   isAcceptingMessages: {
    type: Boolean,
    default: true
   },
   messages: [messageSchema]
})

const userModel = (mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User",userSchema))
                   
export {userModel}