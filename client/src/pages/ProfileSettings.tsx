import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Palette, Eye, Save, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function ProfileSettings() {
  const { user, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading } = trpc.artistProfile.getMyProfile.useQuery(
    undefined,
    { enabled: !!user && !isDemoMode }
  );

  const [themeColor, setThemeColor] = useState(profile?.themeColor || "#0066ff");
  const [accentColor, setAccentColor] = useState(profile?.accentColor || "#00d4aa");
  const [layoutStyle, setLayoutStyle] = useState(profile?.layoutStyle || "default");
  const [fontFamily, setFontFamily] = useState(profile?.fontFamily || "Inter");

  const updateProfile = trpc.artistProfile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile customization saved!");
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  // Update local state when profile loads (must be before early returns)
  useEffect(() => {
    if (profile && profile.themeColor) {
      setThemeColor(profile.themeColor);
      setAccentColor(profile.accentColor || "#00d4aa");
      setLayoutStyle(profile.layoutStyle || "default");
      setFontFamily(profile.fontFamily || "Inter");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!themeColor || !accentColor || !layoutStyle || !fontFamily) {
      toast.error("Please fill in all customization options");
      return;
    }
    await updateProfile.mutateAsync({
      themeColor,
      accentColor,
      layoutStyle: layoutStyle as "default" | "minimal" | "grid",
      fontFamily,
    });
  };

  const handlePreview = () => {
    if (profile?.stageName) {
      const username = profile.stageName.toLowerCase().replace(/\s+/g, "");
      window.open(`/@${username}`, "_blank");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="rounded-3xl border-4 border-black shadow-2xl max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-700 mb-6 text-lg font-medium">
              You need to create an artist profile first.
            </p>
            <Button className="rounded-full text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl" onClick={() => setLocation("/signup")}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Revolutionary Header with Asymmetric Layout */}
        <div className="mb-12">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-none mb-4">
            Make It
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Your Own
            </span>
            <span className="text-black">.</span>
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Customize the look and feel of your public artist profile
          </p>
        </div>

        <div className="grid gap-8">
          {/* Color Customization - Purple Card */}
          <Card className="rounded-3xl border-4 border-purple-500 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-3 text-3xl font-bold">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                Colors & Theme
              </CardTitle>
              <CardDescription className="text-lg font-medium">
                Choose colors that match your brand identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="themeColor" className="text-lg font-bold text-gray-900">Primary Color</Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="themeColor"
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-24 h-16 cursor-pointer rounded-2xl border-4 border-purple-300 shadow-lg"
                    />
                    <Input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#0066ff"
                      className="flex-1 rounded-2xl border-2 border-purple-300 text-lg font-medium"
                    />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Used for headings, buttons, and accents
                  </p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="accentColor" className="text-lg font-bold text-gray-900">Accent Color</Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="accentColor"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-24 h-16 cursor-pointer rounded-2xl border-4 border-purple-300 shadow-lg"
                    />
                    <Input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#00d4aa"
                      className="flex-1 rounded-2xl border-2 border-purple-300 text-lg font-medium"
                    />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Used for secondary elements and highlights
                  </p>
                </div>
              </div>

              {/* Color Preview - Bold Card */}
              <div className="p-8 rounded-3xl border-4 border-white bg-white shadow-xl" style={{ backgroundColor: `${themeColor}10` }}>
                <h3 className="text-3xl font-bold mb-3" style={{ color: themeColor }}>
                  Preview Heading
                </h3>
                <p className="text-gray-600 mb-6 font-medium text-lg">
                  This is how your profile will look with the selected colors.
                </p>
                <div className="flex gap-4">
                  <Button className="rounded-full text-lg px-8 py-6 shadow-xl font-bold" style={{ backgroundColor: themeColor }}>
                    Primary Button
                  </Button>
                  <Button className="rounded-full text-lg px-8 py-6 border-4 shadow-xl font-bold" variant="outline" style={{ borderColor: accentColor, color: accentColor }}>
                    Accent Button
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout Options - Blue Card */}
          <Card className="rounded-3xl border-4 border-blue-500 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-3 text-3xl font-bold">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                Layout Style
              </CardTitle>
              <CardDescription className="text-lg font-medium">
                Choose how your content is organized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="layoutStyle" className="text-lg font-bold text-gray-900">Layout</Label>
                <Select value={layoutStyle} onValueChange={(value) => setLayoutStyle(value as "default" | "minimal" | "grid")}>
                  <SelectTrigger id="layoutStyle" className="rounded-2xl border-2 border-blue-300 text-lg font-medium h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-4 border-blue-300">
                    <SelectItem value="default" className="text-lg font-medium">Default (Single Column)</SelectItem>
                    <SelectItem value="grid" className="text-lg font-medium">Grid Layout</SelectItem>
                    <SelectItem value="minimal" className="text-lg font-medium">Minimal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-base text-gray-600 font-medium p-4 rounded-2xl bg-white border-2 border-blue-200">
                  {layoutStyle === "default" && "Clean single-column layout with all sections stacked"}
                  {layoutStyle === "grid" && "Modern grid layout with side-by-side content"}
                  {layoutStyle === "minimal" && "Minimalist design focusing on essential content"}
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="fontFamily" className="text-lg font-bold text-gray-900">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger id="fontFamily" className="rounded-2xl border-2 border-blue-300 text-lg font-medium h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-4 border-blue-300">
                    <SelectItem value="Inter" className="text-lg font-medium">Inter (Modern Sans-Serif)</SelectItem>
                    <SelectItem value="Playfair Display" className="text-lg font-medium">Playfair Display (Elegant Serif)</SelectItem>
                    <SelectItem value="Roboto" className="text-lg font-medium">Roboto (Clean Sans-Serif)</SelectItem>
                    <SelectItem value="Montserrat" className="text-lg font-medium">Montserrat (Bold Sans-Serif)</SelectItem>
                    <SelectItem value="Lora" className="text-lg font-medium">Lora (Classic Serif)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Bold Gradient Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="rounded-3xl border-4 border-green-500 shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50 cursor-pointer hover:scale-105 transition-transform"
              onClick={handleSave}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg mx-auto mb-6">
                  {updateProfile.isPending ? (
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  ) : (
                    <Save className="h-8 w-8 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </h3>
                <p className="text-base text-gray-600 font-medium">
                  Apply your customizations
                </p>
              </CardContent>
            </Card>

            <Card 
              className="rounded-3xl border-4 border-orange-500 shadow-2xl bg-gradient-to-br from-orange-50 to-red-50 cursor-pointer hover:scale-105 transition-transform"
              onClick={handlePreview}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg mx-auto mb-6">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Preview Profile
                </h3>
                <p className="text-base text-gray-600 font-medium">
                  See how it looks live
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
