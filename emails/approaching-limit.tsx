import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface ApproachingLimitEmailProps {
  teamName: string;
  limitName: string;
  currentUsage: number;
  limit: number;
  percentUsed: number;
}

export default function ApproachingLimitEmail({
  teamName = "Acme Corp",
  limitName = "AI Credits",
  currentUsage = 80,
  limit = 100,
  percentUsed = 80,
}: ApproachingLimitEmailProps) {
  const baseUrl = process.env.SITE_URL ?? "https://yourapp.com";
  return (
    <EmailLayout
      preview={`${teamName} has used ${percentUsed}% of ${limitName}`}
    >
      <Heading style={heading}>Usage Alert</Heading>
      <Text style={paragraph}>
        <strong>{teamName}</strong> has used <strong>{percentUsed}%</strong> of
        the <strong>{limitName}</strong> allocation.
      </Text>
      <Text style={usageBar}>
        {currentUsage} / {limit} used
      </Text>
      <Text style={paragraph}>
        Consider upgrading your plan to avoid hitting the limit and service
        interruption.
      </Text>
      <Button style={button} href={`${baseUrl}/t`}>
        Upgrade Plan
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

const usageBar: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#e65100",
  backgroundColor: "#fff3e0",
  padding: "12px 16px",
  borderRadius: "6px",
  textAlign: "center" as const,
  margin: "16px 0",
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
