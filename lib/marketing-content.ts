import type { IconProps } from "@radix-ui/react-icons/dist/types";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import {
  RocketIcon,
  LockClosedIcon,
  PersonIcon,
  LightningBoltIcon,
  BarChartIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";

type RadixIcon = ForwardRefExoticComponent<
  IconProps & RefAttributes<SVGSVGElement>
>;

export interface FeatureItem {
  icon: RadixIcon;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Features displayed on the landing page features grid.
 * These are the key product selling points.
 */
export const FEATURES: FeatureItem[] = [
  {
    icon: RocketIcon,
    title: "Ready to Ship",
    description:
      "Production-ready with CI/CD, error tracking, and analytics built in. Deploy to Vercel in minutes.",
  },
  {
    icon: LockClosedIcon,
    title: "Auth & Teams",
    description:
      "Email/password and magic link auth with multi-tenant teams, roles, and permissions.",
  },
  {
    icon: LightningBoltIcon,
    title: "AI Integration",
    description:
      "Vercel AI SDK with dual streaming, credit-based billing, and support for OpenAI + Anthropic models.",
  },
  {
    icon: PersonIcon,
    title: "Billing & Credits",
    description:
      "Team-level billing via Polar with configurable plan tiers, usage limits, and AI credit tracking.",
  },
  {
    icon: BarChartIcon,
    title: "Analytics & Flags",
    description:
      "PostHog product analytics and feature flags, fully integrated with env-var gated graceful degradation.",
  },
  {
    icon: GlobeIcon,
    title: "Real-time Backend",
    description:
      "Convex provides real-time database, serverless functions, and file storage — no API layer to build.",
  },
];

/**
 * FAQ items displayed on the landing page and pricing page.
 */
export const FAQ_ITEMS: FAQItem[] = [
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
