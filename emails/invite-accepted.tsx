import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface InviteAcceptedEmailProps {
  memberName: string;
  teamName: string;
}

export default function InviteAcceptedEmail({
  memberName = "Jane Smith",
  teamName = "Acme Corp",
}: InviteAcceptedEmailProps) {
  const baseUrl = process.env.SITE_URL ?? "https://yourapp.com";
  return (
    <EmailLayout
      preview={`${memberName} accepted your invitation to ${teamName}`}
    >
      <Heading style={heading}>Invitation Accepted</Heading>
      <Text style={paragraph}>
        Great news! <strong>{memberName}</strong> has accepted the invitation to
        join <strong>{teamName}</strong>.
      </Text>
      <Text style={paragraph}>
        They now have access to the team and can start collaborating.
      </Text>
      <Button style={button} href={`${baseUrl}/t`}>
        View Team
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
