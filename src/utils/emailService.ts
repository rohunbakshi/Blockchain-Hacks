/**
 * Email Service
 * 
 * This service handles sending emails for the application using EmailJS.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://www.emailjs.com/ and create a free account
 * 2. Create an Email Service (Gmail, Outlook, etc.) and get your Service ID
 * 3. Create email templates:
 *    - One for confirmation emails
 *    - One for password reset emails
 * 4. Get your Public Key from EmailJS dashboard
 * 5. Add these to your .env file:
 *    VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
 *    VITE_EMAILJS_SERVICE_ID=your_service_id_here
 *    VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID=your_confirmation_template_id_here
 *    VITE_EMAILJS_RESET_TEMPLATE_ID=your_reset_template_id_here
 */

import emailjs from '@emailjs/browser';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Initialize EmailJS with public key from environment variable
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_CONFIRMATION_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID;
const EMAILJS_RESET_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID;
const EMAILJS_FROM_EMAIL = import.meta.env.VITE_EMAILJS_FROM_EMAIL || 'noreply@credentialhub.com';
const EMAILJS_FROM_NAME = import.meta.env.VITE_EMAILJS_FROM_NAME || 'CredentialHub Team';

if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

/**
 * Send a confirmation email to the user
 * @param email User's email address
 * @param confirmationLink The link to confirm the email
 * @returns Promise that resolves to true if email was "sent" successfully
 */
export async function sendConfirmationEmail(email: string, confirmationLink: string): Promise<boolean> {
  try {
    const emailData: EmailData = {
      to: email,
      subject: 'Confirm Your Email - CredentialHub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to CredentialHub!</h1>
            </div>
            <div class="content">
              <p>Thank you for signing up! Please confirm your email address to complete your registration.</p>
              <p>Click the button below to confirm your email:</p>
              <a href="${confirmationLink}" class="button">Confirm Email Address</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #14b8a6;">${confirmationLink}</p>
              <p>If you didn't create an account with CredentialHub, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} CredentialHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to CredentialHub!

Thank you for signing up! Please confirm your email address to complete your registration.

Click this link to confirm your email:
${confirmationLink}

If you didn't create an account with CredentialHub, you can safely ignore this email.

© ${new Date().getFullYear()} CredentialHub. All rights reserved.
      `
    };

    // Check if EmailJS is configured
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_CONFIRMATION_TEMPLATE_ID) {
      console.warn('⚠️ EmailJS not configured. Using demo mode. Check your .env file.');
      
      // For demo: Store email in localStorage
      const emails = JSON.parse(localStorage.getItem('credentialHub_sentEmails') || '[]');
      emails.push({
        ...emailData,
        sentAt: new Date().toISOString(),
        type: 'confirmation'
      });
      localStorage.setItem('credentialHub_sentEmails', JSON.stringify(emails));

      console.log('📧 Confirmation Email (Demo Mode):', {
        to: email,
        subject: emailData.subject,
        link: confirmationLink,
        timestamp: new Date().toISOString()
      });
      console.log('🔗 Confirmation Link:', confirmationLink);
      
      return true; // Return true for demo mode
    }

    // Send email using EmailJS
    try {
      const templateParams = {
        to_email: email,
        to_name: email.split('@')[0],
        confirmation_link: confirmationLink,
        subject: emailData.subject,
        from_email: EMAILJS_FROM_EMAIL,
        from_name: EMAILJS_FROM_NAME,
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_CONFIRMATION_TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Confirmation email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
      
      // Fallback to demo mode on error
      const emails = JSON.parse(localStorage.getItem('credentialHub_sentEmails') || '[]');
      emails.push({
        ...emailData,
        sentAt: new Date().toISOString(),
        type: 'confirmation',
        error: String(error)
      });
      localStorage.setItem('credentialHub_sentEmails', JSON.stringify(emails));
      
      console.log('📧 Email stored in demo mode due to error');
      console.log('🔗 Confirmation Link:', confirmationLink);
      
      return true; // Still return true to not block user flow
    }
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
}

/**
 * Send a password reset email
 * @param email User's email address
 * @param resetLink The link to reset the password
 * @returns Promise that resolves to true if email was "sent" successfully
 */
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  try {
    const emailData: EmailData = {
      to: email,
      subject: 'Reset Your Password - CredentialHub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>You requested to reset your password for your CredentialHub account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #14b8a6;">${resetLink}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} CredentialHub. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Password Reset Request

You requested to reset your password for your CredentialHub account.

Click this link to reset your password:
${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.

© ${new Date().getFullYear()} CredentialHub. All rights reserved.
      `
    };

    // Check if EmailJS is configured
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_RESET_TEMPLATE_ID) {
      console.warn('⚠️ EmailJS not configured. Using demo mode. Check your .env file.');
      
      // For demo: Store email in localStorage
      const emails = JSON.parse(localStorage.getItem('credentialHub_sentEmails') || '[]');
      emails.push({
        ...emailData,
        sentAt: new Date().toISOString(),
        type: 'password-reset'
      });
      localStorage.setItem('credentialHub_sentEmails', JSON.stringify(emails));

      console.log('📧 Password Reset Email (Demo Mode):', {
        to: email,
        subject: emailData.subject,
        link: resetLink,
        timestamp: new Date().toISOString()
      });
      console.log('🔗 Reset Link:', resetLink);
      
      return true; // Return true for demo mode
    }

    // Send email using EmailJS
    try {
      const templateParams = {
        to_email: email,
        to_name: email.split('@')[0],
        reset_link: resetLink,
        subject: emailData.subject,
        from_email: EMAILJS_FROM_EMAIL,
        from_name: EMAILJS_FROM_NAME,
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_RESET_TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Password reset email sent successfully to:', email);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      
      // Fallback to demo mode on error
      const emails = JSON.parse(localStorage.getItem('credentialHub_sentEmails') || '[]');
      emails.push({
        ...emailData,
        sentAt: new Date().toISOString(),
        type: 'password-reset',
        error: String(error)
      });
      localStorage.setItem('credentialHub_sentEmails', JSON.stringify(emails));
      
      console.log('📧 Email stored in demo mode due to error');
      console.log('🔗 Reset Link:', resetLink);
      
      return true; // Still return true to not block user flow
    }
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

