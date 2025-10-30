import { useAuth } from "@/_core/hooks/useAuth";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Calendar, MapPin, DollarSign, Users, Plus, ArrowLeft, Loader2, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Tours() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: tours, isLoading, refetch } = trpc.tours.getAll.useQuery({}, {
    enabled: !isDemoMode
  });
  const createTour = trpc.tours.create.useMutation({
    onSuccess: () => {
      toast.success("Tour created successfully!");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create tour");
    },
  });

  const [newTour, setNewTour] = useState({
    tourName: "",
    startDate: "",
    endDate: "",
    budget: "",
    revenueProjection: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isDemoMode) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, isDemoMode, setLocation]);

  const handleCreateTour = () => {
    const budgetInCents = newTour.budget ? Math.round(parseFloat(newTour.budget) * 100) : undefined;
    const revenueInCents = newTour.revenueProjection ? Math.round(parseFloat(newTour.revenueProjection) * 100) : undefined;

    createTour.mutate({
      tourName: newTour.tourName,
      startDate: new Date(newTour.startDate),
      endDate: new Date(newTour.endDate),
      budget: budgetInCents,
      revenueProjection: revenueInCents,
    });
  };

  const stats = [
    {
      title: "Active Tours",
      value: tours?.filter((t) => t.status === "in_progress" || t.status === "confirmed").length || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Shows",
      value: tours?.reduce((sum, t) => sum + (t.venues && typeof t.venues === 'string' ? JSON.parse(t.venues).length : 0), 0) || 0,
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Projected Revenue",
      value: `$${((tours?.reduce((sum, t) => sum + (t.revenueProjection || 0), 0) || 0) / 100).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Budget",
      value: `$${((tours?.reduce((sum, t) => sum + (t.budget || 0), 0) || 0) / 100).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const statusConfig = {
    planning: { label: "Planning", color: "bg-gray-100 text-gray-700" },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700" },
    in_progress: { label: "In Progress", color: "bg-green-100 text-green-700" },
    completed: { label: "Completed", color: "bg-purple-100 text-purple-700" },
    cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Tour Management</h1>
                <p className="text-sm text-muted-foreground">Plan and track your live performances</p>
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Plan New Tour
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tour</DialogTitle>
                  <DialogDescription>
                    Plan your next tour with dates, budget, and revenue projections
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="tourName">Tour Name</Label>
                    <Input
                      id="tourName"
                      value={newTour.tourName}
                      onChange={(e) => setNewTour({ ...newTour, tourName: e.target.value })}
                      placeholder="Summer 2026 Tour"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newTour.startDate}
                        onChange={(e) => setNewTour({ ...newTour, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newTour.endDate}
                        onChange={(e) => setNewTour({ ...newTour, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (USD)</Label>
                      <Input
                        id="budget"
                        type="number"
                        step="100"
                        value={newTour.budget}
                        onChange={(e) => setNewTour({ ...newTour, budget: e.target.value })}
                        placeholder="10000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revenue">Revenue Projection (USD)</Label>
                      <Input
                        id="revenue"
                        type="number"
                        step="100"
                        value={newTour.revenueProjection}
                        onChange={(e) => setNewTour({ ...newTour, revenueProjection: e.target.value })}
                        placeholder="25000"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTour}
                    disabled={!newTour.tourName || !newTour.startDate || !newTour.endDate || createTour.isPending}
                  >
                    {createTour.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Tour
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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

        {/* Tours List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tours</CardTitle>
            <CardDescription>Manage your tour schedule and performance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            {tours && tours.length > 0 ? (
              <div className="space-y-4">
                {tours.map((tour) => {
                  const config = statusConfig[tour.status as keyof typeof statusConfig];
                  const venues = tour.venues && typeof tour.venues === 'string' ? JSON.parse(tour.venues) : [];
                  
                  return (
                    <div key={tour.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{tour.tourName}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(tour.startDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {venues.length} shows
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-semibold">${((tour.budget || 0) / 100).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Projected Revenue</p>
                          <p className="font-semibold text-green-600">
                            ${((tour.revenueProjection || 0) / 100).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Actual Revenue</p>
                          <p className="font-semibold">
                            ${((tour.actualRevenue || 0) / 100).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Profit Margin</p>
                          <p className="font-semibold">
                            {tour.revenueProjection && tour.budget
                              ? `${(((tour.revenueProjection - tour.budget) / tour.revenueProjection) * 100).toFixed(1)}%`
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {venues.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-sm font-medium mb-2">Upcoming Shows:</p>
                          <div className="space-y-2">
                            {venues.slice(0, 3).map((venue: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{venue.name}</span>
                                  <span className="text-muted-foreground">
                                    • {venue.city}, {venue.country}
                                  </span>
                                </div>
                                <span className="text-muted-foreground">{venue.date}</span>
                              </div>
                            ))}
                            {venues.length > 3 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{venues.length - 3} more shows
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tours Planned</h3>
                <p className="text-muted-foreground mb-4">
                  Start planning your first tour to connect with fans live
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Plan Your First Tour
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tour Planning Tips */}
        <Card className="bg-gradient-to-br from-primary/5 to-chart-3/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tour Planning Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Route Optimization</p>
                <p className="text-sm text-muted-foreground">
                  Plan geographically efficient routes to minimize travel costs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Advance Promotion</p>
                <p className="text-sm text-muted-foreground">
                  Announce shows 6-8 weeks in advance for maximum ticket sales
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Merch Inventory</p>
                <p className="text-sm text-muted-foreground">
                  Bring 30-50% more merch than expected sales - tours drive impulse purchases
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Budget Buffer</p>
                <p className="text-sm text-muted-foreground">
                  Add 20% contingency to your budget for unexpected expenses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
