import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Phase 2 mock data — will be replaced with static config in Phase 4
const MOCK_FAQ_ITEMS = [
  {
    question: "Can I try it for free?",
    answer:
      "Yes! The Free tier includes up to 3 team members, 100 AI credits per month, and 50 notes. No credit card required.",
  },
  {
    question: "How does team billing work?",
    answer:
      "Billing is at the team level, not per user. The team owner manages the subscription, and all members share the plan's limits.",
  },
  {
    question: "What AI models are supported?",
    answer:
      "We support OpenAI (GPT-4o, GPT-4o mini) and Anthropic (Claude Sonnet, Claude Haiku) models. Each model has a different credit cost.",
  },
  {
    question: "Can I upgrade or downgrade at any time?",
    answer:
      "Yes. Plan changes take effect immediately. When upgrading, you'll be charged the prorated difference. Downgrades apply at the next billing cycle.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. Data is stored in Convex's encrypted database with row-level security. All API access goes through authenticated, permission-checked functions.",
  },
  {
    question: "Do you offer custom enterprise plans?",
    answer:
      "Yes. Enterprise plans include unlimited everything, custom roles, SSO, and priority support. Contact us for details.",
  },
];

export function FAQAccordion() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know about our platform.
          </p>
        </div>
        <Accordion type="single" collapsible className="mt-12">
          {MOCK_FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
