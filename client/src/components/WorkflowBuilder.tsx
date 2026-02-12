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
import { Play, Save, Plus } from 'lucide-react';

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

export default function WorkflowBuilder({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  onTest,
}: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(
    (type: 'trigger' | 'action' | 'condition' | 'data', subtype: string) => {
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          label: subtype.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          subtype,
          config: {},
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Node Palette */}
      <Card className="w-64 p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Add Nodes</h3>

        {/* Trigger Nodes */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Triggers</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('trigger', 'stream_milestone')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Stream Milestone
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('trigger', 'bopshop_sale')}
            >
              <Plus className="h-4 w-4 mr-2" />
              BopShop Sale
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('trigger', 'tip_received')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tip Received
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('trigger', 'follower_milestone')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Follower Milestone
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('trigger', 'schedule')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Action Nodes */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Actions</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('action', 'send_email')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('action', 'post_instagram')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Post to Instagram
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('action', 'post_twitter')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Post to Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('action', 'send_sms')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Send SMS
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('action', 'generate_ai_content')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate AI Content
            </Button>
          </div>
        </div>

        {/* Condition Nodes */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Conditions</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('condition', 'if_else')}
            >
              <Plus className="h-4 w-4 mr-2" />
              If/Else
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('condition', 'filter')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Data Nodes */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Data</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('data', 'format')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Format Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => addNode('data', 'merge')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Merge Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Workflow Canvas */}
      <div className="flex-1 relative">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Workflow
          </Button>
          <Button onClick={onTest} variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Test Run
          </Button>
        </div>

        {/* React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'trigger':
                  return '#10b981'; // green
                case 'action':
                  return '#3b82f6'; // blue
                case 'condition':
                  return '#f59e0b'; // amber
                case 'data':
                  return '#8b5cf6'; // purple
                default:
                  return '#6b7280'; // gray
              }
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
