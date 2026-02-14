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

  // Update local state when profile loads
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-bold text-gray-900">Loading...</div>
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="rounded-none border-4 border-black max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-900 mb-6 text-lg font-bold">
              You need to create an artist profile first.
            </p>
            <Button 
              className="rounded-none text-lg px-8 py-4 bg-black text-white hover:bg-gray-900 border-4 border-black font-bold" 
              onClick={() => setLocation("/signup")}
            >
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-4 text-black">
            Make It Your Own
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Customize the look and feel of your public artist profile
          </p>
        </div>

        <div className="grid gap-8">
          {/* Color Customization */}
          <Card className="rounded-none border-4 border-black bg-white">
            <CardHeader className="pb-8 border-b-4 border-black">
              <CardTitle className="text-3xl font-bold text-black">
                Colors & Theme
              </CardTitle>
              <CardDescription className="text-lg font-medium text-gray-700">
                Choose colors that match your brand identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="themeColor" className="text-lg font-bold text-gray-900">
                    Primary Color
                  </Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="themeColor"
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-24 h-16 cursor-pointer rounded-none border-2 border-gray-900"
                    />
                    <Input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#0066ff"
                      className="flex-1 rounded-none border-2 border-gray-900 text-lg font-medium"
                    />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Used for headings, buttons, and accents
                  </p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="accentColor" className="text-lg font-bold text-gray-900">
                    Accent Color
                  </Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="accentColor"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-24 h-16 cursor-pointer rounded-none border-2 border-gray-900"
                    />
                    <Input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#00d4aa"
                      className="flex-1 rounded-none border-2 border-gray-900 text-lg font-medium"
                    />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Used for secondary elements and highlights
                  </p>
                </div>
              </div>

              {/* Color Preview */}
              <div className="p-8 rounded-none border-4 border-gray-900 bg-white">
                <h3 className="text-3xl font-bold mb-3" style={{ color: themeColor }}>
                  Preview Heading
                </h3>
                <p className="text-gray-600 mb-6 font-medium text-lg">
                  This is how your profile will look with the selected colors.
                </p>
                <div className="flex gap-4">
                  <Button 
                    className="rounded-none text-lg px-8 py-4 font-bold border-4 border-black" 
                    style={{ backgroundColor: themeColor, color: 'white' }}
                  >
                    Primary Button
                  </Button>
                  <Button 
                    className="rounded-none text-lg px-8 py-4 border-4 font-bold bg-white" 
                    variant="outline" 
                    style={{ borderColor: accentColor, color: accentColor }}
                  >
                    Accent Button
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout Options */}
          <Card className="rounded-none border-4 border-black bg-white">
            <CardHeader className="pb-8 border-b-4 border-black">
              <CardTitle className="text-3xl font-bold text-black">
                Layout Style
              </CardTitle>
              <CardDescription className="text-lg font-medium text-gray-700">
                Choose how your content is organized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="space-y-4">
                <Label htmlFor="layoutStyle" className="text-lg font-bold text-gray-900">
                  Layout
                </Label>
                <Select value={layoutStyle} onValueChange={(value) => setLayoutStyle(value as "default" | "minimal" | "grid")}>
                  <SelectTrigger id="layoutStyle" className="rounded-none border-2 border-gray-900 text-lg font-medium h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-2 border-gray-900">
                    <SelectItem value="default" className="text-lg font-medium">Default (Single Column)</SelectItem>
                    <SelectItem value="grid" className="text-lg font-medium">Grid Layout</SelectItem>
                    <SelectItem value="minimal" className="text-lg font-medium">Minimal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-base text-gray-600 font-medium p-4 rounded-none bg-gray-100 border-2 border-gray-900">
                  {layoutStyle === "default" && "Clean single-column layout with all sections stacked"}
                  {layoutStyle === "grid" && "Modern grid layout with side-by-side content"}
                  {layoutStyle === "minimal" && "Minimalist design focusing on essential content"}
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="fontFamily" className="text-lg font-bold text-gray-900">
                  Font Family
                </Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger id="fontFamily" className="rounded-none border-2 border-gray-900 text-lg font-medium h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-2 border-gray-900">
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

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="rounded-none border-4 border-black bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleSave}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <span className="text-6xl font-bold text-black">
                    {updateProfile.isPending ? "..." : "DIGITAL"}
                  </span>
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
              className="rounded-none border-4 border-black bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handlePreview}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <span className="text-6xl font-bold text-black">👁</span>
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
