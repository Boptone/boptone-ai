import BoptoneExplainer from "@/components/BoptoneExplainer";

/**
 * Public explainer page - interactive 5-step walkthrough of Boptone's value proposition.
 * Accessible from homepage or directly via /explainer.
 * Ends with "Get Started Free" CTA that redirects to signup.
 */
export default function Explainer() {
  return <BoptoneExplainer mode="public" />;
}
