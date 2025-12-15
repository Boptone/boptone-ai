import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Heart, DollarSign, ExternalLink, Check, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Payment method icons as SVG components
const PaymentIcons = {
  paypal: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
    </svg>
  ),
  venmo: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M19.616 3.426c.585.957.848 1.943.848 3.193 0 3.979-3.396 9.149-6.15 12.781H6.865L4.4 3.66l6.469-.586 1.312 10.541c1.223-1.992 2.734-5.12 2.734-7.261 0-1.193-.205-2.008-.527-2.67l5.228-.258z"/>
    </svg>
  ),
  zelle: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M13.559 24h-2.841a.483.483 0 0 1-.483-.483v-6.276H4.5a.5.5 0 0 1-.5-.5v-2.5a.5.5 0 0 1 .5-.5h5.735V9.259H4.5a.5.5 0 0 1-.5-.5v-2.5a.5.5 0 0 1 .5-.5h4.441L4.16 1.277A.5.5 0 0 1 4.5.5h3.118a.5.5 0 0 1 .386.183l5.555 6.576V.483c0-.267.216-.483.483-.483h2.841c.267 0 .483.216.483.483v6.276H19.5a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-.5.5h-2.134v4.482H19.5a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-.5.5h-2.941l4.282 5.482a.5.5 0 0 1-.394.777h-3.118a.5.5 0 0 1-.394-.192l-5.376-6.89v6.599a.483.483 0 0 1-.483.483z"/>
    </svg>
  ),
  cashapp: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M23.59 3.475a5.1 5.1 0 0 0-3.05-3.05c-1.31-.42-2.5-.42-4.92-.42H8.36c-2.4 0-3.61 0-4.9.4a5.1 5.1 0 0 0-3.05 3.06C0 4.765 0 5.965 0 8.365v7.27c0 2.41 0 3.6.4 4.9a5.1 5.1 0 0 0 3.05 3.05c1.3.41 2.5.41 4.9.41h7.28c2.41 0 3.61 0 4.9-.4a5.1 5.1 0 0 0 3.06-3.06c.41-1.3.41-2.5.41-4.9v-7.25c0-2.41 0-3.61-.41-4.91zM17.42 8.19l-.93.93a.5.5 0 0 1-.67.01 5 5 0 0 0-3.22-1.18c-.97 0-1.94.32-1.94 1.21 0 .9 1.04 1.2 2.24 1.65 2.1.7 3.84 1.58 3.84 3.64 0 2.24-1.74 3.78-4.58 4.02v1.93a.5.5 0 0 1-.5.5H9.64a.5.5 0 0 1-.5-.5v-1.86c-1.69-.12-2.96-.52-4.26-1.37a.5.5 0 0 1-.08-.75l1.03-1.03a.5.5 0 0 1 .63-.06c.93.63 1.99.95 3.01.95 1.36 0 2.05-.52 2.05-1.27 0-.9-.79-1.18-2.28-1.73-2.23-.75-3.6-1.68-3.6-3.57 0-2.1 1.63-3.56 4.34-3.87V5.6a.5.5 0 0 1 .5-.5h2.02a.5.5 0 0 1 .5.5v1.73c1.12.07 2.18.36 3.28.94a.5.5 0 0 1 .14.78z"/>
    </svg>
  ),
  apple_cash: () => (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
    </svg>
  ),
};

const paymentMethodColors: Record<string, string> = {
  paypal: "#003087",
  venmo: "#3D95CE",
  zelle: "#6D1ED4",
  cashapp: "#00D632",
  apple_cash: "#000000",
};

interface KickInModalProps {
  artistId: number;
  artistName: string;
  trigger?: React.ReactNode;
}

export function KickInModal({ artistId, artistName, trigger }: KickInModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"amount" | "method" | "confirm" | "success">("amount");
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [fanName, setFanName] = useState("");
  const [fanEmail, setFanEmail] = useState("");
  const [message, setMessage] = useState("");
  const [copiedHandle, setCopiedHandle] = useState(false);

  const { data: paymentData, isLoading } = trpc.kickIn.getArtistPaymentMethods.useQuery(
    { artistId },
    { enabled: open }
  );

  const recordTipMutation = trpc.kickIn.recordTip.useMutation({
    onSuccess: () => {
      setStep("success");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const selectedMethodData = paymentData?.methods.find(m => m.method === selectedMethod);

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      toast.error("Please enter an amount of at least $1.00");
      return;
    }
    setStep("method");
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setStep("confirm");
  };

  const handleConfirmTip = () => {
    if (!selectedMethod) return;
    
    recordTipMutation.mutate({
      artistId,
      amount: Math.round(parseFloat(amount) * 100), // Convert to cents
      paymentMethod: selectedMethod as any,
      fanName: fanName || undefined,
      fanEmail: fanEmail || undefined,
      message: message || undefined,
    });
  };

  const copyHandle = () => {
    if (selectedMethodData?.handle) {
      navigator.clipboard.writeText(selectedMethodData.handle);
      setCopiedHandle(true);
      toast.success("Handle copied to clipboard!");
      setTimeout(() => setCopiedHandle(false), 2000);
    }
  };

  const getPaymentUrl = () => {
    if (!selectedMethodData) return null;
    const info = selectedMethodData.info;
    if (info?.urlPrefix) {
      return `${info.urlPrefix}${selectedMethodData.handle.replace(/^[@$]/, '')}`;
    }
    return null;
  };

  const resetModal = () => {
    setStep("amount");
    setAmount("");
    setSelectedMethod(null);
    setFanName("");
    setFanEmail("");
    setMessage("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetModal();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            className="gap-2 border-pink-500/50 text-pink-500 hover:bg-pink-500/10 hover:text-pink-400"
          >
            <Heart className="h-4 w-4" />
            Kick In
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Kick In to {artistName}
          </DialogTitle>
          <DialogDescription>
            {step === "amount" && "Show your support with a tip"}
            {step === "method" && "Choose your payment method"}
            {step === "confirm" && "Complete your tip"}
            {step === "success" && "Thank you for your support!"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : paymentData?.methods.length === 0 ? (
          <div className="py-8 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              This artist hasn't set up their tip jar yet.
            </p>
          </div>
        ) : (
          <>
            {/* Step 1: Amount */}
            {step === "amount" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Tip Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="5.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                {/* Quick amount buttons */}
                <div className="flex gap-2">
                  {[5, 10, 20, 50].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                      className={cn(
                        amount === preset.toString() && "border-primary bg-primary/10"
                      )}
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>

                <Button 
                  onClick={handleAmountSubmit} 
                  className="w-full"
                  disabled={!amount || parseFloat(amount) < 1}
                >
                  Continue
                </Button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === "method" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select how you'd like to send ${amount}
                </p>
                <div className="grid gap-2">
                  {paymentData?.methods.map((method) => {
                    const Icon = PaymentIcons[method.method as keyof typeof PaymentIcons];
                    const color = paymentMethodColors[method.method];
                    return (
                      <Button
                        key={method.method}
                        variant="outline"
                        className="justify-start gap-3 h-14"
                        onClick={() => handleMethodSelect(method.method)}
                      >
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          {Icon && <Icon />}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{method.info?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {method.displayName || method.handle}
                          </div>
                        </div>
                        {method.isPrimary && (
                          <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Preferred
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
                <Button variant="ghost" onClick={() => setStep("amount")} className="w-full">
                  Back
                </Button>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === "confirm" && selectedMethodData && (
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-lg border text-center"
                  style={{ 
                    borderColor: `${paymentMethodColors[selectedMethod!]}40`,
                    backgroundColor: `${paymentMethodColors[selectedMethod!]}10`
                  }}
                >
                  <p className="text-2xl font-bold">${amount}</p>
                  <p className="text-sm text-muted-foreground">
                    via {selectedMethodData.info?.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Send to:</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1 text-sm font-mono">
                      {selectedMethodData.handle}
                    </code>
                    <Button variant="ghost" size="sm" onClick={copyHandle}>
                      {copiedHandle ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {getPaymentUrl() && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => window.open(getPaymentUrl()!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fanName">Your Name (optional)</Label>
                  <Input
                    id="fanName"
                    placeholder="Anonymous"
                    value={fanName}
                    onChange={(e) => setFanName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Love your music!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  After sending your tip via {selectedMethodData.info?.name}, click below to confirm. 
                  This helps the artist track their earnings for tax purposes.
                </p>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("method")} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={handleConfirmTip} 
                    className="flex-1"
                    disabled={recordTipMutation.isPending}
                  >
                    {recordTipMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "I've Sent the Tip"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === "success" && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Thank You!</h3>
                  <p className="text-muted-foreground">
                    Your support means the world to {artistName}.
                  </p>
                </div>
                <Button onClick={() => handleOpenChange(false)} className="w-full">
                  Done
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
