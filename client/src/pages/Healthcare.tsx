import { useAuth } from "@/_core/hooks/useAuth";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Heart, Shield, Brain, Stethoscope, Plus, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Healthcare() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [, setLocation] = useLocation();
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  
  const { data: plans, isLoading, refetch } = trpc.healthcare.getAll.useQuery({}, {
    enabled: !isDemoMode
  });
  const enrollPlan = trpc.healthcare.enroll.useMutation({
    onSuccess: () => {
      toast.success("Successfully enrolled in healthcare plan!");
      setIsEnrollDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to enroll");
    },
  });

  const [enrollment, setEnrollment] = useState({
    planType: "basic" as "basic" | "standard" | "premium",
    monthlyPremium: "",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isDemoMode) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, isDemoMode, setLocation]);

  const handleEnroll = () => {
    const premiumInCents = Math.round(parseFloat(enrollment.monthlyPremium) * 100);
    enrollPlan.mutate({
      provider: "Boptone Health",
      planType: enrollment.planType,
      monthlyCost: premiumInCents,
    });
  };

  const planDetails = {
    basic: {
      name: "Basic Care",
      price: 99,
      features: [
        "Telemedicine consultations",
        "Mental health hotline",
        "Prescription discounts",
        "Annual health screening",
      ],
      color: "from-blue-500 to-blue-600",
    },
    standard: {
      name: "Standard Care",
      price: 199,
      features: [
        "All Basic features",
        "In-person doctor visits",
        "Mental health therapy (4 sessions/month)",
        "Dental & vision coverage",
        "Hearing protection equipment",
      ],
      color: "from-purple-500 to-purple-600",
    },
    premium: {
      name: "Premium Care",
      price: 349,
      features: [
        "All Standard features",
        "Unlimited mental health therapy",
        "Substance abuse support",
        "Vocal cord specialist access",
        "Performance injury treatment",
        "Nutrition & fitness coaching",
        "24/7 concierge medical service",
      ],
      color: "from-orange-500 to-orange-600",
    },
  };

  const activePlan = plans?.find((p) => p.status === "active");

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
                <h1 className="text-2xl font-bold">Healthcare & Wellness</h1>
                <p className="text-sm text-muted-foreground">Artist-focused health benefits and support</p>
              </div>
            </div>
            {!activePlan && (
              <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Enroll in Plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enroll in Healthcare Plan</DialogTitle>
                    <DialogDescription>
                      Choose a plan that fits your health and wellness needs
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="planType">Select Plan</Label>
                      <Select
                        value={enrollment.planType}
                        onValueChange={(value: any) => {
                          setEnrollment({
                            ...enrollment,
                            planType: value,
                            monthlyPremium: planDetails[value as keyof typeof planDetails].price.toString(),
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic Care - $99/month</SelectItem>
                          <SelectItem value="standard">Standard Care - $199/month</SelectItem>
                          <SelectItem value="premium">Premium Care - $349/month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold">
                        {planDetails[enrollment.planType].name}
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {planDetails[enrollment.planType].features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="pt-3 border-t mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Monthly Premium:</span>
                          <span className="text-2xl font-bold">
                            ${planDetails[enrollment.planType].price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleEnroll}
                      disabled={enrollPlan.isPending}
                    >
                      {enrollPlan.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Enroll Now
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Current Plan */}
        {activePlan ? (
          <Card className={`bg-gradient-to-r ${planDetails[activePlan.planType as keyof typeof planDetails].color} text-white border-0`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-2xl">Your Current Plan</CardTitle>
                  <CardDescription className="text-white/80">
                    {planDetails[activePlan.planType as keyof typeof planDetails].name}
                  </CardDescription>
                </div>
                <Shield className="h-12 w-12 text-white/80" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Monthly Premium</p>
                  <p className="text-3xl font-bold">${(activePlan.monthlyCost / 100).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/80">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Active</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-sm text-white/80 mb-3">Your Benefits:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {planDetails[activePlan.planType as keyof typeof planDetails].features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-primary/5 to-chart-3/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                No Active Healthcare Plan
              </CardTitle>
              <CardDescription>
                Protect your health and career with comprehensive artist-focused coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsEnrollDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Explore Healthcare Plans
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Available Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(planDetails).map(([key, plan]) => (
            <Card key={key} className="relative overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${plan.color}`} />
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {!activePlan && (
                  <Button
                    className="w-full"
                    variant={key === "premium" ? "default" : "outline"}
                    onClick={() => {
                      setEnrollment({
                        planType: key as any,
                        monthlyPremium: plan.price.toString(),
                      });
                      setIsEnrollDialogOpen(true);
                    }}
                  >
                    Select Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Healthcare Matters */}
        <Card>
          <CardHeader>
            <CardTitle>Why Artist Healthcare Matters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Mental Health</h3>
              <p className="text-sm text-muted-foreground">
                Touring and industry pressure take a toll. Access therapy and support when you need it.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Vocal Health</h3>
              <p className="text-sm text-muted-foreground">
                Your voice is your instrument. Specialist care keeps you performing at your best.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Preventive Care</h3>
              <p className="text-sm text-muted-foreground">
                Regular check-ups and screenings catch issues early, keeping you healthy long-term.
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">Financial Protection</h3>
              <p className="text-sm text-muted-foreground">
                Medical emergencies can derail careers. Coverage protects your income and future.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Wellness Resources */}
        <Card className="bg-gradient-to-br from-primary/5 to-chart-3/5 border-primary/20">
          <CardHeader>
            <CardTitle>Free Wellness Resources</CardTitle>
            <CardDescription>Available to all Boptone artists</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">24/7 Crisis Hotline</p>
                <p className="text-sm text-muted-foreground">
                  Immediate support for mental health emergencies: 1-800-BOPTONE
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Hearing Protection Program</p>
                <p className="text-sm text-muted-foreground">
                  Free custom earplugs for all performing artists
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Wellness Webinars</p>
                <p className="text-sm text-muted-foreground">
                  Monthly sessions on stress management, nutrition, and performance health
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
