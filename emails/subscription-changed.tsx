import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface SubscriptionChangedEmailProps {
  teamName: string;
  previousTier: string;
  newTier: string;
  changeType: "upgrade" | "downgrade";
}

export default function SubscriptionChangedEmail({
  teamName = "Acme Corp",
  previousTier = "Free",
  newTier = "Pro",
  changeType = "upgrade",
}: SubscriptionChangedEmailProps) {
  const baseUrl = process.env.SITE_URL ?? "https://yourapp.com";
  const isUpgrade = changeType === "upgrade";
  return (
    <EmailLayout
      preview={`Your ${teamName} subscription has been ${isUpgrade ? "upgraded" : "changed"} to ${newTier}`}
    >
      <Heading style={heading}>
        Subscription {isUpgrade ? "Upgraded" : "Changed"}
      </Heading>
      <Text style={paragraph}>
        The subscription for <strong>{teamName}</strong> has been{" "}
        {isUpgrade ? "upgraded" : "changed"} from{" "}
        <strong>{previousTier}</strong> to <strong>{newTier}</strong>.
      </Text>
      {isUpgrade ? (
        <Text style={paragraph}>
          You now have access to all {newTier} features. Enjoy!
        </Text>
      ) : (
        <Text style={paragraph}>
          Your new plan limits will take effect at the start of the next billing
          cycle.
        </Text>
      )}
      <Button style={button} href={`${baseUrl}/t`}>
        View Billing
      </Button>
    </EmailLayout>
  );
}

const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#09090b",
  margin: "0 0 16px",
};

const paragraph: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#3c4043",
  margin: "0 0 12px",
};

const button: React.CSSProperties = {
  backgroundColor: "#09090b",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  marginTop: "24px",
};
