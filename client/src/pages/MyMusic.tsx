import { useState, useRef, useCallback } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import AudioPlayer from "@/components/AudioPlayer";
import BatchUploadDialog from "@/components/BatchUploadDialog";
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
  Heart,
  Search,
  Filter,
  X,
  FileAudio,
  Image as ImageIcon,
  DollarSign,
  Users,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ReleaseQualityScore, { type ReleaseQualityData } from "@/components/ReleaseQualityScore";
import { CreditsDisplay } from "@/components/Upload/CreditsSection";
import { TranscodeStatus } from "@/components/TranscodeStatus";
import { ArtworkSimulator } from "@/components/ArtworkSimulator";

/**
 * WORLD-CLASS MUSIC UPLOAD & MANAGEMENT SYSTEM
 * Rivals DistroKid, TuneCore, and CD Baby
 * 
 * Features:
 * - Drag-and-drop upload with progress tracking
 * - Audio metadata extraction
 * - Cover art upload
 * - Songwriter splits management
 * - Advanced filtering and sorting
 * - Real-time statistics
 */

export default function MyMusic() {
  useRequireArtist(); // Enforce artist authentication
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [mood, setMood] = useState("");
  const [bpm, setBpm] = useState("");
  const [musicalKey, setMusicalKey] = useState("");
  const [isExplicit, setIsExplicit] = useState(false);
  const [isrcCode, setIsrcCode] = useState("");
  
  // Songwriter splits
  const [songwriters, setSongwriters] = useState<Array<{name: string; percentage: number}>>([
    { name: "", percentage: 100 }
  ]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "processing" | "live" | "archived">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "title" | "playCount" | "duration">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [batchUploadDialogOpen, setBatchUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  
  // Audio player state
  const [nowPlaying, setNowPlaying] = useState<any | null>(null);

  // Track detail sheet state
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [detailTrack, setDetailTrack] = useState<any | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch data
  const { data: profile } = trpc.artistProfile.getMyProfile.useQuery();
  const { data: tracksData, refetch: refetchTracks } = trpc.music.getTracks.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchQuery || undefined,
    sortBy,
    sortOrder,
    limit: 50,
    offset: 0,
  });
  
  const { data: stats } = trpc.music.getTrackStats.useQuery();
  
  // Mutations
  const uploadMutation = trpc.music.uploadTrack.useMutation({
    onSuccess: () => {
      toast.success("Track uploaded successfully!");
      resetUploadForm();
      setUploadDialogOpen(false);
      refetchTracks();
    },
    onError: (error) => {
      toast.error(error.message || "Upload failed");
    },
  });
  
  const deleteMutation = trpc.music.deleteTrack.useMutation({
    onSuccess: () => {
      toast.success("Track deleted successfully");
      refetchTracks();
    },
    onError: (error) => {
      toast.error(error.message || "Delete failed");
    },
  });
  
  // File handling
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(f => f.type.startsWith('audio/'));
    const imageFile = files.find(f => f.type.startsWith('image/'));
    
    if (audioFile) {
      setAudioFile(audioFile);
      // Auto-extract title from filename
      const filename = audioFile.name.replace(/\.[^/.]+$/, "");
      setTitle(filename);
    }
    
    if (imageFile) {
      setArtworkFile(imageFile);
    }
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const filename = file.name.replace(/\.[^/.]+$/, "");
      setTitle(filename);
    }
  };
  
  const handleArtworkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtworkFile(file);
    }
  };
  
  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:audio/mpeg;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
    });
  };
  
  // Handle upload
  const handleUpload = async () => {
    if (!audioFile) {
      toast.error("Please select an audio file");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    // Validate songwriter splits
    const totalPercentage = songwriters.reduce((sum, sw) => sum + sw.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error(`Songwriter splits must add up to 100% (current: ${totalPercentage}%)`);
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Convert files to base64
      const audioBase64 = await fileToBase64(audioFile);
      setUploadProgress(30);
      
      let artworkBase64: string | undefined;
      if (artworkFile) {
        artworkBase64 = await fileToBase64(artworkFile);
        setUploadProgress(50);
      }
      
      // Upload track
      await uploadMutation.mutateAsync({
        audioFileBase64: audioBase64,
        audioFileName: audioFile.name,
        artworkFileBase64: artworkBase64,
        artworkFileName: artworkFile?.name,
        title,
        artist: artist || undefined,
        genre: genre || undefined,
        mood: mood || undefined,
        bpm: bpm ? parseInt(bpm) : undefined,
        musicalKey: musicalKey || undefined,
        isExplicit,
        isrcCode: isrcCode || undefined,
        songwriterSplits: songwriters.filter(sw => sw.name.trim()).length > 0 
          ? songwriters.filter(sw => sw.name.trim())
          : undefined,
      });
      
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const resetUploadForm = () => {
    setAudioFile(null);
    setArtworkFile(null);
    setTitle("");
    setArtist("");
    setGenre("");
    setMood("");
    setBpm("");
    setMusicalKey("");
    setIsExplicit(false);
    setIsrcCode("");
    setSongwriters([{ name: "", percentage: 100 }]);
  };
  
  const handleDeleteTrack = (trackId: number) => {
    if (confirm("Are you sure you want to delete this track?")) {
      deleteMutation.mutate({ trackId });
    }
  };
  
  const addSongwriter = () => {
    setSongwriters([...songwriters, { name: "", percentage: 0 }]);
  };
  
  const removeSongwriter = (index: number) => {
    setSongwriters(songwriters.filter((_, i) => i !== index));
  };
  
  const updateSongwriter = (index: number, field: 'name' | 'percentage', value: string | number) => {
    const updated = [...songwriters];
    updated[index] = { ...updated[index], [field]: value };
    setSongwriters(updated);
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">BopMusic</h1>
            <p className="text-muted-foreground mt-1">
              Upload and manage your tracks
            </p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="gap-2">
                  <UploadIcon className="h-5 w-5" />
                  Upload Single Track
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Track</DialogTitle>
                <DialogDescription>
                  Upload your music and add metadata for distribution
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Drag & Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`border border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <FileAudio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-2">
                    Drag and drop your audio file here
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    or click to browse (MP3, WAV, FLAC, M4A)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select Audio File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileSelect}
                    className="hidden"
                  />
                  
                  {audioFile && (
                    <div className="mt-4 p-3 bg-muted rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileAudio className="h-4 w-4" />
                        <span className="text-sm font-medium">{audioFile.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAudioFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Cover Art */}
                <div>
                  <Label>Cover Art (Optional)</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {artworkFile ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(artworkFile)}
                          alt="Cover art preview"
                          className="h-24 w-24 rounded-md object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => setArtworkFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-24 w-24 rounded-md border border-dashed border-border flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => artworkInputRef.current?.click()}
                    >
                      {artworkFile ? 'Change' : 'Upload'} Cover Art
                    </Button>
                    <input
                      ref={artworkInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleArtworkFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {/* Track Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title">Track Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter track title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="artist">Artist Name</Label>
                    <Input
                      id="artist"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder={profile?.stageName || "Artist name"}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      placeholder="e.g., Hip-Hop, R&B"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="mood">Mood</Label>
                    <Input
                      id="mood"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      placeholder="e.g., Energetic, Chill"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bpm">BPM</Label>
                    <Input
                      id="bpm"
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(e.target.value)}
                      placeholder="120"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="musicalKey">Musical Key</Label>
                    <Input
                      id="musicalKey"
                      value={musicalKey}
                      onChange={(e) => setMusicalKey(e.target.value)}
                      placeholder="e.g., C Major"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="isrcCode">ISRC Code</Label>
                    <Input
                      id="isrcCode"
                      value={isrcCode}
                      onChange={(e) => setIsrcCode(e.target.value)}
                      placeholder="CC-XXX-YY-NNNNN"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      id="isExplicit"
                      checked={isExplicit}
                      onChange={(e) => setIsExplicit(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isExplicit" className="cursor-pointer">
                      Explicit Content
                    </Label>
                  </div>
                </div>
                
                {/* Songwriter Splits */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Songwriter Splits</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSongwriter}
                    >
                      Add Writer
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {songwriters.map((songwriter, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder="Writer name"
                          value={songwriter.name}
                          onChange={(e) => updateSongwriter(index, 'name', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="%"
                          value={songwriter.percentage}
                          onChange={(e) => updateSongwriter(index, 'percentage', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                        {songwriters.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSongwriter(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Total: {songwriters.reduce((sum, sw) => sum + sw.percentage, 0)}% (must equal 100%)
                  </p>
                </div>
                
                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!audioFile || !title || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Track'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button size="lg" onClick={() => setBatchUploadDialogOpen(true)} className="gap-2">
            <UploadIcon className="h-5 w-5" />
            Batch Upload
          </Button>
          </div>
          
          <BatchUploadDialog
            open={batchUploadDialogOpen}
            onOpenChange={setBatchUploadDialogOpen}
            onUploadComplete={() => {
              refetchTracks();
              toast.success('Batch upload complete!');
            }}
          />
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tracks</p>
                  <p className="text-3xl font-black mt-1">{stats?.totalTracks || 0}</p>
                </div>
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
                  <p className="text-3xl font-black mt-1">{stats?.totalPlays?.toLocaleString() || 0}</p>
                </div>
                <Headphones className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                  <p className="text-3xl font-black mt-1">{stats?.totalLikes?.toLocaleString() || 0}</p>
                </div>
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-black mt-1">
                    ${((stats?.totalEarnings || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Upload Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="playCount">Plays</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Track List */}
        <Card>
          <CardHeader>
            <CardTitle>Tracks ({tracksData?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {!tracksData?.tracks || tracksData.tracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No tracks yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your first track to get started
                </p>
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Track
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tracksData.tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {/* Artwork */}
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {track.artworkUrl ? (
                        <img src={track.artworkUrl} alt={track.title} className="h-full w-full object-cover" />
                      ) : (
                        <Music className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        {track.isExplicit && (
                          <Badge variant="secondary" className="text-xs">E</Badge>
                        )}
                        <Badge variant={
                          track.status === 'live' ? 'default' :
                          track.status === 'draft' ? 'secondary' :
                          track.status === 'processing' ? 'outline' :
                          'destructive'
                        }>
                          {track.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist} {track.genre && `• ${track.genre}`}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(track.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Headphones className="h-3 w-3" />
                          {track.playCount.toLocaleString()} plays
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {track.likeCount.toLocaleString()} likes
                        </span>
                        {track.fileSize && (
                          <span>{formatFileSize(track.fileSize)}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setNowPlaying(track)}>
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setDetailTrack(track); setDetailSheetOpen(true); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/distribution/wizard?tracks=${track.id}`)}>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Distribute
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteTrack(track.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Track Detail Sheet — Loudness & Metadata */}
        <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            {detailTrack && (
              <>
                <SheetHeader className="mb-4">
                  <SheetTitle className="flex items-center gap-3">
                    {detailTrack.artworkUrl && (
                      <img src={detailTrack.artworkUrl} alt={detailTrack.title} className="h-10 w-10 rounded object-cover" />
                    )}
                    <span className="truncate">{detailTrack.title}</span>
                  </SheetTitle>
                </SheetHeader>

                {/* Unified Release Quality Score (DISTRO-UQ1) */}
                {detailTrack.audioMetrics ? (
                  <ReleaseQualityScore
                    data={(() => {
                      const m = detailTrack.audioMetrics as any;
                      // Reconstruct AudioQualityReportData from the flat audioMetrics blob
                      const audioQuality = {
                        qualityTier: m.qualityTier ?? 'boptone_only',
                        isDistributionReady: m.isDistributionReady ?? false,
                        summary: m.summary ?? '',
                        warnings: m.warnings ?? [],
                        recommendations: m.recommendations ?? [],
                        loudness: null,
                        technicalProfile: (m.sampleRateHz || m.bitDepth || m.codec) ? {
                          format: m.codec ?? null,
                          sampleRateHz: m.sampleRateHz ?? 0,
                          bitDepth: m.bitDepth ?? null,
                          channels: m.channels ?? null,
                          bitrateKbps: m.bitrateKbps ?? null,
                          durationSeconds: null,
                          isLossless: m.isLossless ?? false,
                          codec: m.codec ?? null,
                        } : null,
                      };
                      // Reconstruct LoudnessData from the flat audioMetrics blob
                      const loudness = (m.integratedLufs !== undefined || m.truePeakDbtp !== undefined) ? {
                        integratedLufs: m.integratedLufs ?? null,
                        truePeakDbtp: m.truePeakDbtp ?? null,
                        loudnessRange: m.loudnessRange ?? null,
                        isClipping: m.isClipping ?? false,
                        spotifyReady: m.spotifyReady ?? false,
                        appleReady: m.appleReady ?? false,
                        youtubeReady: m.youtubeReady ?? false,
                        amazonReady: m.amazonReady ?? false,
                        tidalReady: m.tidalReady ?? false,
                        deezerReady: m.deezerReady ?? false,
                        recommendation: m.loudnessRecommendation ?? null,
                      } : null;
                      return { audioQuality, loudness, coverArt: m.coverArtReport ?? undefined } as ReleaseQualityData;
                    })()}
                    trackTitle={detailTrack.title}
                    defaultExpanded={true}
                  />
                ) : (
                  <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">No quality data available.</p>
                    <p className="text-xs text-muted-foreground mt-1">Re-upload this track to generate a full quality score.</p>
                  </div>
                )}
                {/* Professional Credits (DISTRO-CREDITS) */}
                {detailTrack.credits && Object.keys(detailTrack.credits as object).length > 0 && (
                  <div className="mt-4 mb-4">
                    <CreditsDisplay credits={detailTrack.credits as any} />
                  </div>
                )}

                {/* DSP Format Variants (DISTRO-A3) */}
                <div className="mt-4 mb-4 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
                  <TranscodeStatus trackId={detailTrack.id} autoRefresh={true} />
                </div>

                {/* Artwork Display Simulator (BOP-MUSIC-ART) */}
                {detailTrack.artworkUrl && (
                  <div className="mt-4 mb-4">
                    <ArtworkSimulator
                      imageUrl={detailTrack.artworkUrl}
                      trackTitle={detailTrack.title}
                      artistName={detailTrack.artistName || ""}
                      compact
                    />
                  </div>
                )}

                {/* Track metadata summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-muted-foreground">Artist</span>
                    <span className="font-medium">{detailTrack.artist || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-muted-foreground">Genre</span>
                    <span className="font-medium">{detailTrack.genre || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{formatDuration(detailTrack.duration)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-muted-foreground">File size</span>
                    <span className="font-medium">{detailTrack.fileSize ? formatFileSize(detailTrack.fileSize) : '—'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-muted-foreground">ISRC</span>
                    <span className="font-mono text-xs">{detailTrack.isrcCode || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={detailTrack.status === 'live' ? 'default' : 'secondary'}>{detailTrack.status}</Badge>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Audio Player */}
        {nowPlaying && (
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t">
            <div className="container max-w-7xl mx-auto">
              <AudioPlayer
                audioUrl={nowPlaying.audioUrl}
                title={nowPlaying.title}
                artist={nowPlaying.artist}
                artworkUrl={nowPlaying.artworkUrl || undefined}
                onEnded={() => setNowPlaying(null)}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
