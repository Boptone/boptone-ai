import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "@/components/ui/dialog";
import {
  Upload as UploadIcon,
  X,
  FileAudio,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Music2,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

interface UploadQueueItem {
  id: string;
  file: File;
  title: string;
  artist: string;
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

interface BatchUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

// Distribution platforms (will be fetched from API in production)
const DISTRIBUTION_PLATFORMS = [
  { id: 1, name: "Spotify", slug: "spotify", logo: "🎵" },
  { id: 2, name: "Apple Music", slug: "apple_music", logo: "🍎" },
  { id: 3, name: "Tidal", slug: "tidal", logo: "🌊" },
  { id: 4, name: "Deezer", slug: "deezer", logo: "🎧" },
  { id: 5, name: "YouTube Music", slug: "youtube_music", logo: "▶️" },
  { id: 6, name: "Amazon Music", slug: "amazon_music", logo: "📦" },
  { id: 7, name: "Pandora", slug: "pandora", logo: "📻" },
  { id: 8, name: "SoundCloud", slug: "soundcloud", logo: "☁️" },
];

export default function BatchUploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
}: BatchUploadDialogProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStep, setCurrentStep] = useState<"select" | "metadata" | "distribution" | "uploading">("select");
  
  // Bulk metadata
  const [bulkArtist, setBulkArtist] = useState("");
  const [bulkGenre, setBulkGenre] = useState("");
  const [bulkMood, setBulkMood] = useState("");
  const [bulkArtwork, setBulkArtwork] = useState<File | null>(null);
  
  // Distribution settings
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [releaseDate, setReleaseDate] = useState("");
  const [distributeToBAP, setDistributeToBAP] = useState(true); // BAP is default
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const audioFiles = Array.from(files).filter((file) =>
      file.type.startsWith("audio/") || 
      [".mp3", ".wav", ".flac", ".m4a"].some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (audioFiles.length === 0) {
      toast.error("No valid audio files selected");
      return;
    }

    const newItems: UploadQueueItem[] = audioFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      artist: "",
      status: "pending",
      progress: 0,
    }));

    setUploadQueue(prev => [...prev, ...newItems]);
    setCurrentStep("metadata");
    toast.success(`Added ${audioFiles.length} track${audioFiles.length > 1 ? 's' : ''} to upload queue`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFromQueue = (id: string) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const applyBulkMetadata = () => {
    setUploadQueue(prev => prev.map(item => ({
      ...item,
      artist: bulkArtist || item.artist,
    })));
  };

  const togglePlatform = (platformId: number) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const startUpload = async () => {
    setCurrentStep("uploading");
    
    // Simulate upload process (replace with actual upload logic)
    for (const item of uploadQueue) {
      setUploadQueue(prev => prev.map(i =>
        i.id === item.id ? { ...i, status: "uploading" } : i
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadQueue(prev => prev.map(i =>
          i.id === item.id ? { ...i, progress } : i
        ));
      }

      setUploadQueue(prev => prev.map(i =>
        i.id === item.id ? { ...i, status: "complete", progress: 100 } : i
      ));
    }

    toast.success(`Successfully uploaded ${uploadQueue.length} track${uploadQueue.length > 1 ? 's' : ''}!`);
    onUploadComplete();
    handleClose();
  };

  const handleClose = () => {
    setUploadQueue([]);
    setCurrentStep("select");
    setBulkArtist("");
    setBulkGenre("");
    setBulkMood("");
    setBulkArtwork(null);
    setSelectedPlatforms([]);
    setReleaseDate("");
    setDistributeToBAP(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Batch Upload Tracks</DialogTitle>
          <DialogDescription>
            Upload multiple tracks at once and distribute to streaming platforms
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {["select", "metadata", "distribution", "uploading"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep === step ? "border-primary bg-primary text-primary-foreground" :
                ["select", "metadata", "distribution", "uploading"].indexOf(currentStep) > index ? "border-primary bg-primary text-primary-foreground" :
                "border-muted-foreground text-muted-foreground"
              }`}>
                {["select", "metadata", "distribution", "uploading"].indexOf(currentStep) > index ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              {index < 3 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  ["select", "metadata", "distribution", "uploading"].indexOf(currentStep) > index ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: File Selection */}
        {currentStep === "select" && (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <UploadIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Drop audio files here or click to browse
              </h3>
              <p className="text-sm text-muted-foreground">
                Supports MP3, WAV, FLAC, M4A • Multiple files allowed
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.flac,.m4a"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {uploadQueue.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Selected Files ({uploadQueue.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uploadQueue.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileAudio className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromQueue(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setCurrentStep("metadata")} className="w-full">
                  Continue to Metadata
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Bulk Metadata */}
        {currentStep === "metadata" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Apply Metadata to All Tracks</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set common metadata that will be applied to all {uploadQueue.length} track{uploadQueue.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Artist Name *</Label>
                <Input
                  value={bulkArtist}
                  onChange={(e) => setBulkArtist(e.target.value)}
                  placeholder="Enter artist name"
                />
              </div>

              <div>
                <Label>Genre</Label>
                <Select value={bulkGenre} onValueChange={setBulkGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hip-hop">Hip Hop</SelectItem>
                    <SelectItem value="r&b">R&B</SelectItem>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="classical">Classical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Mood</Label>
                <Select value={bulkMood} onValueChange={setBulkMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="energetic">Energetic</SelectItem>
                    <SelectItem value="chill">Chill</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                    <SelectItem value="romantic">Romantic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Album Artwork</Label>
                <Button
                  variant="outline"
                  onClick={() => artworkInputRef.current?.click()}
                  className="w-full justify-start"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {bulkArtwork ? bulkArtwork.name : "Upload artwork"}
                </Button>
                <input
                  ref={artworkInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBulkArtwork(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("select")}>
                Back
              </Button>
              <Button onClick={() => {
                applyBulkMetadata();
                setCurrentStep("distribution");
              }} className="flex-1">
                Continue to Distribution
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Distribution Platform Selection */}
        {currentStep === "distribution" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose Distribution Platforms</h3>
              <p className="text-sm text-muted-foreground">
                Select where you want your music to be available
              </p>
            </div>

            {/* BAP (Primary Platform) */}
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-2xl">
                    <Music2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold">BAP (Boptone Artist Protocol)</h4>
                    <p className="text-sm text-muted-foreground">
                      Primary streaming platform • 90% artist revenue share
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Recommended</Badge>
                  <Checkbox
                    checked={distributeToBAP}
                    onCheckedChange={(checked) => setDistributeToBAP(checked as boolean)}
                  />
                </div>
              </div>
            </div>

            {/* Third-Party Platforms */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Third-Party Streaming Platforms
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Optional: Distribute to major streaming services (Boptone takes a % based on your subscription tier)
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {DISTRIBUTION_PLATFORMS.map((platform) => (
                  <div
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{platform.logo}</span>
                        <span className="font-medium">{platform.name}</span>
                      </div>
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={() => togglePlatform(platform.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Release Date */}
            <div>
              <Label>Release Date (Optional)</Label>
              <Input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to publish immediately
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep("metadata")}>
                Back
              </Button>
              <Button onClick={startUpload} className="flex-1" disabled={!distributeToBAP && selectedPlatforms.length === 0}>
                {distributeToBAP || selectedPlatforms.length > 0 ? "Start Upload" : "Select at least one platform"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Uploading */}
        {currentStep === "uploading" && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Uploading Tracks...</h3>
              <p className="text-sm text-muted-foreground">
                Please don't close this window
              </p>
            </div>

            <div className="space-y-3">
              {uploadQueue.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileAudio className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {item.status === "complete" && (
                      <Badge variant="default">
                        <Check className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                    {item.status === "uploading" && (
                      <Badge variant="secondary">Uploading...</Badge>
                    )}
                    {item.status === "error" && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                      </Badge>
                    )}
                  </div>
                  {item.status !== "pending" && (
                    <Progress value={item.progress} className="h-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
