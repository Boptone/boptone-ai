# Boptone Email Templates

This directory contains branded email templates for Boptone, designed to match the Brex-inspired minimal aesthetic of the website.

## Design System

All email templates follow these design principles:

- **90% Grayscale Palette**: White (#ffffff), light gray (#f9fafb, #e5e7eb), medium gray (#6b7280, #4b5563), dark gray (#111827)
- **10% Turquoise Accent**: Primary color (#14b8a6) for CTAs and links
- **Massive Bold Typography**: Large, bold headings (32px) with tight letter-spacing
- **Generous Whitespace**: Ample padding and spacing for breathing room
- **Rounded Pill Buttons**: Border-radius: 9999px for all CTA buttons
- **Clean, Minimal Design**: No gradients, no decorative elements

## Available Templates

### 1. Password Reset Email

**Files:**
- `password-reset.html` - HTML version with full styling
- `password-reset.txt` - Plain text fallback

**Placeholders:**
- `{{resetLink}}` - Password reset URL
- `{{verificationCode}}` - 6-digit verification code

**Usage:**
```typescript
import { sendPasswordResetEmail, generateVerificationCode, generateResetToken, createResetLink } from '../emailService';

const token = generateResetToken();
const code = generateVerificationCode();

await sendPasswordResetEmail({
  to: 'user@example.com',
  resetLink: createResetLink(token),
  verificationCode: code
});
```

## Email Service Integration

The `emailService.ts` module provides helper functions for sending emails. Currently uses placeholder logic - integrate with your email provider:

### SendGrid Integration

```typescript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: data.to,
  from: 'noreply@boptone.com',
  subject: 'Reset Your Boptone Password',
  text: text,
  html: html,
});
```

### AWS SES Integration

```typescript
// Install: npm install aws-sdk
import AWS from 'aws-sdk';

const ses = new AWS.SES({ region: 'us-east-1' });

await ses.sendEmail({
  Source: 'noreply@boptone.com',
  Destination: { ToAddresses: [data.to] },
  Message: {
    Subject: { Data: 'Reset Your Boptone Password' },
    Body: {
      Text: { Data: text },
      Html: { Data: html },
    },
  },
}).promise();
```

## Testing

### Preview HTML Template

Open `password-reset.html` in a browser after replacing placeholders:

```bash
# Replace placeholders with test data
sed 's/{{resetLink}}/https:\/\/boptone.com\/reset-password?token=test123/g; s/{{verificationCode}}/123456/g' password-reset.html > preview.html

# Open in browser
open preview.html  # macOS
xdg-open preview.html  # Linux
start preview.html  # Windows
```

### Email Client Testing

Test email rendering across different email clients:

1. **Litmus** - https://litmus.com
2. **Email on Acid** - https://www.emailonacid.com
3. **Mailtrap** - https://mailtrap.io (for development testing)

## Best Practices

1. **Always provide plain text fallback** - Some email clients don't support HTML
2. **Use inline CSS** - Email clients strip `<style>` tags
3. **Test across clients** - Gmail, Outlook, Apple Mail render differently
4. **Keep it simple** - Complex layouts break in email clients
5. **Use tables for layout** - Flexbox and Grid don't work in emails
6. **Avoid background images** - Not supported in all clients
7. **Use web-safe fonts** - Arial, Helvetica, Georgia, Times New Roman

## Color Palette Reference

```css
/* Grayscale */
--white: #ffffff;
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-900: #111827;

/* Accent */
--primary: #14b8a6; /* Turquoise */
```

## Typography Reference

```css
/* Headings */
h1: 24px, font-weight: 700
h2: 32px, font-weight: 700

/* Body */
p: 16px, line-height: 1.6
small: 14px, line-height: 1.6
tiny: 12px, line-height: 1.6
```

## Adding New Templates

1. Create HTML version: `template-name.html`
2. Create text version: `template-name.txt`
3. Use `{{placeholder}}` syntax for dynamic content
4. Add helper function to `emailService.ts`
5. Document in this README
6. Test across email clients

## Security Considerations

- **Expiring links**: Reset links should expire after 1 hour
- **Rate limiting**: Limit password reset requests per email/IP
- **Token security**: Use JWT or cryptographically secure random tokens
- **HTTPS only**: All reset links must use HTTPS
- **No sensitive data**: Never include passwords in emails
