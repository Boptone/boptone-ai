import { useState, useRef } from "react";
import { Upload, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onUploadComplete?: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.artistProfile.uploadAvatar.useMutation({
    onSuccess: (data) => {
      toast.success("Avatar uploaded successfully!");
      setPreview(data.url);
      onUploadComplete?.(data.url);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Convert to base64 and upload
    const base64 = await fileToBase64(file);
    uploadMutation.mutate({ fileData: base64 });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Avatar Preview */}
      <div
        className={`relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 transition-all ${
          isDragging ? "border-[#81e6fe] scale-105" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <User className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Upload Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-[#81e6fe]/20 flex items-center justify-center">
            <Upload className="w-8 h-8 text-[#81e6fe]" />
          </div>
        )}

        {/* Loading Overlay */}
        {uploadMutation.isPending && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Upload Button */}
      <Button
        variant="bap"
        onClick={handleClick}
        disabled={uploadMutation.isPending}
        className="rounded-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {preview ? "Change Avatar" : "Upload Avatar"}
      </Button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Help Text */}
      <p className="text-sm text-gray-500 text-center max-w-xs">
        Drag and drop an image, or click to browse. Image will be automatically resized to 512x512 and optimized.
      </p>
    </div>
  );
}
