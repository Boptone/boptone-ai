import { useAuth } from "@/_core/hooks/useAuth";
import { DEV_MODE } from "@/lib/devMode";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
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
      label: "TOTAL",
    },
    {
      title: "Active Cases",
      value: infringements?.filter((i) => i.status === "dmca_sent").length || 0,
      label: "ACTIVE",
    },
    {
      title: "Resolved",
      value: infringements?.filter((i) => i.status === "resolved").length || 0,
      label: "RESOLVED",
    },
    {
      title: "New Alerts",
      value: infringements?.filter((i) => i.status === "detected").length || 0,
      label: "NEW",
    },
  ];

  const statusConfig = {
    detected: { label: "Detected", textLabel: "!" },
    dmca_sent: { label: "DMCA Sent", textLabel: "→" },
    resolved: { label: "Resolved", textLabel: "✓" },
    disputed: { label: "Disputed", textLabel: "?" },
    false_positive: { label: "False Positive", textLabel: "X" },
  };

  const handleStatusUpdate = (id: number, newStatus: any) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-white sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button className="rounded-full" variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <span className="text-xl font-bold">←</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">IP Protection</h1>
              <p className="text-sm text-gray-600">Intelligent infringement detection and DMCA management</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            return (
              <div className="border-4 border-black rounded-none" key={stat.title}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-black text-white px-3 py-1 text-xs font-bold rounded-none">
                      {stat.label}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How It Works */}
        <div className="border-4 border-black rounded-none bg-gray-50">
          <div className="border-b-4 border-black p-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              HOW AI PROTECTION WORKS
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-black text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-bold mb-1">Continuous Monitoring</p>
                <p className="text-sm text-gray-600">
                  AI scans YouTube, SoundCloud, and social media for unauthorized use of your content
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-black text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-bold mb-1">Instant Detection</p>
                <p className="text-sm text-gray-600">
                  Audio fingerprinting identifies matches with 99.9% accuracy
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-black text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-bold mb-1">Automated DMCA Takedowns</p>
                <p className="text-sm text-gray-600">
                  We file DMCA notices on your behalf with platform-specific protocols
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-none bg-black text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                4
              </div>
              <div>
                <p className="font-bold mb-1">Track & Resolve</p>
                <p className="text-sm text-gray-600">
                  Monitor takedown progress and receive notifications when content is removed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Infringements List */}
        <div className="border-4 border-black rounded-none">
          <div className="border-b-4 border-black p-6">
            <h2 className="text-xl font-bold">DETECTED INFRINGEMENTS</h2>
            <p className="text-sm text-gray-600 mt-1">
              Unauthorized use of your copyrighted content across the web
            </p>
          </div>
          <div className="p-6">
            {infringements && infringements.length > 0 ? (
              <div className="space-y-4">
                {infringements.map((infringement) => {
                  const config = statusConfig[infringement.status as keyof typeof statusConfig];
                  
                  return (
                    <div key={infringement.id} className="border-4 border-black rounded-none p-4 space-y-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold">Copyright Infringement #{infringement.id}</h3>
                            <span className="text-xs px-2 py-1 rounded-none bg-black text-white font-bold flex items-center gap-1">
                              {config.textLabel} {config.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Platform: <span className="font-bold capitalize">{infringement.platform}</span>
                          </p>
                          {infringement.detectedUrl && (
                            <a
                              href={infringement.detectedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-black hover:text-gray-600 underline block truncate font-bold"
                            >
                              {infringement.detectedUrl}
                            </a>
                          )}
                          {infringement.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              Note: {infringement.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2 border-t-4 border-black">
                        <p className="text-xs text-gray-600 flex-1">
                          Detected: {new Date(infringement.detectedAt).toLocaleDateString()}
                        </p>
                        {infringement.status === "detected" && (
                          <Button className="rounded-full bg-black hover:bg-gray-800 text-white" size="sm"
                            onClick={() => handleStatusUpdate(infringement.id, "dmca_sent")}
                          >
                            Send DMCA Takedown
                          </Button>
                        )}
                        {infringement.status === "dmca_sent" && (
                          <Button className="rounded-full border-4 border-black hover:bg-gray-50" size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(infringement.id, "resolved")}
                          >
                            Mark as Resolved
                          </Button>
                        )}
                        {infringement.status === "detected" && (
                          <Button className="rounded-full hover:bg-gray-50" size="sm"
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
                <div className="w-16 h-16 border-4 border-black rounded-none flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold">✓</span>
                </div>
                <h3 className="text-lg font-bold mb-2">No Infringements Detected</h3>
                <p className="text-gray-600 mb-4">
                  Your content is protected. We're continuously monitoring for unauthorized use.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-none bg-gray-100 border-4 border-black">
                  <span className="text-sm font-bold">ALL CLEAR</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Protection Tips */}
        <div className="border-4 border-black rounded-none">
          <div className="border-b-4 border-black p-6">
            <h2 className="text-xl font-bold">MAXIMIZE YOUR PROTECTION</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-none bg-black mt-2 flex-shrink-0" />
              <div>
                <p className="font-bold mb-1">Register Your Copyrights</p>
                <p className="text-sm text-gray-600">
                  Official copyright registration strengthens your legal position
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-none bg-black mt-2 flex-shrink-0" />
              <div>
                <p className="font-bold mb-1">Watermark Your Content</p>
                <p className="text-sm text-gray-600">
                  Add audio watermarks to unreleased tracks and demos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-none bg-black mt-2 flex-shrink-0" />
              <div>
                <p className="font-bold mb-1">Monitor Regularly</p>
                <p className="text-sm text-gray-600">
                  Check this dashboard weekly for new detections
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
