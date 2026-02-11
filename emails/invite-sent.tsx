import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface InviteSentEmailProps {
  inviterName: string;
  teamName: string;
  roleName: string;
  inviteUrl: string;
}

export default function InviteSentEmail({
  inviterName = "John Doe",
  teamName = "Acme Corp",
  roleName = "Member",
  inviteUrl = "https://yourapp.com/t",
}: InviteSentEmailProps) {
  return (
    <EmailLayout preview={`${inviterName} invited you to join ${teamName}`}>
      <Heading style={heading}>You&apos;re invited!</Heading>
      <Text style={paragraph}>
        <strong>{inviterName}</strong> has invited you to join{" "}
        <strong>{teamName}</strong> as a <strong>{roleName}</strong>.
      </Text>
      <Text style={paragraph}>
        Click the button below to accept the invitation and join the team.
      </Text>
      <Button style={button} href={inviteUrl}>
        Accept Invitation
      </Button>
      <Text style={muted}>
        If you don&apos;t want to join this team, you can safely ignore this
        email.
      </Text>
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

const muted: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#8898aa",
  marginTop: "24px",
};
