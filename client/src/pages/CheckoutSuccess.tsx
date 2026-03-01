import { useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Package } from "lucide-react";

/**
 * Checkout Success Page
 * Displays order confirmation after successful Stripe payment
 */
export default function CheckoutSuccess() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const sessionId = params.get("session_id");
  
  const { data: session, isLoading } = trpc.checkout.getSession.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );
  
  // Clear cart after successful checkout
  const utils = trpc.useUtils();
  const markActivationStep = trpc.activation.markStepComplete.useMutation();
  const activationFired = useRef(false);
  useEffect(() => {
    if (session && session.status === "paid") {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
      // Fire activation step: first BopShop purchase (once per session)
      if (!activationFired.current) {
        activationFired.current = true;
        markActivationStep.mutate({ stepKey: "make_first_sale" });
      }
    }
  }, [session, utils]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#0cc0df] mx-auto mb-4" />
          <p className="text-xl text-gray-600">Confirming your order...</p>
        </div>
      </div>
    );
  }
  
  if (!session || session.status !== "paid") {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-8">Unable to confirm your order</p>
          <Link href="/cart">
            <Button
              size="lg"
              className="rounded-full bg-[#0cc0df] hover:bg-[#0aa0bf] text-black text-lg font-bold h-14 px-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Return to Cart
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#f8f8f6] py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
          </div>
          
          {/* Success Message */}
          <h1 className="text-5xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-2xl text-gray-600 mb-12">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          
          {/* Order Details */}
          <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 mb-8 text-left">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Order Number</span>
                <span className="font-bold">{session.id.slice(-8).toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Email</span>
                <span className="font-bold">{session.customerEmail}</span>
              </div>
              
              <div className="border-t-2 border-black pt-4">
                <div className="flex justify-between text-2xl">
                  <span className="font-bold">Total Paid</span>
                  <span className="font-bold text-[#0cc0df]">
                    ${((session.amountTotal || 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="bg-gray-50 border-2 border-black rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <Package className="w-8 h-8 text-[#0cc0df] flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="text-xl font-bold mb-2">What's Next?</h3>
                <p className="text-gray-600">
                  You'll receive an order confirmation email shortly. We'll send you another email with tracking information once your order ships.
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button
                size="lg"
                className="rounded-full bg-[#0cc0df] hover:bg-[#0aa0bf] text-black text-lg font-bold h-14 px-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Continue Shopping
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-black text-black text-lg font-bold h-14 px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
