import { resend } from "@/lib/resend";
import verificationEmail from "../../emails/verificationEmail";
import { apiResponse } from '@/types/apiResponse';

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<apiResponse> {
  try {
    // console.log(email,username,verifyCode);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Mystery Message Verification Code',
      react: verificationEmail({ username, otp: verifyCode }),
    });
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}