import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Music, Mail, MapPin, Send } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Contact() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const sendMessage = trpc.system.notifyOwner.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    },
    onError: () => {
      toast.error("Failed to send message. Please try emailing us directly at hello@boptone.com");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    const emailContent = `
New Contact Form Submission

From: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject || "No subject"}

Message:
${formData.message}
    `.trim();

    sendMessage.mutate({
      title: `Contact Form: ${formData.subject || "New Message"}`,
      content: emailContent,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
              <Music className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Boptone</h1>
                <p className="text-xs text-muted-foreground">Own Your Tone</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setLocation("/")}>Home</Button>
              <Button onClick={() => setLocation("/signup")}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Get in Touch
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have questions about Boptone? Want to partner with us? We'd love to hear from you.
        </p>
      </div>

      {/* Contact Form & Info */}
      <div className="container mx-auto px-4 py-8 mb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={sendMessage.isPending}
                >
                  {sendMessage.isPending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                    <p className="text-muted-foreground mb-2">
                      For general inquiries, partnerships, or support:
                    </p>
                    <a 
                      href="mailto:hello@boptone.com" 
                      className="text-primary hover:underline font-medium"
                    >
                      hello@boptone.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Location</h3>
                    <p className="text-muted-foreground">
                      Acid Bird, Inc.<br />
                      Los Angeles, California<br />
                      United States
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-8">
                <h3 className="font-semibold text-lg mb-3">Looking for Support?</h3>
                <p className="text-muted-foreground mb-4">
                  If you're an existing user and need technical support, please email us with "Support" in the subject line for priority handling.
                </p>
                <h3 className="font-semibold text-lg mb-3 mt-6">Media Inquiries</h3>
                <p className="text-muted-foreground mb-4">
                  For press and media inquiries, please include "Press" in your subject line.
                </p>
                <h3 className="font-semibold text-lg mb-3 mt-6">Partnership Opportunities</h3>
                <p className="text-muted-foreground">
                  Interested in partnering with Boptone? We'd love to explore collaboration opportunities. Include "Partnership" in your subject line.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Preview */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">When does Boptone launch?</h3>
                <p className="text-sm text-muted-foreground">
                  We're targeting a 2026 launch. Sign up for early access to be notified when we go live.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How much does it cost?</h3>
                <p className="text-sm text-muted-foreground">
                  We offer a free tier for emerging artists and paid plans starting at $29/month. Check our pricing page for details.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I try before I buy?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! We offer a 14-day free trial on our Pro tier with no credit card required.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Do you take a percentage of my revenue?</h3>
                <p className="text-sm text-muted-foreground">
                  No. We charge a flat subscription fee. You keep 100% of your revenue.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Music className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Boptone</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The autonomous operating system for creators. Own Your Tone™
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/#features" className="hover:text-foreground">Features</a></li>
                <li><a href="/#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="/demo" className="hover:text-foreground">Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-foreground">About</a></li>
                <li><a href="/contact" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground">Privacy</a></li>
                <li><a href="/terms" className="hover:text-foreground">Terms of Service</a></li>
                <li><a href="mailto:hello@boptone.com" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Boptone. All rights reserved. Own Your Tone™</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
