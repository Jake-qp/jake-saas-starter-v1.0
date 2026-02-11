import { internalMutation } from "./_generated/server";

/**
 * Demo data for preview/demo deployments.
 * Exported for testing — the seedPreview mutation uses this data.
 */
export const PREVIEW_DATA = {
  team: {
    name: "Acme Corp",
    slug: "acme-corp",
    isPersonal: false,
  },
  users: [
    {
      email: "alice@example.com",
      fullName: "Alice Johnson",
      firstName: "Alice",
      lastName: "Johnson",
    },
    {
      email: "bob@example.com",
      fullName: "Bob Smith",
      firstName: "Bob",
      lastName: "Smith",
    },
    {
      email: "carol@example.com",
      fullName: "Carol Williams",
      firstName: "Carol",
      lastName: "Williams",
    },
  ],
  messages: [
    { text: "Welcome to the team! Let's get started on the Q1 roadmap." },
    { text: "I've uploaded the design specs to the shared drive." },
    { text: "Can we schedule a sync for Thursday afternoon?" },
    { text: "Great progress on the dashboard — the charts look clean." },
    { text: "Don't forget to submit your time entries by Friday." },
  ],
};

/**
 * Seed a preview/demo deployment with realistic sample data.
 * Call from the Convex dashboard or via `npx convex run seedPreview:seedPreview`.
 *
 * Creates:
 * - 1 demo team (Acme Corp)
 * - 3 demo users with team memberships
 * - 5 sample messages
 * - Roles and permissions (via init)
 */
export const seedPreview = internalMutation({
  args: {},
  async handler(ctx) {
    // Check if data already exists
    const existingTeam = await ctx.db
      .query("teams")
      .withIndex("slug", (q) => q.eq("slug", PREVIEW_DATA.team.slug))
      .unique();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (existingTeam) {
      console.log("Preview data already seeded — skipping");
      return;
    }

    // Ensure roles exist (idempotent check)
    const existingRoles = await ctx.db.query("roles").collect();
    let adminRoleId;
    let memberRoleId;

    if (existingRoles.length === 0) {
      // Create permissions
      const permissionIds = {
        "Manage Team": await ctx.db.insert("permissions", {
          name: "Manage Team",
        }),
        "Delete Team": await ctx.db.insert("permissions", {
          name: "Delete Team",
        }),
        "Manage Members": await ctx.db.insert("permissions", {
          name: "Manage Members",
        }),
        "Read Members": await ctx.db.insert("permissions", {
          name: "Read Members",
        }),
        Contribute: await ctx.db.insert("permissions", {
          name: "Contribute",
        }),
      };

      // Create roles (using raw db since this is an internal mutation)
      adminRoleId = await ctx.db.insert("roles", {
        name: "Admin",
        isDefault: false,
        permissions: Object.values(permissionIds),
      });
      memberRoleId = await ctx.db.insert("roles", {
        name: "Member",
        isDefault: true,
        permissions: [permissionIds["Read Members"], permissionIds.Contribute],
      });
    } else {
      const adminRole = existingRoles.find((r) => r.name === "Admin");
      const memberRole = existingRoles.find((r) => r.name === "Member");
      adminRoleId = adminRole!._id;
      memberRoleId = memberRole!._id;
    }

    // Create team
    const teamId = await ctx.db.insert("teams", PREVIEW_DATA.team);

    // Create users and memberships
    const userIds = [];
    for (let i = 0; i < PREVIEW_DATA.users.length; i++) {
      const userData = PREVIEW_DATA.users[i];
      const userId = await ctx.db.insert("users", {
        ...userData,
        name: userData.fullName,
      });
      userIds.push(userId);

      const roleId = i === 0 ? adminRoleId : memberRoleId;
      const searchable = `${userData.fullName} ${userData.email}`.normalize(
        "NFKD",
      );

      await ctx.db.insert("members", {
        teamId,
        userId,
        roleId,
        searchable,
      });
    }

    // Create sample messages
    // First member (Alice) is the admin, use her for messages
    const members = await ctx.db
      .query("members")
      .filter((q) => q.eq(q.field("teamId"), teamId))
      .collect();

    for (let i = 0; i < PREVIEW_DATA.messages.length; i++) {
      const member = members[i % members.length];
      await ctx.db.insert("messages", {
        teamId,
        memberId: member._id,
        text: PREVIEW_DATA.messages[i].text,
      });
    }

    console.log(
      `Preview data seeded: 1 team, ${PREVIEW_DATA.users.length} users, ${PREVIEW_DATA.messages.length} messages`,
    );
  },
});
