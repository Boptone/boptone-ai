import { useAuth } from "@/_core/hooks/useAuth";
import { DEV_MODE } from "@/lib/devMode";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, ArrowLeft, Loader2, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function IPProtection() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [, setLocation] = useLocation();
  
  const { data: infringements, isLoading, refetch } = trpc.ipProtection.getAll.useQuery({}, {
    enabled: !isDemoMode && !DEV_MODE
  });
  const updateStatus = trpc.ipProtection.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated successfully!");
      refetch();
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isDemoMode && !DEV_MODE) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, isDemoMode, setLocation]);

  const stats = [
    {
      title: "Total Detections",
      value: infringements?.length || 0,
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Cases",
      value: infringements?.filter((i) => i.status === "dmca_sent").length || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Resolved",
      value: infringements?.filter((i) => i.status === "resolved").length || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "New Alerts",
      value: infringements?.filter((i) => i.status === "detected").length || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const statusConfig = {
    detected: { label: "Detected", color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
    dmca_sent: { label: "DMCA Sent", color: "bg-blue-100 text-blue-700", icon: FileText },
    resolved: { label: "Resolved", color: "bg-green-100 text-green-700", icon: CheckCircle },
    disputed: { label: "Disputed", color: "bg-orange-100 text-orange-700", icon: Clock },
    false_positive: { label: "False Positive", color: "bg-gray-100 text-gray-700", icon: XCircle },
  };

  const handleStatusUpdate = (id: number, newStatus: any) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">IP Protection</h1>
              <p className="text-sm text-muted-foreground">AI-powered infringement detection and DMCA management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How It Works */}
        <Card className="bg-gradient-to-br from-primary/5 to-chart-3/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              How AI Protection Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Continuous Monitoring</p>
                <p className="text-sm text-muted-foreground">
                  AI scans YouTube, SoundCloud, and social media for unauthorized use of your content
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Instant Detection</p>
                <p className="text-sm text-muted-foreground">
                  Audio fingerprinting identifies matches with 99.9% accuracy
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Automated DMCA Takedowns</p>
                <p className="text-sm text-muted-foreground">
                  We file DMCA notices on your behalf with platform-specific protocols
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-medium">Track & Resolve</p>
                <p className="text-sm text-muted-foreground">
                  Monitor takedown progress and receive notifications when content is removed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infringements List */}
        <Card>
          <CardHeader>
            <CardTitle>Detected Infringements</CardTitle>
            <CardDescription>
              Unauthorized use of your copyrighted content across the web
            </CardDescription>
          </CardHeader>
          <CardContent>
            {infringements && infringements.length > 0 ? (
              <div className="space-y-4">
                {infringements.map((infringement) => {
                  const config = statusConfig[infringement.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  
                  return (
                    <div key={infringement.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">Copyright Infringement #{infringement.id}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${config.color} flex items-center gap-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Platform: <span className="font-medium capitalize">{infringement.platform}</span>
                          </p>
                          {infringement.detectedUrl && (
                            <a
                              href={infringement.detectedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline block truncate"
                            >
                              {infringement.detectedUrl}
                            </a>
                          )}
                          {infringement.notes && (
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              Note: {infringement.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground flex-1">
                          Detected: {new Date(infringement.detectedAt).toLocaleDateString()}
                        </p>
                        {infringement.status === "detected" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(infringement.id, "dmca_sent")}
                          >
                            Send DMCA Takedown
                          </Button>
                        )}
                        {infringement.status === "dmca_sent" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(infringement.id, "resolved")}
                          >
                            Mark as Resolved
                          </Button>
                        )}
                        {infringement.status === "detected" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusUpdate(infringement.id, "false_positive")}
                          >
                            False Positive
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Infringements Detected</h3>
                <p className="text-muted-foreground mb-4">
                  Your content is protected. We're continuously monitoring for unauthorized use.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">All Clear</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Protection Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Maximize Your Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Register Your Copyrights</p>
                <p className="text-sm text-muted-foreground">
                  Official copyright registration strengthens your legal position
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Watermark Your Content</p>
                <p className="text-sm text-muted-foreground">
                  Add audio watermarks to unreleased tracks and demos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Monitor Regularly</p>
                <p className="text-sm text-muted-foreground">
                  Check this dashboard weekly for new detections
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
