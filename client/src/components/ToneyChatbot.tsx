import { AIChatBox, Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { X, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

/**
 * Toney - Boptone's AI Assistant
 * Helps artists with career guidance, platform navigation, and creative advice
 */
const STORAGE_KEY = 'toney-chat-history';
const AUTO_OPENED_KEY = 'toney-auto-opened';

export function ToneyChatbot() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const chatMutation = trpc.toney.chat.useMutation();
  const workflowMutation = trpc.workflows.generateFromText.useMutation();
  const [hasAutoOpened, setHasAutoOpened] = useState(() => {
    // Check if we've already auto-opened in this session
    return localStorage.getItem(AUTO_OPENED_KEY) === 'true';
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load chat history from localStorage on mount
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
    // Default welcome message if no history
    return [{
      role: "assistant",
      content: "Hey! I'm Toney, your AI career assistant. I'm here to help you navigate Boptone and grow your music career. What can I help you with today?"
    }];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [messages]);

  // Save auto-opened state
  useEffect(() => {
    if (hasAutoOpened) {
      localStorage.setItem(AUTO_OPENED_KEY, 'true');
    }
  }, [hasAutoOpened]);

  // Proactive greeting: auto-open after 15 seconds on key pages (only if no chat history)
  useEffect(() => {
    // Only auto-open on homepage (pricing section) or features page
    const isKeyPage = location === '/' || location === '/features';
    
    // Only show proactive greeting if user has no chat history (first visit)
    const hasHistory = messages.length > 1 || 
      (messages.length === 1 && messages[0].content !== "Hey! I'm Toney, your AI career assistant. I'm here to help you navigate Boptone and grow your music career. What can I help you with today?");
    
    if (isKeyPage && !hasAutoOpened && !isOpen && !hasHistory) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
        
        // Add contextual greeting based on page
        const contextualGreeting = location === '/features' 
          ? "I noticed you're checking out our features! I can help explain how any of these tools can accelerate your career. What interests you most?"
          : "I see you're exploring Boptone! I can help you understand our pricing, features, or answer any questions about building your music career. What would you like to know?";
        
        setMessages([{
          role: "assistant",
          content: contextualGreeting
        }]);
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [location, hasAutoOpened, isOpen, messages]);

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
      <div className="fixed bottom-8 right-8 z-[99999]">
        {/* Outer ring - lighter blue */}
        <div className="absolute inset-0 rounded-full" style={{ 
          background: 'linear-gradient(135deg, #7AB8F5 0%, #9B87E8 100%)',
          padding: '4px',
          width: '64px',
          height: '64px'
        }}>
          {/* Inner button - primary blue */}
          <Button
            data-toney-trigger
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg"
            style={{ backgroundColor: '#81e6fe', color: 'white' }}
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
      <div className="rounded-lg shadow-2xl border flex flex-col" style={{ height: "600px", backgroundColor: "#f5f5f5" }}>
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Toney</h3>
              <p className="text-xs opacity-90">Your AI Career Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Are you sure you want to clear your conversation history with Toney?')) {
                  localStorage.removeItem(STORAGE_KEY);
                  localStorage.removeItem(AUTO_OPENED_KEY);
                  setMessages([{
                    role: "assistant",
                    content: "Hey! I'm Toney, your AI career assistant. I'm here to help you navigate Boptone and grow your music career. What can I help you with today?"
                  }]);
                  setHasAutoOpened(false);
                }
              }}
              className="text-xs text-primary-foreground hover:bg-primary-foreground/20"
            >
              Clear History
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <AIChatBox
            messages={messages}
            onSendMessage={async (content) => {
              // Add user message immediately
              setMessages(prev => [...prev, { role: "user", content }]);
              
              try {
                // Call Toney AI backend
                const response = await chatMutation.mutateAsync({
                  message: content,
                  conversationHistory: messages.filter(m => m.role !== 'system').map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                  })),
                });
                
                // Check if Toney wants to generate a workflow
                if (response.message.includes('GENERATE_WORKFLOW:')) {
                  const workflowDescription = response.message.split('GENERATE_WORKFLOW:')[1].trim();
                  
                  // Add Toney's response (without the command)
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "I'm generating that workflow for you now...",
                  }]);
                  
                  // Trigger workflow generation
                  try {
                    const workflowResponse = await workflowMutation.mutateAsync({
                      description: workflowDescription,
                    });
                    
                    // Add success message with link to workflows page
                    setMessages(prev => [...prev, {
                      role: "assistant",
                      content: `Workflow created successfully! I've generated "${workflowResponse.workflow.name}" for you. You can view and activate it on your [Workflows page](/workflows).`,
                    }]);
                  } catch (workflowError) {
                    console.error('[Toney] Failed to generate workflow:', workflowError);
                    setMessages(prev => [...prev, {
                      role: "assistant",
                      content: "I had trouble generating that workflow. You can try creating it manually on the [Workflows page](/workflows) or describe it differently.",
                    }]);
                  }
                } else {
                  // Normal AI response
                  setMessages(prev => [...prev, {
                    role: "assistant",
                    content: response.message,
                  }]);
                }
              } catch (error) {
                console.error('[Toney] Failed to get AI response:', error);
                toast.error('Failed to get response from Toney');
                
                // Add error message
                setMessages(prev => [...prev, {
                  role: "assistant",
                  content: "I'm having trouble connecting right now. Please try again in a moment.",
                }]);
              }
            }}
            placeholder="Ask Toney anything about your music career..."
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
