import type { Metadata } from "next";
import { PricingTable } from "../_components/PricingTable";
import { FAQAccordion } from "../_components/FAQAccordion";

export const metadata: Metadata = {
  title: "Pricing - SaaS Starter",
  description:
    "Simple, transparent pricing. Start free, upgrade when you're ready.",
};

export default function PricingPage() {
  return (
    <>
      <PricingTable />
      <FAQAccordion />
    </>
  );
}
