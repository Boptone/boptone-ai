import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { ToneyChatbot } from "@/components/ToneyChatbot";

export default function Contact() {
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
    <div className="min-h-screen bg-white">
      
      {/* Hero - Minimal with massive typography */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container py-32">
          <div className="max-w-4xl">
            <h1 className="text-7xl md:text-8xl font-bold mb-10 leading-none">
              Get in Touch.
            </h1>
            <p className="text-2xl text-gray-600 leading-relaxed max-w-2xl">
              Have questions about Boptone? Want to partner with us? We'd love to hear from you.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form & Info - Xerox gradient */}
      <div className="bg-gray-50 py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 max-w-6xl">
            {/* Contact Form */}
            <div className="border-2 border-gray-200 bg-white p-12 rounded-xl">
              <h2 className="text-4xl font-bold mb-10">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-base font-medium mb-2 block">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-medium mb-2 block">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-base font-medium mb-2 block">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What's this about?"
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-base font-medium mb-2 block">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    className="text-base"
                    required
                  />
                </div>

                <Button 
                  className="rounded-full w-full h-14 text-lg bg-black hover:bg-gray-800 text-white" 
                  type="submit" 
                  disabled={sendMessage.isPending}
                >
                  {sendMessage.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="border-2 border-gray-200 bg-white p-10 rounded-xl">
                <h3 className="text-2xl font-bold mb-4">Email Us</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  For general inquiries, partnerships, or support:
                </p>
                <a 
                  href="mailto:hello@boptone.com" 
                  className="text-black hover:underline font-medium text-lg"
                >
                  hello@boptone.com
                </a>
              </div>

              <div className="border-2 border-gray-200 bg-white p-10 rounded-xl">
                <h3 className="text-2xl font-bold mb-4">HQ</h3>
                <p className="text-gray-600 leading-relaxed">
                  Los Angeles, CA USA
                </p>
              </div>

              <div className="border-2 border-black bg-white p-10 rounded-xl">
                <h3 className="text-xl font-bold mb-3">Looking for Support?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  If you're an existing user and need technical support, please email us with "Support" in the subject line for priority handling.
                </p>
                <h3 className="text-xl font-bold mb-3">Media Inquiries</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  For press and media inquiries, please include "Press" in your subject line.
                </p>
                <h3 className="text-xl font-bold mb-3">Partnership Opportunities</h3>
                <p className="text-gray-600 leading-relaxed">
                  Interested in partnering with Boptone? We'd love to explore collaboration opportunities. Include "Partnership" in your subject line.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Preview - Minimal cards */}
      <div className="border-t border-gray-200 bg-white py-32">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl font-bold mb-16">Common Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-gray-200 bg-white p-8 rounded-xl">
                <h3 className="text-xl font-bold mb-3">When does Boptone launch?</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're targeting a 2026 launch. Sign up for early access to be notified when we go live.
                </p>
              </div>
              <div className="border-2 border-gray-200 bg-white p-8 rounded-xl">
                <h3 className="text-xl font-bold mb-3">How much does it cost?</h3>
                <p className="text-gray-600 leading-relaxed">
                  We offer a free tier for emerging artists and paid plans starting at $29/month. Check our pricing page for details.
                </p>
              </div>
              <div className="border-2 border-gray-200 bg-white p-8 rounded-xl">
                <h3 className="text-xl font-bold mb-3">Can I try before I buy?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! We offer a 14-day free trial on our Pro tier with no credit card required.
                </p>
              </div>
              <div className="border-2 border-gray-200 bg-white p-8 rounded-xl">
                <h3 className="text-xl font-bold mb-3">Do you take a percentage of my revenue?</h3>
                <p className="text-gray-600 leading-relaxed">
                  No. We charge a flat subscription fee. You keep 100% of your revenue.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToneyChatbot />
    </div>
  );
}
