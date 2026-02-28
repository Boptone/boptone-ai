import { useRequireArtist } from "@/hooks/useRequireArtist";
import { trpc } from "@/lib/trpc";
import WorkflowBuilder from "@/components/WorkflowBuilder";
import WorkflowUpgradeGate from "@/components/WorkflowUpgradeGate";

/**
 * WorkflowBuilderPage
 *
 * Route: /workflows/builder
 *
 * Wraps the visual WorkflowBuilder with a PRO/Enterprise tier gate.
 * Free-tier users are redirected to the upgrade prompt instead of
 * seeing the builder UI. This protects the route even when accessed
 * directly via URL (not just via the /workflows page button).
 */
export default function WorkflowBuilderPage() {
  useRequireArtist();

  const { data: tierData, isLoading: tierLoading } = trpc.workflows.tierStatus.useQuery();

  if (tierLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!tierData?.isPro) {
    return <WorkflowUpgradeGate />;
  }

  return <WorkflowBuilder />;
}
