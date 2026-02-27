/**
 * BopsVideoUpload — Enterprise-grade video upload component for Bops
 *
 * Features:
 * - Client-side validation: duration (15-30s), aspect ratio (9:16), file size (200MB), format
 * - Real-time video metadata extraction using HTMLVideoElement
 * - Upload progress tracking via XMLHttpRequest
 * - Thumbnail preview from video frame
 * - Caption input (150 char limit)
 * - Accessible, mobile-first design
 * - Error recovery and retry
 */
import { useRef, useState, useCallback } from "react";
import { Upload, X, CheckCircle, AlertCircle, Film, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// ---------------------------------------------------------------------------
// Constants — must match server-side validation
// ---------------------------------------------------------------------------
const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB
const MIN_DURATION_S = 15;
const MAX_DURATION_S = 30;
const CAPTION_MAX_LENGTH = 150;
const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v"];
const ALLOWED_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface VideoMetadata {
  durationMs: number;
  width: number;
  height: number;
  aspectRatio: number;
  thumbnailUrl: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

type UploadStage =
  | "idle"
  | "validating"
  | "uploading"
  | "registering"
  | "success"
  | "error";

interface BopsVideoUploadProps {
  onSuccess?: (bopId: number) => void;
  onCancel?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const s = Math.round(seconds);
  return `${s}s`;
}

async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      const durationMs = Math.round(video.duration * 1000);
      const width = video.videoWidth;
      const height = video.videoHeight;
      const aspectRatio = width / height;

      // Seek to 10% for thumbnail
      video.currentTime = video.duration * 0.1;
    };

    video.onseeked = () => {
      // Capture thumbnail frame
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(video.videoWidth, 540);
      canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);

      URL.revokeObjectURL(url);
      resolve({
        durationMs: Math.round(video.duration * 1000),
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio: video.videoWidth / video.videoHeight,
        thumbnailUrl,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video file. Please try a different file."));
    };

    video.src = url;
  });
}

function validateVideo(file: File, meta: VideoMetadata): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // File size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.push(`File is too large (${formatFileSize(file.size)}). Maximum is 200 MB.`);
  }

  // File type
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(`Unsupported format. Use MP4, MOV, or WebM.`);
  }

  // Duration
  const durationS = meta.durationMs / 1000;
  if (durationS < MIN_DURATION_S) {
    errors.push(`Video is too short (${formatDuration(durationS)}). Minimum is 15 seconds.`);
  } else if (durationS > MAX_DURATION_S) {
    errors.push(`Video is too long (${formatDuration(durationS)}). Maximum is 30 seconds.`);
  }

  // Aspect ratio — must be vertical (9:16 ± 10%)
  const targetRatio = 9 / 16; // 0.5625
  const tolerance = 0.1;
  if (meta.aspectRatio > targetRatio + tolerance) {
    errors.push(`Video must be vertical (9:16). This video appears to be horizontal.`);
  } else if (meta.aspectRatio > targetRatio + tolerance * 0.5) {
    warnings.push(`Video is slightly wider than 9:16. It will be cropped on mobile.`);
  }

  // Resolution — recommend 1080p
  if (meta.width < 720) {
    warnings.push(`Resolution is low (${meta.width}×${meta.height}). 1080×1920 recommended for best quality.`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ---------------------------------------------------------------------------
// Upload via XHR for progress tracking
// ---------------------------------------------------------------------------
async function uploadVideo(
  file: File,
  meta: VideoMetadata,
  caption: string,
  onProgress: (pct: number) => void
): Promise<{
  videoKey: string;
  videoUrl: string;
  durationMs: number;
  width: number;
  height: number;
  fileSizeBytes: number;
  mimeType: string;
}> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("durationMs", String(meta.durationMs));
    formData.append("width", String(meta.width));
    formData.append("height", String(meta.height));
    formData.append("caption", caption.slice(0, CAPTION_MAX_LENGTH));

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error ?? "Upload failed"));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.open("POST", "/api/bops/upload");
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function BopsVideoUpload({ onSuccess, onCancel }: BopsVideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<UploadStage>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [caption, setCaption] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const createBop = trpc.bops.create.useMutation();

  // ---------------------------------------------------------------------------
  // File selection handler
  // ---------------------------------------------------------------------------
  const handleFile = useCallback(async (file: File) => {
    setStage("validating");
    setErrorMessage(null);
    setSelectedFile(file);
    setMetadata(null);
    setValidation(null);
    setUploadProgress(0);

    try {
      const meta = await extractVideoMetadata(file);
      const result = validateVideo(file, meta);
      setMetadata(meta);
      setValidation(result);
      setStage("idle");

      if (!result.valid) {
        setErrorMessage(result.errors[0]);
      }
    } catch (err) {
      setStage("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to read video");
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  // ---------------------------------------------------------------------------
  // Upload + register flow
  // ---------------------------------------------------------------------------
  const handleSubmit = useCallback(async () => {
    if (!selectedFile || !metadata || !validation?.valid) return;

    try {
      // Step 1: Upload to S3
      setStage("uploading");
      setUploadProgress(0);

      const uploadResult = await uploadVideo(
        selectedFile,
        metadata,
        caption,
        setUploadProgress
      );

      // Step 2: Register in database
      setStage("registering");

      const result = await createBop.mutateAsync({
        videoKey: uploadResult.videoKey,
        videoUrl: uploadResult.videoUrl,
        caption: caption || undefined,
        durationMs: uploadResult.durationMs,
        width: uploadResult.width ?? 1080,
        height: uploadResult.height ?? 1920,
        fileSizeBytes: uploadResult.fileSizeBytes,
        mimeType: uploadResult.mimeType,
      });

      setStage("success");
      toast.success("Bop uploaded! It will be live once reviewed.");
      onSuccess?.(result.id);
    } catch (err) {
      setStage("error");
      const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  }, [selectedFile, metadata, validation, caption, createBop, onSuccess]);

  const handleReset = useCallback(() => {
    setStage("idle");
    setSelectedFile(null);
    setMetadata(null);
    setValidation(null);
    setCaption("");
    setUploadProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const isUploading = stage === "uploading" || stage === "registering";
  const canSubmit = selectedFile && metadata && validation?.valid && !isUploading && stage !== "success";
  const durationS = metadata ? metadata.durationMs / 1000 : 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold tracking-tight">Post a Bop</h2>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Success state */}
      {stage === "success" && (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Bop Posted!</h3>
          <p className="text-muted-foreground mb-6">
            Your Bop is being reviewed and will be live shortly.
          </p>
          <Button onClick={handleReset} variant="outline">
            Post Another Bop
          </Button>
        </div>
      )}

      {/* Upload flow */}
      {stage !== "success" && (
        <>
          {/* Drop zone / file selector */}
          {!selectedFile && (
            <div
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer
                transition-all duration-200 select-none
                ${isDragging
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-border hover:border-yellow-400 hover:bg-muted/40"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.join(",")}
                className="hidden"
                onChange={handleFileInputChange}
              />
              <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-1">
                {isDragging ? "Drop your Bop here" : "Select your video"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                MP4, MOV, or WebM · 15–30 seconds · Vertical (9:16) · Up to 200 MB
              </p>
              <Button variant="outline" size="sm" className="pointer-events-none">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}

          {/* Validating state */}
          {stage === "validating" && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Checking your video...</p>
            </div>
          )}

          {/* Video preview + metadata */}
          {selectedFile && metadata && stage !== "validating" && (
            <div className="space-y-4">
              {/* Preview card */}
              <div className="flex gap-4 p-4 bg-muted/40 rounded-xl border border-border">
                {/* Thumbnail */}
                <div className="relative w-16 h-28 rounded-lg overflow-hidden bg-black flex-shrink-0">
                  {metadata.thumbnailUrl && (
                    <img
                      src={metadata.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm mb-1">{selectedFile.name}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>{formatFileSize(selectedFile.size)}</p>
                    <p>{metadata.width}×{metadata.height} · {formatDuration(durationS)}</p>
                  </div>

                  {/* Validation indicators */}
                  <div className="mt-2 space-y-1">
                    {[
                      {
                        label: `Duration: ${formatDuration(durationS)}`,
                        ok: durationS >= MIN_DURATION_S && durationS <= MAX_DURATION_S,
                        hint: "15–30 seconds",
                      },
                      {
                        label: `Vertical: ${metadata.width}×${metadata.height}`,
                        ok: metadata.aspectRatio <= 9 / 16 + 0.1,
                        hint: "9:16 required",
                      },
                      {
                        label: `Size: ${formatFileSize(selectedFile.size)}`,
                        ok: selectedFile.size <= MAX_FILE_SIZE_BYTES,
                        hint: "Max 200 MB",
                      },
                    ].map((check) => (
                      <div key={check.label} className="flex items-center gap-1.5 text-xs">
                        {check.ok ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                        )}
                        <span className={check.ok ? "text-foreground" : "text-red-600 font-medium"}>
                          {check.label}
                        </span>
                        {!check.ok && (
                          <span className="text-muted-foreground">({check.hint})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remove button */}
                {!isUploading && (
                  <button
                    onClick={handleReset}
                    className="self-start text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Remove video"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Validation errors */}
              {validation && !validation.valid && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    {validation.errors.map((e, i) => (
                      <p key={i}>{e}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation warnings */}
              {validation?.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>{w}</p>
                </div>
              ))}

              {/* Caption input */}
              {validation?.valid && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Caption
                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                  </label>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX_LENGTH))}
                    placeholder="What's this Bop about?"
                    className="resize-none text-sm"
                    rows={3}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {caption.length}/{CAPTION_MAX_LENGTH}
                  </p>
                </div>
              )}

              {/* Upload progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {stage === "uploading"
                        ? `Uploading... ${uploadProgress}%`
                        : "Saving your Bop..."}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                      style={{ width: `${stage === "registering" ? 100 : uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error message */}
              {stage === "error" && errorMessage && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Upload failed</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                {!isUploading && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleReset}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                      {stage === "uploading" ? "Uploading..." : "Saving..."}
                    </>
                  ) : stage === "error" ? (
                    "Try Again"
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Post Bop
                    </>
                  )}
                </Button>
              </div>

              {/* Requirements reminder */}
              {!isUploading && validation?.valid && (
                <p className="text-xs text-center text-muted-foreground">
                  Your Bop will be reviewed before going live · 15–30 seconds · Vertical only
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
