import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

/**
 * Shopping Cart Page
 * Displays cart items with quantity controls and checkout
 */
export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Fetch cart
  const { data: cartItems, isLoading } = trpc.ecommerce.cart.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Update cart item
  const updateCart = trpc.ecommerce.cart.update.useMutation({
    onSuccess: () => {
      utils.ecommerce.cart.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update cart");
    },
  });

  // Remove from cart
  const removeFromCart = trpc.ecommerce.cart.remove.useMutation({
    onSuccess: () => {
      utils.ecommerce.cart.get.invalidate();
      toast.success("Item removed from cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove item");
    },
  });

  // Clear cart
  const clearCart = trpc.ecommerce.cart.clear.useMutation({
    onSuccess: () => {
      utils.ecommerce.cart.get.invalidate();
      toast.success("Cart cleared");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to clear cart");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">Sign in to view your cart</h1>
          <p className="text-xl text-gray-600 mb-8">
            You need to be signed in to add items to your cart
          </p>
          <a href={getLoginUrl()}>
            <Button
              size="lg"
              className="bg-black text-white text-xl px-8 py-6 rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all"
            >
              Sign In
            </Button>
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading cart...</div>
      </div>
    );
  }

  const subtotal = cartItems?.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0) || 0;
  const isEmpty = !cartItems || cartItems.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-bold mb-2">Shopping Cart</h1>
              <p className="text-2xl text-gray-600">
                {isEmpty ? "Your cart is empty" : `${cartItems.length} item${cartItems.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <Link href="/bopshop">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {isEmpty ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-32 w-32 text-gray-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-xl text-gray-600 mb-8">
              Start shopping to add items to your cart
            </p>
            <Link href="/bopshop">
              <Button
                size="lg"
                className="bg-black text-white text-xl px-8 py-6 rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all"
              >
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-colors"
                >
                  <div className="flex gap-6">
                    {/* Product Image - BAP Protocol */}
                    <div className="w-32 h-32 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden border-2 border-gray-200">
                      {item.product?.primaryImageUrl ? (
                        <img
                          src={item.product.primaryImageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">
                        {item.product?.name || "Product"}
                      </h3>
                      <p className="text-xl text-gray-600 mb-4">
                        ${(item.priceAtAdd / 100).toFixed(2)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateCart.mutate({
                                id: item.id,
                                quantity: item.quantity - 1,
                              });
                            }
                          }}
                          className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-xl font-bold w-12 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateCart.mutate({
                              id: item.id,
                              quantity: item.quantity + 1,
                            });
                          }}
                          className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total & Remove */}
                    <div className="text-right">
                      <div className="text-2xl font-bold mb-4">
                        ${((item.priceAtAdd * item.quantity) / 100).toFixed(2)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart.mutate({ id: item.id })}
                        className="border-2 border-red-200 text-red-600 rounded-lg hover:border-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <Button
                variant="outline"
                onClick={() => clearCart.mutate()}
                className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
              >
                Clear Cart
              </Button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sticky top-4">
                <h2 className="text-3xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-xl">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-bold">${(subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between text-2xl">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">${(subtotal / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Link href="/checkout">
                  <Button
                    size="lg"
                    className="w-full bg-black text-white text-xl py-6 rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all"
                  >
                    Proceed to Checkout
                  </Button>
                </Link>

                <p className="text-sm text-gray-500 text-center mt-4">
                  Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
