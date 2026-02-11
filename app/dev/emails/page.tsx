"use client";

import { useState } from "react";

/**
 * Email Preview Route — Development Only
 *
 * Renders all React Email templates with sample data.
 * This route is for local development and should NOT be deployed to production.
 */

const EMAIL_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome",
    description: "Sent when a new user signs up",
  },
  {
    id: "invite-sent",
    name: "Invite Sent",
    description: "Sent when a user is invited to a team",
  },
  {
    id: "invite-accepted",
    name: "Invite Accepted",
    description: "Sent when an invite is accepted",
  },
  {
    id: "subscription-changed",
    name: "Subscription Changed",
    description: "Sent when subscription tier changes",
  },
  {
    id: "payment-failed",
    name: "Payment Failed",
    description: "Sent when a payment fails",
  },
  {
    id: "payment-received",
    name: "Payment Received",
    description: "Sent when a payment is processed",
  },
  {
    id: "approaching-limit",
    name: "Approaching Limit",
    description: "Sent when usage reaches 80% of limit",
  },
  {
    id: "member-removed",
    name: "Member Removed",
    description: "Sent when a member is removed from a team",
  },
] as const;

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    EMAIL_TEMPLATES[0].id,
  );
  const selected = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-background p-4 overflow-y-auto">
        <h1 className="text-lg font-bold mb-4">Email Templates</h1>
        <p className="text-xs text-muted-foreground mb-4">
          Development preview only
        </p>
        <nav className="space-y-1">
          {EMAIL_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                selectedTemplate === template.id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {template.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-8 overflow-y-auto bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{selected?.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selected?.description}
            </p>
          </div>

          {/* Email Preview Card */}
          <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="border-b border-border px-6 py-3 bg-muted/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">From:</span>
                <span>YourApp &lt;noreply@yourapp.com&gt;</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">To:</span>
                <span>user@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Subject:</span>
                <span>{getSubjectLine(selectedTemplate)}</span>
              </div>
            </div>
            <div className="p-6">
              <EmailPreviewContent templateId={selectedTemplate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSubjectLine(templateId: string): string {
  switch (templateId) {
    case "welcome":
      return "Welcome to YourApp!";
    case "invite-sent":
      return "You're invited to join Acme Corp";
    case "invite-accepted":
      return "Jane Smith accepted your invitation";
    case "subscription-changed":
      return "Your subscription has been upgraded to Pro";
    case "payment-failed":
      return "Payment of $29.00 failed";
    case "payment-received":
      return "Payment of $29.00 received";
    case "approaching-limit":
      return "Acme Corp has used 80% of AI Credits";
    case "member-removed":
      return "You have been removed from Acme Corp";
    default:
      return "Preview";
  }
}

function EmailPreviewContent({ templateId }: { templateId: string }) {
  switch (templateId) {
    case "welcome":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Welcome to YourApp!</h3>
          <p className="text-sm text-muted-foreground">Hi there,</p>
          <p className="text-sm text-muted-foreground">
            Thanks for signing up! Your account is ready and you can start using
            YourApp right away.
          </p>
          <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
            <li>Create or join a team</li>
            <li>Invite your teammates</li>
            <li>Explore AI-powered features</li>
          </ol>
          <div className="pt-4">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
              Go to Dashboard
            </span>
          </div>
        </div>
      );
    case "invite-sent":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">You&apos;re invited!</h3>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">John Doe</strong> has invited
            you to join <strong className="text-foreground">Acme Corp</strong>{" "}
            as a <strong className="text-foreground">Member</strong>.
          </p>
          <div className="pt-4">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
              Accept Invitation
            </span>
          </div>
        </div>
      );
    case "invite-accepted":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Invitation Accepted</h3>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Jane Smith</strong> has accepted
            the invitation to join{" "}
            <strong className="text-foreground">Acme Corp</strong>.
          </p>
          <div className="pt-4">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
              View Team
            </span>
          </div>
        </div>
      );
    case "subscription-changed":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Subscription Upgraded</h3>
          <p className="text-sm text-muted-foreground">
            The subscription for{" "}
            <strong className="text-foreground">Acme Corp</strong> has been
            upgraded from <strong className="text-foreground">Free</strong> to{" "}
            <strong className="text-foreground">Pro</strong>.
          </p>
          <div className="pt-4">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
              View Billing
            </span>
          </div>
        </div>
      );
    case "payment-failed":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Payment Failed</h3>
          <p className="text-sm text-muted-foreground">
            We were unable to process the payment of{" "}
            <strong className="text-foreground">$29.00</strong> for{" "}
            <strong className="text-foreground">Acme Corp</strong>.
          </p>
          <div className="pt-4">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
              Update Payment Method
            </span>
          </div>
        </div>
      );
    case "payment-received":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Payment Received</h3>
          <p className="text-sm text-muted-foreground">
            We&apos;ve received your payment of{" "}
            <strong className="text-foreground">$29.00</strong> for the{" "}
            <strong className="text-foreground">Pro</strong> plan.
          </p>
          <div className="pt-4">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
              View Billing
            </span>
          </div>
        </div>
      );
    case "approaching-limit":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Usage Alert</h3>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Acme Corp</strong> has used{" "}
            <strong className="text-foreground">80%</strong> of the{" "}
            <strong className="text-foreground">AI Credits</strong> allocation.
          </p>
          <div className="bg-warning/10 border border-warning/20 rounded-md p-3 text-center">
            <p className="text-sm font-bold text-warning">80 / 100 used</p>
          </div>
          <div className="pt-4">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
              Upgrade Plan
            </span>
          </div>
        </div>
      );
    case "member-removed":
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Team Membership Update</h3>
          <p className="text-sm text-muted-foreground">
            Hi Jane Smith, you have been removed from{" "}
            <strong className="text-foreground">Acme Corp</strong>.
          </p>
          <div className="pt-4">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium">
              Go to Dashboard
            </span>
          </div>
        </div>
      );
    default:
      return <p className="text-sm text-muted-foreground">Select a template</p>;
  }
}
