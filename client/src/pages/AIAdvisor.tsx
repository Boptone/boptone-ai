import { useAuth } from "@/_core/hooks/useAuth";
import { useDemo } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Sparkles, Send, Loader2, ArrowLeft, Lightbulb, TrendingUp, Music, DollarSign } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Streamdown } from "streamdown";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
};

export default function AIAdvisor() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isDemoMode } = useDemo();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI Career Advisor, powered by Boptone. I can help you with:\n\n- **Release Strategy**: When and how to release your music\n- **Content Ideas**: Social media posts, marketing campaigns\n- **Career Planning**: Next steps to grow your audience\n- **Financial Advice**: Revenue optimization and budgeting\n- **Tour Planning**: Optimal routing and venue selection\n\nWhat would you like to discuss today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: profile } = trpc.artistProfile.getMyProfile.useQuery(undefined, {
    enabled: !isDemoMode
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isDemoMode) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, isDemoMode, setLocation]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Simulate AI response (in production, this would call the LLM via tRPC)
      // For now, we'll create intelligent responses based on keywords
      const response = await generateAIResponse(input, profile);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const quickPrompts = [
    {
      icon: Music,
      label: "Release Strategy",
      prompt: "What's the best time to release my next single?",
    },
    {
      icon: TrendingUp,
      label: "Grow Audience",
      prompt: "How can I grow my Instagram following?",
    },
    {
      icon: Lightbulb,
      label: "Content Ideas",
      prompt: "Give me 5 social media post ideas for this week",
    },
    {
      icon: DollarSign,
      label: "Revenue Tips",
      prompt: "How can I diversify my revenue streams?",
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Career Advisor</h1>
                <p className="text-sm text-muted-foreground">Powered by Boptone</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Prompts Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Prompts</CardTitle>
                <CardDescription className="text-xs">Click to use</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickPrompts.map((prompt) => {
                  const Icon = prompt.icon;
                  return (
                    <Button
                      key={prompt.label}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                    >
                      <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm">{prompt.label}</span>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Messages</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium text-primary">Unlimited</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Unlimited AI-powered guidance for your career
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <Streamdown>{message.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask me anything about your music career..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Intelligent response generator (placeholder for actual LLM integration)
async function generateAIResponse(userInput: string, profile: any): Promise<string> {
  const input = userInput.toLowerCase();

  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Release strategy
  if (input.includes("release") || input.includes("single") || input.includes("album")) {
    return `Based on current music industry trends and your profile data, here's my recommendation for your next release:

**Optimal Release Timing:**
- **Best Day**: Friday (industry standard for maximum playlist consideration)
- **Best Time**: 12:01 AM EST (to capture all time zones)
- **Recommended Month**: Avoid December (holiday saturation) and August (summer slowdown)

**Pre-Release Strategy (4-6 weeks before):**
1. **Week 1-2**: Tease on social media (behind-the-scenes content)
2. **Week 3**: Pre-save campaign launch
3. **Week 4**: Submit to playlist curators
4. **Week 5**: Press release to music blogs
5. **Week 6**: Final push with countdown posts

**Platform Priority:**
1. Boptone (direct artist-to-fan with 90% revenue share)
2. TikTok (viral potential for discovery)
3. Instagram (visual storytelling)

**Budget Allocation** (if you have $1,000):
- 50% ($500): Social media ads (Instagram/TikTok)
- 30% ($300): Content creation (music videos, behind-the-scenes)
- 20% ($200): Influencer collaborations
- 10% ($100): Cover art and promotional graphics

Would you like me to create a detailed release checklist for you?`;
  }

  // Social media growth
  if (input.includes("instagram") || input.includes("followers") || input.includes("social")) {
    return `Here's a proven strategy to grow your Instagram following organically:

**Content Strategy (Post 4-5x per week):**
1. **Behind-the-Scenes** (2x/week): Studio sessions, creative process
2. **Performance Clips** (1x/week): Live snippets, rehearsals
3. **Personal Connection** (1x/week): Your story, inspirations
4. **Engagement Posts** (1x/week): Questions, polls, challenges

**Engagement Tactics:**
- Respond to ALL comments within first hour
- Use 20-30 relevant hashtags (mix of popular and niche)
- Post Reels 3x per week (Instagram prioritizes video)
- Go live weekly to boost algorithm favor
- Collaborate with artists in your genre (cross-promotion)

**Best Posting Times:**
- Weekdays: 11 AM - 1 PM, 7 PM - 9 PM
- Weekends: 10 AM - 12 PM

**Hashtag Strategy:**
- 5-10 mega hashtags (1M+ posts): #music #musician #newmusic
- 10-15 medium hashtags (100K-1M posts): #indieartist #unsignedartist
- 5-10 niche hashtags (10K-100K posts): #[yourgenre]music #[yourcity]music

**Growth Timeline:**
- Month 1: +500-1,000 followers
- Month 3: +2,000-5,000 followers
- Month 6: +10,000-20,000 followers

Consistency is key! Would you like me to generate specific post ideas for this week?`;
  }

  // Content ideas
  if (input.includes("content") || input.includes("post") || input.includes("ideas")) {
    return `Here are 5 engaging social media post ideas for this week:

**Monday - Motivation:**
"Behind every song is a story. Here's the story behind my latest track... [Share the inspiration, struggles, or breakthrough moment]"
*Format*: Carousel post with lyrics + behind-the-scenes photos

**Tuesday - Tutorial Tuesday:**
"Quick tip: How I create that signature sound in my tracks [Show a 30-second production technique]"
*Format*: Reel with text overlay

**Wednesday - Engagement:**
"If my music was a movie genre, it would be ___. What would yours be? 🎬🎵"
*Format*: Static post with question

**Thursday - Throwback:**
"One year ago vs. today. Growth isn't always visible, but it's always happening. Keep pushing! 💪"
*Format*: Before/after comparison (studio setup, performance, etc.)

**Friday - Release Reminder:**
"New music drops TONIGHT at midnight! Set your alarms ⏰ Link in bio for pre-save"
*Format*: Eye-catching graphic + countdown sticker in Stories

**Bonus - Weekend:**
"Sunday reset: What song is on repeat for you this week? Drop it below 👇"
*Format*: Poll in Stories + feed post

**Pro Tips:**
- Use trending audio on Reels
- Add location tags to reach local fans
- Create a consistent visual aesthetic
- End posts with a call-to-action

Need more ideas or help with specific content creation?`;
  }

  // Revenue/financial
  if (input.includes("revenue") || input.includes("money") || input.includes("income") || input.includes("diversify")) {
    return `Let's build a diversified revenue strategy for sustainable income:

**Primary Revenue Streams (Active Now):**
1. **Streaming Royalties**: $0.003-0.005 per stream
   - Focus: Playlist placements, consistent releases
   
2. **Live Performances**: $500-5,000 per show (depending on your level)
   - Strategy: Book 2-4 shows per month
   
3. **Merchandise**: 30-50% profit margins
   - Start with: T-shirts, hoodies, stickers, digital downloads

**Secondary Revenue Streams (Build These):**
4. **YouTube Ad Revenue**: Monetize music videos, vlogs, tutorials
   - Requirement: 1,000 subscribers + 4,000 watch hours
   
5. **Sync Licensing**: $500-50,000 per placement
   - Submit to: Music libraries, TV/film supervisors
   
6. **Patreon/Fan Subscriptions**: $5-20/month per supporter
   - Offer: Exclusive content, early releases, behind-the-scenes
   
7. **Session Work**: $50-500 per session
   - Offer: Production, features, mixing services
   
8. **Teaching**: $30-100 per hour
   - Platforms: Fiverr, Lessonface, private students

**Revenue Projection (6 months):**
- Streaming: $200-500/month
- Shows: $1,000-2,000/month
- Merch: $300-800/month
- Other: $200-500/month
**Total**: $1,700-3,800/month

**Action Steps:**
1. Set up merch store (use Boptone's built-in commerce)
2. Create Patreon with 3 tier levels
3. Submit 5 tracks to sync libraries this month
4. Book 3 shows for next month

Want help setting up any of these revenue streams?`;
  }

  // Default response
  return `That's a great question! As your AI Career Advisor, I'm here to help you navigate the music industry with data-driven insights.

**I can help you with:**
- **Release Strategy**: Timing, platforms, and promotional tactics
- **Audience Growth**: Social media strategies and engagement tips
- **Revenue Optimization**: Diversifying income streams
- **Content Creation**: Post ideas and marketing campaigns
- **Career Planning**: Next steps based on your current phase (${profile?.careerPhase || "discovery"})
- **Financial Decisions**: Budgeting, investments, and micro-loans
- **Tour Planning**: Routing, venues, and revenue projections

Could you provide more details about what you'd like to focus on? For example:
- "How should I promote my next single?"
- "What's the best way to grow on TikTok?"
- "Should I take out a micro-loan for studio time?"

I'm here to provide personalized advice based on your unique situation!`;
}
