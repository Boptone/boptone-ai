import { useState, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { DEV_MODE } from "@/lib/devMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload as UploadIcon, Music, Image as ImageIcon, Loader2, Check, Sparkles, AlertCircle, CheckCircle2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RevenueCalculator } from "@/components/RevenueCalculator";

// Validation helper functions
const validateISRC = (isrc: string): boolean => {
  // ISRC format: CC-XXX-YY-NNNNN (12 characters without hyphens)
  const cleanISRC = isrc.replace(/-/g, '');
  return /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(cleanISRC);
};

const validateUPC = (upc: string): boolean => {
  // UPC format: 12 digits
  return /^\d{12}$/.test(upc);
};

const validateSongwriterSplits = (splits: Array<{email: string; fullName: string; percentage: number}>): boolean => {
  if (splits.length === 0) return false;
  const total = splits.reduce((sum, split) => sum + split.percentage, 0);
  return Math.abs(total - 100) < 0.01; // Allow for floating point precision
};

type ValidationStatus = 'valid' | 'invalid' | 'empty';

interface ValidationState {
  isrc: ValidationStatus;
  upc: ValidationStatus;
  songwriterSplits: ValidationStatus;
  publishingData: ValidationStatus;
  aiDisclosure: ValidationStatus;
}

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
    // Compliance fields
    isrcCode: "",
    upcCode: "",
    publisher: "",
    pro: "", // Performance Rights Organization
    aiUsed: false,
    aiTypes: [] as Array<'lyrics' | 'production' | 'mastering' | 'vocals' | 'artwork'>,
    // Pricing
    pricePerStream: 1, // Default $0.01 (in cents)
  });

  const [songwriterSplits, setSongwriterSplits] = useState<Array<{email: string; fullName: string; percentage: number}>>([
    { email: user?.email || "", fullName: user?.name || "", percentage: 100 }
  ]);

  // Validation state
  const [validation, setValidation] = useState<ValidationState>({
    isrc: 'empty',
    upc: 'empty',
    songwriterSplits: 'valid', // Start valid with 100% to current user
    publishingData: 'empty',
    aiDisclosure: 'valid', // Start valid (not required)
  });

  const [showValidation, setShowValidation] = useState(false);

  const uploadTrackMutation = trpc.bap.tracks.upload.useMutation({
    onSuccess: () => {
      toast.success("Track published to BAP!", {
        description: "Your music is now live and available to fans worldwide."
      });
      setLocation("/discover");
    },
    onError: (error: any) => {
      toast.error("Upload failed", {
        description: error.message
      });
      setIsUploading(false);
    }
  });

  // Validate fields on change
  const handleISRCChange = (value: string) => {
    setMetadata(prev => ({ ...prev, isrcCode: value }));
    if (value === '') {
      setValidation(prev => ({ ...prev, isrc: 'empty' }));
    } else {
      setValidation(prev => ({ ...prev, isrc: validateISRC(value) ? 'valid' : 'invalid' }));
    }
  };

  const handleUPCChange = (value: string) => {
    setMetadata(prev => ({ ...prev, upcCode: value }));
    if (value === '') {
      setValidation(prev => ({ ...prev, upc: 'empty' }));
    } else {
      setValidation(prev => ({ ...prev, upc: validateUPC(value) ? 'valid' : 'invalid' }));
    }
  };

  const handleSongwriterSplitsChange = (newSplits: Array<{email: string; fullName: string; percentage: number}>) => {
    setSongwriterSplits(newSplits);
    if (newSplits.length === 0) {
      setValidation(prev => ({ ...prev, songwriterSplits: 'empty' }));
    } else {
      setValidation(prev => ({ ...prev, songwriterSplits: validateSongwriterSplits(newSplits) ? 'valid' : 'invalid' }));
    }
  };

  const handlePublishingDataChange = (field: 'publisher' | 'pro', value: string) => {
    setMetadata(prev => ({ ...prev, [field]: value }));
    const hasData = (field === 'publisher' ? value : metadata.publisher) || (field === 'pro' ? value : metadata.pro);
    setValidation(prev => ({ ...prev, publishingData: hasData ? 'valid' : 'empty' }));
  };

  const handleAIDisclosureChange = (used: boolean) => {
    setMetadata(prev => ({ ...prev, aiUsed: used, aiTypes: used ? prev.aiTypes : [] }));
    setValidation(prev => ({ ...prev, aiDisclosure: 'valid' })); // Always valid
  };

  const addSongwriter = () => {
    const newSplits = [...songwriterSplits, { email: "", fullName: "", percentage: 0 }];
    handleSongwriterSplitsChange(newSplits);
  };

  const removeSongwriter = (index: number) => {
    const newSplits = songwriterSplits.filter((_, i) => i !== index);
    handleSongwriterSplitsChange(newSplits);
  };

  const updateSongwriter = (index: number, field: 'email' | 'fullName' | 'percentage', value: string | number) => {
    const newSplits = [...songwriterSplits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    handleSongwriterSplitsChange(newSplits);
  };

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

  const canPublish = () => {
    // Must have audio file and title
    if (!audioFile || !metadata.title) return false;
    
    // All validation fields must be either valid or empty (not invalid)
    return Object.values(validation).every(status => status !== 'invalid');
  };

  const getComplianceScore = (): number => {
    let score = 0;
    if (validation.isrc === 'valid') score += 20;
    if (validation.upc === 'valid') score += 20;
    if (validation.songwriterSplits === 'valid') score += 20;
    if (validation.publishingData === 'valid') score += 20;
    if (validation.aiDisclosure === 'valid' && metadata.aiUsed) score += 20;
    return score;
  };

  const handlePublish = async () => {
    setShowValidation(true);
    
    if (!audioFile) {
      toast.error("Please upload an audio file");
      return;
    }

    if (!metadata.title) {
      toast.error("Please fill in title");
      return;
    }

    if (!canPublish()) {
      toast.error("Please fix validation errors before publishing");
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
      // Convert audio file to base64
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:audio/mpeg;base64, prefix
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioFile);
      });

      // Convert artwork to base64 if exists
      let artworkBase64: string | undefined;
      if (artworkFile) {
        artworkBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(artworkFile);
        });
      }

      await uploadTrackMutation.mutateAsync({
        title: metadata.title,
        artist: metadata.artist || undefined,
        genre: metadata.genre || undefined,
        audioFile: audioBase64,
        artworkFile: artworkBase64,
        isExplicit: metadata.explicit,
        pricePerStream: metadata.pricePerStream,
        // Compliance data
        isrcCode: metadata.isrcCode || undefined,
        upcCode: metadata.upcCode || undefined,
        songwriterSplits: songwriterSplits.length > 0 ? songwriterSplits : undefined,
        publishingData: (metadata.publisher || metadata.pro) ? {
          publisher: metadata.publisher || undefined,
          pro: metadata.pro || undefined,
        } : undefined,
        aiDisclosure: {
          used: metadata.aiUsed,
          types: metadata.aiUsed ? metadata.aiTypes : undefined,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const ValidationIcon = ({ status }: { status: ValidationStatus }) => {
    if (status === 'valid') return <CheckCircle2 className="h-4 w-4 text-primary" />;
    if (status === 'invalid') return <AlertCircle className="h-4 w-4 text-gray-500" />;
    return null;
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

  if (!user && !DEV_MODE) {
    return (
      <DashboardLayout>
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to upload music to BAP</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }

  const complianceScore = getComplianceScore();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-foreground">Upload to BAP</h1>
          <p className="text-xl text-gray-600">
            Share your music with the world. Your track will be live in minutes.
          </p>
        </div>

        {/* Compliance Score Banner */}
        {audioFile && (
          <Alert className="border-2 border-gray-200 bg-white">
            <Sparkles className="h-5 w-5 text-gray-700" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Compliance Score: {complianceScore}%</p>
                  <p className="text-sm text-gray-600">
                    {complianceScore >= 90 ? 'Excellent! Your metadata meets all industry standards.' :
                     complianceScore >= 60 ? 'Good start. Add more metadata to improve compliance.' :
                     'Add metadata below to meet platform requirements.'}
                  </p>
                </div>
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 bg-primary"
                    style={{ width: `${complianceScore}%` }}
                  />
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Audio Upload */}
        <Card className="rounded-xl">
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
                  <Button variant="outline" asChild className="rounded-full">
                    <span>Choose File</span>
                  </Button>
                </Label>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                {extractingMetadata ? (
                  <Loader2 className="h-10 w-10 animate-spin text-primary flex-shrink-0" />
                ) : (
                  <Check className="h-10 w-10 text-primary flex-shrink-0" />
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
                  className="rounded-full"
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
                      isrcCode: "",
                      upcCode: "",
                      publisher: "",
                      pro: "",
                      aiUsed: false,
                      aiTypes: [],
                      pricePerStream: 1,
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
            <Card className="rounded-xl">
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="explicit"
                    checked={metadata.explicit}
                    onCheckedChange={(checked) => setMetadata(prev => ({ ...prev, explicit: checked as boolean }))}
                  />
                  <Label htmlFor="explicit" className="cursor-pointer">
                    Explicit Content
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Compliance & Metadata Section */}
            <Card className="rounded-xl border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gray-700" />
                  Compliance & Metadata
                </CardTitle>
                <CardDescription>
                  Industry-standard metadata for distribution and royalty tracking. Optional but highly recommended.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ISRC Code */}
                <div className="space-y-2">
                  <Label htmlFor="isrc" className="flex items-center gap-2">
                    ISRC Code
                    {showValidation && <ValidationIcon status={validation.isrc} />}
                  </Label>
                  <Input
                    id="isrc"
                    value={metadata.isrcCode}
                    onChange={(e) => handleISRCChange(e.target.value)}
                    placeholder="CC-XXX-YY-NNNNN (e.g., USRC11234567)"
                    maxLength={15}
                    className={showValidation && validation.isrc === 'invalid' ? 'border-gray-400' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    International Standard Recording Code - unique identifier for this recording
                  </p>
                  {showValidation && validation.isrc === 'invalid' && (
                    <p className="text-xs text-gray-600">Invalid ISRC format. Should be 12 characters: CC-XXX-YY-NNNNN</p>
                  )}
                </div>

                {/* UPC Code */}
                <div className="space-y-2">
                  <Label htmlFor="upc" className="flex items-center gap-2">
                    UPC Code
                    {showValidation && <ValidationIcon status={validation.upc} />}
                  </Label>
                  <Input
                    id="upc"
                    value={metadata.upcCode}
                    onChange={(e) => handleUPCChange(e.target.value)}
                    placeholder="123456789012 (12 digits)"
                    maxLength={12}
                    className={showValidation && validation.upc === 'invalid' ? 'border-gray-400' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Universal Product Code - barcode identifier for commercial release
                  </p>
                  {showValidation && validation.upc === 'invalid' && (
                    <p className="text-xs text-gray-600">Invalid UPC format. Must be exactly 12 digits</p>
                  )}
                </div>

                {/* Pricing Controls */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Stream Pricing</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set your per-stream price and see real-time revenue projections. You keep 90% of every stream.
                  </p>
                  <RevenueCalculator
                    pricePerStream={metadata.pricePerStream}
                    onChange={(price) => setMetadata(prev => ({ ...prev, pricePerStream: price }))}
                  />
                </div>

                {/* Songwriter Splits */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Songwriter Splits
                    {showValidation && <ValidationIcon status={validation.songwriterSplits} />}
                  </Label>
                  <div className="space-y-3">
                    {songwriterSplits.map((split, index) => (
                      <div key={index} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Input
                            value={split.fullName}
                            onChange={(e) => updateSongwriter(index, 'fullName', e.target.value)}
                            placeholder="Full name"
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={split.percentage}
                            onChange={(e) => updateSongwriter(index, 'percentage', parseFloat(e.target.value) || 0)}
                            placeholder="%"
                            className="w-24"
                          />
                          {songwriterSplits.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSongwriter(index)}
                              className="flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input
                          type="email"
                          value={split.email}
                          onChange={(e) => updateSongwriter(index, 'email', e.target.value)}
                          placeholder="Email address (for payment invitations)"
                          className="w-full"
                        />
                        {index > 0 && (
                          <p className="text-xs text-muted-foreground">
                            We'll send an invitation to set up payment details
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSongwriter}
                    className="w-full"
                  >
                    + Add Songwriter
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Total: {songwriterSplits.reduce((sum, s) => sum + s.percentage, 0).toFixed(2)}% (must equal 100%)
                  </p>
                  {showValidation && validation.songwriterSplits === 'invalid' && (
                    <p className="text-xs text-gray-600">Songwriter splits must add up to 100%</p>
                  )}
                </div>

                {/* Publishing Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publisher" className="flex items-center gap-2">
                      Publisher
                      {showValidation && validation.publishingData !== 'empty' && <ValidationIcon status={validation.publishingData} />}
                    </Label>
                    <Input
                      id="publisher"
                      value={metadata.publisher}
                      onChange={(e) => handlePublishingDataChange('publisher', e.target.value)}
                      placeholder="Publishing company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pro">PRO (Performance Rights Org)</Label>
                    <Select value={metadata.pro} onValueChange={(value) => handlePublishingDataChange('pro', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select PRO" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ascap">ASCAP</SelectItem>
                        <SelectItem value="bmi">BMI</SelectItem>
                        <SelectItem value="sesac">SESAC</SelectItem>
                        <SelectItem value="socan">SOCAN</SelectItem>
                        <SelectItem value="prs">PRS</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* AI Disclosure */}
                <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-purple-500">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aiUsed"
                      checked={metadata.aiUsed}
                      onCheckedChange={(checked) => handleAIDisclosureChange(checked as boolean)}
                    />
                    <Label htmlFor="aiUsed" className="cursor-pointer font-semibold flex items-center gap-2">
                      AI was used in creating this track
                      <ValidationIcon status={validation.aiDisclosure} />
                    </Label>
                  </div>
                  {metadata.aiUsed && (
                    <div className="ml-6 space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">Select all that apply:</p>
                      {(['lyrics', 'production', 'mastering', 'vocals', 'artwork'] as const).map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ai-${type}`}
                            checked={metadata.aiTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setMetadata(prev => ({ ...prev, aiTypes: [...prev.aiTypes, type] }));
                              } else {
                                setMetadata(prev => ({ ...prev, aiTypes: prev.aiTypes.filter(t => t !== type) }));
                              }
                            }}
                          />
                          <Label htmlFor={`ai-${type}`} className="cursor-pointer capitalize">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Future-proof your release: Major platforms are beginning to require AI disclosure
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Artwork Upload */}
            <Card className="rounded-xl">
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
                        <Button variant="outline" asChild className="rounded-full">
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
            <Card className="rounded-xl">
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
                  className="w-full rounded-full"
                  disabled={isUploading || !canPublish()}
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
                {!canPublish() && audioFile && metadata.title && (
                  <p className="text-sm text-center text-muted-foreground mt-2">
                    Fix validation errors above to publish
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
