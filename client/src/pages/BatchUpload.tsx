import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Upload,
  X,
  FileAudio,
  Check,
  AlertCircle,
  RefreshCw,
  Music2,
  Image as ImageIcon,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface QueueItem {
  id: string;
  file: File;
  title: string;
  status: "queued" | "uploading" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

const GENRES = [
  "Hip-Hop", "R&B", "Pop", "Rock", "Electronic", "Jazz", "Classical",
  "Country", "Reggae", "Latin", "Afrobeats", "Gospel", "Soul", "Funk",
  "Blues", "Metal", "Punk", "Folk", "Indie", "Alternative", "Other",
];

const MOODS = [
  "Energetic", "Chill", "Romantic", "Melancholic", "Uplifting",
  "Dark", "Peaceful", "Intense", "Playful", "Nostalgic",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusIcon({ status }: { status: QueueItem["status"] }) {
  switch (status) {
    case "done":
      return <Check className="h-4 w-4 text-green-600" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "uploading":
    case "processing":
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
    default:
      return <FileAudio className="h-4 w-4 text-muted-foreground" />;
  }
}

function StatusBadge({ status }: { status: QueueItem["status"] }) {
  const variants: Record<QueueItem["status"], { label: string; className: string }> = {
    queued: { label: "Queued", className: "bg-muted text-muted-foreground border-muted" },
    uploading: { label: "Uploading", className: "bg-blue-50 text-blue-700 border-blue-200" },
    processing: { label: "Processing", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    done: { label: "Done", className: "bg-green-50 text-green-700 border-green-200" },
    error: { label: "Error", className: "bg-red-50 text-red-700 border-red-200" },
  };
  const v = variants[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold border rounded-sm ${v.className}`}>
      {v.label}
    </span>
  );
}

export default function BatchUpload() {
  const uploadTrack = trpc.bap.tracks.upload.useMutation();

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<"drop" | "configure" | "uploading" | "complete">("drop");
  const [isUploading, setIsUploading] = useState(false);

  // Bulk metadata
  const [bulkArtist, setBulkArtist] = useState("");
  const [bulkGenre, setBulkGenre] = useState("");
  const [bulkMood, setBulkMood] = useState("");
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const audio = Array.from(files).filter(
      f => f.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(f.name)
    );
    if (audio.length === 0) {
      toast.error("No valid audio files found. Accepted: MP3, WAV, FLAC, M4A, AAC, OGG");
      return;
    }
    const items: QueueItem[] = audio.map(f => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file: f,
      title: f.name.replace(/\.[^/.]+$/, ""),
      status: "queued",
      progress: 0,
    }));
    setQueue(prev => [...prev, ...items]);
    setStep("configure");
    toast.success(`${audio.length} track${audio.length > 1 ? "s" : ""} added to queue`);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArtworkFile(file);
    const url = URL.createObjectURL(file);
    setArtworkPreview(url);
  };

  const updateTitle = (id: string, title: string) => {
    setQueue(prev => prev.map(i => i.id === id ? { ...i, title } : i));
  };

  const removeItem = (id: string) => {
    setQueue(prev => prev.filter(i => i.id !== id));
    if (queue.length <= 1) setStep("drop");
  };

  const retryItem = (id: string) => {
    setQueue(prev => prev.map(i =>
      i.id === id ? { ...i, status: "queued", progress: 0, error: undefined } : i
    ));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const startUpload = async () => {
    setStep("uploading");
    setIsUploading(true);

    let artworkBase64: string | undefined;
    if (artworkFile) {
      try {
        artworkBase64 = await fileToBase64(artworkFile);
      } catch {
        console.warn("[BatchUpload] Failed to read artwork");
      }
    }

    const pending = queue.filter(i => i.status === "queued" || i.status === "error");
    let successCount = 0;

    for (const item of pending) {
      setQueue(prev => prev.map(i =>
        i.id === item.id ? { ...i, status: "uploading", progress: 15 } : i
      ));

      try {
        const audioBase64 = await fileToBase64(item.file);

        setQueue(prev => prev.map(i =>
          i.id === item.id ? { ...i, progress: 45 } : i
        ));

        setQueue(prev => prev.map(i =>
          i.id === item.id ? { ...i, status: "processing", progress: 70 } : i
        ));

        await uploadTrack.mutateAsync({
          title: item.title || item.file.name.replace(/\.[^/.]+$/, ""),
          artist: bulkArtist || undefined,
          genre: bulkGenre || undefined,
          audioFile: audioBase64,
          artworkFile: artworkBase64,
          isExplicit: false,
          pricePerStream: 1,
        });

        setQueue(prev => prev.map(i =>
          i.id === item.id ? { ...i, status: "done", progress: 100 } : i
        ));
        successCount++;
      } catch (err: any) {
        const msg = err?.message || "Upload failed";
        setQueue(prev => prev.map(i =>
          i.id === item.id ? { ...i, status: "error", progress: 0, error: msg } : i
        ));
        toast.error(`"${item.title}" failed: ${msg}`);
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast.success(`${successCount} track${successCount > 1 ? "s" : ""} uploaded successfully`);
    }

    const allDone = queue.every(i => i.status === "done" || (i.status !== "error" && i.status !== "queued"));
    if (allDone || successCount === pending.length) {
      setStep("complete");
    }
  };

  const reset = () => {
    setQueue([]);
    setStep("drop");
    setBulkArtist("");
    setBulkGenre("");
    setBulkMood("");
    setArtworkFile(null);
    setArtworkPreview(null);
  };

  const doneCount = queue.filter(i => i.status === "done").length;
  const errorCount = queue.filter(i => i.status === "error").length;
  const pendingCount = queue.filter(i => i.status === "queued").length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pt-2 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight uppercase">Batch Upload</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Upload multiple tracks at once. Apply shared metadata across all files, then review each title before submitting.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          {(["drop", "configure", "uploading", "complete"] as const).map((s, i) => {
            const labels = ["Select Files", "Configure", "Upload", "Done"];
            const stepIndex = ["drop", "configure", "uploading", "complete"].indexOf(step);
            const isPast = i < stepIndex;
            const isCurrent = s === step;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-xs font-bold transition-colors ${
                  isCurrent ? "bg-black text-white border-black" :
                  isPast ? "bg-black text-white border-black" :
                  "border-muted-foreground text-muted-foreground"
                }`}>
                  {isPast ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className={isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}>
                  {labels[i]}
                </span>
                {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            );
          })}
        </div>

        {/* Drop zone */}
        {step === "drop" && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-sm cursor-pointer transition-all p-16 flex flex-col items-center justify-center gap-4 text-center ${
              isDragging
                ? "border-black bg-black/5"
                : "border-border hover:border-black/40 hover:bg-muted/30"
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-lg">Drop audio files here</p>
              <p className="text-muted-foreground text-sm mt-1">
                or click to browse — MP3, WAV, FLAC, M4A, AAC, OGG accepted
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg"
              multiple
              className="hidden"
              onChange={e => addFiles(e.target.files)}
            />
          </div>
        )}

        {/* Configure step */}
        {(step === "configure" || step === "uploading") && (
          <div className="space-y-6">
            {/* Bulk metadata */}
            <div className="border border-border p-5 space-y-4">
              <h2 className="font-bold text-sm uppercase tracking-wider">Shared Metadata</h2>
              <p className="text-xs text-muted-foreground">
                These values apply to all tracks in this batch. You can edit individual track titles below.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide">Artist Name</Label>
                  <Input
                    value={bulkArtist}
                    onChange={e => setBulkArtist(e.target.value)}
                    placeholder="Your artist name"
                    className="rounded-none"
                    disabled={step === "uploading"}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide">Genre</Label>
                  <Select value={bulkGenre} onValueChange={setBulkGenre} disabled={step === "uploading"}>
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRES.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide">Mood</Label>
                  <Select value={bulkMood} onValueChange={setBulkMood} disabled={step === "uploading"}>
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOODS.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide">Shared Artwork</Label>
                  <div
                    className="border border-dashed border-border rounded-sm h-10 flex items-center justify-center gap-2 cursor-pointer hover:bg-muted/30 transition-colors text-sm text-muted-foreground"
                    onClick={() => artworkInputRef.current?.click()}
                  >
                    {artworkPreview ? (
                      <>
                        <img src={artworkPreview} alt="artwork" className="h-7 w-7 object-cover" />
                        <span className="text-xs truncate max-w-[120px]">{artworkFile?.name}</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-4 w-4" />
                        <span>Upload artwork</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={artworkInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleArtworkChange}
                  />
                </div>
              </div>
            </div>

            {/* Track queue */}
            <div className="border border-border">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
                <h2 className="font-bold text-sm uppercase tracking-wider">
                  Track Queue ({queue.length})
                </h2>
                {step === "configure" && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    Add more files
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg"
                multiple
                className="hidden"
                onChange={e => addFiles(e.target.files)}
              />
              <div className="divide-y divide-border">
                {queue.map(item => (
                  <div key={item.id} className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <StatusIcon status={item.status} />
                      <div className="flex-1 min-w-0">
                        {step === "configure" ? (
                          <Input
                            value={item.title}
                            onChange={e => updateTitle(item.id, e.target.value)}
                            className="h-7 text-sm rounded-none border-0 border-b border-border px-0 focus-visible:ring-0 bg-transparent"
                          />
                        ) : (
                          <p className="text-sm font-medium truncate">{item.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.file.name} &bull; {formatBytes(item.file.size)}
                        </p>
                        {item.status === "error" && item.error && (
                          <p className="text-xs text-destructive mt-1">{item.error}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={item.status} />
                        {item.status === "error" && (
                          <button
                            onClick={() => retryItem(item.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Retry"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {step === "configure" && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {(item.status === "uploading" || item.status === "processing") && (
                      <div className="mt-2 pl-7">
                        <Progress value={item.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.status === "uploading" ? "Uploading..." : "Processing..."}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {step === "configure" && queue.length > 0 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={reset}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  Clear all
                </button>
                <Button
                  onClick={startUpload}
                  className="rounded-none bg-black text-white hover:bg-gray-900 font-bold uppercase tracking-wide px-8"
                >
                  Upload {queue.length} Track{queue.length > 1 ? "s" : ""}
                </Button>
              </div>
            )}

            {/* Upload progress summary */}
            {step === "uploading" && (
              <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                <span>
                  {doneCount} of {queue.length} complete
                  {errorCount > 0 && ` · ${errorCount} failed`}
                </span>
                {!isUploading && errorCount > 0 && (
                  <Button
                    onClick={startUpload}
                    variant="outline"
                    size="sm"
                    className="rounded-none font-semibold"
                  >
                    Retry Failed
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Complete state */}
        {step === "complete" && (
          <div className="border border-border p-12 flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <Check className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Upload Complete</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {doneCount} track{doneCount > 1 ? "s" : ""} uploaded successfully.
                {errorCount > 0 && ` ${errorCount} failed.`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={reset}
                variant="outline"
                className="rounded-none font-bold uppercase tracking-wide"
              >
                Upload More
              </Button>
              <Button
                onClick={() => window.location.href = "/releases"}
                className="rounded-none bg-black text-white hover:bg-gray-900 font-bold uppercase tracking-wide"
              >
                View Releases
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
