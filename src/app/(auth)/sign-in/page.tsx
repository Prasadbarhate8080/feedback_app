'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { signInSchema } from '@/schemas/signInSchema';

export default function SignInForm() {
  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
  };

  const handleGithubLogin = () => {
    signIn('github', { callbackUrl: '/' });
  };

  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast(
          <div>
            <strong style={{ fontSize: '16px' }}> Login Failed</strong>
            <div style={{ fontSize: '14px' }}>
              Incorrect username or password
            </div>
          </div>,
          {
            type: 'error',
            hideProgressBar: true,
            closeButton: false,
          }
        );
      } else {
        toast(
          <div>
            <strong style={{ fontSize: '16px' }}> Error</strong>
            <div style={{ fontSize: '14px' }}>{result.error}</div>
          </div>,
          {
            type: 'error',
            hideProgressBar: true,
            closeButton: false,
          }
        );
      }
    }

    if (result?.url) {
      router.replace('/dashboard');
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-800'>
      <div className='w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md'>
        <div className='text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-6'>
            Welcome Back to True Feedback
          </h1>
          <p className='mb-4'>Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              name='identifier'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='password'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type='password' {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='w-full' type='submit'>
              Sign In
            </Button>
          </form>

          <hr className='my-4' />
          {/* Google Login Button */}
          <div className='flex gap-2 justify-center'>
            <button
              onClick={handleGoogleLogin}
              className='bg-red-500 text-white p-2 rounded'
            >
              Continue with Google
            </button>

            {/* GitHub Login Button */}
            <button
              onClick={handleGithubLogin}
              className='bg-gray-800 text-white p-2 rounded'
            >
              Continue with GitHub
            </button>
          </div>
        </Form>
        <div className='text-center mt-4'>
          <p>
            Not a member yet?{' '}
            <Link href='/sign-up' className='text-blue-600 hover:text-blue-800'>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
