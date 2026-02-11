import fs from 'fs';
import path from 'path';

/**
 * Email Service for Boptone
 * 
 * This module provides email sending functionality with branded templates.
 * Currently uses placeholder logic - integrate with your email provider (SendGrid, AWS SES, etc.)
 */

interface PasswordResetEmailData {
  to: string;
  resetLink: string;
  verificationCode: string;
}

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Load email template from file and replace placeholders
 */
function loadTemplate(templateName: string, data: Record<string, string>): { html: string; text: string } {
  const templateDir = path.join(__dirname, 'email-templates');
  
  let html = fs.readFileSync(path.join(templateDir, `${templateName}.html`), 'utf-8');
  let text = fs.readFileSync(path.join(templateDir, `${templateName}.txt`), 'utf-8');
  
  // Replace placeholders in both HTML and text versions
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    html = html.replace(new RegExp(placeholder, 'g'), value);
    text = text.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return { html, text };
}

/**
 * Send password reset email
 * 
 * @param data - Email data including recipient, reset link, and verification code
 * @returns Promise that resolves when email is sent
 * 
 * @example
 * ```ts
 * await sendPasswordResetEmail({
 *   to: 'user@example.com',
 *   resetLink: 'https://boptone.com/reset-password?token=abc123',
 *   verificationCode: '123456'
 * });
 * ```
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  const { html, text } = loadTemplate('password-reset', {
    resetLink: data.resetLink,
    verificationCode: data.verificationCode,
  });
  
  // TODO: Integrate with your email service provider
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: data.to,
  //   from: 'noreply@boptone.com',
  //   subject: 'Reset Your Boptone Password',
  //   text: text,
  //   html: html,
  // });
  
  // Example with AWS SES:
  // const AWS = require('aws-sdk');
  // const ses = new AWS.SES({ region: 'us-east-1' });
  // await ses.sendEmail({
  //   Source: 'noreply@boptone.com',
  //   Destination: { ToAddresses: [data.to] },
  //   Message: {
  //     Subject: { Data: 'Reset Your Boptone Password' },
  //     Body: {
  //       Text: { Data: text },
  //       Html: { Data: html },
  //     },
  //   },
  // }).promise();
  
  // Placeholder: Log email content for development
  console.log('[Email Service] Password reset email would be sent to:', data.to);
  console.log('[Email Service] Reset link:', data.resetLink);
  console.log('[Email Service] Verification code:', data.verificationCode);
  console.log('[Email Service] HTML length:', html.length, 'chars');
  console.log('[Email Service] Text length:', text.length, 'chars');
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate password reset token (placeholder - use JWT or secure random token in production)
 */
export function generateResetToken(): string {
  // TODO: Replace with secure token generation (e.g., JWT with expiration)
  // Example with JWT:
  // const jwt = require('jsonwebtoken');
  // return jwt.sign({ purpose: 'password-reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  // Placeholder: Generate random token
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Create password reset link
 */
export function createResetLink(token: string): string {
  // TODO: Replace with your production domain
  const baseUrl = process.env.VITE_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/reset-password?token=${token}`;
}
