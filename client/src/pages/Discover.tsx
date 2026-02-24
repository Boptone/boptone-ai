import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Send, Music2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";

export default function Discover() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query.trim();
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // TODO: Implement AI music recommendation backend
      // For now, show a placeholder response
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const aiResponse = `I understand you're looking for: "${userMessage}"\n\nHere are some recommendations:\n\n1. **Artist Name** - "Song Title" (Genre)\n2. **Artist Name** - "Song Title" (Genre)\n3. **Artist Name** - "Song Title" (Genre)\n\n*AI-powered music discovery coming soon!*`;
      
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      toast.error("Failed to get recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const exampleQueries = [
    "I need 5 new artists to listen to",
    "I feel like listening to jazz",
    "Show me trending hip-hop tracks",
    "Find me something relaxing",
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music2 className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold">BopAudio</h1>
          </div>
          {user && (
            <div className="text-sm text-gray-400">
              Welcome, {user.name}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {messages.length === 0 ? (
          /* Empty State - Centered Welcome */
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-12 h-12 text-cyan-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              How can I help you?
            </h2>
            <p className="text-gray-400 text-center mb-8 max-w-2xl">
              Ask me anything about music. I'll help you discover new artists, find the perfect tracks for your mood, or explore genres you love.
            </p>
            
            {/* Example Queries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mb-8">
              {exampleQueries.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(example)}
                  className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left text-sm text-gray-300 transition-colors border border-gray-700"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation View */
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="container mx-auto max-w-4xl space-y-6">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-cyan-600 text-white"
                        : "bg-gray-800 text-gray-100"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Streamdown>{message.content}</Streamdown>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Search Box - Fixed at Bottom */}
        <div className="border-t border-gray-800 px-6 py-6 bg-[#1a1a1a]">
          <div className="container mx-auto max-w-4xl">
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="...Find Your Tone"
                className="w-full bg-gray-800 text-white rounded-full px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 text-lg"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full p-3 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
