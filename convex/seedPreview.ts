import { internalMutation } from "./_generated/server";
import { ALL_PERMISSIONS, ROLE_PERMISSION_MAP } from "./rbacConfig";

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
 * - 3 demo users with team memberships (Owner, Admin, Member)
 * - 5 sample messages
 * - All roles and 14 permissions
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
    let ownerRoleId;
    let adminRoleId;
    let memberRoleId;

    if (existingRoles.length === 0) {
      // Create all 14 permissions
      const permissionIds: Record<
        string,
        ReturnType<typeof ctx.db.insert>
      > = {};
      for (const name of ALL_PERMISSIONS) {
        permissionIds[name] = await ctx.db.insert("permissions", { name });
      }

      // Create Owner role (all permissions)
      ownerRoleId = await ctx.db.insert("roles", {
        name: "Owner",
        isDefault: false,
        permissions: ROLE_PERMISSION_MAP.Owner.map((n) => permissionIds[n]),
      });

      // Create Admin role
      adminRoleId = await ctx.db.insert("roles", {
        name: "Admin",
        isDefault: false,
        permissions: ROLE_PERMISSION_MAP.Admin.map((n) => permissionIds[n]),
      });

      // Create Member role (default)
      memberRoleId = await ctx.db.insert("roles", {
        name: "Member",
        isDefault: true,
        permissions: ROLE_PERMISSION_MAP.Member.map((n) => permissionIds[n]),
      });
    } else {
      const ownerRole = existingRoles.find((r) => r.name === "Owner");
      const adminRole = existingRoles.find((r) => r.name === "Admin");
      const memberRole = existingRoles.find((r) => r.name === "Member");
      ownerRoleId = ownerRole!._id;
      adminRoleId = adminRole!._id;
      memberRoleId = memberRole!._id;
    }

    // Create team
    const teamId = await ctx.db.insert("teams", PREVIEW_DATA.team);

    // Create users and memberships
    // Alice = Owner, Bob = Admin, Carol = Member
    const roleIds = [ownerRoleId, adminRoleId, memberRoleId];
    for (let i = 0; i < PREVIEW_DATA.users.length; i++) {
      const userData = PREVIEW_DATA.users[i];
      const userId = await ctx.db.insert("users", {
        ...userData,
        name: userData.fullName,
      });

      const searchable = `${userData.fullName} ${userData.email}`.normalize(
        "NFKD",
      );

      await ctx.db.insert("members", {
        teamId,
        userId,
        roleId: roleIds[i],
        searchable,
      });
    }

    // Create sample messages
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
