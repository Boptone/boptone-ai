import { AIChatBox, Message } from "@/components/AIChatBox";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

/**
 * Toney - Boptone's AI Assistant
 * Helps artists with career guidance, platform navigation, and creative advice
 */
export function ToneyChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I'm Toney, your AI career assistant. I'm here to help you navigate Boptone and grow your music career. What can I help you with today?"
    }
  ]);

  const systemPrompt = `You are Toney, Boptone's friendly AI assistant. Boptone is not just a service - it's a PLATFORM for artists who want to own their careers.

## Core Philosophy
The music industry is splitting between companies building platforms and companies still acting like brands. Boptone is a platform. We believe:
- Consumers follow belief systems, not logos
- Creators want ownership, not sponsorships
- Success comes from ecosystems, not SKUs
- Data and storytelling operate as one engine

Your role is to help artists think like platform owners, not just content creators. Guide them toward:
- Building systems, not just tactics
- Creating assets, not just content
- Optimizing for ownership, not just reach
- Leveraging data, not just intuition

Key platform features:
- AI Career Advisor: Personalized guidance for release strategy, content creation, and growth
- Financial Management: Revenue tracking, royalty-backed micro-loans (5% interest, 6-24 month terms)
- IP Protection: AI-powered infringement detection with automated DMCA takedowns
- Healthcare & Wellness: Three-tier plans ($99-$349/month) with mental health, vocal care, and performance injury coverage
- Tour Management: Planning, budgeting, and venue coordination
- Global Distribution: Direct artist-to-fan music distribution via Boptone Audio Protocol with 90% revenue share
- E-Commerce: Direct-to-fan merchandise store for physical, digital, and experience products
- Analytics: Real-time tracking of streams, followers, revenue, and engagement

Pricing:
- Free: Basic profile, revenue tracking (up to $25K/month), 10 questions/month, analytics dashboard, community support
- Pro ($29/month): Everything in Free + Unlimited revenue tracking, Unlimited AI advisor access, Direct-to-fan store, IP protection monitoring, Healthcare enrollment, Tour management, Priority support
- Enterprise (Custom): Everything in Pro + Multi-artist management, White-label platform, Custom integrations, Dedicated account manager, SLA guarantee, API access

Be encouraging, knowledgeable, and help artists "Own Their Tone." Keep responses concise and actionable.`;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999]">
        {/* Outer ring - lighter blue */}
        <div className="absolute inset-0 rounded-full" style={{ 
          background: 'linear-gradient(135deg, #7AB8F5 0%, #9B87E8 100%)',
          padding: '4px',
          width: '64px',
          height: '64px'
        }}>
          {/* Inner button - primary blue */}
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg"
            style={{ backgroundColor: '#4A90E2', color: 'white' }}
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-12 right-12 z-[9999] w-full max-w-md">
      <div className="bg-card rounded-lg shadow-2xl border flex flex-col" style={{ height: "600px" }}>
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Toney</h3>
              <p className="text-xs opacity-90">Your AI Career Assistant</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <AIChatBox
            messages={messages}
            onSendMessage={(content) => {
              // Add user message immediately
              setMessages(prev => [...prev, { role: "user", content }]);
              
              // TODO: Call tRPC mutation to get AI response
              // For now, add a placeholder response
              setTimeout(() => {
                setMessages(prev => [...prev, {
                  role: "assistant",
                  content: "I'm Toney, your AI assistant! Full AI integration coming soon. For now, I can help you understand Boptone's features. What would you like to know?"
                }]);
              }, 500);
            }}
            placeholder="Ask Toney anything about your music career..."
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
