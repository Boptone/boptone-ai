import { useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, Play, Music2, Globe, Bell, Upload, Folder, ShoppingBag, Shield, FileText, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO } from "@/const";

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

  const theHits = [
    { id: 1, title: "Pop Hits", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop", subtitle: "BOPTONE" },
    { id: 2, title: "Rap Hits", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop", subtitle: "BOPTONE" },
    { id: 3, title: "Today's Top Hits", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop", subtitle: "BOPTONE" },
    { id: 4, title: "Indie Hits", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop", subtitle: "BOPTONE" },
    { id: 5, title: "Rock Hits", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop", subtitle: "BOPTONE" },
  ];

  const popularAlbums = [
    { id: 1, title: "The Art of Loving", artist: "Olivia Dean", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
    { id: 2, title: "The Life of a Showgirl", artist: "Taylor Swift", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop" },
    { id: 3, title: "Finally Over It", artist: "Summer Walker", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop" },
    { id: 4, title: "LUX", artist: "ROSALÍA", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop" },
    { id: 5, title: "Love Is A Kingdom", artist: "Tems", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" },
  ];

  return (
    <div className="flex h-screen bg-[#1a1a1a] text-white">
      {/* Dark Sidebar */}
      <div 
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-black border-r border-gray-800 transition-all duration-300 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-800">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/boptone_main_logo_white.png" 
                alt="Boptone" 
                className="h-8 w-auto"
              />
            </div>
          )}
        </div>
        
        {/* Sidebar Toggle */}
        <div className="p-4 flex items-center justify-end">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 px-2 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors">
            <Music2 className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Music</span>}
          </button>
          
          <button 
            onClick={() => window.location.href = '/shop'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Shop</span>}
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Globe className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Explore</span>}
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Feed</span>}
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Folder className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Collection</span>}
          </button>

          {!sidebarCollapsed && (
            <>
              <div className="pt-6 pb-2 px-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-400">Playlists</span>
                  <button className="p-1 hover:bg-gray-800 rounded">
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </>
          )}
        </nav>
        
        {/* Sidebar Footer - Legal Links */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <span>|</span>
              <a href="/terms" className="hover:text-cyan-400 transition-colors">Terms</a>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-gray-900 to-[#1a1a1a] p-12">
          <h1 className="text-8xl md:text-9xl font-black mb-8">
            Find Your Tone.
          </h1>
          
          {/* Conversational AI Interface */}
          <div className="max-w-4xl mb-8">
            <div className="relative">
              <Sparkles className="absolute left-6 top-6 w-6 h-6 text-cyan-400" />
              <Textarea
                placeholder="Search for artists, albums, tracks, or get recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-16 pr-6 py-6 text-lg bg-gray-800 border-2 border-gray-700 text-white placeholder:text-gray-500 rounded-3xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none min-h-[120px] leading-relaxed"
                rows={3}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Powered by Boptone AI
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex gap-4 max-w-4xl">
            <button
              onClick={() => window.location.href = '/shop'}
              className="group flex items-center gap-3 px-6 py-4 bg-gray-800 hover:bg-cyan-600 rounded-full transition-all duration-300 hover:scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <ShoppingBag className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
              <span className="font-semibold text-sm">BopShop</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/newsletter'}
              className="group flex items-center gap-3 px-6 py-4 bg-gray-800 hover:bg-cyan-600 rounded-full transition-all duration-300 hover:scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Mail className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
              <span className="font-semibold text-sm">Newsletter</span>
            </button>
          </div>
        </div>

        {/* Featured Artist Module */}
        <div className="px-8 py-6">
          <h2 className="text-5xl font-bold mb-6">Featured Artist</h2>
          <div className="bg-gray-900 rounded-lg p-8 flex gap-8 items-center border-l-4 border-cyan-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <img
              src={featuredArtist.image}
              alt={featuredArtist.name}
              className="w-48 h-48 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-90">{featuredArtist.genre}</p>
              <h3 className="text-7xl md:text-8xl font-black mb-4">{featuredArtist.name}</h3>
              <p className="text-lg mb-4 opacity-90">{featuredArtist.bio}</p>
              <p className="text-sm mb-6">{featuredArtist.monthlyListeners} monthly listeners</p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 rounded-full font-bold"
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

        {/* The Hits - Horizontal Carousel */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-4xl font-bold">The Hits</h2>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">View all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {theHits.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer flex-shrink-0 w-48"
              >
                <div className="relative mb-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button className="absolute bottom-2 right-2 w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </button>
                </div>
                <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Albums - Horizontal Carousel */}
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-4xl font-bold">Popular albums</h2>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">View all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {popularAlbums.map((album) => (
              <div
                key={album.id}
                className="group cursor-pointer flex-shrink-0 w-48"
              >
                <div className="relative mb-3">
                  <img
                    src={album.image}
                    alt={album.title}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button className="absolute bottom-2 right-2 w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </button>
                </div>
                <h3 className="font-bold text-sm mb-1 truncate">{album.title}</h3>
                <p className="text-sm text-gray-400 truncate">{album.artist}</p>
              </div>
            ))}
          </div>
        </div>

        {/* New Music - Horizontal Carousel */}
        <div className="px-8 py-6 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">New Music</h2>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">View all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {popularAlbums.map((album) => (
              <div
                key={`new-${album.id}`}
                className="group cursor-pointer flex-shrink-0 w-48"
              >
                <div className="relative mb-3">
                  <img
                    src={album.image}
                    alt={album.title}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button className="absolute bottom-2 right-2 w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </button>
                </div>
                <h3 className="font-bold text-sm mb-1 truncate">{album.title}</h3>
                <p className="text-sm text-gray-400 truncate">{album.artist}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
