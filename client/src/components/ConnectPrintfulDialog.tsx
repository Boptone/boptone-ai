/**
 * Connect Printful Dialog Component
 * 
 * Allows artists to connect their Printful account by entering API token
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ConnectPrintfulDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ConnectPrintfulDialog({
  open,
  onOpenChange,
  onSuccess,
}: ConnectPrintfulDialogProps) {
  const [apiToken, setApiToken] = useState("");
  const [storeId, setStoreId] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    storeInfo?: { name: string | null; website: string | null; email: string | null };
    error?: string;
  } | null>(null);

  const connectMutation = trpc.pod.connectPrintful.useMutation({
    onSuccess: () => {
      toast.success("Printful account connected successfully!");
      setApiToken("");
      setStoreId("");
      setConnectionTestResult(null);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to connect: ${error.message}`);
    },
  });

  const testConnection = async () => {
    if (!apiToken.trim()) {
      toast.error("Please enter your API token");
      return;
    }

    setIsTestingConnection(true);
    setConnectionTestResult(null);

    try {
      // Get Printful provider ID (should be 1 based on seed data)
      const result = await trpc.pod.testConnection.mutate({
        providerId: 1, // Printful
        apiToken: apiToken.trim(),
        storeId: storeId.trim() || undefined,
      });

      setConnectionTestResult({
        success: true,
        storeInfo: result.storeInfo,
      });
      toast.success("Connection successful!");
    } catch (error: any) {
      setConnectionTestResult({
        success: false,
        error: error.message,
      });
      toast.error(`Connection failed: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleConnect = () => {
    if (!apiToken.trim()) {
      toast.error("Please enter your API token");
      return;
    }

    connectMutation.mutate({
      apiToken: apiToken.trim(),
      storeId: storeId.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Connect Your Printful Account</DialogTitle>
          <DialogDescription>
            Connect your Printful account to enable print-on-demand merchandise fulfillment.
            You'll need your Printful API token to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Instructions */}
          <Alert>
            <AlertDescription className="text-sm space-y-2">
              <p className="font-medium">How to get your Printful API token:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Log in to your Printful account</li>
                <li>Go to Settings → Stores</li>
                <li>Select your store or create a new one</li>
                <li>Click "Add Store" → "Manual order platform / API"</li>
                <li>Copy your API token</li>
              </ol>
              <a
                href="https://www.printful.com/dashboard/store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-2"
              >
                Open Printful Dashboard
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          {/* API Token Input */}
          <div className="space-y-2">
            <Label htmlFor="apiToken">
              Printful API Token <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="Enter your Printful API token"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              disabled={connectMutation.isPending}
            />
          </div>

          {/* Store ID Input (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="storeId">
              Store ID <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              id="storeId"
              type="text"
              placeholder="Leave blank to use default store"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              disabled={connectMutation.isPending}
            />
          </div>

          {/* Test Connection Button */}
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={isTestingConnection || connectMutation.isPending || !apiToken.trim()}
            className="w-full"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>

          {/* Connection Test Result */}
          {connectionTestResult && (
            <Alert variant={connectionTestResult.success ? "default" : "destructive"}>
              <AlertDescription>
                {connectionTestResult.success ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Connection Successful!</span>
                    </div>
                    {connectionTestResult.storeInfo && (
                      <div className="text-sm space-y-1 ml-6">
                        {connectionTestResult.storeInfo.name && (
                          <p>Store: {connectionTestResult.storeInfo.name}</p>
                        )}
                        {connectionTestResult.storeInfo.website && (
                          <p>Website: {connectionTestResult.storeInfo.website}</p>
                        )}
                        {connectionTestResult.storeInfo.email && (
                          <p>Email: {connectionTestResult.storeInfo.email}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-medium">Connection Failed</p>
                    <p className="text-sm mt-1">{connectionTestResult.error}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={connectMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={
              connectMutation.isPending ||
              !apiToken.trim() ||
              (connectionTestResult && !connectionTestResult.success)
            }
          >
            {connectMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
