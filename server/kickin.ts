import { getDb } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Since artistPaymentMethods and kickInTips tables don't exist in schema yet,
// we'll create simple in-memory storage for now and define the tables

// Temporary storage until tables are added
const paymentMethodsStore: Map<number, any[]> = new Map();
const tipsStore: Map<number, any[]> = new Map();

export async function getArtistPaymentMethods(artistId: number) {
  return paymentMethodsStore.get(artistId) || [];
}

export async function addPaymentMethod(
  artistId: number, 
  type: string, 
  handle: string, 
  isPrimary?: boolean
) {
  const methods = paymentMethodsStore.get(artistId) || [];
  
  // If setting as primary, unset other primaries first
  if (isPrimary) {
    methods.forEach(m => m.isPrimary = false);
  }
  
  const newMethod = {
    id: Date.now(),
    artistId,
    type,
    handle,
    isPrimary: isPrimary || methods.length === 0,
    createdAt: new Date(),
  };
  
  methods.push(newMethod);
  paymentMethodsStore.set(artistId, methods);
  
  return { success: true, id: newMethod.id };
}

export async function removePaymentMethod(artistId: number, methodId: number) {
  const methods = paymentMethodsStore.get(artistId) || [];
  const filtered = methods.filter(m => m.id !== methodId);
  paymentMethodsStore.set(artistId, filtered);
  return { success: true };
}

export async function setPrimaryPaymentMethod(artistId: number, methodId: number) {
  const methods = paymentMethodsStore.get(artistId) || [];
  methods.forEach(m => {
    m.isPrimary = m.id === methodId;
  });
  paymentMethodsStore.set(artistId, methods);
  return { success: true };
}

export async function recordTip(input: {
  artistId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  fanEmail?: string;
  fanName?: string;
  message?: string;
}) {
  const tips = tipsStore.get(input.artistId) || [];
  
  const newTip = {
    id: Date.now(),
    artistId: input.artistId,
    amount: input.amount.toString(),
    currency: input.currency,
    paymentMethod: input.paymentMethod,
    fanEmail: input.fanEmail,
    fanName: input.fanName,
    message: input.message,
    status: 'pending',
    createdAt: new Date(),
  };
  
  tips.push(newTip);
  tipsStore.set(input.artistId, tips);
  
  return { success: true, tipId: newTip.id };
}

export async function getArtistTips(artistId: number, limit: number, offset: number) {
  const tips = tipsStore.get(artistId) || [];
  return tips.slice(offset, offset + limit).reverse();
}

export async function getTipStats(artistId: number) {
  const tips = tipsStore.get(artistId) || [];
  const total = tips.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const verified = tips.filter(t => t.status === 'verified').length;
  return { total, count: tips.length, verified };
}

export async function verifyTip(artistId: number, tipId: number) {
  const tips = tipsStore.get(artistId) || [];
  const tip = tips.find(t => t.id === tipId);
  if (tip) {
    tip.status = 'verified';
  }
  return { success: true };
}

export async function updateTaxSettings(artistId: number, country: string) {
  return { success: true, country };
}

export async function getTaxReport(artistId: number, year: number) {
  const tips = tipsStore.get(artistId) || [];
  const yearTips = tips.filter(t => 
    new Date(t.createdAt).getFullYear() === year
  );
  const total = yearTips.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  return { total, tips: yearTips };
}
