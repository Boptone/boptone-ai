/**
 * Email Service
 * Handles all transactional email sending with template rendering and audit logging
 */

import Handlebars from 'handlebars';
import { getDb } from '../db';
import { emailLogs } from '../../drizzle/schema';
import { ENV } from '../_core/env';

/**
 * Email templates using Handlebars
 */
const emailTemplates = {
  'order-confirmation': {
    subject: 'Order Confirmation - {{order_number}}',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                Hi {{customer_name}},
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                Thank you for your order! We're excited to get your items to you.
              </p>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 1px solid #e0e0e0; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9f9f9;">
                    <p style="margin: 0; font-size: 14px; color: #666666;">Order Number</p>
                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #000000;">{{order_number}}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Items -->
              <h2 style="font-size: 20px; margin: 30px 0 15px 0; color: #000000;">Order Items</h2>
              {{#each items}}
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px; border-bottom: 1px solid #e0e0e0; padding-bottom: 15px;">
                <tr>
                  <td width="80" style="padding-right: 15px;">
                    {{#if imageUrl}}
                    <img src="{{imageUrl}}" alt="{{name}}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
                    {{/if}}
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #000000;">{{name}}</p>
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #666666;">by {{artistName}}</p>
                    <p style="margin: 0; font-size: 14px; color: #666666;">Qty: {{quantity}} × {{formatted_price}}</p>
                  </td>
                  <td style="text-align: right; vertical-align: top;">
                    <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000000;">{{formatted_total}}</p>
                  </td>
                </tr>
              </table>
              {{/each}}
              
              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="text-align: right; padding: 5px 0;">
                    <span style="font-size: 14px; color: #666666;">Subtotal:</span>
                  </td>
                  <td width="100" style="text-align: right; padding: 5px 0;">
                    <span style="font-size: 14px; color: #000000;">{{subtotal}}</span>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: right; padding: 5px 0;">
                    <span style="font-size: 14px; color: #666666;">Shipping:</span>
                  </td>
                  <td style="text-align: right; padding: 5px 0;">
                    <span style="font-size: 14px; color: #000000;">{{shipping_amount}}</span>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: right; padding: 5px 0;">
                    <span style="font-size: 14px; color: #666666;">Tax:</span>
                  </td>
                  <td style="text-align: right; padding: 5px 0;">
                    <span style="font-size: 14px; color: #000000;">{{tax_amount}}</span>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: right; padding: 15px 0 0 0; border-top: 2px solid #000000;">
                    <span style="font-size: 18px; font-weight: bold; color: #000000;">Total:</span>
                  </td>
                  <td style="text-align: right; padding: 15px 0 0 0; border-top: 2px solid #000000;">
                    <span style="font-size: 18px; font-weight: bold; color: #000000;">{{total}}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Shipping Address -->
              <h2 style="font-size: 20px; margin: 30px 0 15px 0; color: #000000;">Shipping Address</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 0;">
                {{shipping_name}}<br>
                {{shipping_address_line1}}<br>
                {{#if shipping_address_line2}}{{shipping_address_line2}}<br>{{/if}}
                {{shipping_city}}, {{shipping_state}} {{shipping_postal_code}}<br>
                {{shipping_country}}
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 30px 0 0 0;">
                We'll send you a shipping confirmation email with tracking information once your order ships.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Questions? Contact us at <a href="mailto:support@boptone.com" style="color: #000000;">support@boptone.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Order Confirmation - {{order_number}}

Hi {{customer_name}},

Thank you for your order! We're excited to get your items to you.

Order Number: {{order_number}}

Order Items:
{{#each items}}
- {{name}} by {{artistName}}
  Qty: {{quantity}} × {{formatted_price}} = {{formatted_total}}
{{/each}}

Subtotal: {{subtotal}}
Shipping: {{shipping_amount}}
Tax: {{tax_amount}}
Total: {{total}}

Shipping Address:
{{shipping_name}}
{{shipping_address_line1}}
{{#if shipping_address_line2}}{{shipping_address_line2}}{{/if}}
{{shipping_city}}, {{shipping_state}} {{shipping_postal_code}}
{{shipping_country}}

We'll send you a shipping confirmation email with tracking information once your order ships.

Questions? Contact us at support@boptone.com`
  },

  'abandoned-cart': {
    subject: 'You left something behind...',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Order</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Don't Miss Out!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                Hi {{customer_name}},
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                You left some amazing items in your cart! Complete your order now before they're gone.
              </p>
              
              <!-- Items -->
              {{#each items}}
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px; border-bottom: 1px solid #e0e0e0; padding-bottom: 15px;">
                <tr>
                  <td width="80" style="padding-right: 15px;">
                    {{#if imageUrl}}
                    <img src="{{imageUrl}}" alt="{{name}}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
                    {{/if}}
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #000000;">{{name}}</p>
                    <p style="margin: 0 0 5px 0; font-size: 14px; color: #666666;">by {{artistName}}</p>
                    <p style="margin: 0; font-size: 14px; color: #666666;">Qty: {{quantity}}</p>
                  </td>
                  <td style="text-align: right; vertical-align: top;">
                    <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000000;">{{formatted_price}}</p>
                  </td>
                </tr>
              </table>
              {{/each}}
              
              <!-- Subtotal -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="text-align: right; padding: 15px 0 0 0; border-top: 2px solid #000000;">
                    <span style="font-size: 18px; font-weight: bold; color: #000000;">Subtotal:</span>
                  </td>
                  <td width="100" style="text-align: right; padding: 15px 0 0 0; border-top: 2px solid #000000;">
                    <span style="font-size: 18px; font-weight: bold; color: #000000;">{{subtotal}}</span>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{checkout_url}}" style="display: inline-block; padding: 15px 40px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Complete Your Order</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Questions? Contact us at <a href="mailto:support@boptone.com" style="color: #000000;">support@boptone.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Don't Miss Out!

Hi {{customer_name}},

You left some amazing items in your cart! Complete your order now before they're gone.

Your Cart:
{{#each items}}
- {{name}} by {{artistName}}
  Qty: {{quantity}} - {{formatted_price}}
{{/each}}

Subtotal: {{subtotal}}

Complete your order: {{checkout_url}}

Questions? Contact us at support@boptone.com`
  },

  'shipping-in-transit': {
    subject: 'Your order is on the way! - {{order_number}}',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">📦 Your Order is On the Way!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                Hi {{customer_name}},
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                Great news! Your order has shipped and is on its way to you.
              </p>
              
              <!-- Tracking Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 1px solid #e0e0e0; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9f9f9;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Order Number</p>
                    <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #000000;">{{order_number}}</p>
                    
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Tracking Number</p>
                    <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #000000;">{{tracking_number}}</p>
                    
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Carrier</p>
                    <p style="margin: 0; font-size: 16px; color: #000000;">{{carrier}} {{service_level}}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Track Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{tracking_url}}" style="display: inline-block; padding: 15px 40px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Track Your Package</a>
                  </td>
                </tr>
              </table>
              
              <!-- Shipping Address -->
              <h2 style="font-size: 20px; margin: 30px 0 15px 0; color: #000000;">Shipping To</h2>
              <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 0;">
                {{shipping_name}}<br>
                {{shipping_address_line1}}<br>
                {{#if shipping_address_line2}}{{shipping_address_line2}}<br>{{/if}}
                {{shipping_city}}, {{shipping_state}} {{shipping_postal_code}}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Questions? Contact us at <a href="mailto:support@boptone.com" style="color: #000000;">support@boptone.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Your Order is On the Way!

Hi {{customer_name}},

Great news! Your order has shipped and is on its way to you.

Order Number: {{order_number}}
Tracking Number: {{tracking_number}}
Carrier: {{carrier}} {{service_level}}

Track your package: {{tracking_url}}

Shipping To:
{{shipping_name}}
{{shipping_address_line1}}
{{#if shipping_address_line2}}{{shipping_address_line2}}{{/if}}
{{shipping_city}}, {{shipping_state}} {{shipping_postal_code}}

Questions? Contact us at support@boptone.com`
  },

  'shipping-out-for-delivery': {
    subject: 'Out for delivery today! - {{order_number}}',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Out for Delivery</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🚚 Out for Delivery Today!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                Hi {{customer_name}},
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                Your order is out for delivery and should arrive today!
              </p>
              
              <!-- Tracking Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 1px solid #e0e0e0; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9f9f9;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Order Number</p>
                    <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: bold; color: #000000;">{{order_number}}</p>
                    
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Tracking Number</p>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #000000;">{{tracking_number}}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Track Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{tracking_url}}" style="display: inline-block; padding: 15px 40px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold;">Track Your Package</a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 30px 0 0 0;">
                Please ensure someone is available to receive the package at your delivery address.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Questions? Contact us at <a href="mailto:support@boptone.com" style="color: #000000;">support@boptone.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Out for Delivery Today!

Hi {{customer_name}},

Your order is out for delivery and should arrive today!

Order Number: {{order_number}}
Tracking Number: {{tracking_number}}

Track your package: {{tracking_url}}

Please ensure someone is available to receive the package at your delivery address.

Questions? Contact us at support@boptone.com`
  },

  'shipping-delivered': {
    subject: 'Your order has been delivered! - {{order_number}}',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Delivered</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">✅ Delivered!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                Hi {{customer_name}},
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                Your order has been delivered! We hope you love it.
              </p>
              
              <!-- Order Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border: 1px solid #e0e0e0; border-radius: 4px;">
                <tr>
                  <td style="padding: 20px; background-color: #f9f9f9;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;">Order Number</p>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #000000;">{{order_number}}</p>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 30px 0 0 0;">
                If you have any issues with your order, please don't hesitate to reach out. We're here to help!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Questions? Contact us at <a href="mailto:support@boptone.com" style="color: #000000;">support@boptone.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Delivered!

Hi {{customer_name}},

Your order has been delivered! We hope you love it.

Order Number: {{order_number}}

If you have any issues with your order, please don't hesitate to reach out. We're here to help!

Questions? Contact us at support@boptone.com`
  },

  'review-request': {
    subject: 'How did we do? Leave a review - {{order_number}}',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leave a Review</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">How Did We Do?</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                Hi {{customer_name}},
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">
                We hope you're enjoying your recent purchase! Your feedback helps us improve and helps other customers make informed decisions.
              </p>
              
              <h2 style="font-size: 20px; margin: 30px 0 15px 0; color: #000000;">Review Your Items</h2>
              
              <!-- Items -->
              {{#each items}}
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 4px; padding: 15px;">
                <tr>
                  <td width="80" style="padding-right: 15px;">
                    {{#if imageUrl}}
                    <img src="{{imageUrl}}" alt="{{name}}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
                    {{/if}}
                  </td>
                  <td style="vertical-align: middle;">
                    <p style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #000000;">{{name}}</p>
                    <p style="margin: 0 0 15px 0; font-size: 14px; color: #666666;">by {{artistName}}</p>
                    <a href="{{review_url}}" style="display: inline-block; padding: 10px 20px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px;">Leave a Review</a>
                  </td>
                </tr>
              </table>
              {{/each}}
              
              <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 30px 0 0 0;">
                Thank you for supporting independent artists on Boptone!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                Questions? Contact us at <a href="mailto:support@boptone.com" style="color: #000000;">support@boptone.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `How Did We Do?

Hi {{customer_name}},

We hope you're enjoying your recent purchase! Your feedback helps us improve and helps other customers make informed decisions.

Review Your Items:
{{#each items}}
- {{name}} by {{artistName}}
  Leave a review: {{review_url}}
{{/each}}

Thank you for supporting independent artists on Boptone!

Questions? Contact us at support@boptone.com`
  },
};

/**
 * Get compiled template
 */
function getTemplate(templateName: keyof typeof emailTemplates) {
  const template = emailTemplates[templateName];
  return {
    subject: Handlebars.compile(template.subject),
    html: Handlebars.compile(template.html),
    text: Handlebars.compile(template.text),
  };
}

/**
 * Send email via Manus Email API
 */
async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch(`${ENV.forgeApiUrl}/email/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.forgeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text || params.html.replace(/<[^>]*>/g, ''),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[EmailService] Failed to send email:', error);
      return { success: false, error };
    }

    const result = await response.json();
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[EmailService] Email send error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Log email to database
 */
async function logEmail(params: {
  emailType: 'order_confirmation' | 'abandoned_cart' | 'shipping_in_transit' | 'shipping_out_for_delivery' | 'shipping_delivered' | 'review_request';
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  status: 'queued' | 'sent' | 'failed';
  messageId?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn('[EmailService] Cannot log email: database not available');
    return 0;
  }

  const result = await db.insert(emailLogs).values({
    emailType: params.emailType,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName ?? null,
    subject: params.subject,
    status: params.status,
    messageId: params.messageId ?? null,
    errorMessage: params.errorMessage ?? null,
    metadata: params.metadata ?? null,
    queuedAt: params.status === 'queued' ? new Date() : null,
    sentAt: params.status === 'sent' ? new Date() : null,
    failedAt: params.status === 'failed' ? new Date() : null,
  });

  return Number((result as any).insertId) || 0;
}

/**
 * Format currency
 */
function formatCurrency(amountInCents: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amountInCents / 100);
}

/**
 * Send order confirmation email (1 minute after purchase)
 */
export async function sendOrderConfirmationEmail(params: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    name: string;
    artistName: string;
    imageUrl?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}): Promise<void> {
  const template = getTemplate('order-confirmation');
  
  const templateData = {
    base_url: process.env.VITE_APP_URL || 'https://boptone.com',
    order_number: params.orderNumber,
    customer_name: params.customerName,
    items: params.items.map(item => ({
      ...item,
      formatted_price: formatCurrency(item.price, params.currency),
      formatted_total: formatCurrency(item.price * item.quantity, params.currency),
    })),
    subtotal: formatCurrency(params.subtotal, params.currency),
    shipping_amount: formatCurrency(params.shippingAmount, params.currency),
    tax_amount: formatCurrency(params.taxAmount, params.currency),
    total: formatCurrency(params.total, params.currency),
    shipping_name: params.shippingAddress.name,
    shipping_address_line1: params.shippingAddress.line1,
    shipping_address_line2: params.shippingAddress.line2,
    shipping_city: params.shippingAddress.city,
    shipping_state: params.shippingAddress.state,
    shipping_postal_code: params.shippingAddress.zip,
    shipping_country: params.shippingAddress.country,
  };

  const html = template.html(templateData);
  const text = template.text(templateData);
  const subject = template.subject(templateData);

  // Log email
  const logId = await logEmail({
    emailType: 'order_confirmation',
    recipientEmail: params.customerEmail,
    recipientName: params.customerName,
    subject,
    status: 'queued',
    metadata: { orderNumber: params.orderNumber },
  });

  // Send email
  const result = await sendEmail({
    to: params.customerEmail,
    subject,
    html,
    text,
  });

  // Update log
  if (result.success) {
    console.log(`[EmailService] Order confirmation sent to ${params.customerEmail} (log ${logId})`);
  } else {
    console.error(`[EmailService] Failed to send order confirmation to ${params.customerEmail}:`, result.error);
  }
}

/**
 * Send abandoned cart email (24 hours after checkout started)
 */
export async function sendAbandonedCartEmail(params: {
  cartEventId: number;
  customerEmail: string;
  customerName?: string;
  userId?: number;
  items: Array<{
    name: string;
    artistName: string;
    imageUrl?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  currency: string;
  checkoutUrl: string;
}): Promise<void> {
  const template = getTemplate('abandoned-cart');
  
  const templateData = {
    base_url: process.env.VITE_APP_URL || 'https://boptone.com',
    customer_name: params.customerName || 'there',
    items: params.items.map(item => ({
      ...item,
      formatted_price: formatCurrency(item.price, params.currency),
      formatted_total: formatCurrency(item.price * item.quantity, params.currency),
    })),
    subtotal: formatCurrency(params.subtotal, params.currency),
    checkout_url: params.checkoutUrl,
  };

  const html = template.html(templateData);
  const text = template.text(templateData);
  const subject = template.subject(templateData);

  // Log email
  const logId = await logEmail({
    emailType: 'abandoned_cart',
    recipientEmail: params.customerEmail,
    recipientName: params.customerName,
    subject,
    status: 'queued',
    metadata: { cartEventId: params.cartEventId, userId: params.userId },
  });

  // Send email
  const result = await sendEmail({
    to: params.customerEmail,
    subject,
    html,
    text,
  });

  // Update log
  if (result.success) {
    console.log(`[EmailService] Abandoned cart email sent to ${params.customerEmail} (log ${logId})`);
  } else {
    console.error(`[EmailService] Failed to send abandoned cart email to ${params.customerEmail}:`, result.error);
  }
}

/**
 * Send shipping update email (in-transit, out-for-delivery, delivered)
 */
export async function sendShippingUpdateEmail(params: {
  emailType: 'shipping_in_transit' | 'shipping_out_for_delivery' | 'shipping_delivered';
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  serviceLevel?: string;
  estimatedDeliveryDate?: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
}): Promise<void> {
  const templateName = params.emailType.replace('shipping_', 'shipping-') as keyof typeof emailTemplates;
  const template = getTemplate(templateName);
  
  const templateData = {
    base_url: process.env.VITE_APP_URL || 'https://boptone.com',
    order_number: params.orderNumber,
    customer_name: params.customerName,
    tracking_number: params.trackingNumber,
    tracking_url: params.trackingUrl,
    carrier: params.carrier,
    service_level: params.serviceLevel,
    estimated_delivery_date: params.estimatedDeliveryDate,
    shipping_name: params.shippingAddress?.name,
    shipping_address_line1: params.shippingAddress?.line1,
    shipping_address_line2: params.shippingAddress?.line2,
    shipping_city: params.shippingAddress?.city,
    shipping_state: params.shippingAddress?.state,
    shipping_postal_code: params.shippingAddress?.zip,
  };

  const html = template.html(templateData);
  const text = template.text(templateData);
  const subject = template.subject(templateData);

  // Log email
  const logId = await logEmail({
    emailType: params.emailType,
    recipientEmail: params.customerEmail,
    recipientName: params.customerName,
    subject,
    status: 'queued',
    metadata: { orderNumber: params.orderNumber, trackingNumber: params.trackingNumber },
  });

  // Send email
  const result = await sendEmail({
    to: params.customerEmail,
    subject,
    html,
    text,
  });

  // Update log
  if (result.success) {
    console.log(`[EmailService] Shipping update (${params.emailType}) sent to ${params.customerEmail} (log ${logId})`);
  } else {
    console.error(`[EmailService] Failed to send shipping update to ${params.customerEmail}:`, result.error);
  }
}

/**
 * Send review request email (14 days after delivery)
 */
export async function sendReviewRequestEmail(params: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    productId: number;
    name: string;
    artistName: string;
    imageUrl?: string;
  }>;
}): Promise<void> {
  const template = getTemplate('review-request');
  
  const templateData = {
    base_url: process.env.VITE_APP_URL || 'https://boptone.com',
    order_number: params.orderNumber,
    customer_name: params.customerName,
    items: params.items.map(item => ({
      ...item,
      review_url: `${process.env.VITE_APP_URL || 'https://boptone.com'}/products/${item.productId}/review`,
    })),
  };

  const html = template.html(templateData);
  const text = template.text(templateData);
  const subject = template.subject(templateData);

  // Log email
  const logId = await logEmail({
    emailType: 'review_request',
    recipientEmail: params.customerEmail,
    recipientName: params.customerName,
    subject,
    status: 'queued',
    metadata: { orderNumber: params.orderNumber },
  });

  // Send email
  const result = await sendEmail({
    to: params.customerEmail,
    subject,
    html,
    text,
  });

  // Update log
  if (result.success) {
    console.log(`[EmailService] Review request sent to ${params.customerEmail} (log ${logId})`);
  } else {
    console.error(`[EmailService] Failed to send review request to ${params.customerEmail}:`, result.error);
  }
}
