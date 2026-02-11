import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface WelcomeEmailProps {
  userName: string;
}

export default function WelcomeEmail({
  userName = "there",
}: WelcomeEmailProps) {
  const baseUrl = process.env.SITE_URL ?? "https://yourapp.com";
  return (
    <EmailLayout preview={`Welcome to YourApp, ${userName}!`}>
      <Heading style={heading}>Welcome to YourApp!</Heading>
      <Text style={paragraph}>Hi {userName},</Text>
      <Text style={paragraph}>
        Thanks for signing up! Your account is ready and you can start using
        YourApp right away.
      </Text>
      <Text style={paragraph}>Here are a few things to get you started:</Text>
      <Text style={listItem}>1. Create or join a team</Text>
      <Text style={listItem}>2. Invite your teammates</Text>
      <Text style={listItem}>3. Explore AI-powered features</Text>
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

const listItem: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#3c4043",
  margin: "0 0 4px",
  paddingLeft: "8px",
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
