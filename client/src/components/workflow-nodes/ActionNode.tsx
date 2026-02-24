import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card } from '../ui/card';
import { Play } from 'lucide-react';

export default function ActionNode({ data }: NodeProps) {
  return (
    <Card className="min-w-[200px] border border-blue-500 bg-blue-50 dark:bg-blue-950">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Play className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-sm text-blue-900 dark:text-blue-100">
            Action
          </span>
        </div>
        <div className="text-sm font-medium">{data.label as string}</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-blue-500" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500" />
    </Card>
  );
}
