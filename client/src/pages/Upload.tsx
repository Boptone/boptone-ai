import { useState, useCallback } from "react";
import { useRequireArtist } from "@/hooks/useRequireArtist";
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
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RevenueCalculator } from "@/components/RevenueCalculator";
import ReleaseQualityScore, { type ReleaseQualityData } from "@/components/ReleaseQualityScore";

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
  useRequireArtist(); // Enforce artist authentication
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

  const [songwriterSplits, setSongwriterSplits] = useState<Array<{email: string; fullName: string; percentage: number; role: "songwriter" | "producer" | "mixer" | "mastering" | "other"; ipiNumber: string}>>([
    { email: user?.email || "", fullName: user?.name || "", percentage: 100, role: "songwriter", ipiNumber: "" }
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
  const [releaseQuality, setReleaseQuality] = useState<ReleaseQualityData | null>(null);

  const markActivationStep = trpc.activation.markStepComplete.useMutation();

  const uploadTrackMutation = trpc.bap.tracks.upload.useMutation({
    onSuccess: (data: any) => {
      // Build unified release quality data for the ReleaseQualityScore card
      if (data?.audioQuality || data?.coverArt) {
        setReleaseQuality({
          audioQuality: data?.audioQuality ?? undefined,
          loudness: data?.audioQuality?.loudness ?? undefined,
          coverArt: data?.coverArt ?? undefined,
        } as ReleaseQualityData);
      }
      const tier = data?.audioQuality?.qualityTier;
      const tierMsg = tier === 'boptone_premium'
        ? 'Hi-res lossless quality — perfect for Boptone, mobile, car audio, and all DSPs.'
        : tier === 'distribution_ready'
        ? 'Your track meets all DSP distribution requirements.'
        : tier === 'boptone_only'
        ? 'Uploaded to Boptone. Review the quality score to prepare for DSP distribution.'
        : 'Track uploaded successfully.';
      toast.success("Track published to BAP!", { description: tierMsg });
      // Fire activation step: first track uploaded
      markActivationStep.mutate({ stepKey: "upload_first_track" });
      // Delay navigation so artist can see quality report
      setTimeout(() => setLocation("/music"), 4000);
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

  const handleSongwriterSplitsChange = (newSplits: Array<{email: string; fullName: string; percentage: number; role: "songwriter" | "producer" | "mixer" | "mastering" | "other"; ipiNumber: string}>) => {
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
    const newSplits = [...songwriterSplits, { email: "", fullName: "", percentage: 0, role: "songwriter" as const, ipiNumber: "" }];
    handleSongwriterSplitsChange(newSplits);
  };

  const removeSongwriter = (index: number) => {
    const newSplits = songwriterSplits.filter((_, i) => i !== index);
    handleSongwriterSplitsChange(newSplits);
  };

  const updateSongwriter = (index: number, field: 'email' | 'fullName' | 'percentage' | 'role' | 'ipiNumber', value: string | number) => {
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
    if (status === 'valid') return <span className="text-sm font-semibold text-gray-900">✓</span>;
    if (status === 'invalid') return <span className="text-sm font-semibold text-gray-500">✗</span>;
    return null;
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl font-medium text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user && !DEV_MODE) {
    return (
      <DashboardLayout>
        <Card className="border border-black">
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">Upload to BAP</h1>
          <p className="text-xl text-gray-600">
            Share your music with the world. Your track will be live in minutes.
          </p>
        </div>

        {/* Compliance Score Banner */}
        {audioFile && (
          <Alert className="border border-black bg-white">
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
                    className="h-full transition-all duration-500 bg-gray-900"
                    style={{ width: `${complianceScore}%` }}
                  />
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Audio Upload */}
        <Card className="border border-black">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Audio File</CardTitle>
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
                className={`border border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging ? 'border-gray-900 bg-gray-50' : 'border-gray-300'
                }`}
              >
                <div className="text-6xl font-bold text-gray-300 mb-4">↑</div>
                <p className="text-lg font-medium mb-2">
                  Drag and drop your audio file here
                </p>
                <p className="text-sm text-gray-600 mb-4">
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
                  <Button variant="outline" asChild className="rounded-full border border-black hover:border-black">
                    <span>Choose File</span>
                  </Button>
                </Label>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-6 bg-gray-50 border border-black">
                {extractingMetadata ? (
                  <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-400">...</div>
                  </div>
                ) : (
                  <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900">✓</div>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{audioFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {extractingMetadata && (
                    <p className="text-sm text-gray-900 mt-1">
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
            <Card className="border border-black">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Track Information</CardTitle>
                <CardDescription>
                  AI extracted metadata. Review and edit as needed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
            <Card className="border border-black">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Compliance & Metadata</CardTitle>
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
                    className={showValidation && validation.isrc === 'invalid' ? 'border-black' : ''}
                  />
                  <p className="text-xs text-gray-600">
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
                    className={showValidation && validation.upc === 'invalid' ? 'border-black' : ''}
                  />
                  <p className="text-xs text-gray-600">
                    Universal Product Code - barcode identifier for commercial release
                  </p>
                  {showValidation && validation.upc === 'invalid' && (
                    <p className="text-xs text-gray-600">Invalid UPC format. Must be exactly 12 digits</p>
                  )}
                </div>

                {/* Pricing Controls */}
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Stream Pricing</Label>
                  <p className="text-sm text-gray-600 mb-4">
                    Set your per-stream price and see real-time revenue projections. You keep 90% of every stream.
                  </p>
                  <RevenueCalculator
                    pricePerStream={metadata.pricePerStream}
                    onChange={(price) => setMetadata(prev => ({ ...prev, pricePerStream: price }))}
                  />
                </div>

                {/* Songwriter Splits — Music Business 2.0 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-base font-bold">
                      Song Splits
                      {showValidation && <ValidationIcon status={validation.songwriterSplits} />}
                    </Label>
                    <span className="text-xs text-gray-500">Who gets paid when this track earns</span>
                  </div>

                  {/* Visual percentage bar */}
                  {(() => {
                    const total = songwriterSplits.reduce((sum, s) => sum + s.percentage, 0);
                    const remaining = 100 - total;
                    const isOver = total > 100;
                    const isExact = Math.abs(total - 100) < 0.01;
                    return (
                      <div className="space-y-1">
                        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                          {songwriterSplits.map((s, i) => {
                            const colors = ['bg-gray-900', 'bg-gray-600', 'bg-gray-400', 'bg-gray-300', 'bg-gray-200'];
                            return s.percentage > 0 ? (
                              <div
                                key={i}
                                className={`${colors[i % colors.length]} transition-all duration-300`}
                                style={{ width: `${Math.min(s.percentage, 100)}%` }}
                                title={`${s.fullName || 'Writer ' + (i + 1)}: ${s.percentage}%`}
                              />
                            ) : null;
                          })}
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className={isOver ? 'text-red-600 font-semibold' : isExact ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                            {total.toFixed(1)}% assigned{isExact ? ' ✓' : ''}
                          </span>
                          {!isExact && !isOver && (
                            <span className="text-gray-400">{remaining.toFixed(1)}% remaining</span>
                          )}
                          {isOver && (
                            <span className="text-red-600 font-semibold">Over by {(total - 100).toFixed(1)}%</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-3">
                    {songwriterSplits.map((split, index) => (
                      <div key={index} className="p-4 bg-gray-50 border border-black space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-900 flex-shrink-0" />
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {index === 0 ? 'Primary Artist' : `Co-Writer ${index}`}
                          </span>
                          {songwriterSplits.length > 1 && index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSongwriter(index)}
                              className="ml-auto text-gray-400 hover:text-red-600 h-6 px-2"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={split.fullName}
                            onChange={(e) => updateSongwriter(index, 'fullName', e.target.value)}
                            placeholder="Full legal name"
                          />
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step={0.1}
                              value={split.percentage}
                              onChange={(e) => updateSongwriter(index, 'percentage', parseFloat(e.target.value) || 0)}
                              placeholder="%"
                              className="w-20"
                            />
                            <span className="text-sm text-gray-500 flex-shrink-0">%</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            value={split.role}
                            onValueChange={(v) => updateSongwriter(index, 'role', v)}
                          >
                            <SelectTrigger className="border-black">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="songwriter">Songwriter</SelectItem>
                              <SelectItem value="producer">Producer</SelectItem>
                              <SelectItem value="mixer">Mixer</SelectItem>
                              <SelectItem value="mastering">Mastering Engineer</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            value={split.ipiNumber}
                            onChange={(e) => updateSongwriter(index, 'ipiNumber', e.target.value)}
                            placeholder="IPI number (optional)"
                          />
                        </div>
                        <Input
                          type="email"
                          value={split.email}
                          onChange={(e) => updateSongwriter(index, 'email', e.target.value)}
                          placeholder={index === 0 ? 'Your email (for payout notifications)' : 'Email — we\'ll send a payout invitation'}
                          className="w-full"
                        />
                        {index > 0 && (
                          <p className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded">
                            💌 We'll email this co-writer a secure link to register their payment details. They keep 100% of their split.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSongwriter}
                    className="w-full border-black hover:bg-gray-50"
                  >
                    + Add Co-Writer or Collaborator
                  </Button>

                  {showValidation && validation.songwriterSplits === 'invalid' && (
                    <p className="text-xs text-red-600 font-medium">Splits must add up to exactly 100%</p>
                  )}
                </div>

                {/* Publishing Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="space-y-3 p-4 bg-white border border-black hover:border-black transition-colors rounded-lg">
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
                      <p className="text-sm text-gray-600 mb-2">Select all that apply:</p>
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
                  <p className="text-xs text-gray-600">
                    Future-proof your release: Major platforms are beginning to require AI disclosure
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Artwork Upload */}
            <Card className="border border-black">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Artwork</CardTitle>
                <CardDescription>
                  Upload cover art (recommended: 3000x3000px, JPG or PNG)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!artworkFile ? (
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 bg-gray-100 border border-black flex items-center justify-center">
                      <div className="text-4xl text-gray-300">🖼</div>
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
                        <Button variant="outline" asChild className="rounded-full border border-black hover:border-black">
                          <span>Upload Artwork</span>
                        </Button>
                      </Label>
                      <p className="text-sm text-gray-600 mt-2">
                        Optional - we'll generate a placeholder if not provided
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <img
                      src={URL.createObjectURL(artworkFile)}
                      alt="Artwork preview"
                      className="w-32 h-32 object-cover border border-black"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{artworkFile.name}</p>
                      <p className="text-sm text-gray-600">
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

            {/* Unified Release Quality Score — shown after successful upload (DISTRO-UQ1) */}
            {releaseQuality && (
              <ReleaseQualityScore
                data={releaseQuality}
                trackTitle={metadata.title || undefined}
                defaultExpanded={false}
              />
            )}
            {/* Publish Button */}
            <Card className="border border-black">
              <CardContent className="pt-6">
                {isUploading && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Uploading to BAP...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2">
                      <div
                        className="bg-gray-900 h-2 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                <Button
                  onClick={handlePublish}
                  className="w-full rounded-full bg-black hover:bg-gray-800 text-white h-14 text-lg"
                  disabled={isUploading || !canPublish()}
                  size="lg"
                >
                  {isUploading ? "Publishing..." : "Publish to BAP"}
                </Button>
                {!canPublish() && audioFile && metadata.title && (
                  <p className="text-sm text-center text-gray-600 mt-2">
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
