import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card } from '../ui/card';
import { Zap } from 'lucide-react';

export default function TriggerNode({ data }: NodeProps) {
  return (
    <Card className="min-w-[200px] border border-green-500 bg-green-50 dark:bg-green-950">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-sm text-green-900 dark:text-green-100">
            Trigger
          </span>
        </div>
        <div className="text-sm font-medium">{data.label as string}</div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-green-500" />
    </Card>
  );
}
