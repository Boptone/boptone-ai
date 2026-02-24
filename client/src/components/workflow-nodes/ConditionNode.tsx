import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Card } from '../ui/card';
import { GitBranch } from 'lucide-react';

export default function ConditionNode({ data }: NodeProps) {
  return (
    <Card className="min-w-[200px] border border-amber-500 bg-amber-50 dark:bg-amber-950">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="h-4 w-4 text-amber-600" />
          <span className="font-semibold text-sm text-amber-900 dark:text-amber-100">
            Condition
          </span>
        </div>
        <div className="text-sm font-medium">{data.label as string}</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-amber-500" />
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="!bg-green-500 !top-[30%]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="!bg-red-500 !top-[70%]"
      />
    </Card>
  );
}
