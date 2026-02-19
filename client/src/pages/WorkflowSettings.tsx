import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/**
 * Workflow Trigger Configuration UI
 * Artists configure automation rules: "When X happens → do Y"
 */
export default function WorkflowSettings() {
  const { user, loading: authLoading } = useAuth();
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [showCreateTrigger, setShowCreateTrigger] = useState(false);

  // New trigger form state
  const [eventType, setEventType] = useState<string>("");
  const [threshold, setThreshold] = useState<string>("");
  const [comparison, setComparison] = useState<string>("greater_or_equal");

  // Fetch workflows
  const { data: workflows, isLoading: workflowsLoading } = trpc.workflows.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  // Fetch triggers for selected workflow
  const { data: triggers, refetch: refetchTriggers } = trpc.workflows.getTriggers.useQuery(
    { workflowId: selectedWorkflow! },
    { enabled: !!selectedWorkflow }
  );

  // Mutations
  const createTrigger = trpc.workflows.createTrigger.useMutation({
    onSuccess: () => {
      toast.success("Trigger created successfully!");
      refetchTriggers();
      setShowCreateTrigger(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create trigger: ${error.message}`);
    },
  });

  const deleteTrigger = trpc.workflows.deleteTrigger.useMutation({
    onSuccess: () => {
      toast.success("Trigger deleted");
      refetchTriggers();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const updateTrigger = trpc.workflows.updateTrigger.useMutation({
    onSuccess: () => {
      toast.success("Trigger updated");
      refetchTriggers();
    },
  });

  const resetForm = () => {
    setEventType("");
    setThreshold("");
    setComparison("greater_or_equal");
  };

  const handleCreateTrigger = () => {
    if (!selectedWorkflow) {
      toast.error("Please select a workflow first");
      return;
    }

    if (!eventType) {
      toast.error("Please select an event type");
      return;
    }

    if (!threshold) {
      toast.error("Please enter a threshold value");
      return;
    }

    createTrigger.mutate({
      workflowId: selectedWorkflow,
      type: "event",
      config: {
        eventType,
        threshold: parseInt(threshold),
        comparison: comparison as any,
      },
    });
  };

  const handleToggleTrigger = (triggerId: number, currentActive: boolean) => {
    updateTrigger.mutate({
      id: triggerId,
      isActive: !currentActive,
    });
  };

  const handleDeleteTrigger = (triggerId: number) => {
    if (confirm("Are you sure you want to delete this trigger?")) {
      deleteTrigger.mutate({ id: triggerId });
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      stream_milestone: "Stream Milestone",
      new_follower: "New Follower",
      sale: "Product Sale",
      tip: "Tip Received",
      album_release: "Album Release",
      playlist_add: "Playlist Add",
    };
    return labels[type] || type;
  };

  const getComparisonLabel = (comp: string) => {
    const labels: Record<string, string> = {
      equals: "equals",
      greater_than: "greater than",
      less_than: "less than",
      greater_or_equal: "greater than or equal to",
      less_or_equal: "less than or equal to",
    };
    return labels[comp] || comp;
  };

  if (authLoading || workflowsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl font-bold text-gray-900">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-24 bg-gray-50">
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-black">Workflow Triggers</h1>
        <p className="text-lg text-gray-700">Please log in to configure workflow triggers.</p>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-5xl bg-gray-50">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4 text-black">
          Workflow Triggers
        </h1>
        <p className="text-lg text-gray-700 font-medium">
          Configure automation rules: "When X happens → do Y"
        </p>
      </div>

      {/* Workflow Selector */}
      <Card className="mb-8 rounded-none border-4 border-black bg-white">
        <CardHeader className="border-b-4 border-black">
          <CardTitle className="text-2xl font-bold text-black">Select Workflow</CardTitle>
          <CardDescription className="text-gray-700 font-medium">
            Choose a workflow to configure its triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Select
            value={selectedWorkflow?.toString() || ""}
            onValueChange={(value) => setSelectedWorkflow(parseInt(value))}
          >
            <SelectTrigger className="w-full rounded-none border-2 border-gray-200 h-12 text-lg font-medium">
              <SelectValue placeholder="Select a workflow..." />
            </SelectTrigger>
            <SelectContent className="rounded-none border-2 border-gray-200">
              {workflows?.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id.toString()} className="text-lg">
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {workflows?.length === 0 && (
            <p className="text-sm text-gray-600 mt-4 font-medium">
              No workflows found. Create a workflow first from the{" "}
              <a href="/workflows" className="text-black underline font-bold">
                Workflows page
              </a>
              .
            </p>
          )}
        </CardContent>
      </Card>

      {/* Triggers List */}
      {selectedWorkflow && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-black">Active Triggers</h2>
            <Button 
              onClick={() => setShowCreateTrigger(true)} 
              className="rounded-none bg-black text-white hover:bg-gray-900 border-4 border-black font-bold px-6 py-3 text-lg"
            >
              + Add Trigger
            </Button>
          </div>

          {/* Existing Triggers */}
          <div className="space-y-4 mb-8">
            {triggers?.map((trigger) => {
              const config = trigger.config as any;
              return (
                <Card key={trigger.id} className="rounded-none border-4 border-black bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold">INSTANT</span>
                          <h3 className="font-bold text-xl text-black">
                            {getEventTypeLabel(config.eventType)}
                          </h3>
                          <Badge 
                            variant={trigger.isActive ? "default" : "secondary"}
                            className="rounded-none border-2 border-gray-200 font-bold"
                          >
                            {trigger.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <p className="text-gray-700 font-medium">
                          When {getEventTypeLabel(config.eventType).toLowerCase()}{" "}
                          {getComparisonLabel(config.comparison)} {config.threshold}
                        </p>
                        <p className="text-sm text-gray-600 mt-2 font-medium">
                          Triggered {trigger.triggerCount} times
                          {trigger.lastTriggeredAt && (
                            <> • Last: {new Date(trigger.lastTriggeredAt).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleTrigger(trigger.id, trigger.isActive)}
                          className="rounded-none border-2 border-gray-200 hover:bg-gray-100"
                        >
                          {trigger.isActive ? "❚❚" : "▶"}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteTrigger(trigger.id)}
                          className="rounded-none border-2 border-gray-200 hover:bg-gray-100"
                        >
                          DELETE
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {triggers?.length === 0 && !showCreateTrigger && (
              <Card className="rounded-none border-4 border-black bg-white">
                <CardContent className="pt-6 text-center py-12">
                  <span className="text-6xl mb-4 block">INSTANT</span>
                  <p className="text-gray-700 mb-4 font-medium text-lg">
                    No triggers configured for this workflow yet.
                  </p>
                  <Button 
                    onClick={() => setShowCreateTrigger(true)} 
                    className="rounded-none bg-black text-white hover:bg-gray-900 border-4 border-black font-bold px-6 py-3 text-lg"
                  >
                    + Add Your First Trigger
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Create Trigger Form */}
          {showCreateTrigger && (
            <Card className="rounded-none border-4 border-black bg-white">
              <CardHeader className="border-b-4 border-black">
                <CardTitle className="text-2xl font-bold text-black">Create New Trigger</CardTitle>
                <CardDescription className="text-gray-700 font-medium">
                  Define when this workflow should automatically execute
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Event Type */}
                <div className="space-y-2">
                  <Label htmlFor="eventType" className="text-lg font-bold text-black">Event Type</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger id="eventType" className="rounded-none border-2 border-gray-200 h-12 text-lg font-medium">
                      <SelectValue placeholder="Select an event..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-gray-200">
                      <SelectItem value="stream_milestone" className="text-lg">Stream Milestone</SelectItem>
                      <SelectItem value="new_follower" className="text-lg">New Follower</SelectItem>
                      <SelectItem value="sale" className="text-lg">Product Sale</SelectItem>
                      <SelectItem value="tip" className="text-lg">Tip Received</SelectItem>
                      <SelectItem value="album_release" className="text-lg">Album Release</SelectItem>
                      <SelectItem value="playlist_add" className="text-lg">Playlist Add</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 font-medium">
                    What event should trigger this workflow?
                  </p>
                </div>

                {/* Comparison */}
                <div className="space-y-2">
                  <Label htmlFor="comparison" className="text-lg font-bold text-black">Condition</Label>
                  <Select value={comparison} onValueChange={setComparison}>
                    <SelectTrigger id="comparison" className="rounded-none border-2 border-gray-200 h-12 text-lg font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-gray-200">
                      <SelectItem value="equals" className="text-lg">Equals</SelectItem>
                      <SelectItem value="greater_than" className="text-lg">Greater Than</SelectItem>
                      <SelectItem value="less_than" className="text-lg">Less Than</SelectItem>
                      <SelectItem value="greater_or_equal" className="text-lg">Greater Than or Equal To</SelectItem>
                      <SelectItem value="less_or_equal" className="text-lg">Less Than or Equal To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Threshold */}
                <div className="space-y-2">
                  <Label htmlFor="threshold" className="text-lg font-bold text-black">Threshold Value</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="e.g., 1000"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="rounded-none border-2 border-gray-200 h-12 text-lg font-medium"
                  />
                  <p className="text-sm text-gray-600 font-medium">
                    The value that must be reached to trigger the workflow
                  </p>
                </div>

                {/* Preview */}
                {eventType && threshold && (
                  <div className="bg-gray-100 p-4 rounded-none border-2 border-gray-200">
                    <p className="text-sm font-bold mb-1 text-black">Trigger Preview:</p>
                    <p className="text-sm text-gray-700 font-medium">
                      When <strong>{getEventTypeLabel(eventType).toLowerCase()}</strong>{" "}
                      {getComparisonLabel(comparison)} <strong>{threshold}</strong> → execute
                      workflow
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleCreateTrigger}
                    disabled={createTrigger.isPending}
                    className="rounded-none bg-black text-white hover:bg-gray-900 border-4 border-black font-bold px-6 py-3 text-lg"
                  >
                    {createTrigger.isPending && "..."}
                    Create Trigger
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateTrigger(false);
                      resetForm();
                    }}
                    className="rounded-none border-2 border-gray-200 hover:bg-gray-100 font-bold px-6 py-3 text-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
