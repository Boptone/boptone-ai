import { getDb } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

// Temporary in-memory storage until proper tables are created
const smartLinksStore: Map<number, any[]> = new Map();
const linkClicksStore: any[] = [];
const fanProfilesStore: Map<number, any[]> = new Map();

let linkIdCounter = 1;
let fanIdCounter = 1;

function generateShortCode(): string {
  return Math.random().toString(36).substring(2, 10);
}

export async function createSmartLink(artistId: number, input: {
  name: string;
  destinationUrl: string;
  campaign?: string;
}) {
  const links = smartLinksStore.get(artistId) || [];
  const shortCode = generateShortCode();
  
  const newLink = {
    id: linkIdCounter++,
    artistId,
    name: input.name,
    shortCode,
    destinationUrl: input.destinationUrl,
    campaign: input.campaign,
    clickCount: 0,
    createdAt: new Date(),
  };
  
  links.push(newLink);
  smartLinksStore.set(artistId, links);
  
  return { 
    success: true, 
    id: newLink.id,
    shortCode,
    url: `/l/${shortCode}`
  };
}

export async function getSmartLinks(artistId: number) {
  return smartLinksStore.get(artistId) || [];
}

export async function trackClick(linkId: number, source?: string, referrer?: string) {
  // Find the link using Array.from to avoid iteration issues
  const entries = Array.from(smartLinksStore.entries());
  for (const [artistId, links] of entries) {
    const link = links.find((l: any) => l.id === linkId);
    if (link) {
      link.clickCount++;
      
      linkClicksStore.push({
        id: Date.now(),
        linkId,
        source,
        referrer,
        createdAt: new Date(),
      });
      
      return link.destinationUrl;
    }
  }
  return null;
}

export async function getFans(artistId: number, input: {
  stage?: string;
  limit: number;
  offset: number;
}) {
  let fans = fanProfilesStore.get(artistId) || [];
  
  if (input.stage) {
    fans = fans.filter((f: any) => f.funnelStage === input.stage);
  }
  
  return fans
    .sort((a: any, b: any) => b.fanScore - a.fanScore)
    .slice(input.offset, input.offset + input.limit);
}

export async function getFanStats(artistId: number) {
  const fans = fanProfilesStore.get(artistId) || [];
  
  const byStage = fans.reduce((acc: Record<string, number>, fan: any) => {
    acc[fan.funnelStage] = (acc[fan.funnelStage] || 0) + 1;
    return acc;
  }, {});
  
  return { total: fans.length, byStage };
}

export async function getFunnelData(artistId: number) {
  const stats = await getFanStats(artistId);
  
  return {
    stages: [
      { name: 'Discovered', count: stats.byStage['discovered'] || 0 },
      { name: 'Follower', count: stats.byStage['follower'] || 0 },
      { name: 'Engaged', count: stats.byStage['engaged'] || 0 },
      { name: 'Purchased', count: stats.byStage['purchased'] || 0 },
      { name: 'Superfan', count: stats.byStage['superfan'] || 0 },
    ],
    total: stats.total,
  };
}

export async function getTopSources(artistId: number) {
  const fans = fanProfilesStore.get(artistId) || [];
  
  const sources = fans.reduce((acc: Record<string, number>, fan: any) => {
    const source = fan.discoverySource || 'unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(sources)
    .map(([source, count]) => ({ source, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export async function recordDiscoverySource(artistId: number, source: string, email?: string) {
  const fans = fanProfilesStore.get(artistId) || [];
  
  const newFan = {
    id: fanIdCounter++,
    artistId,
    email,
    discoverySource: source,
    funnelStage: 'discovered',
    fanScore: 10,
    createdAt: new Date(),
  };
  
  fans.push(newFan);
  fanProfilesStore.set(artistId, fans);
  
  return { success: true, fanId: newFan.id };
}
