import { eq, and, isNull, gte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { orders, orderItems, reviewReminderLog, productReviews, products, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

/**
 * Review Reminder Email Service
 * 
 * Sends automated emails to customers 7 days after purchase
 * asking them to review the products they bought.
 */

interface ReminderEmail {
  to: string;
  subject: string;
  html: string;
}

/**
 * Generate review reminder email HTML template
 */
function generateReminderEmailHTML(params: {
  customerName: string;
  productName: string;
  productUrl: string;
  orderDate: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How was your purchase?</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                How was your purchase?
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi ${params.customerName},
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for your recent purchase of <strong>${params.productName}</strong> on ${params.orderDate}!
              </p>
              
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                We'd love to hear about your experience. Your review helps other customers make informed decisions and supports independent artists on Boptone.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${params.productUrl}#reviews" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">
                      Write a Review
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Your feedback is invaluable to us and the artist community. Thank you for being part of Boptone!
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px; color: #6c757d; font-size: 14px;">
                <strong>Boptone</strong> - Empowering Independent Artists
              </p>
              <p style="margin: 0; color: #6c757d; font-size: 12px;">
                You're receiving this because you made a purchase on BopShop.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send review reminder email via Manus notification API
 */
async function sendReminderEmail(email: ReminderEmail): Promise<boolean> {
  try {
    const response = await fetch(`${ENV.forgeApiUrl}/notification/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        to: email.to,
        subject: email.subject,
        html: email.html,
      }),
    });

    if (!response.ok) {
      console.error("[ReviewReminder] Failed to send email:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("[ReviewReminder] Email send error:", error);
    return false;
  }
}

/**
 * Find orders eligible for review reminders
 * (7 days old, no existing review, no reminder sent yet)
 */
export async function sendReviewReminders(): Promise<{
  sent: number;
  failed: number;
}> {
  const db = await getDb();
  if (!db) {
    console.warn("[ReviewReminder] Database unavailable");
    return { sent: 0, failed: 0 };
  }

  // Calculate date 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const eightDaysAgo = new Date();
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  try {
    // Find eligible order items (from orders paid 7 days ago, no reminder sent)
    const eligibleItems = await db
      .select({
        orderId: orders.id,
        userId: orders.customerId,
        productId: orderItems.productId,
        userEmail: users.email,
        userName: users.name,
        productName: orderItems.productName,
        orderDate: orders.paidAt,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(reviewReminderLog, and(
        eq(reviewReminderLog.orderId, orders.id),
        eq(reviewReminderLog.productId, orderItems.productId)
      ))
      .where(and(
        gte(orders.paidAt, sql`${eightDaysAgo.toISOString()}`),
        sql`${orders.paidAt} <= ${sevenDaysAgo.toISOString()}`,
        isNull(reviewReminderLog.id) // No reminder sent yet
      ));

    let sent = 0;
    let failed = 0;

    for (const item of eligibleItems) {
      if (!item.userEmail || !item.productName || !item.productId) {
        console.warn(`[ReviewReminder] Skipping order ${item.orderId}: missing email, product name, or product ID`);
        continue;
      }

      // Check if user already reviewed this product
      const [existingReview] = await db
        .select()
        .from(productReviews)
        .where(and(
          eq(productReviews.userId, item.userId),
          eq(productReviews.productId, item.productId)
        ))
        .limit(1);

      if (existingReview) {
        console.log(`[ReviewReminder] Skipping order ${item.orderId}: user already reviewed product`);
        continue;
      }

      // Generate email
      const productUrl = `https://boptone.com/product/${item.productId}`;
      const orderDate = item.orderDate
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(new Date(item.orderDate))
        : "recently";

      const email: ReminderEmail = {
        to: item.userEmail,
        subject: `How was your purchase of ${item.productName}?`,
        html: generateReminderEmailHTML({
          customerName: item.userName || "there",
          productName: item.productName,
          productUrl,
          orderDate,
        }),
      };

      // Send email
      const success = await sendReminderEmail(email);

      // Log reminder attempt
      await db.insert(reviewReminderLog).values({
        orderId: item.orderId,
        userId: item.userId,
        productId: item.productId,
        emailStatus: success ? "sent" : "failed",
      });

      if (success) {
        sent++;
        console.log(`[ReviewReminder] Sent reminder for order ${item.orderId} to ${item.userEmail}`);
      } else {
        failed++;
        console.error(`[ReviewReminder] Failed to send reminder for order ${item.orderId}`);
      }

      // Rate limiting: wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`[ReviewReminder] Batch complete: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  } catch (error) {
    console.error("[ReviewReminder] Error processing reminders:", error);
    return { sent: 0, failed: 0 };
  }
}
