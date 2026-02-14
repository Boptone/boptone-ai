import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Transparency() {
  // Mock data (TODO: Replace with real data from backend)
  const platformMetrics = {
    currentFee: 10, // Boptone's current platform fee percentage
    feeCapCommitment: 15, // Maximum fee Boptone will ever charge
    artistRetentionRate: 94, // Percentage of artists who stay after 12 months
    averageAORS: 87, // Average Artist-Owned Revenue Share across all tiers
    artistPortabilityScore: 100, // 100 = full data export available
    revenueConcentration: 42, // Percentage of revenue from single largest source
  };

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight uppercase mb-4">
            Platform Transparency
          </h1>
          <p className="text-xl font-medium text-gray-600 max-w-3xl">
            Boptone is committed to radical transparency. We believe artists deserve to know exactly how the platform operates,
            what we charge, and how we compare to alternatives.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Platform Health Score */}
        <Card className="rounded-none border-4 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-3xl font-bold uppercase">Platform Health Score</CardTitle>
            <CardDescription className="text-white/90 font-medium text-lg">
              Real-time metrics showing Boptone's commitment to artist independence
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              {healthScoreMetrics.map((metric) => (
                <div key={metric.title} className="p-6 border-4 border-black bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold uppercase">{metric.title}</h3>
                    <span 
                      className={`px-3 py-1 text-xs font-bold uppercase ${
                        metric.status === "HEALTHY" ? "bg-black text-white" : "bg-gray-300 text-black"
                      }`}
                    >
                      {metric.status}
                    </span>
                  </div>
                  <div className="text-4xl font-bold font-mono mb-2">{metric.current}</div>
                  <p className="text-sm font-medium text-gray-600">{metric.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Boptone's Take Rate */}
        <Card className="rounded-none border-4 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-3xl font-bold uppercase">Boptone's Take Rate</CardTitle>
            <CardDescription className="text-white/90 font-medium text-lg">
              What we charge and our commitment to artists
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 border-4 border-black bg-gray-50">
                <div className="text-xs font-bold tracking-wider mb-2 uppercase text-gray-600">
                  Current Platform Fee
                </div>
                <div className="text-5xl font-bold font-mono mb-2">{platformMetrics.currentFee}%</div>
                <p className="text-sm font-medium text-gray-700">Updated monthly</p>
              </div>
              <div className="p-6 border-4 border-black bg-gray-50">
                <div className="text-xs font-bold tracking-wider mb-2 uppercase text-gray-600">
                  Maximum Fee Cap
                </div>
                <div className="text-5xl font-bold font-mono mb-2">{platformMetrics.feeCapCommitment}%</div>
                <p className="text-sm font-medium text-gray-700">Contractual guarantee</p>
              </div>
              <div className="p-6 border-4 border-black bg-gray-50">
                <div className="text-xs font-bold tracking-wider mb-2 uppercase text-gray-600">
                  Artist Share
                </div>
                <div className="text-5xl font-bold font-mono mb-2">{100 - platformMetrics.currentFee}%</div>
                <p className="text-sm font-medium text-gray-700">You keep the majority</p>
              </div>
            </div>

            <div className="p-6 border-2 border-black bg-white">
              <h4 className="text-lg font-bold uppercase mb-3">Our Commitment</h4>
              <ul className="space-y-2 text-gray-700 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-xl">•</span>
                  <span>Boptone will <strong>never exceed 15% platform fees</strong> - this is a contractual guarantee in every artist agreement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">•</span>
                  <span>Artists can <strong>terminate with zero penalties</strong> if we ever restrict data portability or exceed the 15% cap</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">•</span>
                  <span><strong>Full data export</strong> available at any time - you own your catalog, fan data, and earnings history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-xl">•</span>
                  <span>Fees are updated monthly and published on this page for <strong>complete transparency</strong></span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Artist Metrics */}
        <Card className="rounded-none border-4 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-3xl font-bold uppercase">Artist Health Metrics</CardTitle>
            <CardDescription className="text-white/90 font-medium text-lg">
              How artists are performing on Boptone
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 border-4 border-black bg-white">
                <div className="text-xs font-bold tracking-wider mb-2 uppercase text-gray-600">
                  Artist Retention Rate
                </div>
                <div className="text-5xl font-bold font-mono mb-2">{platformMetrics.artistRetentionRate}%</div>
                <p className="text-sm font-medium text-gray-700">
                  Percentage of artists who stay after 12 months
                </p>
              </div>
              <div className="p-6 border-4 border-black bg-white">
                <div className="text-xs font-bold tracking-wider mb-2 uppercase text-gray-600">
                  Average AORS
                </div>
                <div className="text-5xl font-bold font-mono mb-2">{platformMetrics.averageAORS}%</div>
                <p className="text-sm font-medium text-gray-700">
                  Artist-Owned Revenue Share across all tiers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="rounded-none border-4 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-3xl font-bold uppercase">Platform Comparison</CardTitle>
            <CardDescription className="text-white/90 font-medium text-lg">
              How Boptone compares to major streaming platforms and distributors
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full border-4 border-black">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="p-4 text-left font-bold uppercase border-r-2 border-white">Platform</th>
                    <th className="p-4 text-left font-bold uppercase border-r-2 border-white">Platform Fee</th>
                    <th className="p-4 text-left font-bold uppercase border-r-2 border-white">Artist Share</th>
                    <th className="p-4 text-left font-bold uppercase border-r-2 border-white">Payout Speed</th>
                    <th className="p-4 text-left font-bold uppercase border-r-2 border-white">Data Portability</th>
                    <th className="p-4 text-left font-bold uppercase">Ownership</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr 
                      key={row.platform} 
                      className={`${idx === 0 ? "bg-gray-100 font-bold" : "bg-white"} border-t-2 border-black`}
                    >
                      <td className="p-4 border-r-2 border-black">{row.platform}</td>
                      <td className="p-4 border-r-2 border-black">{row.platformFee}</td>
                      <td className="p-4 border-r-2 border-black">{row.artistShare}</td>
                      <td className="p-4 border-r-2 border-black">{row.payoutSpeed}</td>
                      <td className="p-4 border-r-2 border-black">{row.dataPortability}</td>
                      <td className="p-4">{row.ownership}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 border-2 border-black bg-gray-50">
              <p className="text-sm font-medium text-gray-700">
                <strong>Note:</strong> Platform fees for Spotify and Apple Music include their share of streaming revenue paid to rights holders.
                DistroKid fees vary by plan tier. All data is publicly available and updated quarterly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Public Commitment */}
        <Card className="rounded-none border-4 border-black">
          <CardHeader className="bg-black text-white">
            <CardTitle className="text-3xl font-bold uppercase">Our Public Commitment</CardTitle>
            <CardDescription className="text-white/90 font-medium text-lg">
              How we prevent Boptone from becoming what we're designed to replace
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="prose max-w-none">
              <p className="text-lg font-medium text-gray-800 leading-relaxed">
                Every platform starts with good intentions. Spotify promised to empower artists. YouTube promised to democratize content.
                They all ended up extracting value instead of creating it.
              </p>
              <p className="text-lg font-medium text-gray-800 leading-relaxed">
                Boptone is different because we've built structural accountability into the platform itself. This isn't just a promise—it's enforced by code and contracts.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-6 border-4 border-black bg-white">
                <h4 className="text-lg font-bold uppercase mb-3">15% Fee Cap</h4>
                <p className="text-gray-700 font-medium">
                  Boptone will never charge more than 15% platform fees. This is written into every artist agreement.
                  If we ever exceed this, artists can terminate with zero penalties.
                </p>
              </div>
              <div className="p-6 border-4 border-black bg-white">
                <h4 className="text-lg font-bold uppercase mb-3">Data Portability Guarantee</h4>
                <p className="text-gray-700 font-medium">
                  You own your catalog, fan data, and earnings history. Full data export is available at any time.
                  If we ever restrict portability, artists can terminate with zero penalties.
                </p>
              </div>
              <div className="p-6 border-4 border-black bg-white">
                <h4 className="text-lg font-bold uppercase mb-3">Open BAP Protocol</h4>
                <p className="text-gray-700 font-medium">
                  BAP (Boptone Artist Protocol) is designed to be interoperable. Other platforms can integrate BAP streaming,
                  ensuring artists aren't locked into Boptone alone.
                </p>
              </div>
              <div className="p-6 border-4 border-black bg-white">
                <h4 className="text-lg font-bold uppercase mb-3">Public Transparency</h4>
                <p className="text-gray-700 font-medium">
                  This page is updated monthly with real platform metrics. No hidden fees, no surprises.
                  Artists deserve to know exactly how the platform operates.
                </p>
              </div>
            </div>

            <div className="p-6 border-2 border-black bg-gray-50">
              <p className="text-gray-700 font-medium">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-2">
                Questions about our transparency commitments? Contact us at transparency@boptone.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
