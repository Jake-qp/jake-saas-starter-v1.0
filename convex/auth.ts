import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ResendOTP } from "./helpers/ResendOTP";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      reset: ResendOTP,
    }),
    ResendOTP,
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      // Only run for newly created users (not updates)
      if (args.existingUserId) return;

      const userId = args.userId;

      // Set fullName from email if not already set
      const user = await ctx.db.get(userId);
      if (!user) return;

      const email = user.email ?? args.profile.email;
      const fullName =
        user.fullName ?? user.name ?? (email ? email.split("@")[0] : "User");

      if (!user.fullName) {
        await ctx.db.patch(userId, { fullName });
      }

      // Auto-create personal team for new users
      // Use raw db because we're inside a Convex Auth callback (no ents ctx)
      const existingMember = (
        await ctx.db
          .query("members")
          .filter((q) => q.eq(q.field("userId"), userId))
          .collect()
      ).find((m) => m.deletionTime === undefined);

      if (!existingMember) {
        const name = `${fullName}'s Team`;
        // Generate unique slug
        let slug = fullName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "")
          .slice(0, 30);
        if (!slug) slug = "team";

        let n = 0;
        let finalSlug = slug;
        for (;;) {
          finalSlug = n === 0 ? slug : `${slug}-${n}`;
          const existing = await ctx.db
            .query("teams")
            .filter((q) => q.eq(q.field("slug"), finalSlug))
            .unique();
          if (!existing) break;
          n++;
        }

        const teamId = await ctx.db.insert("teams", {
          name,
          slug: finalSlug,
          isPersonal: true,
        });

        // Find the Admin role
        const adminRole = await ctx.db
          .query("roles")
          .filter((q) => q.eq(q.field("name"), "Admin"))
          .unique();

        if (adminRole) {
          const searchable = `${fullName} ${email ?? ""}`
            .normalize("NFKD")
            .replace(/[\u0300-\u036F]/g, "");

          await ctx.db.insert("members", {
            teamId,
            userId,
            roleId: adminRole._id,
            searchable,
          });
        }
      }
    },
  },
});
