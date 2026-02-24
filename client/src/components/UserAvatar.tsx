import { User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

/**
 * UserAvatar - Reusable component for displaying user profile pictures
 * 
 * Features:
 * - Fetches avatar from artist profile
 * - Shows fallback User icon when no avatar uploaded
 * - Supports multiple sizes (sm, md, lg, xl)
 * - Optional name display next to avatar
 * - Consistent circular styling with BAP Protocol aesthetic
 */
export function UserAvatar({ size = "md", showName = false, className = "" }: UserAvatarProps) {
  const { isAuthenticated, user } = useAuth();
  
  // Fetch artist profile to get avatar
  const { data: artistProfile } = trpc.artistProfile.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const avatarUrl = artistProfile?.avatarUrl;
  const displayName = artistProfile?.stageName || user?.name || "Artist";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Avatar Circle */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0`}>
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className={`${iconSizes[size]} text-gray-400`} />
        )}
      </div>

      {/* Optional Name Display */}
      {showName && (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{displayName}</span>
          {user?.email && (
            <span className="text-sm text-gray-500">{user.email}</span>
          )}
        </div>
      )}
    </div>
  );
}
