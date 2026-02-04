import { useState } from "react";
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
import { Loader2, Palette, Eye, Save } from "lucide-react";
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
        <Card className="rounded-xl max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-6">
              You need to create an artist profile first.
            </p>
            <Button className="rounded-full" onClick={() => setLocation("/signup")}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Update local state when profile loads
  if (profile && themeColor === "#0066ff" && profile.themeColor) {
    setThemeColor(profile.themeColor);
    setAccentColor(profile.accentColor || "#00d4aa");
    setLayoutStyle(profile.layoutStyle || "default");
    setFontFamily(profile.fontFamily || "Inter");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile Customization</h1>
          <p className="text-muted-foreground">
            Customize the look and feel of your public artist profile
          </p>
        </div>

        <div className="grid gap-6">
          {/* Color Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Colors & Theme
              </CardTitle>
              <CardDescription>
                Choose colors that match your brand identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="themeColor">Primary Color</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="themeColor"
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#0066ff"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used for headings, buttons, and accents
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="accentColor"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-20 h-12 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#00d4aa"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Used for secondary elements and highlights
                  </p>
                </div>
              </div>

              {/* Color Preview */}
              <div className="p-6 rounded-lg border" style={{ backgroundColor: `${themeColor}10` }}>
                <h3 className="text-2xl font-bold mb-2" style={{ color: themeColor }}>
                  Preview Heading
                </h3>
                <p className="text-muted-foreground mb-4">
                  This is how your profile will look with the selected colors.
                </p>
                <div className="flex gap-3">
                  <Button className="rounded-full" style={{ backgroundColor: themeColor }}>
                    Primary Button
                  </Button>
                  <Button className="rounded-full" variant="outline" style={{ borderColor: accentColor, color: accentColor }}>
                    Accent Button
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout Options */}
          <Card>
            <CardHeader>
              <CardTitle>Layout Style</CardTitle>
              <CardDescription>
                Choose how your content is organized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="layoutStyle">Layout</Label>
                <Select value={layoutStyle} onValueChange={(value) => setLayoutStyle(value as "default" | "minimal" | "grid")}>
                  <SelectTrigger id="layoutStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (Single Column)</SelectItem>
                    <SelectItem value="grid">Grid Layout</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {layoutStyle === "default" && "Clean single-column layout with all sections stacked"}
                  {layoutStyle === "grid" && "Modern grid layout with side-by-side content"}
                  {layoutStyle === "minimal" && "Minimalist design focusing on essential content"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger id="fontFamily">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter (Modern Sans-Serif)</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display (Elegant Serif)</SelectItem>
                    <SelectItem value="Roboto">Roboto (Clean Sans-Serif)</SelectItem>
                    <SelectItem value="Montserrat">Montserrat (Bold Sans-Serif)</SelectItem>
                    <SelectItem value="Lora">Lora (Classic Serif)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="rounded-full flex-1" size="lg"
              onClick={handleSave}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button className="rounded-full flex-1" size="lg"
              variant="outline"
              onClick={handlePreview}
            >
              <Eye className="h-5 w-5 mr-2" />
              Preview Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
