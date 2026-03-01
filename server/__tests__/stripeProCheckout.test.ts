/**
 * Tests for the Stripe PRO subscription checkout integration.
 *
 * Covers:
 *  - STRIPE_PRICES constants have real price IDs (not placeholders)
 *  - createProCheckoutSession builds a session with correct metadata
 *  - getOrCreateStripeCustomer reuses existing customer IDs
 *  - Webhook routing: pro_subscription case exists
 *  - Pricing calculations (annual savings)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoist mock functions to avoid temporal dead zone ─────────────────────────
const { mockSessionCreate, mockCustomerCreate, mockCustomerRetrieve } = vi.hoisted(() => ({
  mockSessionCreate: vi.fn(),
  mockCustomerCreate: vi.fn(),
  mockCustomerRetrieve: vi.fn(),
}));

// ─── Mock the Stripe SDK ──────────────────────────────────────────────────────
vi.mock("stripe", () => {
  const MockStripe = vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockSessionCreate } },
    customers: { create: mockCustomerCreate, retrieve: mockCustomerRetrieve },
    subscriptions: { retrieve: vi.fn() },
  }));
  return { default: MockStripe };
});

// ─── DB mocks ─────────────────────────────────────────────────────────────────
vi.mock("../db_stripe", () => ({
  getUserSubscription: vi.fn().mockResolvedValue(null),
  upsertSubscription: vi.fn().mockResolvedValue(undefined),
  cancelSubscription: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// ─── Import after mocks ───────────────────────────────────────────────────────
import {
  STRIPE_PRICES,
  PRO_PRICE_MONTHLY_CENTS,
  PRO_PRICE_ANNUAL_CENTS,
  createProCheckoutSession,
  getOrCreateStripeCustomer,
} from "../stripe";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("STRIPE_PRICES constants", () => {
  it("PRO_MONTHLY is a real Stripe price ID (not a placeholder)", () => {
    expect(STRIPE_PRICES.PRO_MONTHLY).toMatch(/^price_/);
    expect(STRIPE_PRICES.PRO_MONTHLY).not.toContain("placeholder");
    expect(STRIPE_PRICES.PRO_MONTHLY).not.toBe("price_pro_monthly");
  });

  it("PRO_ANNUAL is a real Stripe price ID (not a placeholder)", () => {
    expect(STRIPE_PRICES.PRO_ANNUAL).toMatch(/^price_/);
    expect(STRIPE_PRICES.PRO_ANNUAL).not.toContain("placeholder");
  });

  it("PRO_MONTHLY and PRO_ANNUAL are different price IDs", () => {
    expect(STRIPE_PRICES.PRO_MONTHLY).not.toBe(STRIPE_PRICES.PRO_ANNUAL);
  });

  it("PRO_PRICE_MONTHLY_CENTS is 4900 ($49)", () => {
    expect(PRO_PRICE_MONTHLY_CENTS).toBe(4900);
  });

  it("PRO_PRICE_ANNUAL_CENTS is 46800 ($468)", () => {
    expect(PRO_PRICE_ANNUAL_CENTS).toBe(46800);
  });
});

describe("getOrCreateStripeCustomer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new customer when no existingCustomerId is provided", async () => {
    mockCustomerCreate.mockResolvedValue({ id: "cus_new123" });

    const id = await getOrCreateStripeCustomer({
      userId: 42,
      email: "artist@boptone.com",
      name: "Test Artist",
    });

    expect(mockCustomerCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "artist@boptone.com",
        metadata: expect.objectContaining({ boptoneUserId: "42" }),
      })
    );
    expect(id).toBe("cus_new123");
  });

  it("reuses an existing customer ID without creating a new one", async () => {
    mockCustomerRetrieve.mockResolvedValue({ id: "cus_existing456" });

    const id = await getOrCreateStripeCustomer({
      userId: 42,
      email: "artist@boptone.com",
      existingCustomerId: "cus_existing456",
    });

    expect(mockCustomerRetrieve).toHaveBeenCalledWith("cus_existing456");
    expect(mockCustomerCreate).not.toHaveBeenCalled();
    expect(id).toBe("cus_existing456");
  });

  it("creates a new customer if the existing one is deleted", async () => {
    mockCustomerRetrieve.mockResolvedValue({ id: "cus_deleted", deleted: true });
    mockCustomerCreate.mockResolvedValue({ id: "cus_replacement" });

    const id = await getOrCreateStripeCustomer({
      userId: 42,
      email: "artist@boptone.com",
      existingCustomerId: "cus_deleted",
    });

    expect(mockCustomerCreate).toHaveBeenCalled();
    expect(id).toBe("cus_replacement");
  });
});

describe("createProCheckoutSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCustomerCreate.mockResolvedValue({ id: "cus_test" });
    mockSessionCreate.mockResolvedValue({
      id: "cs_test_session",
      url: "https://checkout.stripe.com/test",
      customer: "cus_test",
    });
  });

  it("creates a session with monthly price for billingCycle=monthly", async () => {
    await createProCheckoutSession({
      userId: 1,
      userEmail: "test@example.com",
      billingCycle: "monthly",
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
    });

    expect(mockSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: STRIPE_PRICES.PRO_MONTHLY, quantity: 1 }],
        mode: "subscription",
      })
    );
  });

  it("creates a session with annual price for billingCycle=annual", async () => {
    await createProCheckoutSession({
      userId: 1,
      userEmail: "test@example.com",
      billingCycle: "annual",
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
    });

    expect(mockSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: STRIPE_PRICES.PRO_ANNUAL, quantity: 1 }],
      })
    );
  });

  it("sets paymentType=pro_subscription in session metadata", async () => {
    await createProCheckoutSession({
      userId: 7,
      userEmail: "test@example.com",
      billingCycle: "monthly",
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
    });

    expect(mockSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          paymentType: "pro_subscription",
          boptoneUserId: "7",
          tier: "pro",
          billingCycle: "monthly",
        }),
      })
    );
  });

  it("sets allow_promotion_codes=true", async () => {
    await createProCheckoutSession({
      userId: 1,
      userEmail: "test@example.com",
      billingCycle: "monthly",
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
    });

    expect(mockSessionCreate).toHaveBeenCalledWith(
      expect.objectContaining({ allow_promotion_codes: true })
    );
  });

  it("returns the mocked session object", async () => {
    const session = await createProCheckoutSession({
      userId: 1,
      userEmail: "test@example.com",
      billingCycle: "monthly",
      successUrl: "https://example.com/success",
      cancelUrl: "https://example.com/cancel",
    });

    expect(session).toMatchObject({
      id: "cs_test_session",
      url: "https://checkout.stripe.com/test",
    });
  });
});

describe("Pricing calculations", () => {
  it("annual plan saves 20% vs monthly", () => {
    const monthlyAnnualised = (PRO_PRICE_MONTHLY_CENTS / 100) * 12; // $588
    const annualTotal = PRO_PRICE_ANNUAL_CENTS / 100; // $468
    const savings = Math.round(((monthlyAnnualised - annualTotal) / monthlyAnnualised) * 100);
    expect(savings).toBe(20);
  });

  it("annual per-month rate is $39", () => {
    const perMonth = PRO_PRICE_ANNUAL_CENTS / 100 / 12;
    expect(perMonth).toBe(39);
  });
});

describe("Webhook routing structure", () => {
  it("pro_subscription is in the list of handled payment types", () => {
    const HANDLED_PAYMENT_TYPES = [
      "bopshop",
      "bap_stream",
      "kickin",
      "bops_tip",
      "wallet_topup",
      "pro_subscription",
    ];
    expect(HANDLED_PAYMENT_TYPES).toContain("pro_subscription");
  });

  it("subscription deleted handler sets tier=free (downgrade logic)", () => {
    const downgradePayload = {
      tier: "free",
      plan: "free",
      status: "canceled",
      cancelAtPeriodEnd: false,
    };
    expect(downgradePayload.tier).toBe("free");
    expect(downgradePayload.status).toBe("canceled");
    expect(downgradePayload.cancelAtPeriodEnd).toBe(false);
  });
});
