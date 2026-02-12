import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Trash2, 
  Plus, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import AIWorkflowAssistant from "@/components/AIWorkflowAssistant";

/**
 * Workflows Management Page
 * 
 * World-class workflow automation dashboard for Pro/Enterprise artists.
 * Browse templates, create custom workflows, view execution history.
 */
export default function Workflows() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("templates");

  // Fetch data
  const { data: workflows, isLoading: workflowsLoading } = trpc.workflows.list.useQuery();
  const { data: templates, isLoading: templatesLoading } = trpc.workflows.listTemplates.useQuery();

  // Mutations
  const createFromTemplate = trpc.workflows.createFromTemplate.useMutation({
    onSuccess: () => {
      toast.success("Workflow created successfully!");
      setActiveTab("my-workflows");
    },
    onError: (error) => {
      toast.error(`Failed to create workflow: ${error.message}`);
    },
  });

  const deleteWorkflow = trpc.workflows.delete.useMutation({
    onSuccess: () => {
      toast.success("Workflow deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const updateWorkflowStatus = trpc.workflows.update.useMutation({
    onSuccess: () => {
      toast.success("Workflow status updated");
    },
  });

  const handleActivateTemplate = async (templateId: number) => {
    createFromTemplate.mutate({ templateId });
  };

  const handleToggleWorkflow = async (workflowId: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    updateWorkflowStatus.mutate({ id: workflowId, status: newStatus });
  };

  const handleDeleteWorkflow = async (workflowId: number) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      deleteWorkflow.mutate({ id: workflowId });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "fan_engagement":
        return "👥";
      case "release_automation":
        return "🚀";
      case "revenue_tracking":
        return "💰";
      case "marketing":
        return "📢";
      case "collaboration":
        return "🤝";
      default:
        return "⚙️";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* AI Workflow Assistant - Prominent placement */}
        <AIWorkflowAssistant
          onWorkflowGenerated={() => {
            setActiveTab("my-workflows");
          }}
        />
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Workflow Automation</h1>
              <p className="text-gray-600">
                Automate your music career with powerful no-code workflows
              </p>
            </div>
            <Button
              onClick={() => setLocation("/workflows/builder")}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Custom Workflow
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="templates">
              <Sparkles className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="my-workflows">
              <Zap className="w-4 h-4 mr-2" />
              My Workflows
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {templatesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading templates...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates?.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-3xl">{getCategoryIcon(template.category)}</span>
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{template.usageCount}</span>
                          </div>
                          {template.rating && Number(template.rating) > 0 && (
                            <div className="flex items-center gap-1">
                              <span>⭐</span>
                              <span>{Number(template.rating).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleActivateTemplate(template.id)}
                          disabled={createFromTemplate.isPending}
                          size="sm"
                        >
                          Activate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Workflows Tab */}
          <TabsContent value="my-workflows" className="space-y-6">
            {workflowsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading workflows...</p>
              </div>
            ) : workflows && workflows.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {workflows.map((workflow) => (
                  <Card key={workflow.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{getCategoryIcon(workflow.category)}</span>
                          <div>
                            <CardTitle className="text-lg">{workflow.name}</CardTitle>
                            <CardDescription>{workflow.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={workflow.status === "active" ? "default" : "secondary"}
                          >
                            {workflow.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleWorkflow(workflow.id, workflow.status)}
                          >
                            {workflow.status === "active" ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Total Runs: {workflow.totalRuns}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Success: {workflow.successfulRuns}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Failed: {workflow.failedRuns}</span>
                        </div>
                        {workflow.lastRunAt && (
                          <div className="flex items-center gap-2">
                            <span>Last run: {new Date(workflow.lastRunAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No workflows yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Get started by activating a template or creating a custom workflow
                  </p>
                  <Button onClick={() => setActiveTab("templates")}>
                    Browse Templates
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>
                  View detailed logs of all workflow executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>Execution history coming soon</p>
                  <p className="text-sm mt-2">
                    Track every workflow run with detailed logs and performance metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
