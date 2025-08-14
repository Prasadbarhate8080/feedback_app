import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import { userModel } from '@/models/user.model';

export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        id: 'credentials',
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials: any): Promise<any> {
          await dbConnect();
          try {
            const user = await userModel.findOne({
              $or: [
                { email: credentials.identifier },
                { username: credentials.identifier },
              ],
            });
            // console.log(user)
            if (!user) {
              throw new Error('No user found with this email');
            }
            if (!user.isVerified) {
              throw new Error('Please verify your account before logging in');
            }
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password 
            );
            if (isPasswordCorrect) {
              return user;
            } else {
              throw new Error('Incorrect password');
            }
          } catch (err: any) {
            throw new Error(err);
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        
        if (user) {
          // console.log("user:",user,"token:",token)
          token._id = user._id?.toString(); // Convert ObjectId to string
          token.isVerified = user.isVerified;
          token.isAcceptingMessages = user.isAcceptingMessages;
          token.userName = user.userName;
        }
        return token;
      },
      async session({ session, token }) {
        
        if (token) {
          // console.log("session:",session,"token:",token)
          session.user._id = token._id;
          session.user.isVerified = token.isVerified;
          session.user.isAcceptingMessages = token.isAcceptingMessages;
          session.user.userName = token.userName;
        }
        return session;
      },
    },
    session: {
      strategy: 'jwt',
    },
    secret: process.env.NEXT_AUTH_SECRET,
    pages: {
      signIn: '/sign-in',
    },
  };