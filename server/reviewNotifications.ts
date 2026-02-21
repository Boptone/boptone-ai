import { getDb } from "./db";
import { products, artistProfiles, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Review Notification Service
 * 
 * Sends email notifications to artists when their products receive new reviews.
 * Leverages Manus built-in notification API for email delivery.
 */

interface ReviewNotificationData {
  productId: number;
  productName: string;
  rating: number;
  reviewerName: string;
  reviewTitle?: string;
  reviewContent: string;
  reviewId: number;
}

/**
 * Notify artist when their product receives a new review
 * 
 * @param reviewData - Review details for notification
 * @returns Success status
 */
export async function notifyArtistOfReview(reviewData: ReviewNotificationData): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Review Notification] Database unavailable");
      return false;
    }

    // Get product details and artist info
    const [product] = await db
      .select({
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        artistId: products.artistId,
        artistProfile: {
          id: artistProfiles.id,
          userId: artistProfiles.userId,
          stageName: artistProfiles.stageName,
        },
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
        },
      })
      .from(products)
      .leftJoin(artistProfiles, eq(products.artistId, artistProfiles.id))
      .leftJoin(users, eq(artistProfiles.userId, users.id))
      .where(eq(products.id, reviewData.productId))
      .limit(1);

    if (!product || !product.user?.email) {
      console.error("[Review Notification] Product or artist email not found");
      return false;
    }

    // Generate star rating display
    const starRating = "★".repeat(reviewData.rating) + "☆".repeat(5 - reviewData.rating);

    // Build email content
    const emailSubject = `New ${reviewData.rating}-Star Review on "${reviewData.productName}"`;
    
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #f0f0f0;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 8px;
    }
    .stars {
      font-size: 32px;
      color: #fbbf24;
      margin: 16px 0;
      letter-spacing: 4px;
    }
    .product-name {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 16px 0 8px 0;
    }
    .review-meta {
      color: #666666;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .review-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 16px 0 8px 0;
    }
    .review-content {
      background-color: #f9f9f9;
      border-left: 4px solid #81e6fe;
      padding: 16px;
      margin: 16px 0;
      border-radius: 4px;
      color: #1a1a1a;
      font-size: 15px;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      box-shadow: 4px 4px 0px #81e6fe;
      transition: all 0.2s;
    }
    .cta-button:hover {
      box-shadow: 2px 2px 0px #81e6fe;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 2px solid #f0f0f0;
      color: #666666;
      font-size: 13px;
    }
    .footer a {
      color: #000000;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BOPTONE</div>
      <div style="color: #666; font-size: 14px;">BopShop Review Notification</div>
    </div>

    <div class="stars">${starRating}</div>
    
    <div class="product-name">${reviewData.productName}</div>
    <div class="review-meta">Reviewed by ${reviewData.reviewerName}</div>

    ${reviewData.reviewTitle ? `<div class="review-title">${reviewData.reviewTitle}</div>` : ''}
    
    <div class="review-content">
      ${reviewData.reviewContent}
    </div>

    <div style="text-align: center;">
      <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://boptone.com'}/bopshop/${product.productSlug}#reviews" class="cta-button">
        View Review & Respond
      </a>
    </div>

    <div class="footer">
      <p>
        This review was posted on your BopShop product.<br>
        <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://boptone.com'}/store">Manage your store</a> | 
        <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://boptone.com'}/settings">Notification settings</a>
      </p>
      <p style="margin-top: 16px;">
        <strong>Boptone</strong> - Automate Your Tone
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Send notification using Manus built-in notification API
    const notificationResult = await sendEmailNotification({
      to: product.user.email,
      subject: emailSubject,
      html: emailBody,
      metadata: {
        type: "review_notification",
        productId: reviewData.productId,
        reviewId: reviewData.reviewId,
        artistId: product.artistId,
      },
    });

    if (notificationResult) {
      console.log(`[Review Notification] Sent to ${product.user.email} for product #${reviewData.productId}`);
      return true;
    } else {
      console.error("[Review Notification] Failed to send email");
      return false;
    }
  } catch (error) {
    console.error("[Review Notification] Error:", error);
    return false;
  }
}

/**
 * Send email notification using Manus built-in notification API
 * 
 * @param emailData - Email details
 * @returns Success status
 */
async function sendEmailNotification(emailData: {
  to: string;
  subject: string;
  html: string;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  try {
    // Use Manus built-in notification API
    const response = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/notification/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        metadata: emailData.metadata,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Email Notification] API error:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Email Notification] Fetch error:", error);
    return false;
  }
}
