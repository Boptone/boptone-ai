import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  Play,
  Save,
  Plus,
  Zap,
  Mail,
  Bell,
  Webhook,
  Brain,
  GitBranch,
  Clock,
  ShoppingBag,
  Heart,
  Users,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// Custom Node Components
import TriggerNode from './workflow-nodes/TriggerNode';
import ActionNode from './workflow-nodes/ActionNode';
import ConditionNode from './workflow-nodes/ConditionNode';
import DataNode from './workflow-nodes/DataNode';

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  data: DataNode,
};

interface WorkflowBuilderProps {
  workflowId?: number;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onTest?: () => void;
}

type FieldType = 'text' | 'textarea' | 'select';
interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}
interface NodeSchema {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  fields: FieldDef[];
}

const NODE_SCHEMAS: Record<string, NodeSchema> = {
  stream_milestone: {
    label: 'Stream Milestone', icon: Zap,
    fields: [{ key: 'threshold', label: 'Stream Count Threshold', type: 'text', placeholder: '1000000', required: true }],
  },
  new_follower: { label: 'New Follower', icon: Users, fields: [] },
  bopshop_sale: {
    label: 'BopShop Sale', icon: ShoppingBag,
    fields: [{ key: 'minAmount', label: 'Min Sale Amount ($)', type: 'text', placeholder: '0' }],
  },
  tip_received: {
    label: 'Tip Received', icon: Heart,
    fields: [{ key: 'minAmount', label: 'Min Tip Amount ($)', type: 'text', placeholder: '0' }],
  },
  follower_milestone: {
    label: 'Follower Milestone', icon: Users,
    fields: [{ key: 'threshold', label: 'Follower Count Threshold', type: 'text', placeholder: '10000', required: true }],
  },
  schedule: {
    label: 'Schedule', icon: Clock,
    fields: [
      { key: 'cron', label: 'Cron Expression', type: 'text', placeholder: '0 9 * * 1', required: true },
      { key: 'timezone', label: 'Timezone', type: 'text', placeholder: 'America/New_York' },
    ],
  },
  send_email: {
    label: 'Send Email', icon: Mail,
    fields: [
      { key: 'to', label: 'To (email or {{fan.email}})', type: 'text', placeholder: '{{fan.email}}', required: true },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'New release from {{artist.name}}', required: true },
      { key: 'body', label: 'Body', type: 'textarea', placeholder: 'Hey {{fan.name}}, check out my new track...' },
    ],
  },
  send_notification: {
    label: 'Notify Me', icon: Bell,
    fields: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'New milestone reached!', required: true },
      { key: 'message', label: 'Message', type: 'textarea', placeholder: '{{artist.name}} just hit {{count}} streams!' },
      { key: 'type', label: 'Type', type: 'select', options: ['milestone', 'opportunity', 'financial', 'system', 'alert'] },
    ],
  },
  notify_fans: {
    label: 'Notify All Fans', icon: Users,
    fields: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'New release out now!', required: true },
      { key: 'message', label: 'Message', type: 'textarea', placeholder: 'Hey everyone, my new track is live...' },
      { key: 'actionUrl', label: 'Action URL (optional)', type: 'text', placeholder: '/bops/my-new-track' },
    ],
  },
  call_webhook: {
    label: 'Call Webhook', icon: Webhook,
    fields: [
      { key: 'url', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/...', required: true },
      { key: 'method', label: 'Method', type: 'select', options: ['POST', 'GET', 'PUT', 'PATCH'] },
    ],
  },
  generate_ai_content: {
    label: 'Generate AI Content', icon: Brain,
    fields: [
      { key: 'prompt', label: 'Prompt', type: 'textarea', placeholder: 'Write a social media post celebrating {{count}} streams...', required: true },
      { key: 'systemPrompt', label: 'AI Persona (optional)', type: 'textarea', placeholder: 'You are a creative music marketing assistant...' },
    ],
  },
  post_instagram: {
    label: 'Post to Instagram', icon: Sparkles,
    fields: [{ key: 'caption', label: 'Caption', type: 'textarea', placeholder: '{{ai_content.content}} #music #newrelease' }],
  },
  post_twitter: {
    label: 'Post to Twitter/X', icon: Sparkles,
    fields: [{ key: 'text', label: 'Tweet Text', type: 'textarea', placeholder: '{{ai_content.content}}' }],
  },
  wait: {
    label: 'Wait / Delay', icon: Clock,
    fields: [
      { key: 'delayHours', label: 'Delay Hours', type: 'text', placeholder: '24' },
      { key: 'delayMinutes', label: 'Delay Minutes', type: 'text', placeholder: '0' },
    ],
  },
  if_else: {
    label: 'If / Else', icon: GitBranch,
    fields: [
      { key: 'field', label: 'Field to Check', type: 'text', placeholder: 'amount' },
      { key: 'operator', label: 'Operator', type: 'select', options: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'exists'] },
      { key: 'value', label: 'Value', type: 'text', placeholder: '100' },
    ],
  },
  filter: {
    label: 'Filter', icon: GitBranch,
    fields: [{ key: 'field', label: 'Array Field', type: 'text', placeholder: 'items' }],
  },
  format: {
    label: 'Format Data', icon: Sparkles,
    fields: [{ key: 'template', label: 'Template', type: 'textarea', placeholder: '{{artist.name}} has {{count}} streams!' }],
  },
  merge: { label: 'Merge Data', icon: Sparkles, fields: [] },
};

function getSchema(subtype: string): NodeSchema {
  return NODE_SCHEMAS[subtype] ?? { label: subtype, icon: Zap, fields: [] };
}

function validateWorkflow(nodes: Node[], edges: Edge[]): string[] {
  const errors: string[] = [];
  if (!nodes.some((n) => n.type === 'trigger')) errors.push('Add at least one Trigger node to start the workflow.');
  if (!nodes.some((n) => n.type === 'action')) errors.push('Add at least one Action node to do something.');
  if (nodes.length > 1 && edges.length === 0) errors.push('Connect your nodes with arrows to define the flow.');
  for (const node of nodes) {
    const schema = getSchema(node.data?.subtype as string);
    for (const field of schema.fields) {
      if (field.required) {
        const val = (node.data?.config as Record<string, string>)?.[field.key];
        if (!val || String(val).trim() === '') {
          errors.push(`"${schema.label}" node is missing required field: ${field.label}`);
        }
      }
    }
  }
  return errors;
}

export default function WorkflowBuilder({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  onTest,
}: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const generateMutation = trpc.workflows.generateFromText.useMutation({
    onSuccess: (data) => {
      if (data?.nodes) {
        setNodes(data.nodes as Node[]);
        setEdges((data.edges ?? []) as Edge[]);
        setShowAiInput(false);
        setAiPrompt('');
        toast.success('Workflow generated! Review nodes and save.');
      }
    },
    onError: () => toast.error('AI generation failed — try a different description.'),
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(
    (type: 'trigger' | 'action' | 'condition' | 'data', subtype: string) => {
      const schema = getSchema(subtype);
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x: 120 + Math.random() * 160, y: 80 + nodes.length * 110 },
        data: { label: schema.label, subtype, config: {} },
      };
      setNodes((nds) => [...nds, newNode]);
      setSelectedNode(newNode);
    },
    [setNodes, nodes.length]
  );

  const updateNodeConfig = useCallback(
    (nodeId: string, key: string, value: string) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          const newConfig = { ...(n.data.config as Record<string, string>), [key]: value };
          const updated = { ...n, data: { ...n.data, config: newConfig } };
          setSelectedNode((prev) => (prev?.id === nodeId ? updated : prev));
          return updated;
        })
      );
    },
    [setNodes]
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setSelectedNode((prev) => (prev?.id === nodeId ? null : prev));
    },
    [setNodes, setEdges]
  );

  const handleSave = () => {
    const errors = validateWorkflow(nodes, edges);
    setValidationErrors(errors);
    if (errors.length > 0) { toast.error('Fix validation errors before saving.'); return; }
    setValidationErrors([]);
    if (onSave) onSave(nodes, edges);
  };

  const schema = selectedNode ? getSchema(selectedNode.data?.subtype as string) : null;
  const NodeIcon = schema?.icon ?? Zap;

  return (
    <div className="flex h-full gap-4 min-h-0">
      {/* Left Panel */}
      <Card className="w-56 p-3 overflow-y-auto flex-shrink-0">
        <div className="mb-3">
          <Button variant="outline" size="sm" className="w-full justify-start text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => setShowAiInput(!showAiInput)}>
            <Sparkles className="h-4 w-4 mr-2" />AI Build
          </Button>
          {showAiInput && (
            <div className="mt-2 space-y-2">
              <Textarea placeholder="e.g. When I get a new follower, send them a welcome email and notify me" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="text-xs min-h-[80px]" />
              <Button size="sm" className="w-full" onClick={() => generateMutation.mutate({ description: aiPrompt, workflowId })} disabled={!aiPrompt.trim() || generateMutation.isPending}>
                {generateMutation.isPending ? 'Generating…' : 'Generate'}
              </Button>
            </div>
          )}
        </div>
        <Separator className="mb-3" />
        <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Triggers</p>
        <div className="space-y-0.5 mb-4">
          {[['new_follower','New Follower'],['stream_milestone','Stream Milestone'],['bopshop_sale','BopShop Sale'],['tip_received','Tip Received'],['follower_milestone','Follower Milestone'],['schedule','Schedule']].map(([s,l]) => (
            <Button key={s} variant="ghost" size="sm" className="w-full justify-start h-7 text-xs" onClick={() => addNode('trigger', s)}>
              <Plus className="h-3 w-3 mr-1.5 text-emerald-500 flex-shrink-0" />{l}
            </Button>
          ))}
        </div>
        <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Actions</p>
        <div className="space-y-0.5 mb-4">
          {[['send_email','Send Email'],['send_notification','Notify Me'],['notify_fans','Notify All Fans'],['generate_ai_content','AI Content'],['call_webhook','Call Webhook'],['post_instagram','Instagram Post'],['post_twitter','Twitter/X Post'],['wait','Wait / Delay']].map(([s,l]) => (
            <Button key={s} variant="ghost" size="sm" className="w-full justify-start h-7 text-xs" onClick={() => addNode('action', s)}>
              <Plus className="h-3 w-3 mr-1.5 text-blue-500 flex-shrink-0" />{l}
            </Button>
          ))}
        </div>
        <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Logic</p>
        <div className="space-y-0.5">
          {[['if_else','If / Else'],['filter','Filter'],['format','Format Data'],['merge','Merge Data']].map(([s,l]) => (
            <Button key={s} variant="ghost" size="sm" className="w-full justify-start h-7 text-xs" onClick={() => addNode('condition', s)}>
              <Plus className="h-3 w-3 mr-1.5 text-amber-500 flex-shrink-0" />{l}
            </Button>
          ))}
        </div>
      </Card>

      {/* Canvas */}
      <div className="flex-1 relative min-w-0">
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <Button onClick={handleSave} size="sm"><Save className="h-4 w-4 mr-1.5" />Save</Button>
          {onTest && <Button onClick={onTest} variant="outline" size="sm"><Play className="h-4 w-4 mr-1.5" />Test Run</Button>}
        </div>
        {validationErrors.length > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-red-50 border border-red-200 rounded-lg p-2 max-w-xs space-y-1">
            {validationErrors.map((err, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-red-700">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />{err}
              </div>
            ))}
          </div>
        )}
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => setSelectedNode(node)} nodeTypes={nodeTypes} fitView className="bg-background">
          <Background />
          <Controls />
          <MiniMap nodeColor={(node) => { switch (node.type) { case 'trigger': return '#10b981'; case 'action': return '#3b82f6'; case 'condition': return '#f59e0b'; case 'data': return '#8b5cf6'; default: return '#6b7280'; } }} />
        </ReactFlow>
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground">
              <Zap className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Start with a Trigger</p>
              <p className="text-xs mt-1">Click a node from the left panel or use AI Build</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Node Config */}
      {selectedNode && schema && (
        <Card className="w-64 p-4 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <NodeIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">{schema.label}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" title="Delete node" onClick={() => removeNode(selectedNode.id)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Badge variant="outline" className="text-xs mb-3 capitalize">{selectedNode.type}</Badge>
          {schema.fields.length === 0 ? (
            <p className="text-xs text-muted-foreground">No configuration needed for this node.</p>
          ) : (
            <div className="space-y-3">
              {schema.fields.map((field) => {
                const config = (selectedNode.data?.config as Record<string, string>) ?? {};
                const currentValue = config[field.key] ?? '';
                return (
                  <div key={field.key}>
                    <Label className="text-xs font-medium">{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea className="mt-1 text-xs min-h-[60px]" placeholder={field.placeholder} value={currentValue} onChange={(e) => updateNodeConfig(selectedNode.id, field.key, e.target.value)} />
                    ) : field.type === 'select' ? (
                      <select className="mt-1 w-full text-xs border rounded-md px-2 py-1.5 bg-background" value={currentValue} onChange={(e) => updateNodeConfig(selectedNode.id, field.key, e.target.value)}>
                        <option value="">Select…</option>
                        {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <Input className="mt-1 text-xs h-8" placeholder={field.placeholder} value={currentValue} onChange={(e) => updateNodeConfig(selectedNode.id, field.key, e.target.value)} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded text-[10px]">{'{{variable}}'}</code> for dynamic values from previous nodes.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
