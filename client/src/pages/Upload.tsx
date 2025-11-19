import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload as UploadIcon, Music, Image as ImageIcon, Loader2, Check, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";

export default function Upload() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractingMetadata, setExtractingMetadata] = useState(false);
  
  const [metadata, setMetadata] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    releaseDate: "",
    description: "",
    bpm: "",
    musicalKey: "",
    explicit: false,
  });

  const uploadTrackMutation = trpc.bap.uploadTrack.useMutation({
    onSuccess: () => {
      toast.success("Track published to BAP!", {
        description: "Your music is now live and available to fans worldwide."
      });
      setLocation("/discover");
    },
    onError: (error) => {
      toast.error("Upload failed", {
        description: error.message
      });
      setIsUploading(false);
    }
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(f => f.type.startsWith('audio/'));
    
    if (audioFile) {
      handleAudioFile(audioFile);
    } else {
      toast.error("Please drop an audio file (MP3, WAV, FLAC, or AAC)");
    }
  }, []);

  const handleAudioFile = async (file: File) => {
    setAudioFile(file);
    setExtractingMetadata(true);
    
    // Simulate AI metadata extraction (in production, this would call an actual AI service)
    setTimeout(() => {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      const parts = fileName.split(' - ');
      
      setMetadata(prev => ({
        ...prev,
        title: parts.length > 1 ? parts[1] : fileName,
        artist: parts.length > 1 ? parts[0] : user?.name || "",
      }));
      
      setExtractingMetadata(false);
      toast.success("Metadata extracted!", {
        description: "AI analyzed your track. Review and edit as needed."
      });
    }, 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAudioFile(file);
    }
  };

  const handleArtworkSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setArtworkFile(file);
      toast.success("Artwork uploaded!");
    } else {
      toast.error("Please select an image file");
    }
  };

  const handlePublish = async () => {
    if (!audioFile) {
      toast.error("Please upload an audio file");
      return;
    }

    if (!metadata.title || !metadata.artist) {
      toast.error("Please fill in title and artist");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);

    try {
      // In production, upload audio and artwork to S3 first
      // For now, we'll simulate with placeholder URLs
      const audioUrl = `https://storage.boptone.com/tracks/${Date.now()}.mp3`;
      const artworkUrl = artworkFile 
        ? `https://storage.boptone.com/artwork/${Date.now()}.jpg`
        : `https://via.placeholder.com/500x500?text=${encodeURIComponent(metadata.title)}`;

      await uploadTrackMutation.mutateAsync({
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album || null,
        genre: metadata.genre || null,
        releaseDate: metadata.releaseDate ? new Date(metadata.releaseDate) : new Date(),
        duration: 180, // In production, extract from audio file
        audioUrl,
        artworkUrl,
        bpm: metadata.bpm ? parseInt(metadata.bpm) : null,
        musicalKey: metadata.musicalKey || null,
        explicit: metadata.explicit,
        description: metadata.description || null,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to upload music to BAP</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload to BAP</h1>
          <p className="text-muted-foreground">
            Share your music with the world. Your track will be live in minutes.
          </p>
        </div>

        {/* Audio Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Audio File
            </CardTitle>
            <CardDescription>
              Upload your track (MP3, WAV, FLAC, or AAC)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!audioFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Drag and drop your audio file here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="audio-upload"
                />
                <Label htmlFor="audio-upload">
                  <Button variant="outline" asChild>
                    <span>Choose File</span>
                  </Button>
                </Label>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                {extractingMetadata ? (
                  <Loader2 className="h-10 w-10 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <Check className="h-10 w-10 text-green-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{audioFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {extractingMetadata && (
                    <p className="text-sm text-primary flex items-center gap-1 mt-1">
                      <Sparkles className="h-3 w-3" />
                      AI extracting metadata...
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAudioFile(null);
                    setMetadata({
                      title: "",
                      artist: "",
                      album: "",
                      genre: "",
                      releaseDate: "",
                      description: "",
                      bpm: "",
                      musicalKey: "",
                      explicit: false,
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata Form */}
        {audioFile && !extractingMetadata && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Track Information</CardTitle>
                <CardDescription>
                  AI extracted metadata. Review and edit as needed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={metadata.title}
                      onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Song title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist *</Label>
                    <Input
                      id="artist"
                      value={metadata.artist}
                      onChange={(e) => setMetadata(prev => ({ ...prev, artist: e.target.value }))}
                      placeholder="Artist name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="album">Album</Label>
                    <Input
                      id="album"
                      value={metadata.album}
                      onChange={(e) => setMetadata(prev => ({ ...prev, album: e.target.value }))}
                      placeholder="Album name (optional)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Select value={metadata.genre} onValueChange={(value) => setMetadata(prev => ({ ...prev, genre: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="hip-hop">Hip Hop</SelectItem>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="r&b">R&B</SelectItem>
                        <SelectItem value="indie">Indie</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="releaseDate">Release Date</Label>
                    <Input
                      id="releaseDate"
                      type="date"
                      value={metadata.releaseDate}
                      onChange={(e) => setMetadata(prev => ({ ...prev, releaseDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bpm">BPM</Label>
                    <Input
                      id="bpm"
                      type="number"
                      value={metadata.bpm}
                      onChange={(e) => setMetadata(prev => ({ ...prev, bpm: e.target.value }))}
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key">Musical Key</Label>
                    <Input
                      id="key"
                      value={metadata.musicalKey}
                      onChange={(e) => setMetadata(prev => ({ ...prev, musicalKey: e.target.value }))}
                      placeholder="C Major"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={metadata.description}
                    onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell fans about this track..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Artwork Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Artwork
                </CardTitle>
                <CardDescription>
                  Upload cover art (recommended: 3000x3000px, JPG or PNG)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!artworkFile ? (
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleArtworkSelect}
                        className="hidden"
                        id="artwork-upload"
                      />
                      <Label htmlFor="artwork-upload">
                        <Button variant="outline" asChild>
                          <span>Upload Artwork</span>
                        </Button>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-2">
                        Optional - we'll generate a placeholder if not provided
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <img
                      src={URL.createObjectURL(artworkFile)}
                      alt="Artwork preview"
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{artworkFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(artworkFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setArtworkFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Publish Button */}
            <Card>
              <CardContent className="pt-6">
                {isUploading && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Uploading to BAP...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                <Button
                  onClick={handlePublish}
                  disabled={isUploading}
                  className="w-full"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Publish to BAP
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-3">
                  Your track will be live and available to fans worldwide in minutes
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
