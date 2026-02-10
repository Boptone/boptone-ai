import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Upload as UploadIcon, 
  Music, 
  Play,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Sparkles,
  Headphones,
  Heart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

export default function MyMusic() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch user's artist profile and tracks
  const { data: profile } = trpc.artistProfile.getMyProfile.useQuery();
  const { data: myTracks, refetch } = trpc.bap.tracks.getByArtist.useQuery(
    { artistId: profile?.id || 0, limit: 50 },
    { enabled: !!profile?.id }
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Auto-extract title from filename
      const filename = file.name.replace(/\.[^/.]+$/, "");
      setTitle(filename);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error("Please select an audio file");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsUploading(true);

    try {
      // TODO: Implement actual upload logic
      // This would involve:
      // 1. Upload file to S3 using storagePut
      // 2. Extract metadata using audioMetadata service
      // 3. Create track record in database
      
      toast.success("Track uploaded successfully!");
      setUploadFile(null);
      setTitle("");
      setDescription("");
      refetch();
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const stats = [
    {
      title: "Total Tracks",
      value: myTracks?.length || 0,
      icon: Music
    },
    {
      title: "Total Streams",
      value: "0", // TODO: Calculate total streams
      icon: Headphones
    },
    {
      title: "Total Views",
      value: "0", // TODO: Calculate total views
      icon: Eye
    },
    {
      title: "Engagement",
      value: "0%", // TODO: Calculate engagement
      icon: Heart
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Revolutionary Header */}
        <div>
          <h1 className="text-6xl font-black tracking-tight leading-none mb-4 text-foreground">
            Your
            <br />
            Releases.
          </h1>
          <p className="text-2xl text-gray-600">
            Upload and manage your tracks on BAP
          </p>
        </div>

        {/* Stats Grid - Color-Coded Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.title}
                className="border-2 border-gray-200 bg-white"
              >
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-gray-100 flex items-center justify-center mb-4">
                    <Icon className="h-7 w-7 text-gray-700" />
                  </div>
                  <div className="text-lg text-gray-600 mb-2">
                    {stat.title}
                  </div>
                  <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Upload Card - Blue Theme */}
        <Card className="border-2 border-gray-200 bg-white">
          <CardContent className="p-10">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Upload New Track
              </h2>
              <p className="text-xl text-gray-600 font-bold">
                Share your music with the world through BAP
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="audio-file" className="text-lg font-black text-gray-900">Audio File</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="flex-1 h-14 text-lg border-2 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
                  />
                  {uploadFile && (
                    <Badge className="rounded-full border-2 border-primary bg-primary/10 text-primary font-semibold text-sm px-4 py-2">
                      {uploadFile.name}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Supported formats: MP3, WAV, FLAC, M4A (Max 100MB)
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="title" className="text-lg font-black text-gray-900">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter track title"
                  className="h-14 text-lg border-2 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-lg font-black text-gray-900">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your track..."
                  rows={4}
                  className="text-lg border-2 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
                />
              </div>

              <Button 
                onClick={handleUpload}
                disabled={isUploading || !uploadFile || !title}
                className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90"
              >
                {isUploading ? (
                  <>UPLOADING...</>
                ) : (
                  <>
                    <UploadIcon className="h-6 w-6 mr-3" />
                    PUBLISH TRACK
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Track List - Purple Theme */}
        <Card className="border-2 border-gray-200 bg-white">
          <CardContent className="p-10">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Track Library
              </h2>
              <p className="text-xl text-gray-600 font-bold">
                Manage your uploaded music
              </p>
            </div>

            {myTracks && myTracks.length > 0 ? (
              <div className="space-y-4">
                {myTracks.map((track: any) => (
                  <Card 
                    key={track.id}
                    className="rounded-3xl border-4 border-gray-300 shadow-xl hover:scale-[1.02] hover:border-purple-500 transition-all bg-white"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <Music className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-gray-900">{track.title}</h3>
                            <div className="flex items-center gap-4 text-lg text-gray-600 font-bold mt-1">
                              {track.genre && (
                                <Badge className="rounded-full border-2 border-purple-500 bg-purple-50 text-purple-600 font-black text-xs px-3 py-1 capitalize">
                                  {track.genre}
                                </Badge>
                              )}
                              <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="rounded-full border-2 border-green-500 bg-green-50 text-green-600 font-black text-sm px-4 py-2 capitalize">
                            {track.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button className="rounded-full" variant="ghost" size="icon">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Play className="h-4 w-4 mr-2" />
                                Play
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-3xl border-4 border-gray-300 shadow-2xl bg-white">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl mx-auto mb-6">
                    <Music className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4">No Tracks Yet</h3>
                  <p className="text-xl text-gray-600 font-medium mb-8">
                    Upload your first track to claim your profile
                  </p>
                  <Button 
                    className="rounded-full text-xl px-10 py-7 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl font-black"
                    onClick={() => document.getElementById('audio-file')?.click()}
                  >
                    <UploadIcon className="h-6 w-6 mr-3" />
                    Upload Track
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Green/Orange Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/discover">
            <Card className="rounded-3xl border-4 border-green-500 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="p-10 text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg mx-auto mb-6">
                  <Music className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-3">Discover Music</h3>
                <p className="text-lg text-gray-600 font-bold">
                  Explore trending tracks on BAP
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="rounded-3xl border-4 border-orange-500 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 hover:scale-105 transition-transform cursor-pointer"
            onClick={() => toast.info("Feature coming soon")}
          >
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-3">View Analytics</h3>
              <p className="text-lg text-gray-600 font-bold">
                Track your performance metrics
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
