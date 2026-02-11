import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./layout";

interface PaymentFailedEmailProps {
  teamName: string;
  amount: string;
}

export default function PaymentFailedEmail({
  teamName = "Acme Corp",
  amount = "$29.00",
}: PaymentFailedEmailProps) {
  const baseUrl = process.env.SITE_URL ?? "https://yourapp.com";
  return (
    <EmailLayout preview={`Payment of ${amount} failed for ${teamName}`}>
      <Heading style={heading}>Payment Failed</Heading>
      <Text style={paragraph}>
        We were unable to process the payment of <strong>{amount}</strong> for{" "}
        <strong>{teamName}</strong>.
      </Text>
      <Text style={paragraph}>
        Please update your payment method to avoid service interruption. Your
        subscription will remain active for a grace period.
      </Text>
      <Button style={button} href={`${baseUrl}/t`}>
        Update Payment Method
      </Button>
      <Text style={muted}>
        If you believe this is an error, please contact our support team.
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
