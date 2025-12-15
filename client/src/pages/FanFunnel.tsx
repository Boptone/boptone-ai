import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Users, Link2, BarChart3, Target, TrendingUp, 
  Plus, Copy, ExternalLink, Mail, Phone, 
  Music, Globe, Sparkles, Filter, Download
} from "lucide-react";

const FUNNEL_STAGES = [
  { id: "discovered", label: "Discovered", color: "bg-gray-500" },
  { id: "follower", label: "Follower", color: "bg-blue-500" },
  { id: "engaged", label: "Engaged", color: "bg-purple-500" },
  { id: "customer", label: "Customer", color: "bg-green-500" },
  { id: "superfan", label: "Superfan", color: "bg-yellow-500" },
];

const DISCOVERY_SOURCES = [
  { value: "spotify_playlist", label: "Spotify Playlist" },
  { value: "spotify_algorithm", label: "Spotify Algorithm" },
  { value: "apple_music_playlist", label: "Apple Music Playlist" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter/X" },
  { value: "friend_recommendation", label: "Friend Recommendation" },
  { value: "live_show", label: "Live Show" },
  { value: "radio", label: "Radio" },
  { value: "podcast", label: "Podcast" },
  { value: "other", label: "Other" },
];

export default function FanFunnel() {
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false);
  const [newLink, setNewLink] = useState({
    title: "",
    linkType: "release" as const,
    collectEmail: true,
    collectPhone: false,
    showDiscoverySurvey: true,
    destinations: {} as Record<string, string>,
  });

  const { data: funnelStats, isLoading: statsLoading } = trpc.fanFunnel.getFunnelStats.useQuery();
  const { data: smartLinks, isLoading: linksLoading } = trpc.fanFunnel.getSmartLinks.useQuery();
  const { data: fans, isLoading: fansLoading } = trpc.fanFunnel.getFans.useQuery();

  const createLinkMutation = trpc.fanFunnel.createSmartLink.useMutation({
    onSuccess: () => {
      toast.success("Smart link created!");
      setIsCreateLinkOpen(false);
      setNewLink({
        title: "",
        linkType: "release",
        collectEmail: true,
        collectPhone: false,
        showDiscoverySurvey: true,
        destinations: {},
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateLink = () => {
    if (!newLink.title) {
      toast.error("Please enter a title");
      return;
    }
    createLinkMutation.mutate(newLink);
  };

  const copyLinkToClipboard = (slug: string) => {
    const url = `${window.location.origin}/l/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  // Calculate funnel metrics
  const totalFans = funnelStats?.totalFans || 0;
  const stageData = FUNNEL_STAGES.map(stage => ({
    ...stage,
    count: funnelStats?.byStage?.[stage.id] || 0,
    percentage: totalFans > 0 
      ? Math.round(((funnelStats?.byStage?.[stage.id] || 0) / totalFans) * 100) 
      : 0,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fan Funnel</h1>
            <p className="text-muted-foreground mt-1">
              Track your fan journey from discovery to superfan
            </p>
          </div>
          <Badge variant="secondary" className="bg-[#4285F4] text-white">
            PRO Feature
          </Badge>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Fans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalFans.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all stages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Superfans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                {funnelStats?.byStage?.superfan || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Your most engaged fans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Smart Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{smartLinks?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active tracking links
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Lifetime Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                ${((funnelStats?.totalRevenue || 0) / 100).toFixed(0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total fan spending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Fan Journey Funnel
            </CardTitle>
            <CardDescription>
              How fans progress through your ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stageData.map((stage, index) => (
                <div key={stage.id} className="relative">
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{stage.label}</div>
                    <div className="flex-1 h-10 bg-muted rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full ${stage.color} transition-all duration-500`}
                        style={{ width: `${Math.max(stage.percentage, 5)}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                        {stage.count.toLocaleString()} ({stage.percentage}%)
                      </div>
                    </div>
                  </div>
                  {index < stageData.length - 1 && (
                    <div className="ml-12 h-2 w-px bg-border" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="links" className="space-y-4">
          <TabsList>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Smart Links
            </TabsTrigger>
            <TabsTrigger value="fans" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Fan Database
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Discovery Sources
            </TabsTrigger>
          </TabsList>

          {/* Smart Links Tab */}
          <TabsContent value="links" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Your Smart Links</h3>
              <Dialog open={isCreateLinkOpen} onOpenChange={setIsCreateLinkOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Smart Link
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Smart Link</DialogTitle>
                    <DialogDescription>
                      Create a trackable link to understand where your fans come from
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Link Title</Label>
                      <Input
                        placeholder="e.g., New Single Release"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Link Type</Label>
                      <Select
                        value={newLink.linkType}
                        onValueChange={(value: any) => setNewLink({ ...newLink, linkType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="release">Music Release</SelectItem>
                          <SelectItem value="presave">Pre-Save</SelectItem>
                          <SelectItem value="bio">Bio Link</SelectItem>
                          <SelectItem value="tour">Tour/Shows</SelectItem>
                          <SelectItem value="merch">Merchandise</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Spotify URL (optional)</Label>
                      <Input
                        placeholder="https://open.spotify.com/..."
                        value={newLink.destinations.spotify || ""}
                        onChange={(e) => setNewLink({
                          ...newLink,
                          destinations: { ...newLink.destinations, spotify: e.target.value }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Apple Music URL (optional)</Label>
                      <Input
                        placeholder="https://music.apple.com/..."
                        value={newLink.destinations.appleMusic || ""}
                        onChange={(e) => setNewLink({
                          ...newLink,
                          destinations: { ...newLink.destinations, appleMusic: e.target.value }
                        })}
                      />
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <h4 className="font-medium">Data Collection</h4>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label>Collect Email</Label>
                        </div>
                        <Switch
                          checked={newLink.collectEmail}
                          onCheckedChange={(checked) => setNewLink({ ...newLink, collectEmail: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <Label>Collect Phone</Label>
                        </div>
                        <Switch
                          checked={newLink.collectPhone}
                          onCheckedChange={(checked) => setNewLink({ ...newLink, collectPhone: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-muted-foreground" />
                          <Label>Ask Discovery Source</Label>
                        </div>
                        <Switch
                          checked={newLink.showDiscoverySurvey}
                          onCheckedChange={(checked) => setNewLink({ ...newLink, showDiscoverySurvey: checked })}
                        />
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={handleCreateLink}
                      disabled={createLinkMutation.isPending}
                    >
                      {createLinkMutation.isPending ? "Creating..." : "Create Link"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {linksLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading links...</div>
            ) : smartLinks && smartLinks.length > 0 ? (
              <div className="grid gap-4">
                {smartLinks.map((link) => (
                  <Card key={link.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Link2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{link.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {link.linkType} • {link.totalClicks} clicks
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyLinkToClipboard(link.slug)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/l/${link.slug}`, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No smart links yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first smart link to start tracking where your fans come from
                  </p>
                  <Button onClick={() => setIsCreateLinkOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Link
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Fan Database Tab */}
          <TabsContent value="fans" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Fan Database</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {fansLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading fans...</div>
            ) : fans && fans.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left text-sm text-muted-foreground">
                          <th className="p-4">Fan</th>
                          <th className="p-4">Stage</th>
                          <th className="p-4">Score</th>
                          <th className="p-4">Source</th>
                          <th className="p-4">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fans.map((fan) => (
                          <tr key={fan.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{fan.name || "Anonymous"}</div>
                                <div className="text-sm text-muted-foreground">{fan.email}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary">
                                {fan.funnelStage}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${fan.fanScore}%` }}
                                  />
                                </div>
                                <span className="text-sm">{fan.fanScore}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm">
                              {fan.discoverySource?.replace(/_/g, " ") || "Unknown"}
                            </td>
                            <td className="p-4 font-medium">
                              ${((fan.lifetimeValue || 0) / 100).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No fans yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your smart links to start building your fan database
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Discovery Sources Tab */}
          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Where Fans Discover You</CardTitle>
                <CardDescription>
                  Understanding your discovery sources helps optimize marketing spend
                </CardDescription>
              </CardHeader>
              <CardContent>
                {funnelStats?.bySource && Object.keys(funnelStats.bySource).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(funnelStats.bySource)
                      .sort(([, a], [, b]) => b - a)
                      .map(([source, count]) => {
                        const percentage = totalFans > 0 ? Math.round((count / totalFans) * 100) : 0;
                        return (
                          <div key={source} className="flex items-center gap-4">
                            <div className="w-40 text-sm font-medium capitalize">
                              {source.replace(/_/g, " ")}
                            </div>
                            <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                              <div
                                className="h-full bg-[#4285F4] transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                              <div className="absolute inset-0 flex items-center px-3 text-sm">
                                {count} fans ({percentage}%)
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No discovery data yet. Enable the discovery survey on your smart links.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
