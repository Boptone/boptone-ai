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
import { Loader2, Plus, Trash2, Play, Pause, Zap } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-24">
        <h1 className="text-4xl font-semibold tracking-tight mb-4">Workflow Triggers</h1>
        <p className="text-lg">Please log in to configure workflow triggers.</p>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-5xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4">
          Workflow Triggers
        </h1>
        <p className="text-lg text-muted-foreground">
          Configure automation rules: "When X happens → do Y"
        </p>
      </div>

      {/* Workflow Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Workflow</CardTitle>
          <CardDescription>
            Choose a workflow to configure its triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedWorkflow?.toString() || ""}
            onValueChange={(value) => setSelectedWorkflow(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a workflow..." />
            </SelectTrigger>
            <SelectContent>
              {workflows?.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id.toString()}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {workflows?.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              No workflows found. Create a workflow first from the{" "}
              <a href="/workflows" className="text-primary underline">
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
            <h2 className="text-2xl font-semibold">Active Triggers</h2>
            <Button onClick={() => setShowCreateTrigger(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Trigger
            </Button>
          </div>

          {/* Existing Triggers */}
          <div className="space-y-4 mb-8">
            {triggers?.map((trigger) => {
              const config = trigger.config as any;
              return (
                <Card key={trigger.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Zap className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-lg">
                            {getEventTypeLabel(config.eventType)}
                          </h3>
                          <Badge variant={trigger.isActive ? "default" : "secondary"}>
                            {trigger.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          When {getEventTypeLabel(config.eventType).toLowerCase()}{" "}
                          {getComparisonLabel(config.comparison)} {config.threshold}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Triggered {trigger.triggerCount} times
                          {trigger.lastTriggeredAt && (
                            <> • Last: {new Date(trigger.lastTriggeredAt).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleTrigger(trigger.id, trigger.isActive)}
                        >
                          {trigger.isActive ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTrigger(trigger.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {triggers?.length === 0 && !showCreateTrigger && (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No triggers configured for this workflow yet.
                  </p>
                  <Button onClick={() => setShowCreateTrigger(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Trigger
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Create Trigger Form */}
          {showCreateTrigger && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Trigger</CardTitle>
                <CardDescription>
                  Define when this workflow should automatically execute
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Type */}
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder="Select an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stream_milestone">Stream Milestone</SelectItem>
                      <SelectItem value="new_follower">New Follower</SelectItem>
                      <SelectItem value="sale">Product Sale</SelectItem>
                      <SelectItem value="tip">Tip Received</SelectItem>
                      <SelectItem value="album_release">Album Release</SelectItem>
                      <SelectItem value="playlist_add">Playlist Add</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    What event should trigger this workflow?
                  </p>
                </div>

                {/* Comparison */}
                <div className="space-y-2">
                  <Label htmlFor="comparison">Condition</Label>
                  <Select value={comparison} onValueChange={setComparison}>
                    <SelectTrigger id="comparison">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                      <SelectItem value="greater_or_equal">Greater Than or Equal To</SelectItem>
                      <SelectItem value="less_or_equal">Less Than or Equal To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Threshold */}
                <div className="space-y-2">
                  <Label htmlFor="threshold">Threshold Value</Label>
                  <Input
                    id="threshold"
                    type="number"
                    placeholder="e.g., 1000"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    The value that must be reached to trigger the workflow
                  </p>
                </div>

                {/* Preview */}
                {eventType && threshold && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-1">Trigger Preview:</p>
                    <p className="text-sm text-muted-foreground">
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
                    className="gap-2"
                  >
                    {createTrigger.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Trigger
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateTrigger(false);
                      resetForm();
                    }}
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
