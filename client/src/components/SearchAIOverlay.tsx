import { useState } from "react";
import { X, Search as SearchIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SearchAIOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchAIOverlay({ isOpen, onClose }: SearchAIOverlayProps) {
  const [activeTab, setActiveTab] = useState<"search" | "ai">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [aiInput, setAiInput] = useState("");

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Search query:", searchQuery);
  };

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    // Add user message
    const userMessage = { role: "user" as const, content: aiInput };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiInput("");

    // TODO: Call AI API and add assistant response
    // For now, just a placeholder
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm here to help! This is a placeholder response. The AI chat will be connected soon.",
        },
      ]);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white">
      {/* Header */}
      <div className="border-b-2 border-black">
        <div className="container">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Tab Switcher */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setActiveTab("search")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === "search"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <SearchIcon className="w-4 h-4" />
                  Search
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === "ai"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  AI Chat
                </button>
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full w-12 h-12 border-2 border-black hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container h-[calc(100vh-5rem)] py-8">
        {activeTab === "search" ? (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-8">Search Boptone</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for artists, tracks, features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 border-black rounded-full"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-full font-semibold"
              >
                Search
              </Button>
            </form>

            {/* Search Results Placeholder */}
            <div className="mt-12">
              <p className="text-gray-500 text-center">
                Enter a search query to find artists, tracks, and features
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <h2 className="text-4xl font-bold mb-8">AI Chat</h2>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6">
              {aiMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-12">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Ask me anything about Boptone!</p>
                  <p className="text-sm mt-2">I can help with platform features, pricing, and general questions.</p>
                </div>
              ) : (
                aiMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                        message.role === "user"
                          ? "bg-black text-white"
                          : "bg-gray-100 text-black border-2 border-gray-200"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleAISubmit} className="border-t-2 border-black pt-6">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Type your question..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="flex-1 min-h-[60px] max-h-[200px] border-2 border-black rounded-2xl resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAISubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  className="h-[60px] px-8 bg-black text-white hover:bg-gray-800 rounded-full font-semibold"
                  disabled={!aiInput.trim()}
                >
                  Send
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This is a public AI chat. No personalization or login required.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
