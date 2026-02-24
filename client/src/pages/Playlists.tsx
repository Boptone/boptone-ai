import { useState } from "react";
import { Plus, Music2, Lock, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Playlists() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [newPlaylistIsPublic, setNewPlaylistIsPublic] = useState(true);

  const { data: playlists = [], isLoading, refetch } = trpc.playlist.getUserPlaylists.useQuery();
  const createPlaylistMutation = trpc.playlist.createPlaylist.useMutation({
    onSuccess: () => {
      toast.success("Playlist created successfully!");
      setCreateModalOpen(false);
      setNewPlaylistName("");
      setNewPlaylistDescription("");
      setNewPlaylistIsPublic(true);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create playlist: ${error.message}`);
    },
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    createPlaylistMutation.mutate({
      name: newPlaylistName,
      description: newPlaylistDescription || undefined,
      isPublic: newPlaylistIsPublic,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-white">
        <div className="container py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl md:text-7xl font-bold mb-4">Playlists</h1>
              <p className="text-xl text-gray-600">
                Organize your favorite tracks into custom collections
              </p>
            </div>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-[#81e6ff] hover:bg-[#60d5ed] text-white border border-black rounded-full px-8 py-6 text-lg font-bold shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
            >
              <Plus className="w-6 h-6 mr-2" />
              Create Playlist
            </Button>
          </div>
        </div>
      </div>

      {/* Playlists Grid */}
      <div className="container py-16">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 border border-black rounded-xl h-64 animate-pulse shadow-[4px_4px_0px_0px_black]"
              />
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-24">
            <Music2 className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold mb-4">No playlists yet</h2>
            <p className="text-xl text-gray-600 mb-8">
              Create your first playlist to start organizing your music
            </p>
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-[#81e6ff] hover:bg-[#60d5ed] text-white border border-black rounded-full px-8 py-4 text-lg font-bold shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Playlist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {playlists.map((playlist) => (
              <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
                <div className="group cursor-pointer bg-white border border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all">
                  {/* Cover Image */}
                  <div className="aspect-square bg-gradient-to-br from-cyan-400 to-[#60d5ed] relative">
                    {playlist.coverImageUrl ? (
                      <img
                        src={playlist.coverImageUrl}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-20 h-20 text-white opacity-50" />
                      </div>
                    )}
                    {/* Privacy Badge */}
                    <div className="absolute top-3 right-3">
                      {playlist.isPublic ? (
                        <div className="bg-white border border-black rounded-full p-2 shadow-[2px_2px_0px_0px_black]">
                          <Globe className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="bg-white border border-black rounded-full p-2 shadow-[2px_2px_0px_0px_black]">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate group-hover:text-[#81e6ff] transition-colors">
                      {playlist.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {playlist.trackCount} {playlist.trackCount === 1 ? "track" : "tracks"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_black]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold">Create Playlist</DialogTitle>
            <DialogDescription className="text-base">
              Give your playlist a name and description
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-bold">
                Name *
              </Label>
              <Input
                id="name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="e.g., Workout Mix, Chill Vibes"
                className="border border-black rounded-lg text-base"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-bold">
                Description
              </Label>
              <Textarea
                id="description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                placeholder="What's this playlist about?"
                className="border border-black rounded-lg text-base min-h-[100px]"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 border border-black rounded-lg">
              <div>
                <Label htmlFor="public" className="text-base font-bold">
                  Public Playlist
                </Label>
                <p className="text-sm text-gray-600">
                  Anyone can view and listen to this playlist
                </p>
              </div>
              <Switch
                id="public"
                checked={newPlaylistIsPublic}
                onCheckedChange={setNewPlaylistIsPublic}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              className="border border-black rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePlaylist}
              disabled={createPlaylistMutation.isPending}
              className="bg-[#81e6ff] hover:bg-[#60d5ed] text-white border border-black rounded-full px-6 shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
            >
              {createPlaylistMutation.isPending ? "Creating..." : "Create Playlist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
