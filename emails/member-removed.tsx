import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface MemberRemovedEmailProps {
  memberName: string;
  teamName: string;
}

export default function MemberRemovedEmail({
  memberName = "Jane Smith",
  teamName = "Acme Corp",
}: MemberRemovedEmailProps) {
  const baseUrl = process.env.SITE_URL ?? "https://yourapp.com";
  return (
    <EmailLayout preview={`You have been removed from ${teamName}`}>
      <Heading style={heading}>Team Membership Update</Heading>
      <Text style={paragraph}>
        Hi {memberName}, you have been removed from <strong>{teamName}</strong>.
      </Text>
      <Text style={paragraph}>
        You no longer have access to this team&apos;s resources. If you believe
        this was a mistake, please contact the team administrator.
      </Text>
      <Button style={button} href={`${baseUrl}/t`}>
        Go to Dashboard
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
