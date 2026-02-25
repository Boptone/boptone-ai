import { useState, useEffect } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
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
import { Download, Trash2, AlertTriangle } from "lucide-react";
import { AvatarUpload } from "@/components/AvatarUpload";
import { UserAvatar } from "@/components/UserAvatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProfileSettings() {
  useRequireArtist(); // Enforce artist authentication
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
        <Card className="rounded-lg border-4 border-black max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-900 mb-6 text-lg font-bold">
              You need to create an artist profile first.
            </p>
            <Button 
              className="rounded-lg text-lg px-8 py-4 bg-black text-white hover:bg-gray-900 border-4 border-black font-bold" 
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
        <div className="mb-12 flex items-start gap-8">
          <UserAvatar size="lg" />
          <div className="flex-1">
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tight leading-none mb-4 text-black">
              Make It Your Own
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              Customize the look and feel of your public artist profile
            </p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Avatar Upload */}
          <Card className="rounded-lg border-4 border-black bg-white">
            <CardHeader className="pb-8 border-b-4 border-black">
              <CardTitle className="text-3xl font-bold text-black">
                Profile Picture
              </CardTitle>
              <CardDescription className="text-lg font-medium text-gray-700">
                Upload your profile picture (automatically optimized to 512x512)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <AvatarUpload currentAvatarUrl={profile?.avatarUrl || undefined} />
            </CardContent>
          </Card>

          {/* Color Customization */}
          <Card className="rounded-lg border-4 border-black bg-white">
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
                      className="w-24 h-16 cursor-pointer rounded-lg border border-black"
                    />
                    <Input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#0066ff"
                      className="flex-1 rounded-lg border border-black text-lg font-medium"
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
                      className="w-24 h-16 cursor-pointer rounded-lg border border-black"
                    />
                    <Input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#00d4aa"
                      className="flex-1 rounded-lg border border-black text-lg font-medium"
                    />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Used for secondary elements and highlights
                  </p>
                </div>
              </div>

              {/* Color Preview */}
              <div className="p-8 rounded-lg border-4 border-black bg-white">
                <h3 className="text-3xl font-bold mb-3" style={{ color: themeColor }}>
                  Preview Heading
                </h3>
                <p className="text-gray-600 mb-6 font-medium text-lg">
                  This is how your profile will look with the selected colors.
                </p>
                <div className="flex gap-4">
                  <Button 
                    className="rounded-lg text-lg px-8 py-4 font-bold border-4 border-black" 
                    style={{ backgroundColor: themeColor, color: 'white' }}
                  >
                    Primary Button
                  </Button>
                  <Button 
                    className="rounded-lg text-lg px-8 py-4 border-4 font-bold bg-white" 
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
          <Card className="rounded-lg border-4 border-black bg-white">
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
                  <SelectTrigger id="layoutStyle" className="rounded-lg border border-black text-lg font-medium h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border border-black">
                    <SelectItem value="default" className="text-lg font-medium">Default (Single Column)</SelectItem>
                    <SelectItem value="grid" className="text-lg font-medium">Grid Layout</SelectItem>
                    <SelectItem value="minimal" className="text-lg font-medium">Minimal</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-base text-gray-600 font-medium p-4 rounded-lg bg-gray-100 border border-black">
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
                  <SelectTrigger id="fontFamily" className="rounded-lg border border-black text-lg font-medium h-14">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border border-black">
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

          {/* GDPR Privacy Controls */}
          <Card className="rounded-lg border-4 border-black bg-white">
            <CardHeader className="pb-8 border-b-4 border-black">
              <CardTitle className="text-3xl font-bold text-black">
                Privacy & Data
              </CardTitle>
              <CardDescription className="text-lg font-medium text-gray-700">
                Manage your personal data and privacy settings (GDPR compliant)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              {/* Download Data */}
              <div className="p-6 rounded-lg border border-black bg-gray-50">
                <div className="flex items-start gap-4">
                  <Download className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Download Your Data
                    </h4>
                    <p className="text-base text-gray-600 font-medium mb-4">
                      Export all your personal data in JSON format. This includes your profile, products, orders, and reviews.
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold"
                      onClick={async () => {
                        try {
                          const result = await trpc.gdpr.exportUserData.mutate();
                          window.open(result.downloadUrl, '_blank');
                          toast.success('Your data export is ready! Download will start shortly.');
                        } catch (error: any) {
                          toast.error(`Export failed: ${error.message}`);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download My Data
                    </Button>
                  </div>
                </div>
              </div>

              {/* Delete Account */}
              <div className="p-6 rounded-lg border border-red-200 bg-red-50">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Delete Account
                    </h4>
                    <p className="text-base text-gray-600 font-medium mb-4">
                      Permanently delete your account and anonymize your personal data. This action cannot be undone.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="rounded-lg bg-red-600 hover:bg-red-700 font-bold"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete My Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-lg border-4 border-black">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-bold">
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base font-medium">
                            This action cannot be undone. This will:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Permanently delete your account</li>
                              <li>Anonymize your personal information</li>
                              <li>Remove your artist profile</li>
                              <li>Preserve order/review history (required by law)</li>
                            </ul>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-lg font-bold">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-lg bg-red-600 hover:bg-red-700 font-bold"
                            onClick={async () => {
                              try {
                                await trpc.gdpr.deleteAccount.mutate();
                                toast.success('Account deleted successfully');
                                // Redirect to home after short delay
                                setTimeout(() => {
                                  window.location.href = '/';
                                }, 2000);
                              } catch (error: any) {
                                toast.error(`Deletion failed: ${error.message}`);
                              }
                            }}
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>

              {/* Cookie Preferences */}
              <div className="p-6 rounded-lg border border-black bg-gray-50">
                <div className="flex items-start gap-4">
                  <span className="text-2xl mt-1">🍪</span>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Cookie Preferences
                    </h4>
                    <p className="text-base text-gray-600 font-medium mb-4">
                      Manage your cookie consent settings at any time.
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-lg border border-black font-bold"
                      onClick={() => {
                        // Clear cookie consent to trigger banner again
                        localStorage.removeItem('cookie-consent');
                        toast.success('Cookie preferences reset. Refresh the page to see the consent banner.');
                      }}
                    >
                      Manage Cookie Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="rounded-lg border-4 border-black bg-white cursor-pointer hover:bg-gray-50 transition-colors"
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
              className="rounded-lg border-4 border-black bg-white cursor-pointer hover:bg-gray-50 transition-colors"
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
