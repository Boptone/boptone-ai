import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Play, Pause, MoreVertical, Trash2, Edit, Globe, Lock, GripVertical } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Track {
  id: number;
  title: string;
  artistName: string;
  duration: number;
  genre: string;
  coverArtUrl?: string;
}

function SortableTrackRow({ track, index, onRemove, onPlay }: {
  track: Track;
  index: number;
  onRemove: (trackId: number) => void;
  onPlay: (trackId: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-4 p-4 bg-white border-2 border-black rounded-lg hover:bg-gray-50 transition-colors"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Track Number */}
      <div className="w-8 text-center text-gray-600 font-medium">
        {index + 1}
      </div>

      {/* Cover Art */}
      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg border-2 border-black flex-shrink-0">
        {track.coverArtUrl ? (
          <img
            src={track.coverArtUrl}
            alt={track.title}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : null}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-lg truncate">{track.title}</h4>
        <p className="text-sm text-gray-600 truncate">{track.artistName}</p>
      </div>

      {/* Genre */}
      <div className="hidden md:block">
        <span className="px-3 py-1 bg-gray-100 border-2 border-black rounded-full text-sm font-medium">
          {track.genre}
        </span>
      </div>

      {/* Duration */}
      <div className="text-gray-600 font-medium w-16 text-right">
        {formatDuration(track.duration)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onPlay(track.id)}
          variant="outline"
          size="sm"
          className="border-2 border-black rounded-full hover:bg-cyan-500 hover:text-white transition-colors"
        >
          <Play className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-black rounded-full"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-2 border-black">
            <DropdownMenuItem
              onClick={() => onRemove(track.id)}
              className="text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove from playlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function PlaylistDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const playlistId = params.id ? parseInt(params.id) : 0;

  const { data: playlistData, isLoading, refetch } = trpc.playlist.getPlaylist.useQuery(
    { playlistId },
    { enabled: playlistId > 0 }
  );

  const [localTracks, setLocalTracks] = useState<Track[]>([]);

  // Update local tracks when data loads
  if (playlistData?.tracks && localTracks.length === 0) {
    setLocalTracks(playlistData.tracks as Track[]);
  }

  const removeTrackMutation = trpc.playlist.removeTrackFromPlaylist.useMutation({
    onSuccess: () => {
      toast.success("Track removed from playlist");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to remove track: ${error.message}`);
    },
  });

  const reorderTracksMutation = trpc.playlist.reorderPlaylistTracks.useMutation({
    onSuccess: () => {
      toast.success("Playlist order updated");
    },
    onError: (error) => {
      toast.error(`Failed to reorder tracks: ${error.message}`);
      // Revert to original order on error
      if (playlistData?.tracks) {
        setLocalTracks(playlistData.tracks as Track[]);
      }
    },
  });

  const deletePlaylistMutation = trpc.playlist.deletePlaylist.useMutation({
    onSuccess: () => {
      toast.success("Playlist deleted");
      navigate("/playlists");
    },
    onError: (error) => {
      toast.error(`Failed to delete playlist: ${error.message}`);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localTracks.findIndex((t) => t.id === active.id);
      const newIndex = localTracks.findIndex((t) => t.id === over.id);

      const newTracks = arrayMove(localTracks, oldIndex, newIndex);
      setLocalTracks(newTracks);

      // Update backend
      reorderTracksMutation.mutate({
        playlistId,
        trackIds: newTracks.map((t) => t.id),
      });
    }
  };

  const handleRemoveTrack = (trackId: number) => {
    removeTrackMutation.mutate({ playlistId, trackId });
    setLocalTracks(localTracks.filter((t) => t.id !== trackId));
  };

  const handlePlayTrack = (trackId: number) => {
    toast.info("Playback coming soon!");
  };

  const handleDeletePlaylist = () => {
    if (confirm("Are you sure you want to delete this playlist? This action cannot be undone.")) {
      deletePlaylistMutation.mutate({ playlistId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (!playlistData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Playlist not found</h2>
          <Button
            onClick={() => navigate("/playlists")}
            className="bg-cyan-500 hover:bg-cyan-600 text-white border-2 border-black rounded-full px-6"
          >
            Back to Playlists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-gradient-to-br from-cyan-50 to-white">
        <div className="container py-12">
          <div className="flex items-start gap-8">
            {/* Cover Image */}
            <div className="w-64 h-64 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_black] flex-shrink-0">
              {playlistData.coverImageUrl ? (
                <img
                  src={playlistData.coverImageUrl}
                  alt={playlistData.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-32 h-32 text-white opacity-50" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-2 bg-white border-2 border-black rounded-full text-sm font-bold">
                  PLAYLIST
                </span>
                {playlistData.isPublic ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full text-sm font-bold">
                    <Globe className="w-4 h-4" />
                    Public
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black rounded-full text-sm font-bold">
                    <Lock className="w-4 h-4" />
                    Private
                  </div>
                )}
              </div>

              <h1 className="text-6xl md:text-7xl font-bold mb-4">{playlistData.name}</h1>

              {playlistData.description && (
                <p className="text-xl text-gray-600 mb-6">{playlistData.description}</p>
              )}

              <p className="text-lg text-gray-600 mb-8">
                {playlistData.trackCount} {playlistData.trackCount === 1 ? "track" : "tracks"}
              </p>

              <div className="flex items-center gap-4">
                <Button
                  onClick={() => handlePlayTrack(localTracks[0]?.id)}
                  disabled={localTracks.length === 0}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white border-2 border-black rounded-full px-8 py-6 text-lg font-bold shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
                >
                  <Play className="w-6 h-6 mr-2" />
                  Play All
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-2 border-black rounded-full px-6 py-6"
                    >
                      <MoreVertical className="w-6 h-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-2 border-black">
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit playlist
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeletePlaylist}
                      className="text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete playlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="container py-12">
        {localTracks.length === 0 ? (
          <div className="text-center py-24">
            <Play className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold mb-4">No tracks yet</h2>
            <p className="text-xl text-gray-600 mb-8">
              Add tracks from the Discover page to start building your playlist
            </p>
            <Button
              onClick={() => navigate("/discover")}
              className="bg-cyan-500 hover:bg-cyan-600 text-white border-2 border-black rounded-full px-8 py-4 text-lg font-bold shadow-[4px_4px_0px_0px_black] hover:shadow-[2px_2px_0px_0px_black] transition-all"
            >
              Browse Music
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localTracks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {localTracks.map((track, index) => (
                  <SortableTrackRow
                    key={track.id}
                    track={track}
                    index={index}
                    onRemove={handleRemoveTrack}
                    onPlay={handlePlayTrack}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
