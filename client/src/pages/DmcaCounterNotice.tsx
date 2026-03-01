import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

const formSchema = z.object({
  noticeId: z.number().int().positive("Valid notice ID required"),
  identificationOfRemovedContent: z.string().min(20, "Please identify the removed content"),
  goodFaithBelief: z.string().min(20, "Please provide your good faith belief statement"),
  consentToJurisdiction: z.boolean().refine((v): v is true => v === true, { message: "Required" }),
  consentToServiceOfProcess: z.boolean().refine((v): v is true => v === true, { message: "Required" }),
  electronicSignature: z.string().min(2, "Full legal name required"),
  artistAddress: z.string().min(10, "Physical address required for service of process"),
  fairUseJustification: z.string().optional(),
  licenseEvidence: z.string().optional(),
  originalWorkEvidence: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DmcaCounterNoticePage() {
  const { isAuthenticated, loading } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [reinstateAfter, setReinstateAfter] = useState<Date | null>(null);
  const [, navigate] = useLocation();

  const form = useForm<FormValues>({
    defaultValues: {
      consentToJurisdiction: false,
      consentToServiceOfProcess: false,
    },
  });

  const submitMutation = trpc.takedown.submitCounterNotice.useMutation({
    onSuccess: (data) => {
      setReinstateAfter(new Date(data.reinstateAfter));
      setSubmitted(true);
      toast.success("Counter-notice submitted successfully.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit counter-notice.");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <Shield className="w-12 h-12 text-zinc-400 mb-4" />
        <h1 className="text-2xl font-bold mb-3">Sign In Required</h1>
        <p className="text-zinc-400 text-center max-w-md mb-8">
          You must be signed in to your Boptone artist account to file a counter-notice. This verifies your identity as the content owner.
        </p>
        <a href={getLoginUrl()}>
          <Button className="bg-white text-black hover:bg-zinc-200">Sign In to Continue</Button>
        </a>
      </div>
    );
  }

  if (submitted && reinstateAfter) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 bg-green-900/40 border border-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Counter-Notice Submitted</h1>
          <p className="text-zinc-400 text-lg mb-8">
            Your counter-notice has been received and the claimant has been notified.
          </p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left space-y-4 mb-8">
            <h3 className="text-white font-semibold">What Happens Next</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs shrink-0 mt-0.5">1</div>
                <p className="text-zinc-300">The claimant has been notified of your counter-notice and has <strong className="text-white">10-14 business days</strong> to file a lawsuit in federal court.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs shrink-0 mt-0.5">2</div>
                <p className="text-zinc-300">If no lawsuit is filed by <strong className="text-white">{reinstateAfter.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>, your content will be reinstated.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs shrink-0 mt-0.5">3</div>
                <p className="text-zinc-300">If a lawsuit is filed, the matter will be resolved through the courts. Boptone will comply with any court order.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4 text-sm text-amber-300 mb-8 text-left">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            If you submitted a false counter-notice, you may be liable for damages under 17 U.S.C. § 512(f). Consider consulting an attorney if you have questions about your rights.
          </div>

          <Link href="/dashboard">
            <Button className="bg-white text-black hover:bg-zinc-200">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/">
            <span className="text-white font-bold text-xl tracking-tight cursor-pointer">Boptone</span>
          </Link>
          <Link href="/dmca">
            <span className="text-zinc-400 text-sm hover:text-white cursor-pointer">Submit a Takedown Notice</span>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-zinc-400" />
            <span className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Artist Rights</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">File a Counter-Notice</h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            If your content was removed following a copyright notice and you believe the removal was in error, you may file a counter-notice under 17 U.S.C. § 512(g). This is a legal document — please read carefully before proceeding.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-amber-300 font-semibold mb-1">Legal Notice</p>
              <p className="text-amber-200/80 leading-relaxed">
                A counter-notice is a legal document. Submitting a false counter-notice may expose you to liability under 17 U.S.C. § 512(f), including damages and attorneys' fees. If you are unsure whether your use constitutes infringement, consult an attorney before proceeding.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(data => {
            const result = formSchema.safeParse(data);
            if (!result.success) {
              const firstError = result.error.issues[0];
              toast.error(firstError?.message ?? "Please check all required fields");
              return;
            }
            submitMutation.mutate({
              ...data,
              consentToJurisdiction: true as const,
              consentToServiceOfProcess: true as const,
            });
          })} className="space-y-8">

            {/* Notice ID */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
              <h2 className="text-white font-semibold text-lg">1. Identify the Takedown Notice</h2>
              <p className="text-zinc-400 text-sm">Enter the notice ID from the takedown notification you received from Boptone.</p>

              <FormField
                control={form.control}
                name="noticeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Notice ID <span className="text-red-400">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter the notice ID from your notification email"
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Content identification */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
              <h2 className="text-white font-semibold text-lg">2. Identify the Removed Content</h2>

              <FormField
                control={form.control}
                name="identificationOfRemovedContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Description of Removed Content <span className="text-red-400">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the content that was removed, including its title, URL (if known), and any other identifying information."
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Good faith belief */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
              <h2 className="text-white font-semibold text-lg">3. Basis for Counter-Notice</h2>
              <p className="text-zinc-400 text-sm">Explain why you believe the content was removed in error. Common bases include: original work, licensed use, fair use, or public domain.</p>

              <FormField
                control={form.control}
                name="goodFaithBelief"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Good Faith Belief Statement <span className="text-red-400">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="I have a good faith belief that the content was removed as a result of mistake or misidentification because..."
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fairUseJustification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Fair Use Justification (if applicable)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="If your use qualifies as fair use, explain the purpose, nature, amount used, and effect on the market."
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseEvidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">License Evidence (if applicable)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="If you have a license to use the content, describe the license and provide any relevant details."
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="originalWorkEvidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Original Work Evidence (if applicable)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="If the content is your original work, describe when and how you created it."
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact & Declarations */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 space-y-5">
              <h2 className="text-white font-semibold text-lg">4. Contact Information & Declarations</h2>

              <FormField
                control={form.control}
                name="artistAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Physical Address <span className="text-red-400">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Your full physical address (required for service of process)"
                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[80px]"
                      />
                    </FormControl>
                    <p className="text-zinc-500 text-xs">Required by law. This address may be provided to the claimant for service of process.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="consentToJurisdiction"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="jurisdiction"
                          checked={field.value === true}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          className="mt-0.5 border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                        <Label htmlFor="jurisdiction" className="text-zinc-300 text-sm leading-relaxed cursor-pointer">
                          I consent to the jurisdiction of the Federal District Court for the judicial district in which my address is located, or if my address is outside of the United States, any judicial district in which Boptone may be found. <span className="text-red-400">*</span>
                        </Label>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consentToServiceOfProcess"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="serviceOfProcess"
                          checked={field.value === true}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          className="mt-0.5 border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:text-black"
                        />
                        <Label htmlFor="serviceOfProcess" className="text-zinc-300 text-sm leading-relaxed cursor-pointer">
                          I will accept service of process from the person who provided the original notification or an agent of such person. <span className="text-red-400">*</span>
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
                      Under penalty of perjury, I swear that I have a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material to be removed or disabled.
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
              {submitMutation.isPending ? "Submitting Counter-Notice..." : "Submit Counter-Notice"}
            </Button>

            <p className="text-zinc-500 text-xs text-center leading-relaxed">
              This counter-notice is a legal document. For questions, contact{" "}
              <a href="mailto:legal@boptone.com" className="text-zinc-300 hover:text-white">legal@boptone.com</a>.
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
