import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface PaymentReceivedEmailProps {
  teamName: string;
  amount: string;
  planName: string;
}

export default function PaymentReceivedEmail({
  teamName = "Acme Corp",
  amount = "$29.00",
  planName = "Pro",
}: PaymentReceivedEmailProps) {
  const baseUrl = process.env.SITE_URL ?? "https://yourapp.com";
  return (
    <EmailLayout preview={`Payment of ${amount} received for ${teamName}`}>
      <Heading style={heading}>Payment Received</Heading>
      <Text style={paragraph}>
        We&apos;ve received your payment of <strong>{amount}</strong> for the{" "}
        <strong>{planName}</strong> plan for <strong>{teamName}</strong>.
      </Text>
      <Text style={paragraph}>Thank you for your continued support!</Text>
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
