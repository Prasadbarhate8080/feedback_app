import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import { User, userModel } from '@/models/user.model';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';

interface user{
  id:string,
  email: string
  userName: string
  isVerified: boolean
  isAcceptingMessages: boolean
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email/Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<"identifier" | "password", string> | undefined): Promise<user | null> {
        if (!credentials) {
          return null;
        }
        await dbConnect();
        try {
          const user:User | null = await userModel.findOne({
            $or: [{ email: credentials.identifier }, { userName: credentials.identifier }],
          });
          console.log("user found:",user)
          if (!user) {
            throw new Error('invalid credentials');
          }
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (isPasswordCorrect) {
            const userId = user._id.toString();
            if (!userId) {
              throw new Error("User ID missing");
            }
            return {
              id: userId,
              email: user.email,
              userName: user.userName,
              isVerified: user.isVerified,
              isAcceptingMessages: user.isAcceptingMessages,
            };
          } else {
            throw new Error('invalid credentials');
          }
        } catch (err) {
          throw new Error(err instanceof Error ? err.message : 'Authentication failed');
        }
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // ✅ When OAuth login happens, link to existing account
      await dbConnect();
      if (account?.provider !== 'credentials') {
        const existingUser = await userModel.findOne({
          $or: [{ userName: user.name?.replace(' ', '_')}, {email: user.email }],
        });
        if(existingUser)
        {
          const userId = String(existingUser._id);
          user.id = userId;
          userModel.updateOne(
            {
              $or: [{ userName: user.name?.replace(' ', '_') }, { email: user.email }],
            },
            {
              userName: user.name?.replace(' ', '_'),
              email: user.email,
            }
          );
        }
        if (!existingUser) {
          // ✅ Create new user for OAuth login
          const newUser:User = await userModel.create({
            userName: user.name?.replace(' ', '_'),
            email: user.email,
            password: 'hashedPassword',
            verifyCode: 'verifyCode',
            verifyCodeExpiry: Date.now(),
            isVerified: true,
            isAcceptingMessages: true,
            messages: [],
          });
          user.id = newUser._id.toString();
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // console.log("user:",user,"token:",token)
        token.id = user.id.toString(); // Convert ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.userName = user.userName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // console.log("session:",session,"token:",token)
        session.user.id = token.id;
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
