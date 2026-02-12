/**
 * Seed 10 Pre-Built Workflow Templates
 * 
 * Run this script to populate the workflow_templates table with
 * ready-to-use workflows that artists can activate instantly.
 */

import { createWorkflowTemplate } from "./workflowDb";

const templates = [
  // 1. Stream Milestone Celebration
  {
    name: "Stream Milestone Celebration",
    description: "Automatically post to social media when you hit streaming milestones (10K, 50K, 100K streams)",
    category: "fan_engagement" as const,
    tags: ["social media", "streaming", "celebration"],
    difficulty: "beginner" as const,
    isOfficial: true,
    createdBy: "Boptone",
    definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger" as const,
          subtype: "stream_milestone",
          position: { x: 100, y: 200 },
          data: { milestones: [10000, 50000, 100000] },
        },
        {
          id: "action-1",
          type: "action" as const,
          subtype: "post_social",
          position: { x: 400, y: 200 },
          data: {
            platforms: ["instagram", "twitter"],
            message: "Just hit {{milestone}} streams on {{songTitle}}! Thank you all for the support 🎵🔥",
          },
        },
      ],
      edges: [{ id: "e1", source: "trigger-1", target: "action-1" }],
    },
  },

  // 2. New Tip Thank You
  {
    name: "New Tip Thank You",
    description: "Send automatic thank-you email when fans tip you through Kick In",
    category: "fan_engagement" as const,
    tags: ["tips", "email", "gratitude"],
    difficulty: "beginner" as const,
    isOfficial: true,
    createdBy: "Boptone",
    definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger" as const,
          subtype: "kickin_tip_received",
          position: { x: 100, y: 200 },
          data: { minAmount: 5 },
        },
        {
          id: "action-1",
          type: "action" as const,
          subtype: "send_email",
          position: { x: 400, y: 200 },
          data: {
            to: "{{fanEmail}}",
            subject: "Thank you for your support!",
            body: "Hey {{fanName}},\n\nThank you so much for the ${{amount}} tip! Your support means everything to me and helps me keep creating music.\n\nMuch love,\n{{artistName}}",
          },
        },
      ],
      edges: [{ id: "e1", source: "trigger-1", target: "action-1" }],
    },
  },

  // 3. Weekly Revenue Report
  {
    name: "Weekly Revenue Report",
    description: "Get a weekly email summary of your earnings from all sources",
    category: "revenue_tracking" as const,
    tags: ["revenue", "email", "reports"],
    difficulty: "beginner" as const,
    isOfficial: true,
    createdBy: "Boptone",
    definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger" as const,
          subtype: "schedule",
          position: { x: 100, y: 200 },
          data: { cron: "0 9 * * 1", timezone: "America/New_York" }, // Every Monday 9am
        },
        {
          id: "data-1",
          type: "data" as const,
          subtype: "aggregate_revenue",
          position: { x: 300, y: 200 },
          data: { period: "last_7_days" },
        },
        {
          id: "action-1",
          type: "action" as const,
          subtype: "send_email",
          position: { x: 500, y: 200 },
          data: {
            to: "{{artistEmail}}",
            subject: "Your Weekly Revenue Report",
            body: "Weekly Summary:\n\nStreaming: ${{streamingRevenue}}\nMerch: ${{merchRevenue}}\nTips: ${{tipsRevenue}}\n\nTotal: ${{totalRevenue}}",
          },
        },
      ],
      edges: [
        { id: "e1", source: "trigger-1", target: "data-1" },
        { id: "e2", source: "data-1", target: "action-1" },
      ],
    },
  },

  // 4. New Release Announcement
  {
    name: "New Release Announcement",
    description: "Automatically announce new releases across all your social media channels",
    category: "release_automation" as const,
    tags: ["release", "social media", "announcement"],
    difficulty: "intermediate" as const,
    isOfficial: true,
    createdBy: "Boptone",
    definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger" as const,
          subtype: "new_release",
          position: { x: 100, y: 200 },
          data: {},
        },
        {
          id: "action-1",
          type: "action" as const,
          subtype: "post_social",
          position: { x: 400, y: 100 },
          data: {
            platforms: ["instagram"],
            message: "NEW MUSIC OUT NOW! 🎵\n\n{{releaseTitle}} is available everywhere. Link in bio!",
          },
        },
        {
          id: "action-2",
          type: "action" as const,
          subtype: "post_social",
          position: { x: 400, y: 300 },
          data: {
            platforms: ["twitter"],
            message: "🚨 NEW RELEASE ALERT 🚨\n\n{{releaseTitle}} is out now! Stream it here: {{releaseUrl}}",
          },
        },
      ],
      edges: [
        { id: "e1", source: "trigger-1", target: "action-1" },
        { id: "e2", source: "trigger-1", target: "action-2" },
      ],
    },
  },

  // 5. Low Inventory Alert
  {
    name: "Low Inventory Alert",
    description: "Get notified when merch inventory runs low so you can restock",
    category: "marketing" as const,
    tags: ["inventory", "merch", "alerts"],
    difficulty: "beginner" as const,
    isOfficial: true,
    createdBy: "Boptone",
    definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger" as const,
          subtype: "inventory_low",
          position: { x: 100, y: 200 },
          data: { threshold: 10 },
        },
        {
          id: "action-1",
          type: "action" as const,
          subtype: "send_email",
          position: { x: 400, y: 200 },
          data: {
            to: "{{artistEmail}}",
            subject: "Low Inventory Alert: {{productName}}",
            body: "Your {{productName}} inventory is running low ({{currentStock}} left). Time to restock!",
          },
        },
      ],
      edges: [{ id: "e1", source: "trigger-1", target: "action-1" }],
    },
  },

  // 6. Fan Welcome Series
  {
    name: "Fan Welcome Series",
    description: "Send a welcome email series to new fans who join your mailing list",
    category: "fan_engagement" as const,
    tags: ["email", "onboarding", "fans"],
    difficulty: "intermediate" as const,
    isOfficial: true,
    createdBy: "Boptone",
    definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger" as const,
          subtype: "new_fan",
          position: { x: 100, y: 200 },
          data: {},
        },
        {
          id: "action-1",
          type: "action" as const,
          subtype: "send_email",
          position: { x: 400, y: 200 },
          data: {
            to: "{{fanEmail}}",
            subject: "Welcome to the family!",
            body: "Hey {{fanName}}!\n\nThanks for joining my community. Here's a free download of my latest track as a thank you gift.",
          },
        },
      ],
      edges: [{ id: "e1", source: "trigger-1", target: "action-1" }],
    },
  },

  // 7. Payout Ready Notification
  {
    name: "Payout Ready Notification",
    description: "Get notified when your balance reaches the $20 minimum payout threshold",
    category: "revenue_tracking" as const,
    tags: ["payout", "earnings", "notification"],
    difficulty: "beginner" as const,
    isOfficial: true,
    createdBy: "Boptone",
    definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger" as const,
          subtype: "balance_threshold",
          position: { x: 100, y: 200 },
          data: { threshold: 20 },
        },
        {
          id: "action-1",
          type: "action" as const,
          subtype: "send_email",
          position: { x: 400, y: 200 },
          data: {
            to: "{{artistEmail}}",
            subject: "You can withdraw your earnings!",
            body: "Good news! Your balance has reached ${{balance}}. You can now request a payout.",
          },
        },
      ],
      edges: [{ id: "e1", source: "trigger-1", target: "action-1" }],
    },
  },

  // 8. Monthly Fan Engagement Report
  {
    name: "Monthly Fan Engagement Report",
    description: "Track monthly growth in streams, followers, and engagement",
    category: "marketing" as const,
    tags: ["analytics", "growth", "reports"],
    difficulty: "intermediate" as const,
    isOfficial: true,
    createdBy: "Boptone",
    definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger" as const,
          subtype: "schedule",
          position: { x: 100, y: 200 },
          data: { cron: "0 9 1 * *", timezone: "America/New_York" }, // 1st of month, 9am
        },
        {
          id: "data-1",
          type: "data" as const,
          subtype: "aggregate_metrics",
          position: { x: 300, y: 200 },
          data: { period: "last_30_days" },
        },
        {
          id: "action-1",
          type: "action" as const,
          subtype: "send_email",
          position: { x: 500, y: 200 },
          data: {
            to: "{{artistEmail}}",
            subject: "Your Monthly Growth Report",
            body: "Monthly Summary:\n\nNew Streams: {{newStreams}}\nNew Followers: {{newFollowers}}\nEngagement Rate: {{engagementRate}}%",
          },
        },
      ],
      edges: [
        { id: "e1", source: "trigger-1", target: "data-1" },
        { id: "e2", source: "data-1", target: "action-1" },
      ],
    },
  },

  // 9. Abandoned Cart Recovery
  {
    name: "Abandoned Cart Recovery",
    description: "Send reminder emails to fans who added merch to cart but didn't complete purchase",
    category: "marketing" as const,
    tags: ["ecommerce", "email", "conversion"],
    difficulty: "advanced" as const,
    isOfficial: true,
    createdBy: "Boptone",
    definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger" as const,
          subtype: "cart_abandoned",
          position: { x: 100, y: 200 },
          data: { waitTime: 24 }, // 24 hours
        },
        {
          id: "condition-1",
          type: "condition" as const,
          subtype: "if_else",
          position: { x: 300, y: 200 },
          data: { condition: "cartValue > 20" },
        },
        {
          id: "action-1",
          type: "action" as const,
          subtype: "send_email",
          position: { x: 500, y: 150 },
          data: {
            to: "{{fanEmail}}",
            subject: "You left something behind!",
            body: "Hey {{fanName}}, you left items in your cart. Complete your order now and get 10% off with code COMEBACK10",
          },
        },
      ],
      edges: [
        { id: "e1", source: "trigger-1", target: "condition-1" },
        { id: "e2", source: "condition-1", target: "action-1", sourceHandle: "true" },
      ],
    },
  },

  // 10. Collaboration Request Auto-Response
  {
    name: "Collaboration Request Auto-Response",
    description: "Automatically respond to collaboration inquiries with your rates and availability",
    category: "collaboration" as const,
    tags: ["collaboration", "email", "automation"],
    difficulty: "beginner" as const,
    isOfficial: true,
    createdBy: "Boptone",
    definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger" as const,
          subtype: "collab_request",
          position: { x: 100, y: 200 },
          data: {},
        },
        {
          id: "action-1",
          type: "action" as const,
          subtype: "send_email",
          position: { x: 400, y: 200 },
          data: {
            to: "{{requesterEmail}}",
            subject: "Re: Collaboration Inquiry",
            body: "Thanks for reaching out! I'm currently accepting collaborations. My rates are:\n\nFeature: $500\nProduction: $1000\nWriting: $750\n\nLet me know if you'd like to move forward!",
          },
        },
      ],
      edges: [{ id: "e1", source: "trigger-1", target: "action-1" }],
    },
  },
];

export async function seedWorkflowTemplates() {
  console.log("Seeding workflow templates...");
  
  for (const template of templates) {
    try {
      const id = await createWorkflowTemplate(template);
      console.log(`✓ Created template: ${template.name} (ID: ${id})`);
    } catch (error) {
      console.error(`✗ Failed to create template: ${template.name}`, error);
    }
  }
  
  console.log("Workflow templates seeded successfully!");
}

// Run if executed directly
seedWorkflowTemplates()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed templates:", error);
    process.exit(1);
  });
