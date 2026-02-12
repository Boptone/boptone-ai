import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card } from '../ui/card';
import { Database } from 'lucide-react';

export default function DataNode({ data }: NodeProps) {
  return (
    <Card className="min-w-[200px] border-2 border-purple-500 bg-purple-50 dark:bg-purple-950">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4 text-purple-600" />
          <span className="font-semibold text-sm text-purple-900 dark:text-purple-100">
            Data
          </span>
        </div>
        <div className="text-sm font-medium">{data.label as string}</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-purple-500" />
      <Handle type="source" position={Position.Right} className="!bg-purple-500" />
    </Card>
  );
}
