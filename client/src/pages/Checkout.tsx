import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, Lock, Package, Truck } from "lucide-react";
import { toast } from "sonner";

/**
 * Checkout Page
 * Collects shipping info and processes BopShop orders via Stripe
 */
export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [currency, setCurrency] = useState("USD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedShippingRate, setSelectedShippingRate] = useState<string | null>(null);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [isCalculatingRates, setIsCalculatingRates] = useState(false);

  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  // Fetch cart
  const { data: cartItems, isLoading } = trpc.ecommerce.cart.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Get supported currencies
  const { data: currencies } = trpc.payment.getCurrencies.useQuery();

  // Calculate shipping rates mutation
  const calculateRatesMutation = trpc.shipping.calculateRates.useMutation({
    onSuccess: (data) => {
      setShippingRates(data.rates);
      setIsCalculatingRates(false);
      if (data.rates.length > 0) {
        // Auto-select cheapest rate
        const cheapest = data.rates.reduce((prev, curr) =>
          curr.amount < prev.amount ? curr : prev
        );
        setSelectedShippingRate(cheapest.rateId);
        toast.success(`Found ${data.rates.length} shipping options`);
      } else {
        toast.error("No shipping rates available for this address");
      }
    },
    onError: (error) => {
      setIsCalculatingRates(false);
      toast.error(error.message || "Failed to calculate shipping rates");
    },
  });

  // Auto-calculate rates when address is complete
  useEffect(() => {
    const isAddressComplete =
      shippingForm.line1 &&
      shippingForm.city &&
      shippingForm.state &&
      shippingForm.zip &&
      shippingForm.country;

    if (isAddressComplete && cartItems && cartItems.length > 0 && !isCalculatingRates) {
      // Debounce rate calculation
      const timer = setTimeout(() => {
        handleCalculateRates();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shippingForm.line1, shippingForm.city, shippingForm.state, shippingForm.zip, shippingForm.country, cartItems]);

  const handleCalculateRates = () => {
    if (!cartItems || cartItems.length === 0) return;

    setIsCalculatingRates(true);

    // TODO: Get actual product dimensions from cart items
    // For now, use default parcel size
    const parcel = {
      length: 12, // inches
      width: 9,
      height: 3,
      weight: 2, // pounds
    };

    // Use first cart item's order ID (or create a temporary one)
    const orderId = 1; // TODO: Get from cart or create pending order

    calculateRatesMutation.mutate({
      orderId,
      addressTo: {
        name: shippingForm.name,
        street1: shippingForm.line1,
        street2: shippingForm.line2,
        city: shippingForm.city,
        state: shippingForm.state,
        zip: shippingForm.zip,
        country: shippingForm.country,
        phone: shippingForm.phone,
      },
      parcel,
    });
  };

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const isEmpty = !cartItems || cartItems.length === 0;
  if (isEmpty) {
    setLocation("/cart");
    return null;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

  // Get selected shipping rate details
  const selectedRate = shippingRates.find((rate) => rate.rateId === selectedShippingRate);
  const shippingCost = selectedRate ? selectedRate.amount * 100 : 0; // Convert to cents
  const total = subtotal + shippingCost;

  // Create checkout mutation
  const createCheckout = trpc.payment.createBopShopCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast.error("Failed to create checkout session");
        setIsProcessing(false);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process checkout");
      setIsProcessing(false);
    },
  });

  const handleCheckout = async () => {
    // Validate form
    if (!shippingForm.name || !shippingForm.email || !shippingForm.line1 ||
        !shippingForm.city || !shippingForm.state || !shippingForm.zip) {
      toast.error("Please fill in all required shipping fields");
      return;
    }

    if (!selectedShippingRate) {
      toast.error("Please select a shipping method");
      return;
    }

    setIsProcessing(true);

    // For now, we'll use the first cart item's product for checkout
    // In a real implementation, you'd want to handle multiple items
    const firstItem = cartItems[0];

    createCheckout.mutate({
      productId: firstItem.productId,
      variantId: firstItem.variantId,
      quantity: firstItem.quantity,
      currency: currency,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-6xl font-bold mb-2">Checkout</h1>
              <p className="text-2xl text-gray-600">
                Complete your order securely
              </p>
            </div>
            <Link href="/cart">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Cart
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-lg">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingForm.email}
                    onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors text-lg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-lg">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingForm.phone}
                    onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h2 className="text-3xl font-bold mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-lg">Full Name *</Label>
                  <Input
                    id="name"
                    value={shippingForm.name}
                    onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors text-lg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="line1" className="text-lg">Address Line 1 *</Label>
                  <Input
                    id="line1"
                    value={shippingForm.line1}
                    onChange={(e) => setShippingForm({ ...shippingForm, line1: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors text-lg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="line2" className="text-lg">Address Line 2</Label>
                  <Input
                    id="line2"
                    value={shippingForm.line2}
                    onChange={(e) => setShippingForm({ ...shippingForm, line2: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors text-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-lg">City *</Label>
                    <Input
                      id="city"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                      className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors text-lg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-lg">State/Province *</Label>
                    <Input
                      id="state"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                      className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors text-lg"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip" className="text-lg">ZIP/Postal Code *</Label>
                    <Input
                      id="zip"
                      value={shippingForm.zip}
                      onChange={(e) => setShippingForm({ ...shippingForm, zip: e.target.value })}
                      className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors text-lg"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-lg">Country *</Label>
                    <Select value={shippingForm.country} onValueChange={(value) => setShippingForm({ ...shippingForm, country: value })}>
                      <SelectTrigger className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="DE">Germany</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="JP">Japan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            {shippingRates.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="h-8 w-8" />
                  <h2 className="text-3xl font-bold">Shipping Method</h2>
                </div>

                <RadioGroup value={selectedShippingRate || ""} onValueChange={setSelectedShippingRate}>
                  <div className="space-y-3">
                    {shippingRates.map((rate) => (
                      <div
                        key={rate.rateId}
                        className={`flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                          selectedShippingRate === rate.rateId
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        onClick={() => setSelectedShippingRate(rate.rateId)}
                      >
                        <RadioGroupItem value={rate.rateId} id={rate.rateId} />
                        <Label
                          htmlFor={rate.rateId}
                          className="flex-1 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-lg">
                              {rate.carrier} - {rate.service}
                            </div>
                            <div className="text-sm text-gray-600">
                              {rate.estimatedDays > 0
                                ? `Estimated ${rate.estimatedDays} business days`
                                : "Standard delivery"}
                            </div>
                          </div>
                          <div className="font-bold text-xl">
                            ${rate.amount.toFixed(2)}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Loading Rates */}
            {isCalculatingRates && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 animate-pulse" />
                  <p className="text-lg text-gray-600">Calculating shipping rates...</p>
                </div>
              </div>
            )}

            {/* Currency Selection */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h2 className="text-3xl font-bold mb-6">Payment Currency</h2>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies?.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sticky top-4">
              <h2 className="text-3xl font-bold mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.product?.primaryImageUrl && (
                        <img
                          src={item.product.primaryImageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm line-clamp-2">
                        {item.product?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </div>
                      <div className="text-sm font-bold">
                        ${((item.priceAtAdd * item.quantity) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold">${(subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Shipping</span>
                  {selectedRate ? (
                    <span className="font-bold">${selectedRate.amount.toFixed(2)}</span>
                  ) : (
                    <span className="font-medium text-gray-500">
                      {isCalculatingRates ? "Calculating..." : "Enter address"}
                    </span>
                  )}
                </div>
                <div className="border-t-2 border-gray-200 pt-3">
                  <div className="flex justify-between text-2xl">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${(total / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessing || !selectedShippingRate}
                className="w-full bg-black text-white text-xl py-6 rounded-xl shadow-[4px_4px_0px_#81e6fe] hover:shadow-[2px_2px_0px_#81e6fe] transition-all disabled:opacity-50"
              >
                <Lock className="mr-2 h-5 w-5" />
                {isProcessing ? "Processing..." : "Complete Order"}
              </Button>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Secure checkout powered by Stripe
                </p>
                <p className="text-xs text-gray-400 text-center">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
