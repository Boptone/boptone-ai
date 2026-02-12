import { invokeLLM } from "./_core/llm";

/**
 * AI Workflow Generator
 * 
 * Converts natural language descriptions into complete executable workflows.
 * Uses structured output to ensure valid workflow JSON.
 */

// Workflow generation schema for structured output
const WORKFLOW_SCHEMA = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Short, descriptive name for the workflow (e.g., 'Thank Fans Who Tip Over $50')"
    },
    description: {
      type: "string",
      description: "One-sentence description of what the workflow does"
    },
    category: {
      type: "string",
      enum: ["fan_engagement", "release_automation", "revenue_tracking", "marketing", "collaboration", "custom"],
      description: "Category that best fits this workflow"
    },
    nodes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique node ID (e.g., 'trigger-1', 'action-1', 'condition-1')"
          },
          type: {
            type: "string",
            enum: ["trigger", "action", "condition", "data"],
            description: "Node type"
          },
          subtype: {
            type: "string",
            description: "Specific node subtype (e.g., 'tip_received', 'send_email', 'if_else', 'map_data')"
          },
          position: {
            type: "object",
            properties: {
              x: { type: "number" },
              y: { type: "number" }
            },
            required: ["x", "y"]
          },
          data: {
            type: "object",
            description: "Node-specific configuration data"
          }
        },
        required: ["id", "type", "subtype", "position", "data"]
      }
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          source: { type: "string" },
          target: { type: "string" },
          sourceHandle: { type: "string" },
          targetHandle: { type: "string" }
        },
        required: ["id", "source", "target"]
      }
    }
  },
  required: ["name", "description", "category", "nodes", "edges"],
  additionalProperties: false
};

// System prompt for AI workflow generation
const SYSTEM_PROMPT = `You are an expert workflow automation assistant for Boptone, a music platform for artists.

Your job is to convert natural language descriptions into complete, executable workflows.

**Available Node Types:**

1. **Trigger Nodes** (start workflows):
   - tip_received: When a fan tips the artist
   - stream_milestone: When streams reach a threshold
   - new_sale: When BopShop sale occurs
   - new_follower: When artist gains a follower
   - schedule: Time-based trigger (daily, weekly, monthly)
   - webhook: External webhook trigger
   - manual: User manually triggers

2. **Action Nodes** (do things):
   - send_email: Send email to artist or fan
   - send_sms: Send SMS message
   - post_social: Post to social media (Instagram, Twitter, etc.)
   - webhook_call: Call external webhook
   - ai_generate: Generate content with AI
   - notify_owner: Notify platform owner

3. **Condition Nodes** (logic):
   - if_else: If/else branching
   - filter: Filter data based on criteria
   - switch: Multi-way branching

4. **Data Nodes** (transform):
   - map_data: Transform/map data fields
   - aggregate: Aggregate/summarize data
   - format: Format data (dates, numbers, etc.)

**Node Configuration Examples:**

Trigger (tip_received):
{
  "id": "trigger-1",
  "type": "trigger",
  "subtype": "tip_received",
  "position": {"x": 100, "y": 200},
  "data": {
    "minAmount": 50
  }
}

Action (send_email):
{
  "id": "action-1",
  "type": "action",
  "subtype": "send_email",
  "position": {"x": 400, "y": 200},
  "data": {
    "to": "{{fanEmail}}",
    "subject": "Thank you!",
    "body": "Thanks for your {{tipAmount}} tip!"
  }
}

Condition (if_else):
{
  "id": "condition-1",
  "type": "condition",
  "subtype": "if_else",
  "position": {"x": 300, "y": 200},
  "data": {
    "condition": "tipAmount > 100"
  }
}

**Edge Format:**
{
  "id": "e1",
  "source": "trigger-1",
  "target": "action-1"
}

For condition nodes, use sourceHandle "true" or "false":
{
  "id": "e2",
  "source": "condition-1",
  "target": "action-2",
  "sourceHandle": "true"
}

**Layout Guidelines:**
- Start trigger at x=100, y=200
- Space nodes 300px apart horizontally
- Use y=150 for "true" branch, y=250 for "false" branch
- Keep workflows left-to-right, top-to-bottom

**Variable Syntax:**
Use {{variableName}} for dynamic data:
- {{fanName}}, {{fanEmail}}, {{tipAmount}}
- {{streamCount}}, {{artistName}}
- {{productName}}, {{orderTotal}}

**Instructions:**
1. Analyze the user's natural language description
2. Identify the trigger (what starts the workflow)
3. Identify the actions (what should happen)
4. Add conditions if needed (if/else logic)
5. Generate complete workflow JSON with proper node positions
6. Ensure all edges connect nodes correctly
7. Use realistic, helpful configurations

Be creative but practical. Generate workflows that actually help artists automate their music career.`;

/**
 * Generate workflow from natural language description
 */
export async function generateWorkflowFromText(description: string): Promise<any> {
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Generate a workflow for: "${description}"` 
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "workflow_generation",
          strict: true,
          schema: WORKFLOW_SCHEMA
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No content returned from LLM");
    }

    const workflow = JSON.parse(content);
    
    // Validate workflow structure
    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new Error("Generated workflow has no nodes");
    }
    
    if (!workflow.edges || workflow.edges.length === 0) {
      throw new Error("Generated workflow has no edges");
    }

    return workflow;
  } catch (error) {
    console.error("[AI Workflow Generator] Error:", error);
    throw new Error(`Failed to generate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Refine existing workflow based on user feedback
 */
export async function refineWorkflow(
  currentWorkflow: any,
  refinementRequest: string
): Promise<any> {
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Current workflow:\n${JSON.stringify(currentWorkflow, null, 2)}\n\nRefinement request: "${refinementRequest}"\n\nGenerate the updated workflow.` 
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "workflow_refinement",
          strict: true,
          schema: WORKFLOW_SCHEMA
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No content returned from LLM");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("[AI Workflow Generator] Refinement error:", error);
    throw new Error(`Failed to refine workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
