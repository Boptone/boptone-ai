/**
 * Shippo API Integration
 * Handles shipping rate calculation, label purchase, and tracking
 */

import { Shippo } from "shippo";
import * as ShippoSDK from "shippo/models/components";

// Initialize Shippo client
const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY || "",
});

export interface Address {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Parcel {
  length: number; // inches
  width: number; // inches
  height: number; // inches
  weight: number; // pounds
}

export interface ShippingRate {
  rateId: string;
  carrier: string;
  service: string;
  amount: number;
  currency: string;
  estimatedDays: number;
  provider: string;
}

export interface ShipmentResponse {
  shipmentId: string;
  rates: ShippingRate[];
}

export interface LabelResponse {
  transactionId: string;
  labelUrl: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  service: string;
  cost: number;
  currency: string;
}

/**
 * Calculate shipping rates for a shipment
 */
export async function calculateShippingRates(
  addressFrom: Address,
  addressTo: Address,
  parcel: Parcel
): Promise<ShipmentResponse> {
  try {
    const shipmentRequest: ShippoSDK.ShipmentCreateRequest = {
      addressFrom: {
        name: addressFrom.name,
        street1: addressFrom.street1,
        street2: addressFrom.street2 || "",
        city: addressFrom.city,
        state: addressFrom.state,
        zip: addressFrom.zip,
        country: addressFrom.country,
        phone: addressFrom.phone || "",
        email: addressFrom.email || "",
      },
      addressTo: {
        name: addressTo.name,
        street1: addressTo.street1,
        street2: addressTo.street2 || "",
        city: addressTo.city,
        state: addressTo.state,
        zip: addressTo.zip,
        country: addressTo.country,
        phone: addressTo.phone || "",
        email: addressTo.email || "",
      },
      parcels: [
        {
          length: parcel.length.toString(),
          width: parcel.width.toString(),
          height: parcel.height.toString(),
          distanceUnit: ShippoSDK.DistanceUnitEnum.In,
          weight: parcel.weight.toString(),
          massUnit: ShippoSDK.WeightUnitEnum.Lb,
        },
      ],
      async: false,
    };

    const shipment = await shippo.shipments.create(shipmentRequest);

    // Extract rates from shipment
    const rates: ShippingRate[] = (shipment.rates || [])
      .filter((rate): rate is ShippoSDK.Rate => typeof rate !== "string")
      .map((rate) => ({
        rateId: rate.objectId || "",
        carrier: rate.provider || "",
        service: rate.servicelevel?.name || "Standard",
        amount: parseFloat(rate.amount || "0"),
        currency: rate.currency || "USD",
        estimatedDays: rate.estimatedDays || 0,
        provider: rate.provider || "",
      }));

    // Sort rates by price (ascending)
    const sortedRates = rates.sort((a, b) => a.amount - b.amount);

    return {
      shipmentId: shipment.objectId || "",
      rates: sortedRates,
    };
  } catch (error: any) {
    console.error("[Shippo] Error calculating shipping rates:", error);
    throw new Error(`Failed to calculate shipping rates: ${error.message}`);
  }
}

/**
 * Purchase a shipping label
 */
export async function purchaseShippingLabel(
  rateId: string,
  labelFileType: ShippoSDK.LabelFileTypeEnum = ShippoSDK.LabelFileTypeEnum.Pdf
): Promise<LabelResponse> {
  try {
    const transactionRequest: ShippoSDK.TransactionCreateRequest = {
      rate: rateId,
      labelFileType: labelFileType,
      async: false,
    };

    const transaction = await shippo.transactions.create(transactionRequest);

    if (transaction.status !== "SUCCESS") {
      const errorMessages =
        transaction.messages
          ?.map((m) => (typeof m === "object" && m.text) || "")
          .join(", ") || "Unknown error";
      throw new Error(`Label purchase failed: ${errorMessages}`);
    }

    const rate =
      typeof transaction.rate === "object" ? transaction.rate : undefined;
    return {
      transactionId: transaction.objectId || "",
      labelUrl: transaction.labelUrl || "",
      trackingNumber: transaction.trackingNumber || "",
      trackingUrl: transaction.trackingUrlProvider || "",
      carrier: rate?.provider || "",
      service: rate?.servicelevelName || "",
      cost: parseFloat(rate?.amount || "0"),
      currency: rate?.currency || "USD",
    };
  } catch (error: any) {
    console.error("[Shippo] Error purchasing label:", error);
    throw new Error(`Failed to purchase shipping label: ${error.message}`);
  }
}

/**
 * Track a shipment
 * Note: Shippo SDK v2 doesn't have a direct tracking method, so we'll use REST API
 */
export async function trackShipment(
  carrier: string,
  trackingNumber: string
): Promise<any> {
  try {
    // Use fetch to call Shippo tracking API directly
    const response = await fetch(
      `https://api.goshippo.com/tracks/${carrier}/${trackingNumber}`,
      {
        headers: {
          Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Tracking API returned ${response.status}`);
    }

    const tracking = await response.json();

    const trackingHistory = (tracking.tracking_history || []).map(
      (event: any) => ({
        status: event.status || "",
        statusDetails: event.status_details || "",
        location: {
          city: event.location?.city,
          state: event.location?.state,
          country: event.location?.country,
        },
        eventDate: event.status_date || "",
      })
    );

    return {
      carrier: tracking.carrier || carrier,
      trackingNumber: tracking.tracking_number || trackingNumber,
      status: tracking.tracking_status?.status || "UNKNOWN",
      statusDetails: tracking.tracking_status?.status_details || "",
      estimatedDelivery: tracking.eta || undefined,
      trackingHistory,
    };
  } catch (error: any) {
    console.error("[Shippo] Error tracking shipment:", error);
    throw new Error(`Failed to track shipment: ${error.message}`);
  }
}

/**
 * Validate an address
 */
export async function validateAddress(address: Address): Promise<{
  isValid: boolean;
  validatedAddress?: Address;
  messages?: string[];
}> {
  try {
    const addressRequest: ShippoSDK.AddressCreateRequest = {
      name: address.name,
      street1: address.street1,
      street2: address.street2 || "",
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      phone: address.phone || "",
      email: address.email || "",
      validate: true,
    };

    const addressValidation = await shippo.addresses.create(addressRequest);

    const validationResults = addressValidation.validationResults;
    const isValid = validationResults?.isValid || false;

    return {
      isValid,
      validatedAddress: isValid
        ? {
            name: addressValidation.name || address.name,
            street1: addressValidation.street1 || address.street1,
            street2: addressValidation.street2 || address.street2,
            city: addressValidation.city || address.city,
            state: addressValidation.state || address.state,
            zip: addressValidation.zip || address.zip,
            country: addressValidation.country || address.country,
            phone: addressValidation.phone || address.phone,
            email: addressValidation.email || address.email,
          }
        : undefined,
      messages:
        validationResults?.messages?.map((m) => m.text || "").filter(Boolean) ||
        [],
    };
  } catch (error: any) {
    console.error("[Shippo] Error validating address:", error);
    return {
      isValid: false,
      messages: [error.message],
    };
  }
}
