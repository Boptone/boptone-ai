/**
 * ArtworkSimulatorPage — standalone route at /artwork-simulator.
 * Artists can access this directly to test any artwork image before uploading.
 */

import { ArtworkSimulator } from "@/components/ArtworkSimulator";
import DashboardLayout from "@/components/DashboardLayout";

export default function ArtworkSimulatorPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Artwork Display Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Upload your cover art and preview exactly how it renders across every display — car head units,
            phone lock screens, smartwatches, desktop players, and Bluetooth speakers — before publishing.
          </p>
        </div>
        <ArtworkSimulator />
      </div>
    </DashboardLayout>
  );
}
