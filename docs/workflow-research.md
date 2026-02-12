# Workflow Automation System Research

## n8n Database Structure Analysis

### Core Tables (from n8n documentation)

**workflow_entity**
- Stores saved workflows
- Contains workflow definition (nodes, connections, settings)
- Primary table for workflow data

**execution_entity**
- Stores all saved workflow executions
- Tracks execution history and status
- Links to execution_data for detailed results

**execution_data**
- Contains the workflow at time of running
- Stores execution data and results
- Separate from entity for performance

**webhook_entity**
- Records active webhooks in workflows
- Not just Webhook nodes - includes all trigger nodes with webhooks
- Critical for trigger system

**workflow_statistics**
- Counts workflow IDs and their status
- Analytics and monitoring data

**workflow_history**
- Stores previous versions of workflows
- Version control and rollback capability

**credentials_entity**
- Stores credentials for integrations
- Authentication data for external services

**shared_workflow**
- Maps workflows to users
- Access control and permissions

**tag_entity + workflows_tags**
- Workflow organization and categorization
- Many-to-many relationship

### Key Insights

1. **Separation of Concerns**: n8n separates workflow definition (workflow_entity) from execution data (execution_entity + execution_data) for performance

2. **Webhook-Centric Triggers**: webhook_entity is central to trigger system - all triggers use webhooks internally

3. **Version Control Built-In**: workflow_history table shows versioning is a core feature

4. **Multi-User Support**: shared_workflow enables collaboration and access control

5. **Execution Tracking**: Separate execution tables allow detailed monitoring without bloating workflow definitions

## Next Steps
- Research node-based execution engine patterns
- Study trigger system architecture
- Investigate visual editor libraries (React Flow, React Diagrams)
- Design artist-specific workflow schema


## React Flow for Visual Editor

**React Flow** is the industry-standard library for building node-based UIs in React.

### Key Features
- **MIT-licensed open source** (35.2K GitHub stars, 4.54M weekly installs)
- **Built-in interactions**: dragging nodes, zooming, panning, multi-select, add/remove
- **Custom nodes**: Nodes are React components - fully customizable
- **Plugin system**: Background, Minimap, Controls, Panel, NodeToolbar, NodeResizer
- **Production-ready**: Used by Stripe, Typeform, and thousands of developers

### Why React Flow for Boptone
1. **Zero reinvention**: Don't build node editor from scratch
2. **Artist-friendly**: Drag-and-drop, visual, intuitive
3. **Customizable**: Can style nodes to match Brex aesthetic
4. **Performance**: Handles complex workflows efficiently
5. **Community**: Large ecosystem, well-documented

### Implementation Plan
- Install `@xyflow/react` package
- Create custom node types for triggers, actions, conditions
- Build workflow canvas component
- Add Minimap for navigation
- Implement Controls for zoom/pan
- Style nodes with Tailwind to match Boptone design



## Artist-Specific Workflow Use Cases

### Fan Engagement Automation
1. **New Follower Welcome** - When artist gains new follower → Send personalized welcome DM + offer exclusive content
2. **Milestone Celebrations** - When streams hit 1K/10K/100K → Auto-post celebration to Instagram/Twitter + thank fans
3. **Tip Jar Thank You** - When fan tips via Kick In → Send automated thank-you email with exclusive download
4. **Birthday Messages** - When fan birthday → Send personalized birthday message + discount code

### Release & Distribution Automation
5. **Pre-Save Campaign** - When new release scheduled → Create pre-save landing page + send to email list
6. **Release Day Blitz** - When track goes live → Post to all social platforms + notify email list + update website
7. **Playlist Pitching** - When new track uploaded → Auto-submit to curator database + send pitch emails
8. **Distribution Status** - When track approved/rejected by platform → Notify artist + update dashboard

### Revenue & Analytics Automation
9. **Payout Notifications** - When balance reaches $20 → Notify artist "Ready to withdraw"
10. **Revenue Reports** - Every Monday → Generate weekly revenue report + email to artist
11. **Stream Milestones** - When track hits stream goal → Celebrate on social + update bio
12. **Sales Alerts** - When merch sold on BopShop → Notify artist + update inventory

### Marketing & Promotion Automation
13. **Content Repurposing** - When new track released → Auto-generate social media posts + audiograms + stories
14. **Fan Segmentation** - When fan engages X times → Move to "superfan" segment + send exclusive offer
15. **Email Sequences** - When new subscriber joins → Send 5-day welcome sequence introducing artist
16. **Social Proof** - When positive review received → Auto-share to social media + add to website

### Collaboration & Team Automation
17. **Split Sheet Reminders** - When new collaboration created → Remind all writers to sign split sheet
18. **Team Notifications** - When important event occurs → Notify manager/team via Slack/email
19. **Contract Management** - When contract expires in 30 days → Send renewal reminder
20. **Project Updates** - When task completed → Update project board + notify team

### AI-Powered Smart Automation
21. **Predictive Promotion** - AI predicts track will perform well → Auto-boost ad budget
22. **Optimal Posting Times** - AI analyzes engagement → Schedule posts at best times
23. **Fan Sentiment Analysis** - AI monitors comments → Alert artist to negative sentiment
24. **Genre-Based Targeting** - AI identifies similar artists → Auto-follow + engage with their fans



## Boptone Workflow System Architecture

### Core Components

**1. Workflow Definition Layer**
- Visual node-based editor (React Flow)
- Workflow templates library
- Version control and history
- Import/export functionality

**2. Execution Engine**
- Event-driven architecture
- Queue-based job processing
- Retry logic and error handling
- Execution history and logging

**3. Trigger System**
- Webhook receivers (BAP streams, BopShop sales, tips)
- Schedule-based triggers (daily, weekly, monthly)
- Manual triggers (artist-initiated)
- Platform events (follower milestones, revenue thresholds)

**4. Action System**
- Social media integrations (Instagram, Twitter, TikTok)
- Email/SMS notifications
- Database updates (analytics, user data)
- External API calls (Spotify, Apple Music)
- AI-powered actions (content generation, sentiment analysis)

**5. AI Layer**
- Workflow suggestions based on artist goals
- Natural language workflow creation
- Smart content generation (social posts, emails)
- Predictive analytics (optimal posting times, budget allocation)

### Database Schema Design

**workflows table**
```
id: int (PK)
artistId: int (FK → artist_profiles)
name: varchar(255)
description: text
status: enum('active', 'paused', 'draft')
definition: json (nodes, edges, settings)
version: int
isTemplate: boolean
category: varchar(50) (fan_engagement, release, revenue, marketing)
createdAt: timestamp
updatedAt: timestamp
lastRunAt: timestamp
```

**workflow_executions table**
```
id: int (PK)
workflowId: int (FK → workflows)
status: enum('pending', 'running', 'completed', 'failed')
triggeredBy: varchar(50) (webhook, schedule, manual)
triggerData: json
startedAt: timestamp
completedAt: timestamp
duration: int (milliseconds)
errorMessage: text
retryCount: int
```

**workflow_execution_logs table**
```
id: int (PK)
executionId: int (FK → workflow_executions)
nodeId: varchar(50)
nodeType: varchar(50) (trigger, action, condition)
status: enum('success', 'failed', 'skipped')
input: json
output: json
errorMessage: text
executedAt: timestamp
duration: int (milliseconds)
```

**workflow_triggers table**
```
id: int (PK)
workflowId: int (FK → workflows)
type: enum('webhook', 'schedule', 'event', 'manual')
config: json (cron expression, webhook URL, event type)
isActive: boolean
lastTriggeredAt: timestamp
createdAt: timestamp
```

**workflow_templates table**
```
id: int (PK)
name: varchar(255)
description: text
category: varchar(50)
definition: json (nodes, edges, settings)
usageCount: int
rating: decimal(3,2)
isOfficial: boolean (Boptone-created vs community)
createdAt: timestamp
```

### Execution Flow

1. **Trigger Fired** → Event occurs (new stream, schedule hit, manual click)
2. **Workflow Queued** → Execution job added to queue with trigger data
3. **Execution Started** → Engine pulls job from queue, creates execution record
4. **Node Processing** → Execute nodes sequentially (triggers → conditions → actions)
5. **Action Execution** → Call external APIs, send emails, update database
6. **Logging** → Record each node execution (input, output, duration, errors)
7. **Completion** → Mark execution as completed/failed, update workflow stats
8. **Retry Logic** → If failed, retry up to 3 times with exponential backoff

### Node Types

**Trigger Nodes** (Start workflow)
- BAP Stream Milestone (1K, 10K, 100K streams)
- BopShop Sale (product sold, revenue threshold)
- Tip Received (Kick In tips)
- Follower Milestone (Instagram, Twitter)
- Schedule (daily, weekly, monthly, custom cron)
- Manual (artist clicks "Run Now")

**Condition Nodes** (Branch logic)
- If/Else (compare values, check conditions)
- Filter (array filtering, data transformation)
- Switch (multiple branches based on value)
- Delay (wait X minutes/hours before continuing)

**Action Nodes** (Do something)
- Send Email (via Resend)
- Post to Social Media (Instagram, Twitter, TikTok)
- Send SMS (via Twilio)
- Update Database (analytics, user data)
- Call Webhook (external API)
- Generate AI Content (social posts, emails)
- Notify Team (Slack, Discord)

**Data Nodes** (Transform data)
- Map (transform array)
- Aggregate (sum, count, average)
- Format (date, currency, text)
- Merge (combine multiple inputs)

### Pre-Built Templates (MVP)

1. **New Follower Welcome** - Send DM when new follower
2. **Stream Milestone Celebration** - Post when hitting 1K/10K/100K streams
3. **Weekly Revenue Report** - Email artist every Monday
4. **Tip Thank You** - Send email when fan tips
5. **Release Day Blitz** - Post to all platforms when track goes live
6. **Payout Ready Notification** - Alert when balance ≥ $20
7. **Birthday Fan Message** - Send birthday wishes to fans
8. **Merch Sale Alert** - Notify when product sold
9. **Playlist Pitch Automation** - Submit new tracks to curators
10. **Social Proof Sharing** - Auto-share positive reviews

