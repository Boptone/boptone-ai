import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Check, X, Edit3 } from "lucide-react";
import { toast } from "sonner";

/**
 * AI Workflow Assistant
 * 
 * Converts natural language descriptions into complete executable workflows.
 * Game-changing feature that makes automation accessible to all artists.
 */

const EXAMPLE_PROMPTS = [
  "Thank fans who tip over $50",
  "Post to Instagram when I hit 10K streams",
  "Send weekly revenue report every Monday",
  "Notify me when BopShop inventory is low",
  "Welcome new followers with an email",
];

interface AIWorkflowAssistantProps {
  onWorkflowGenerated?: (workflow: any) => void;
  compact?: boolean;
}

export default function AIWorkflowAssistant({ onWorkflowGenerated, compact = false }: AIWorkflowAssistantProps) {
  const [description, setDescription] = useState("");
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [refinementRequest, setRefinementRequest] = useState("");

  const generateMutation = trpc.workflows.generateFromText.useMutation({
    onSuccess: (workflow) => {
      setGeneratedWorkflow(workflow);
      setShowPreview(true);
      toast.success("Workflow generated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to generate workflow: ${error.message}`);
    },
  });

  const refineMutation = trpc.workflows.refineWorkflow.useMutation({
    onSuccess: (workflow) => {
      setGeneratedWorkflow(workflow);
      setRefinementRequest("");
      toast.success("Workflow refined!");
    },
    onError: (error) => {
      toast.error(`Failed to refine workflow: ${error.message}`);
    },
  });

  const saveMutation = trpc.workflows.saveGeneratedWorkflow.useMutation({
    onSuccess: () => {
      toast.success("Workflow saved to My Workflows!");
      setShowPreview(false);
      setDescription("");
      setGeneratedWorkflow(null);
      if (onWorkflowGenerated) {
        onWorkflowGenerated(generatedWorkflow);
      }
    },
    onError: (error) => {
      toast.error(`Failed to save workflow: ${error.message}`);
    },
  });

  const handleGenerate = () => {
    if (description.trim().length < 10) {
      toast.error("Please provide a more detailed description (at least 10 characters)");
      return;
    }
    generateMutation.mutate({ description: description.trim() });
  };

  const handleRefine = () => {
    if (!refinementRequest.trim()) {
      toast.error("Please describe what you'd like to change");
      return;
    }
    refineMutation.mutate({
      currentWorkflow: generatedWorkflow,
      refinementRequest: refinementRequest.trim(),
    });
  };

  const handleSave = () => {
    if (!generatedWorkflow) return;
    saveMutation.mutate({
      name: generatedWorkflow.name,
      description: generatedWorkflow.description,
      category: generatedWorkflow.category,
      definition: {
        nodes: generatedWorkflow.nodes,
        edges: generatedWorkflow.edges,
      },
    });
  };

  const handleExampleClick = (example: string) => {
    setDescription(example);
  };

  if (compact) {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">AI Workflow Assistant</CardTitle>
          </div>
          <CardDescription>
            Describe what you want to automate in plain English
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Example: Thank fans who tip over $50"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="resize-none"
          />
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || description.trim().length < 10}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Workflow
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">AI Workflow Assistant</CardTitle>
              <CardDescription className="text-base mt-1">
                Describe what you want to automate, and AI will build the complete workflow for you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Example prompts */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-100 hover:border-purple-300 transition-colors"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="space-y-3">
            <Textarea
              placeholder="Example: When I hit 10K streams, post a celebration to Instagram and send me an email"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none text-base"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {description.length}/500 characters
              </p>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || description.trim().length < 10}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Workflow...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Workflow
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white/50 rounded-lg p-4 border border-purple-100">
            <p className="text-sm text-gray-600">
              <strong>How it works:</strong> Our AI analyzes your description and creates a complete workflow with triggers, actions, and conditions. You can preview, refine, and save it to your workflows.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Workflow Generated Successfully
            </DialogTitle>
            <DialogDescription>
              Review your AI-generated workflow below. You can refine it or save it to your workflows.
            </DialogDescription>
          </DialogHeader>

          {generatedWorkflow && (
            <div className="space-y-6">
              {/* Workflow overview */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{generatedWorkflow.name}</h3>
                <p className="text-gray-600">{generatedWorkflow.description}</p>
                <Badge variant="outline">{generatedWorkflow.category.replace("_", " ")}</Badge>
              </div>

              {/* Workflow structure */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Workflow Structure:</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {generatedWorkflow.nodes.map((node: any, index: number) => (
                    <div key={node.id} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">
                          {node.type}: {node.subtype.replace("_", " ")}
                        </p>
                        {node.data && Object.keys(node.data).length > 0 && (
                          <p className="text-xs text-gray-500">
                            {JSON.stringify(node.data, null, 2).slice(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refinement section */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Want to make changes?</h4>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Example: Make it send an SMS instead of email"
                    value={refinementRequest}
                    onChange={(e) => setRefinementRequest(e.target.value)}
                    rows={2}
                    className="resize-none flex-1"
                  />
                  <Button
                    onClick={handleRefine}
                    disabled={refineMutation.isPending || !refinementRequest.trim()}
                    variant="outline"
                  >
                    {refineMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Edit3 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={saveMutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save to My Workflows
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
