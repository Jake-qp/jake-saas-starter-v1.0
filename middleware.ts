// Auth middleware — will be wired to Convex Auth in F001-001
// For now, all routes are public.

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
