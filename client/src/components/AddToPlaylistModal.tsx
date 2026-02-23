import { useState } from "react";
import { Plus, Check, Music2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AddToPlaylistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackId: number;
  trackTitle: string;
}

export function AddToPlaylistModal({
  open,
  onOpenChange,
  trackId,
  trackTitle,
}: AddToPlaylistModalProps) {
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const { data: playlists = [], refetch } = trpc.playlist.getUserPlaylists.useQuery(
    undefined,
    { enabled: open }
  );

  const createPlaylistMutation = trpc.playlist.createPlaylist.useMutation({
    onSuccess: async (data) => {
      // Add track to the newly created playlist
      await addTrackMutation.mutateAsync({
        playlistId: data.playlistId,
        trackId,
      });
      toast.success(`Added to new playlist "${newPlaylistName}"`);
      setNewPlaylistName("");
      setShowCreateNew(false);
      refetch();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to create playlist: ${error.message}`);
    },
  });

  const addTrackMutation = trpc.playlist.addTrackToPlaylist.useMutation({
    onSuccess: () => {
      toast.success(`Added "${trackTitle}" to playlist`);
      onOpenChange(false);
    },
    onError: (error) => {
      if (error.message.includes("already in playlist")) {
        toast.info("Track is already in this playlist");
      } else {
        toast.error(`Failed to add track: ${error.message}`);
      }
    },
  });

  const handleAddToPlaylist = (playlistId: number) => {
    addTrackMutation.mutate({ playlistId, trackId });
  };

  const handleCreateAndAdd = () => {
    if (!newPlaylistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    createPlaylistMutation.mutate({
      name: newPlaylistName,
      isPublic: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_black]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">Add to Playlist</DialogTitle>
          <DialogDescription className="text-base">
            Save "{trackTitle}" to a playlist
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Create New Playlist */}
          {!showCreateNew ? (
            <Button
              onClick={() => setShowCreateNew(true)}
              variant="outline"
              className="w-full border-2 border-black rounded-lg p-6 hover:bg-cyan-50 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-bold">Create New Playlist</span>
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-cyan-50 border-2 border-black rounded-lg">
              <Input
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="border-2 border-black rounded-lg"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateAndAdd();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateAndAdd}
                  disabled={createPlaylistMutation.isPending}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white border-2 border-black rounded-full shadow-[2px_2px_0px_0px_black]"
                >
                  {createPlaylistMutation.isPending ? "Creating..." : "Create & Add"}
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateNew(false);
                    setNewPlaylistName("");
                  }}
                  variant="outline"
                  className="border-2 border-black rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing Playlists */}
          {playlists.length > 0 && (
            <>
              <div className="border-t-2 border-gray-200 pt-4">
                <p className="text-sm font-bold text-gray-600 mb-3">YOUR PLAYLISTS</p>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    disabled={addTrackMutation.isPending}
                    className="w-full flex items-center gap-4 p-4 bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {/* Cover */}
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg border-2 border-black flex-shrink-0">
                      {playlist.coverImageUrl ? (
                        <img
                          src={playlist.coverImageUrl}
                          alt={playlist.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music2 className="w-6 h-6 text-white opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-left">
                      <p className="font-bold text-lg">{playlist.name}</p>
                      <p className="text-sm text-gray-600">
                        {playlist.trackCount} {playlist.trackCount === 1 ? "track" : "tracks"}
                      </p>
                    </div>

                    {/* Check if track is already in playlist */}
                    {playlist.trackIds && (playlist.trackIds as number[]).includes(trackId) && (
                      <Check className="w-5 h-5 text-cyan-500" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {playlists.length === 0 && !showCreateNew && (
            <div className="text-center py-8 text-gray-500">
              <Music2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No playlists yet</p>
              <p className="text-sm">Create your first playlist to get started</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
