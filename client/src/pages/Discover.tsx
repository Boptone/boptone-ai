import { useState } from "react";
import { Search, Plus, ChevronRight, Play, Heart, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Discover() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with real data from tRPC
  const featuredArtist = {
    name: "Luna Rivers",
    genre: "Indie Pop",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    bio: "Rising star blending dreamy vocals with electronic beats",
    monthlyListeners: "125K"
  };

  const albums = [
    { id: 1, title: "Midnight Dreams", artist: "Luna Rivers", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
    { id: 2, title: "Urban Echoes", artist: "The Nomads", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop" },
    { id: 3, title: "Neon Nights", artist: "Synth Wave", cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop" },
    { id: 4, title: "Acoustic Soul", artist: "Maya Chen", cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop" },
    { id: 5, title: "Bass Drop", artist: "DJ Pulse", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" },
    { id: 6, title: "Jazz Fusion", artist: "The Quartet", cover: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&h=300&fit=crop" },
  ];

  const tracks = [
    { id: 1, title: "Starlight", artist: "Luna Rivers", duration: "3:45", plays: "2.1M" },
    { id: 2, title: "City Lights", artist: "The Nomads", duration: "4:12", plays: "1.8M" },
    { id: 3, title: "Retrograde", artist: "Synth Wave", duration: "3:28", plays: "3.2M" },
    { id: 4, title: "Whispers", artist: "Maya Chen", duration: "4:05", plays: "1.5M" },
    { id: 5, title: "Thunder", artist: "DJ Pulse", duration: "3:52", plays: "2.7M" },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Collapsible Sidebar */}
      <div 
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-gray-50 border-r-2 border-black transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b-2 border-black flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="text-xl font-bold">Boptone</h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`} />
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="flex-1 p-4 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-2 border-black rounded-full hover:bg-cyan-500 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span>Create Playlist</span>}
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-2 border-black rounded-full hover:bg-cyan-500 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span>My Bops</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-cyan-50 to-white border-b-2 border-black p-12">
          <h1 className="text-6xl font-black mb-6">
            Find Your New Favorite Artist
          </h1>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for artists, albums, or tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-2 border-black rounded-full shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] transition-shadow"
            />
          </div>
        </div>

        {/* Featured Artist Module */}
        <div className="p-8 border-b-2 border-black">
          <h2 className="text-3xl font-bold mb-6">Featured Artist</h2>
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg border-2 border-black shadow-[4px_4px_0_0_#000] p-8 flex gap-8 items-center">
            <img
              src={featuredArtist.image}
              alt={featuredArtist.name}
              className="w-48 h-48 rounded-lg border-2 border-black object-cover"
            />
            <div className="flex-1 text-white">
              <p className="text-sm font-semibold uppercase tracking-wider mb-2">{featuredArtist.genre}</p>
              <h3 className="text-5xl font-black mb-4">{featuredArtist.name}</h3>
              <p className="text-lg mb-4 opacity-90">{featuredArtist.bio}</p>
              <p className="text-sm mb-6">{featuredArtist.monthlyListeners} monthly listeners</p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 border-2 border-black rounded-full shadow-[4px_4px_0_0_#000] font-bold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-black rounded-full font-bold"
                >
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Albums Grid */}
        <div className="p-8 border-b-2 border-black">
          <h2 className="text-3xl font-bold mb-6">New Music</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                className="group cursor-pointer"
              >
                <div className="relative mb-3">
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="w-full aspect-square object-cover rounded-lg border-2 border-black shadow-[4px_4px_0_0_#000] group-hover:shadow-[6px_6px_0_0_#000] transition-shadow"
                  />
                  <button className="absolute bottom-2 right-2 w-12 h-12 bg-cyan-500 rounded-full border-2 border-black shadow-[2px_2px_0_0_#000] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </button>
                </div>
                <h3 className="font-bold text-sm mb-1 truncate">{album.title}</h3>
                <p className="text-sm text-gray-600 truncate">{album.artist}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Tracks */}
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6">Trending Tracks</h2>
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-black hover:shadow-[4px_4px_0_0_#000] transition-all group cursor-pointer"
              >
                <span className="text-gray-400 font-bold w-8 text-center">{index + 1}</span>
                <button className="w-10 h-10 bg-cyan-500 rounded-full border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                  <Play className="w-4 h-4 text-white fill-white" />
                </button>
                <div className="flex-1">
                  <h4 className="font-bold">{track.title}</h4>
                  <p className="text-sm text-gray-600">{track.artist}</p>
                </div>
                <span className="text-sm text-gray-600">{track.plays}</span>
                <span className="text-sm text-gray-600">{track.duration}</span>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
