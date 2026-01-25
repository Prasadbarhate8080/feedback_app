import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/dbConnect';
import { userModel } from '@/models/user.model';
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { User } from '@/models/user.model';

export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        id: 'credentials',
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials: Record<"email" | "password", string> | undefined ): Promise<User | null> {
          await dbConnect();
          try {
            const user = await userModel.findOne({
              $or: [
                { email: credentials.identifier },
                { userName: credentials.identifier },
              ],
            });
            if (!user) {
              throw new Error('invalid credentials');
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
              throw new Error('invalid credentials');
            }
          } catch (err) {
            throw new Error(
            err instanceof Error ? err.message : "Authentication failed"
          );
          }
        },
      }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),

    ],
    callbacks: {

      async signIn({ user, account }) {
      // ✅ When OAuth login happens, link to existing account
      console.log("i am inside the signin callback")
      if (account?.provider !== "credentials") {
        const existingUser = await userModel.findOne({userName: user.name?.replace(" ","_")})
        if (!existingUser) {
          // ✅ Create new user for OAuth login
          await userModel.create({
              userName: user.name?.replace(" ","_"),
              email: user.email,
              password: "hashedPassword",
              verifyCode:"verifyCode",
              verifyCodeExpiry: Date.now(),
              isVerified: false,
              isAcceptingMessages: true,
              messages: []
          })
        }
      }
      return true
    },
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