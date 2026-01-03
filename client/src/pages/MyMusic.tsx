import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  TrendingUp
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
      icon: Music,
      color: "text-blue-600"
    },
    {
      title: "Total Streams",
      value: "0", // TODO: Calculate total streams
      icon: Play,
      color: "text-green-600"
    },
    {
      title: "Total Views",
      value: "0", // TODO: Calculate total views
      icon: Eye,
      color: "text-purple-600"
    },
    {
      title: "Avg. Engagement",
      value: "0%", // TODO: Calculate engagement
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Music</h1>
          <p className="text-muted-foreground">
            Upload and manage your tracks
          </p>
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Track</CardTitle>
            <CardDescription>
              Share your music with the world
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-file">Audio File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {uploadFile && (
                  <Badge variant="secondary">{uploadFile.name}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: MP3, WAV, FLAC, M4A (Max 100MB)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter track title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your track..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleUpload}
              disabled={isUploading || !uploadFile || !title}
              className="w-full"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Publish Track
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Tracks */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tracks</CardTitle>
            <CardDescription>
              Manage your uploaded music
            </CardDescription>
          </CardHeader>
          <CardContent>
            {myTracks && myTracks.length > 0 ? (
              <div className="space-y-2">
                {myTracks.map((track: any) => (
                  <div key={track.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                        <Music className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{track.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {track.genre && <span className="capitalize">{track.genre}</span>}
                          <span>•</span>
                          <span>{new Date(track.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {track.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
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
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No tracks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first track to get started
                </p>
                <Button variant="outline" onClick={() => document.getElementById('audio-file')?.click()}>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Track
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Link href="/discover">
              <Button variant="outline" className="w-full justify-start">
                <Music className="h-4 w-4 mr-2" />
                Discover Music
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Feature coming soon")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
