import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, CheckCircle, AlertCircle, ArrowRight, Package } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";

/**
 * Cart Recovery Page
 * Handles abandoned cart recovery from email links.
 * URL: /cart/recover/:token
 *
 * Flow:
 * 1. User clicks recovery link in email → lands here with JWT token in URL
 * 2. If not logged in → redirect to login, return here after auth
 * 3. If logged in → call cart.recover mutation to restore cart from snapshot
 * 4. On success → redirect to /cart so user can complete checkout
 */
export default function CartRecover() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [recovered, setRecovered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract token from URL path: /cart/recover/:token
  const token = location.split("/cart/recover/")[1]?.split("?")[0] ?? "";

  const utils = trpc.useUtils();

  const recoverMutation = trpc.cart.recover.useMutation({
    onSuccess: (data) => {
      utils.cart.list.invalidate();
      utils.cart.count.invalidate();
      setRecovered(true);
      toastSuccess(`${data.itemCount} item${data.itemCount !== 1 ? "s" : ""} restored to your cart!`);
    },
    onError: (err) => {
      const msg = err.message || "Failed to recover cart. The link may have expired.";
      setError(msg);
      toastError(msg);
    },
  });

  // Once auth is confirmed and we have a token, trigger recovery
  useEffect(() => {
    if (!authLoading && isAuthenticated && token && !recovered && !error && !recoverMutation.isPending) {
      recoverMutation.mutate({ token });
    }
  }, [authLoading, isAuthenticated, token]);

  // Redirect to login if not authenticated, preserving the recovery URL
  if (!authLoading && !isAuthenticated) {
    const returnUrl = encodeURIComponent(`/cart/recover/${token}`);
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#0cc0df]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-[#0cc0df]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Sign in to recover your cart</h1>
          <p className="text-gray-600 mb-8">
            Your saved cart is waiting. Sign in to restore your items and complete your purchase.
          </p>
          <Button
            className="w-full bg-[#0cc0df] hover:bg-[#0aa8c4] text-white font-semibold py-3 rounded-xl"
            onClick={() => {
              window.location.href = getLoginUrl(`/cart/recover/${token}`);
            }}
          >
            Sign In to Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link href="/auth-signup" className="text-[#0cc0df] hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Loading / recovering state
  if (authLoading || recoverMutation.isPending) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#0cc0df] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Restoring your cart…</h2>
          <p className="text-gray-500">Just a moment while we bring back your items.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Link expired or invalid</h1>
          <p className="text-gray-600 mb-8">
            This recovery link has expired or is no longer valid. Recovery links are active for 72 hours after
            they are sent.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
              onClick={() => navigate("/shop/browse")}
            >
              <Package className="w-4 h-4 mr-2" />
              Browse Shop
            </Button>
            <Button
              className="bg-[#0cc0df] hover:bg-[#0aa8c4] text-white font-semibold rounded-xl"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              View Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state — cart restored, prompt user to go to cart
  if (recovered) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is back!</h1>
          <p className="text-gray-600 mb-8">
            We've restored the items you left behind. Head to your cart to complete your purchase.
          </p>
          <Button
            className="w-full bg-[#0cc0df] hover:bg-[#0aa8c4] text-white font-semibold py-3 rounded-xl text-base"
            onClick={() => navigate("/cart")}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Go to Cart &amp; Checkout
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Changed your mind?{" "}
            <Link href="/shop/browse" className="text-[#0cc0df] hover:underline">
              Keep browsing
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Fallback — should not reach here
  return (
    <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#0cc0df] mx-auto mb-4" />
        <p className="text-gray-600">Loading…</p>
      </div>
    </div>
  );
}
