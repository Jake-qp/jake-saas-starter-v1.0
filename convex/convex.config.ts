import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import polar from "@convex-dev/polar/convex.config";
import posthog from "@samhoque/convex-posthog/convex.config";

const app = defineApp();
app.use(rateLimiter);
app.use(polar);
app.use(posthog);

export default app;
