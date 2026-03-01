import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, Search, Shield, Clock, Globe } from "lucide-react";

// ─── Jurisdiction config ─────────────────────────────────────────────────────

const JURISDICTIONS = [
  { value: "US", label: "United States", framework: "DMCA_512", law: "17 U.S.C. § 512" },
  { value: "EU", label: "European Union", framework: "DSA_ART16", law: "EU DSA Article 16" },
  { value: "UK", label: "United Kingdom", framework: "CDPA_1988", law: "CDPA 1988 + E-Commerce Regs" },
  { value: "CA", label: "Canada", framework: "CA_NOTICE", law: "Copyright Act ss. 41.25-41.26" },
  { value: "AU", label: "Australia", framework: "AU_COPYRIGHT", law: "Copyright Act 1968" },
  { value: "WW", label: "Other / Global", framework: "WIPO_GLOBAL", law: "WIPO-aligned" },
] as const;

const INFRINGEMENT_TYPES = [
  { value: "reproduction", label: "Reproduction — Direct copy of my work" },
  { value: "distribution", label: "Distribution — Unauthorized distribution" },
  { value: "public_performance", label: "Public Performance — Without license" },
  { value: "derivative_work", label: "Derivative Work — Unauthorized adaptation" },
  { value: "synchronization", label: "Synchronization — Used in video without license" },
  { value: "cover_song", label: "Cover Song — Without mechanical license" },
  { value: "sampling", label: "Sampling — Uncleared sample" },
  { value: "trademark", label: "Trademark — Unauthorized use of trademark" },
  { value: "other", label: "Other" },
] as const;

const CONTENT_TYPES = [
  { value: "track", label: "Audio Track" },
  { value: "bop", label: "Bops Video" },
  { value: "product", label: "BopShop Product" },
  { value: "profile", label: "Artist Profile" },
  { value: "other", label: "Other Content" },
] as const;

// ─── Form schema ─────────────────────────────────────────────────────────────

const formSchema = z.object({
  jurisdiction: z.enum(["US", "EU", "UK", "CA", "AU", "WW"]),
  legalFramework: z.enum(["DMCA_512", "DSA_ART16", "CDPA_1988", "CA_NOTICE", "AU_COPYRIGHT", "WIPO_GLOBAL"]),
  contentType: z.enum(["track", "bop", "product", "profile", "other"]),
  infringingContentUrl: z.string().url("Please enter a valid URL"),
  additionalUrls: z.string().optional(),
  claimantName: z.string().min(2, "Full legal name required"),
  claimantEmail: z.string().email("Valid email required"),
  claimantPhone: z.string().optional(),
  claimantAddress: z.string().min(10, "Full address required"),
  claimantCompany: z.string().optional(),
  claimantIsRightsHolder: z.boolean().default(true),
  authorizedAgentFor: z.string().optional(),
  copyrightedWorkTitle: z.string().min(1, "Title required"),
  copyrightedWorkDescription: z.string().min(20, "Description required"),
  copyrightedWorkUrl: z.string().url().optional().or(z.literal("")),
  copyrightRegistrationNumber: z.string().optional(),
  isrc: z.string().optional(),
  infringementDescription: z.string().min(50, "Please provide at least 50 characters describing the infringement"),
  infringementType: z.enum(["reproduction", "distribution", "public_performance", "derivative_work", "synchronization", "cover_song", "sampling", "trademark", "other"]),
  goodFaithStatement: z.boolean().refine(v => v === true, "Required"),
  accuracyStatement: z.boolean().refine(v => v === true, "Required"),
  perjuryStatement: z.boolean().refine(v => v === true, "Required"),
  electronicSignature: z.string().min(2, "Your full legal name is required as an electronic signature"),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Status checker ──────────────────────────────────────────────────────────

function StatusChecker() {
  const [ticketId, setTicketId] = useState("");
  const [email, setEmail] = useState("");
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, error } = trpc.takedown.checkStatus.useQuery(
    { ticketId, claimantEmail: email },
    { enabled, retry: false }
  );

  const STATUS_LABELS: Record<string, string> = {
    submitted: "Received",
    intake_validation: "Under Review",
    triage: "In Triage",
    action_taken: "Action Taken",
    notified: "Artist Notified",
    counter_notice_window: "Counter-Notice Window Open",
    counter_notice_received: "Counter-Notice Filed",
    reinstated: "Content Reinstated",
    appeal_pending: "Appeal Pending",
    resolved_upheld: "Resolved — Takedown Upheld",
    resolved_reversed: "Resolved — Takedown Reversed",
    withdrawn: "Withdrawn",
    forwarded: "Notice Forwarded",
    invalid: "Invalid — Missing Required Elements",
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-zinc-400" />
        Check Notice Status
      </h3>
      <div className="space-y-3">
        <Input
          placeholder="Ticket ID (e.g. TDN-2026-ABC123)"
          value={ticketId}
          onChange={e => { setTicketId(e.target.value); setEnabled(false); }}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
        />
        <Input
          placeholder="Your email address"
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setEnabled(false); }}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
        />
        <Button
          onClick={() => setEnabled(true)}
          disabled={!ticketId || !email}
          className="w-full bg-white text-black hover:bg-zinc-200"
        >
          Check Status
        </Button>
      </div>

      {isLoading && (
        <p className="text-zinc-400 text-sm mt-4">Looking up your notice...</p>
      )}
      {error && (
        <p className="text-red-400 text-sm mt-4">No notice found with that ticket ID and email.</p>
      )}
      {data && (
        <div className="mt-4 p-4 bg-zinc-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Ticket</span>
            <span className="text-white font-mono text-sm">{data.ticketId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Status</span>
            <span className="text-white text-sm font-medium">{STATUS_LABELS[data.status] ?? data.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Jurisdiction</span>
            <span className="text-white text-sm">{data.jurisdiction}</span>
          </div>
          {data.slaDeadline && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Response By</span>
              <span className="text-white text-sm">{new Date(data.slaDeadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Jurisdiction info panel ─────────────────────────────────────────────────

function JurisdictionInfo({ jurisdiction }: { jurisdiction: string }) {
  const info: Record<string, { title: string; description: string; timeline: string }> = {
    US: {
      title: "United States — DMCA 17 U.S.C. § 512",
      description: "Boptone will act expeditiously to remove or disable access to infringing material upon receipt of a valid notice. The affected artist will be notified and has 10-14 business days to file a counter-notice.",
      timeline: "Response within 72 hours. Counter-notice window: 10-14 business days.",
    },
    EU: {
      title: "European Union — DSA Article 16",
      description: "Under the EU Digital Services Act, Boptone will send confirmation of receipt without undue delay and notify you of our decision, including available redress options. Automated processing will be disclosed where applicable.",
      timeline: "Receipt confirmation: within 24 hours. Decision notification: within 48 hours.",
    },
    UK: {
      title: "United Kingdom — CDPA 1988",
      description: "Boptone processes notices under the UK Copyright, Designs and Patents Act 1988 and the E-Commerce Regulations 2002, which provide safe harbor for hosting providers acting expeditiously on valid notices.",
      timeline: "Response within 72 hours.",
    },
    CA: {
      title: "Canada — Notice-and-Notice Regime",
      description: "Under Canada's Copyright Act (ss. 41.25-41.26), Boptone is required to forward your notice to the subscriber (artist) rather than remove content directly. The subscriber will be notified of the claimed infringement.",
      timeline: "Notice forwarded within 48 hours. Content removal is not required under Canadian law.",
    },
    AU: {
      title: "Australia — Copyright Act 1968",
      description: "Boptone processes notices under Australia's Copyright Act 1968 safe harbor provisions for carriage service providers.",
      timeline: "Response within 72 hours.",
    },
    WW: {
      title: "Global — WIPO-Aligned",
      description: "For jurisdictions not listed above, Boptone applies WIPO-aligned best practices for notice and takedown.",
      timeline: "Response within 96 hours.",
    },
  };

  const current = info[jurisdiction];
  if (!current) return null;

  return (
    <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-5 text-sm">
      <p className="text-blue-300 font-semibold mb-2">{current.title}</p>
      <p className="text-zinc-300 mb-3 leading-relaxed">{current.description}</p>
      <div className="flex items-center gap-2 text-zinc-400">
        <Clock className="w-4 h-4" />
        <span>{current.timeline}</span>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function DmcaPage() {
  const [submitted, setSubmitted] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ ticketId: string; estimatedResponseBy: Date } | null>(null);
  const [showFaq, setShowFaq] = useState<number | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      jurisdiction: "US",
      legalFramework: "DMCA_512",
      contentType: "track",
      claimantIsRightsHolder: true,
      goodFaithStatement: false,
      accuracyStatement: false,
      perjuryStatement: false,
    },
  });

  const jurisdiction = form.watch("jurisdiction");
  const isRightsHolder = form.watch("claimantIsRightsHolder");

  const submitMutation = trpc.takedown.submitNotice.useMutation({
    onSuccess: (data) => {
      setTicketResult({ ticketId: data.ticketId, estimatedResponseBy: data.estimatedResponseBy });
      setSubmitted(true);
      toast.success(`Notice submitted. Ticket: ${data.ticketId}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit notice. Please check all required fields.");
    },
  });

  const onSubmit = (values: FormValues) => {
    // Validate with Zod before submitting
    const result = formSchema.safeParse(values);
    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.error(firstError?.message ?? "Please check all required fields");
      return;
    }
    // Parse additional URLs
    const additionalUrls = values.additionalUrls
      ? values.additionalUrls.split("\n").map(u => u.trim()).filter(u => u.length > 0)
      : undefined;

    submitMutation.mutate({
      ...values,
      additionalUrls,
      goodFaithStatement: true as const,
      accuracyStatement: true as const,
      perjuryStatement: true as const,
      copyrightedWorkUrl: values.copyrightedWorkUrl || undefined,
    });
  };

  const faqs = [
    {
      q: "What is a DMCA takedown notice?",
      a: "A DMCA (Digital Millennium Copyright Act) takedown notice is a formal legal request to remove content that infringes your copyright. Under 17 U.S.C. § 512, Boptone must act expeditiously upon receiving a valid notice to maintain safe harbor protection.",
    },
    {
      q: "What happens after I submit a notice?",
      a: "You will receive a ticket ID immediately. Our compliance team reviews the notice within the applicable SLA (typically 24-72 hours). If valid, the content will be removed and the artist will be notified. The artist then has 10-14 business days to file a counter-notice.",
    },
    {
      q: "What is a counter-notice?",
      a: "Under § 512(g), an artist who believes their content was wrongly removed may file a counter-notice. If a valid counter-notice is received, Boptone will notify you and restore the content within 10-14 business days unless you notify us that you have filed a lawsuit.",
    },
    {
      q: "What if I submit a false notice?",
      a: "Under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material is infringing may be liable for damages, including costs and attorneys' fees. The perjury declaration in this form carries legal weight.",
    },
    {
      q: "Who is Boptone's designated DMCA agent?",
      a: "Boptone's designated agent is registered with the U.S. Copyright Office. For urgent matters, contact legal@boptone.com. Our registered agent information is available in the Copyright Office's online directory.",
    },
    {
      q: "Does Boptone support EU DSA Article 16?",
      a: "Yes. For EU-based claimants, Boptone follows the Digital Services Act Article 16 requirements: confirmation of receipt without undue delay, decision notification with available redress options, and disclosure of automated processing where applicable.",
    },
  ];

  if (submitted && ticketResult) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 bg-green-900/40 border border-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Notice Received</h1>
          <p className="text-zinc-400 text-lg mb-8">
            Your copyright notice has been submitted and is under review.
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Ticket ID</span>
              <span className="text-white font-mono font-bold text-lg">{ticketResult.ticketId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Estimated Response</span>
              <span className="text-white">{new Date(ticketResult.estimatedResponseBy).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Status</span>
              <span className="text-green-400 font-medium">Under Review</span>
            </div>
          </div>

          <p className="text-zinc-500 text-sm mb-8">
            Save your ticket ID. You can use it to check the status of your notice at any time using the status checker on this page.
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => { setSubmitted(false); form.reset(); }}
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-800"
            >
              Submit Another Notice
            </Button>
            <Link href="/">
              <Button className="bg-white text-black hover:bg-zinc-200">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/">
            <span className="text-white font-bold text-xl tracking-tight cursor-pointer">Boptone</span>
          </Link>
          <Link href="/legal/terms">
            <span className="text-zinc-400 text-sm hover:text-white cursor-pointer">Terms of Service</span>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Page header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-zinc-400" />
            <span className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Copyright Compliance</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Copyright Infringement Notice</h1>
          <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed">
            Boptone respects intellectual property rights and complies with applicable copyright law across all jurisdictions in which we operate. Use this form to submit a notice of claimed infringement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {/* Section 1: Jurisdiction */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
                  <h2 className="text-white font-semibold text-lg">1. Jurisdiction</h2>
                  <p className="text-zinc-400 text-sm">Select the jurisdiction under which you are submitting this notice. Different laws apply different requirements and timelines.</p>

                  <FormField
                    control={form.control}
                    name="jurisdiction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Your Jurisdiction</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            const j = JURISDICTIONS.find(j => j.value === val);
                            if (j) form.setValue("legalFramework", j.framework);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-zinc-700">
                            {JURISDICTIONS.map(j => (
                              <SelectItem key={j.value} value={j.value} className="text-white focus:bg-zinc-800">
                                <span className="font-medium">{j.label}</span>
                                <span className="text-zinc-400 ml-2 text-xs">— {j.law}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <JurisdictionInfo jurisdiction={jurisdiction} />
                </div>

                {/* Section 2: Infringing Content */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
                  <h2 className="text-white font-semibold text-lg">2. Infringing Content</h2>
                  <p className="text-zinc-400 text-sm">Identify the specific content on Boptone that you believe infringes your copyright. Provide the exact URL.</p>

                  <FormField
                    control={form.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Content Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-zinc-700">
                            {CONTENT_TYPES.map(ct => (
                              <SelectItem key={ct.value} value={ct.value} className="text-white focus:bg-zinc-800">
                                {ct.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="infringingContentUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">URL of Infringing Content <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://boptone.com/..."
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalUrls"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Additional URLs (one per line)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="https://boptone.com/...&#10;https://boptone.com/..."
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="infringementType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Type of Infringement <span className="text-red-400">*</span></FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white">
                              <SelectValue placeholder="Select infringement type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-zinc-700">
                            {INFRINGEMENT_TYPES.map(it => (
                              <SelectItem key={it.value} value={it.value} className="text-white focus:bg-zinc-800">
                                {it.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="infringementDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Description of Infringement <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe specifically how the content infringes your copyright. Include timestamps, specific elements, and any other relevant details."
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[120px]"
                          />
                        </FormControl>
                        <p className="text-zinc-500 text-xs">{field.value?.length ?? 0} characters (minimum 50)</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Section 3: Your Copyrighted Work */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
                  <h2 className="text-white font-semibold text-lg">3. Your Copyrighted Work</h2>
                  <p className="text-zinc-400 text-sm">Identify the original copyrighted work that you claim has been infringed.</p>

                  <FormField
                    control={form.control}
                    name="copyrightedWorkTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Title of Copyrighted Work <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. 'My Song Title' or 'Album Name'" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="copyrightedWorkDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Description of Copyrighted Work <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your original work, including when it was created, published, or registered."
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="copyrightedWorkUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">URL to Original Work</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://..." className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="copyrightRegistrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Copyright Registration Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. PA 2-345-678" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isrc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">ISRC (International Standard Recording Code)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. USRC17607839" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Section 4: Your Contact Information */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
                  <h2 className="text-white font-semibold text-lg">4. Your Contact Information</h2>

                  <FormField
                    control={form.control}
                    name="claimantIsRightsHolder"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="isRightsHolder"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
                          />
                          <Label htmlFor="isRightsHolder" className="text-zinc-300 cursor-pointer">
                            I am the copyright owner (not an authorized agent)
                          </Label>
                        </div>
                      </FormItem>
                    )}
                  />

                  {!isRightsHolder && (
                    <FormField
                      control={form.control}
                      name="authorizedAgentFor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Authorized Agent For (rights holder name) <span className="text-red-400">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Name of the copyright owner you represent" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="claimantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Full Legal Name <span className="text-red-400">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your full legal name" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="claimantEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Email Address <span className="text-red-400">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="your@email.com" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="claimantCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Company / Organization</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Optional" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="claimantPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="+1 (555) 000-0000" className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="claimantAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Mailing Address <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Street address, city, state/province, postal code, country"
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Section 5: Declarations */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
                  <h2 className="text-white font-semibold text-lg">5. Declarations</h2>
                  <p className="text-zinc-400 text-sm">
                    The following statements are required by law. Knowingly submitting false information may result in liability under 17 U.S.C. § 512(f).
                  </p>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="goodFaithStatement"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="goodFaith"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
                            />
                            <Label htmlFor="goodFaith" className="text-zinc-300 text-sm leading-relaxed cursor-pointer">
                              I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law. <span className="text-red-400">*</span>
                            </Label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accuracyStatement"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="accuracy"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
                            />
                            <Label htmlFor="accuracy" className="text-zinc-300 text-sm leading-relaxed cursor-pointer">
                              The information in this notification is accurate. <span className="text-red-400">*</span>
                            </Label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="perjuryStatement"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="perjury"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5 border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
                            />
                            <Label htmlFor="perjury" className="text-zinc-300 text-sm leading-relaxed cursor-pointer">
                              Under penalty of perjury, I am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed. <span className="text-red-400">*</span>
                            </Label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="electronicSignature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Electronic Signature — Type your full legal name <span className="text-red-400">*</span></FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Your full legal name"
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 font-serif italic"
                          />
                        </FormControl>
                        <p className="text-zinc-500 text-xs">
                          By typing your name above, you are providing an electronic signature with the same legal effect as a physical signature.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-semibold"
                >
                  {submitMutation.isPending ? "Submitting Notice..." : "Submit Copyright Notice"}
                </Button>

                <p className="text-zinc-500 text-xs text-center leading-relaxed">
                  This notice will be processed under applicable copyright law. False notices may result in legal liability. For questions, contact{" "}
                  <a href="mailto:legal@boptone.com" className="text-zinc-300 hover:text-white">legal@boptone.com</a>.
                </p>
              </form>
            </Form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status checker */}
            <StatusChecker />

            {/* Designated agent */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-400" />
                Designated Agent
              </h3>
              <div className="text-sm text-zinc-400 space-y-1">
                <p className="text-zinc-300 font-medium">Boptone Copyright Agent</p>
                <p>legal@boptone.com</p>
                <p className="text-xs mt-2 text-zinc-500">
                  Registered with the U.S. Copyright Office per 17 U.S.C. § 512(c)(2).
                </p>
              </div>
            </div>

            {/* Counter-notice info */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3">For Artists</h3>
              <p className="text-zinc-400 text-sm mb-4">
                If your content has been removed and you believe it was taken down in error, you may file a counter-notice under § 512(g).
              </p>
              <Link href="/dmca/counter-notice">
                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 text-sm">
                  File a Counter-Notice
                </Button>
              </Link>
            </div>

            {/* FAQ */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <div key={i} className="border-b border-zinc-800 last:border-0 pb-2 last:pb-0">
                    <button
                      type="button"
                      onClick={() => setShowFaq(showFaq === i ? null : i)}
                      className="w-full flex items-start justify-between gap-2 py-2 text-left"
                    >
                      <span className="text-zinc-300 text-sm font-medium">{faq.q}</span>
                      {showFaq === i ? (
                        <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      )}
                    </button>
                    {showFaq === i && (
                      <p className="text-zinc-400 text-sm pb-2 leading-relaxed">{faq.a}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-900 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Boptone. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-zinc-500 text-sm">
            <Link href="/legal/privacy"><span className="hover:text-white cursor-pointer">Privacy Policy</span></Link>
            <Link href="/legal/terms"><span className="hover:text-white cursor-pointer">Terms of Service</span></Link>
            <a href="mailto:legal@boptone.com" className="hover:text-white">legal@boptone.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}
