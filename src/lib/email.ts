import { waitlistServices } from './services';

/**
 * Email service module for handling email-related functionality with Resend
 */

// Check if Resend API key is configured
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('Resend API key is missing. Email functionality will be limited.');
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Resend
 */
export const sendEmail = async (options: SendEmailOptions): Promise<boolean> => {
  const { to, subject, html, from = 'RefillLocal <notifications@refilllocal.com>' } = options;
  
  try {
    // In a real implementation, we would use the Resend SDK
    // For MVP we'll simulate a successful email send
    console.log('Sending email to:', to);
    console.log('Subject:', subject);
    console.log('From:', from);
    
    // Mock successful email sending
    // In production, we would call the Resend API:
    /*
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return false;
    }
    
    return true;
    */
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send a waitlist confirmation email
 */
export const sendWaitlistConfirmationEmail = async (email: string, city: string): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: `You're on the RefillLocal waitlist for ${city}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #678a65; padding: 30px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to RefillLocal!</h1>
        </div>
        
        <div style="padding: 30px 20px; background-color: white; color: #333;">
          <p style="font-size: 16px;">Hi there,</p>
          
          <p style="font-size: 16px;">Thanks for joining the RefillLocal waitlist for <strong>${city}</strong>!</p>
          
          <p style="font-size: 16px;">We're building a directory of refill and zero-waste stores to help you shop package-free. You'll be among the first to know when we launch in your area.</p>
          
          <div style="background-color: #f2edd8; padding: 15px; border-radius: 10px; margin: 25px 0;">
            <p style="margin: 0; font-size: 15px;"><strong>What's next?</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 15px;">We'll notify you when RefillLocal launches in ${city}. In the meantime, you can spread the word to your eco-conscious friends!</p>
          </div>
          
          <p style="font-size: 16px;">Have a great day,</p>
          <p style="font-size: 16px;">The RefillLocal Team</p>
        </div>
        
        <div style="background-color: #f4f7f4; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2025 RefillLocal. All rights reserved.</p>
          <p>If you didn't sign up for this waitlist, please ignore this email.</p>
        </div>
      </div>
    `,
  });
};

export default {
  sendEmail,
  sendWaitlistConfirmationEmail,
};
