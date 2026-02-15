import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Transparency() {
  // Mock data (TODO: Replace with real data from backend)
  const platformMetrics = {
    currentFee: 10, // Boptone's current platform fee percentage
    feeCapCommitment: 15, // Maximum fee Boptone will ever charge
    artistRetentionRate: 94, // Percentage of artists who stay after 12 months
    averageAORS: 87, // Average Artist-Owned Revenue Share across all tiers
    artistPortabilityScore: 100, // 100 = full data export available
    revenueConcentration: 42, // Percentage of revenue from single largest source
    totalArtists: 1247, // Total artists on platform
    totalRevenueProcessed: 2400000, // Total revenue processed in dollars
  };

  // Fee comparison calculator state
  const [monthlyStreams, setMonthlyStreams] = useState<string>("100000");

  // Calculate earnings based on streams
  const calculateEarnings = (streams: number) => {
    const spotifyPerStream = 0.003; // $0.003 per stream
    const appleMusicPerStream = 0.01; // $0.01 per stream
    const boptonePerStream = 0.01; // $0.01 per stream (same as Apple, but artist keeps 90%)

    const spotifyGross = streams * spotifyPerStream;
    const spotifyArtistShare = spotifyGross * 0.3; // Spotify pays ~30% to artists

    const appleMusicGross = streams * appleMusicPerStream;
    const appleMusicArtistShare = appleMusicGross * 0.3; // Apple pays ~30% to artists

    const boptoneGross = streams * boptonePerStream;
    const boptoneArtistShare = boptoneGross * 0.9; // Boptone pays 90% to artists

    return {
      spotify: spotifyArtistShare,
      appleMusic: appleMusicArtistShare,
      boptone: boptoneArtistShare,
      difference: boptoneArtistShare - Math.max(spotifyArtistShare, appleMusicArtistShare),
    };
  };

  const earnings = calculateEarnings(parseInt(monthlyStreams) || 0);

  const comparisonData = [
    {
      platform: "Boptone",
      platformFee: "10%",
      artistShare: "90%",
      payoutSpeed: "Instant",
      dataPortability: "Full Export",
      ownership: "Artist Owned",
    },
    {
      platform: "Spotify",
      platformFee: "~70%",
      artistShare: "~30%",
      payoutSpeed: "90 days",
      dataPortability: "Limited",
      ownership: "Platform Owned",
    },
    {
      platform: "Apple Music",
      platformFee: "~70%",
      artistShare: "~30%",
      payoutSpeed: "60-90 days",
      dataPortability: "Limited",
      ownership: "Platform Owned",
    },
    {
      platform: "DistroKid",
      platformFee: "$20-36/year + 0-20%",
      artistShare: "80-100%",
      payoutSpeed: "Monthly",
      dataPortability: "Partial",
      ownership: "Mixed",
    },
  ];

  const healthScoreMetrics = [
    {
      title: "Platform Fee",
      current: `${platformMetrics.currentFee}%`,
      status: "HEALTHY",
      description: "Well below 15% cap commitment",
    },
    {
      title: "Artist Portability",
      current: `${platformMetrics.artistPortabilityScore}/100`,
      status: "HEALTHY",
      description: "Full data export available",
    },
    {
      title: "Revenue Concentration",
      current: `${platformMetrics.revenueConcentration}%`,
      status: platformMetrics.revenueConcentration > 60 ? "CAUTION" : "HEALTHY",
      description: platformMetrics.revenueConcentration > 60 ? "Artists should diversify income" : "Balanced revenue distribution",
    },
    {
      title: "Artist Retention",
      current: `${platformMetrics.artistRetentionRate}%`,
      status: "HEALTHY",
      description: "High artist satisfaction and loyalty",
    },
  ];

  // Fee breakdown data
  const feeBreakdown = [
    { category: "Cloud Infrastructure", percentage: 35, description: "S3 storage, CDN, database hosting" },
    { category: "Payment Processing", percentage: 25, description: "Stripe fees, bank transfers, instant payouts" },
    { category: "Development & Support", percentage: 20, description: "Engineering, customer support, maintenance" },
    { category: "Security & Compliance", percentage: 15, description: "Legal, accounting, fraud prevention" },
    { category: "Platform Growth", percentage: 5, description: "Marketing, artist acquisition, partnerships" },
  ];

  // Commitment tracker data
  const commitments = [
    { title: "15% Fee Cap", status: "ACTIVE", description: "Contractual guarantee in every artist agreement" },
    { title: "Data Portability", status: "ACTIVE", description: "Full export available at any time" },
    { title: "BAP Protocol", status: "ACTIVE", description: "Open source and interoperable" },
    { title: "Public Financials", status: "ACTIVE", description: "Updated monthly on this page" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            TRANSPARENCY
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Boptone is committed to radical transparency. We believe artists deserve to know exactly how the platform operates,
            what we charge, and how we compare to alternatives.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Real-Time Platform Stats */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-8">
            <h2 className="text-3xl font-bold mb-2">REAL-TIME PLATFORM STATS</h2>
            <p className="text-lg text-gray-600">
              Live metrics showing Boptone's growth and commitment to artists
            </p>
          </div>
          <div className="p-8">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  TOTAL ARTISTS
                </div>
                <div className="text-5xl font-bold mb-2">{platformMetrics.totalArtists.toLocaleString()}</div>
                <p className="text-sm text-gray-700">Active on platform</p>
              </div>
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  REVENUE PROCESSED
                </div>
                <div className="text-5xl font-bold mb-2">${(platformMetrics.totalRevenueProcessed / 1000000).toFixed(1)}M</div>
                <p className="text-sm text-gray-700">Paid to artists</p>
              </div>
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  AVERAGE AORS
                </div>
                <div className="text-5xl font-bold mb-2">{platformMetrics.averageAORS}%</div>
                <p className="text-sm text-gray-700">Artist-owned revenue share</p>
              </div>
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  CURRENT FEE
                </div>
                <div className="text-5xl font-bold mb-2">{platformMetrics.currentFee}%</div>
                <p className="text-sm text-gray-700">Platform fee (15% cap)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Fee Comparison Calculator */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-8">
            <h2 className="text-3xl font-bold mb-2">FEE COMPARISON CALCULATOR</h2>
            <p className="text-lg text-gray-600">
              See exactly how much more you'd earn on Boptone vs other platforms
            </p>
          </div>
          <div className="p-8 space-y-8">
            {/* Input */}
            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">
                MONTHLY STREAMS
              </label>
              <input
                type="number"
                value={monthlyStreams}
                onChange={(e) => setMonthlyStreams(e.target.value)}
                className="w-full px-6 py-4 text-2xl font-bold border-4 border-black rounded-none focus:outline-none focus:ring-4 focus:ring-black"
                placeholder="100000"
              />
            </div>

            {/* Results */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  SPOTIFY
                </div>
                <div className="text-4xl font-bold mb-2">${earnings.spotify.toFixed(2)}</div>
                <p className="text-sm text-gray-700">~30% artist share</p>
              </div>
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  APPLE MUSIC
                </div>
                <div className="text-4xl font-bold mb-2">${earnings.appleMusic.toFixed(2)}</div>
                <p className="text-sm text-gray-700">~30% artist share</p>
              </div>
              <div className="p-6 border-4 border-black bg-black text-white rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-300">
                  BOPTONE
                </div>
                <div className="text-4xl font-bold mb-2">${earnings.boptone.toFixed(2)}</div>
                <p className="text-sm text-gray-300">90% artist share</p>
              </div>
            </div>

            {/* Difference Highlight */}
            {earnings.difference > 0 && (
              <div className="p-6 border-4 border-black bg-gray-50 rounded-none">
                <p className="text-2xl font-bold mb-2">
                  You'd earn <span className="text-4xl">${earnings.difference.toFixed(2)}</span> more per month on Boptone
                </p>
                <p className="text-sm text-gray-700">
                  That's <strong>${(earnings.difference * 12).toFixed(2)}/year</strong> more in your pocket.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fee Breakdown Visualization */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-8">
            <h2 className="text-3xl font-bold mb-2">WHERE DOES THE 10% GO?</h2>
            <p className="text-lg text-gray-600">
              Complete breakdown of how platform fees are used
            </p>
          </div>
          <div className="p-8 space-y-6">
            {feeBreakdown.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{item.category}</span>
                  <span className="text-2xl font-bold">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 h-8 border-2 border-black rounded-none overflow-hidden">
                  <div 
                    className="bg-black h-full flex items-center justify-end pr-4"
                    style={{ width: `${item.percentage}%` }}
                  >
                    <span className="text-white text-xs font-bold">{item.percentage}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
            <div className="mt-8 p-6 border-4 border-black bg-gray-50 rounded-none">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> These percentages represent how the 10% platform fee is allocated. The remaining 90% goes directly to artists.
                All costs are transparent and updated quarterly.
              </p>
            </div>
          </div>
        </div>

        {/* Commitment Tracker */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-8">
            <h2 className="text-3xl font-bold mb-2">COMMITMENT TRACKER</h2>
            <p className="text-lg text-gray-600">
              Real-time status of Boptone's core promises to artists
            </p>
          </div>
          <div className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              {commitments.map((commitment) => (
                <div key={commitment.title} className="p-6 border-4 border-black bg-white rounded-none">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{commitment.title}</h3>
                    <span className="px-3 py-1 text-xs font-bold rounded-none bg-black text-white">
                      ✓ {commitment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{commitment.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Health Score */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-8">
            <h2 className="text-3xl font-bold mb-2">PLATFORM HEALTH SCORE</h2>
            <p className="text-lg text-gray-600">
              Real-time metrics showing Boptone's commitment to artist independence
            </p>
          </div>
          <div className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              {healthScoreMetrics.map((metric) => (
                <div key={metric.title} className="p-6 border-4 border-black bg-white rounded-none">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{metric.title}</h3>
                    <span 
                      className={`px-3 py-1 text-xs font-bold rounded-none ${
                        metric.status === "HEALTHY" ? "bg-black text-white" : "bg-gray-300 text-black"
                      }`}
                    >
                      {metric.status}
                    </span>
                  </div>
                  <div className="text-4xl font-bold mb-2">{metric.current}</div>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Boptone's Take Rate */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-8">
            <h2 className="text-3xl font-bold mb-2">BOPTONE'S TAKE RATE</h2>
            <p className="text-lg text-gray-600">
              What we charge and our commitment to artists
            </p>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 border-4 border-black bg-gray-50 rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  CURRENT PLATFORM FEE
                </div>
                <div className="text-5xl font-bold mb-2">{platformMetrics.currentFee}%</div>
                <p className="text-sm text-gray-700">Updated monthly</p>
              </div>
              <div className="p-6 border-4 border-black bg-gray-50 rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  MAXIMUM FEE CAP
                </div>
                <div className="text-5xl font-bold mb-2">{platformMetrics.feeCapCommitment}%</div>
                <p className="text-sm text-gray-700">Contractual guarantee</p>
              </div>
              <div className="p-6 border-4 border-black bg-gray-50 rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  ARTIST SHARE
                </div>
                <div className="text-5xl font-bold mb-2">{100 - platformMetrics.currentFee}%</div>
                <p className="text-sm text-gray-700">You keep the majority</p>
              </div>
            </div>

            <div className="p-6 border-4 border-black bg-white rounded-none">
              <h4 className="text-lg font-bold mb-4">OUR COMMITMENT</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-xl font-bold">•</span>
                  <span>Boptone will <strong>never exceed 15% platform fees</strong> - this is a contractual guarantee in every artist agreement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl font-bold">•</span>
                  <span>Artists can <strong>terminate with zero penalties</strong> if we ever restrict data portability or exceed the 15% cap</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl font-bold">•</span>
                  <span><strong>Full data export</strong> available at any time - you own your catalog, fan data, and earnings history</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl font-bold">•</span>
                  <span>Fees are updated monthly and published on this page for <strong>complete transparency</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Artist Metrics */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-8">
            <h2 className="text-3xl font-bold mb-2">ARTIST HEALTH METRICS</h2>
            <p className="text-lg text-gray-600">
              How artists are performing on Boptone
            </p>
          </div>
          <div className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  ARTIST RETENTION RATE
                </div>
                <div className="text-5xl font-bold mb-2">{platformMetrics.artistRetentionRate}%</div>
                <p className="text-sm text-gray-700">
                  Percentage of artists who stay after 12 months
                </p>
              </div>
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <div className="text-xs font-bold tracking-wider mb-2 text-gray-600">
                  AVERAGE AORS
                </div>
                <div className="text-5xl font-bold mb-2">{platformMetrics.averageAORS}%</div>
                <p className="text-sm text-gray-700">
                  Artist-Owned Revenue Share across all tiers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-8">
            <h2 className="text-3xl font-bold mb-2">PLATFORM COMPARISON</h2>
            <p className="text-lg text-gray-600">
              How Boptone compares to major streaming platforms and distributors
            </p>
          </div>
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full border-4 border-black rounded-none">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="p-4 text-left font-bold border-r-4 border-white">PLATFORM</th>
                    <th className="p-4 text-left font-bold border-r-4 border-white">PLATFORM FEE</th>
                    <th className="p-4 text-left font-bold border-r-4 border-white">ARTIST SHARE</th>
                    <th className="p-4 text-left font-bold border-r-4 border-white">PAYOUT SPEED</th>
                    <th className="p-4 text-left font-bold border-r-4 border-white">DATA PORTABILITY</th>
                    <th className="p-4 text-left font-bold">OWNERSHIP</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr 
                      key={row.platform} 
                      className={`${idx === 0 ? "bg-gray-100 font-bold" : "bg-white"} border-t-4 border-black`}
                    >
                      <td className="p-4 border-r-4 border-black">{row.platform}</td>
                      <td className="p-4 border-r-4 border-black">{row.platformFee}</td>
                      <td className="p-4 border-r-4 border-black">{row.artistShare}</td>
                      <td className="p-4 border-r-4 border-black">{row.payoutSpeed}</td>
                      <td className="p-4 border-r-4 border-black">{row.dataPortability}</td>
                      <td className="p-4">{row.ownership}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 border-4 border-black bg-gray-50 rounded-none">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Platform fees for Spotify and Apple Music include their share of streaming revenue paid to rights holders.
                DistroKid fees vary by plan tier. All data is publicly available and updated quarterly.
              </p>
            </div>
          </div>
        </div>

        {/* Public Commitment */}
        <div className="border-4 border-black bg-white rounded-none">
          <div className="border-b-4 border-black p-8">
            <h2 className="text-3xl font-bold mb-2">OUR PUBLIC COMMITMENT</h2>
            <p className="text-lg text-gray-600">
              How we prevent Boptone from becoming what we're designed to replace
            </p>
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <p className="text-lg text-gray-800 leading-relaxed">
                Every platform starts with good intentions. Spotify promised to empower artists. YouTube promised to democratize content.
                They all ended up extracting value instead of creating it.
              </p>
              <p className="text-lg text-gray-800 leading-relaxed">
                Boptone is different because we've built structural accountability into the platform itself. This isn't just a promise—it's enforced by code and contracts.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <h4 className="text-lg font-bold mb-3">15% FEE CAP</h4>
                <p className="text-gray-700">
                  Boptone will never charge more than 15% platform fees. This is written into every artist agreement.
                  If we ever exceed this, artists can terminate with zero penalties.
                </p>
              </div>
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <h4 className="text-lg font-bold mb-3">DATA PORTABILITY GUARANTEE</h4>
                <p className="text-gray-700">
                  You own your catalog, fan data, and earnings history. Full data export is available at any time.
                  If we ever restrict portability, artists can terminate with zero penalties.
                </p>
              </div>
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <h4 className="text-lg font-bold mb-3">OPEN BAP PROTOCOL</h4>
                <p className="text-gray-700">
                  BAP (Boptone Artist Protocol) is designed to be interoperable. Other platforms can integrate BAP streaming,
                  ensuring artists aren't locked into Boptone alone.
                </p>
              </div>
              <div className="p-6 border-4 border-black bg-white rounded-none">
                <h4 className="text-lg font-bold mb-3">PUBLIC TRANSPARENCY</h4>
                <p className="text-gray-700">
                  This page is updated monthly with real platform metrics. No hidden fees, no surprises.
                  Artists deserve to know exactly how the platform operates.
                </p>
              </div>
            </div>

            <div className="p-6 border-4 border-black bg-gray-50 rounded-none">
              <p className="text-gray-700 font-bold">
                Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Questions about our transparency commitments? Contact us at transparency@boptone.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
