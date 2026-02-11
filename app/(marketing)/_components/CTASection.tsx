import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";

export function CTASection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-2xl bg-primary px-6 py-16 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Ready to ship faster?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join teams who stopped building infrastructure and started building
            products. Get started in minutes.
          </p>
          <div className="mt-8">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/sign-up">
                Start Building Today
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
