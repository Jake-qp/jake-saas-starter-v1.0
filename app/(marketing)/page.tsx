import { HeroSection } from "./_components/HeroSection";
import { FeaturesGrid } from "./_components/FeaturesGrid";
import { PricingTable } from "./_components/PricingTable";
import { FAQAccordion } from "./_components/FAQAccordion";
import { CTASection } from "./_components/CTASection";
import { WaitlistGate } from "./_components/WaitlistGate";

export default function LandingPage() {
  return (
    <>
      <WaitlistGate />
      <HeroSection />
      <FeaturesGrid />
      <PricingTable />
      <FAQAccordion />
      <CTASection />
    </>
  );
}
