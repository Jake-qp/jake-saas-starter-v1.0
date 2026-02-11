import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export interface PricingCardProps {
  name: string;
  price: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  cta?: React.ReactNode;
  className?: string;
}

/**
 * Pricing plan card for plan comparison sections.
 * Use the `highlighted` prop for the recommended plan.
 *
 * @example
 * <PricingCard
 *   name="Pro"
 *   price="$29/mo"
 *   description="For growing teams"
 *   features={["Unlimited projects", "Priority support", "Custom domains"]}
 *   highlighted
 *   cta={<Button>Get Started</Button>}
 * />
 */
export function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
  cta,
  className,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "flex flex-col",
        highlighted && "border-primary ring-2 ring-primary",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <div className="mt-2 text-3xl font-bold">{price}</div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <CheckIcon className="h-4 w-4 text-success" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      {cta && <CardFooter>{cta}</CardFooter>}
    </Card>
  );
}
