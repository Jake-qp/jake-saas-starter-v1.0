import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

/**
 * Shared email layout with brand header and footer.
 * All transactional emails use this wrapper for consistent branding.
 */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  const baseUrl = process.env.SITE_URL ?? "https://yourapp.com";
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Brand Header */}
          <Section style={header}>
            <Link href={baseUrl} style={logoLink}>
              <Text style={logoText}>YourApp</Text>
            </Link>
          </Section>
          <Hr style={divider} />

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} YourApp. All rights reserved.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/legal/privacy`} style={footerLink}>
                Privacy Policy
              </Link>
              {" • "}
              <Link href={`${baseUrl}/legal/terms`} style={footerLink}>
                Terms of Service
              </Link>
              {" • "}
              <Link href={`${baseUrl}/t`} style={footerLink}>
                Dashboard
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
  borderRadius: "8px",
};

const header: React.CSSProperties = {
  padding: "20px 32px",
};

const logoLink: React.CSSProperties = {
  textDecoration: "none",
};

const logoText: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#09090b",
  margin: "0",
};

const divider: React.CSSProperties = {
  borderColor: "#e6ebf1",
  margin: "0",
};

const content: React.CSSProperties = {
  padding: "32px",
};

const footer: React.CSSProperties = {
  padding: "20px 32px",
};

const footerText: React.CSSProperties = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0 0 8px",
};

const footerLinks: React.CSSProperties = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0",
};

const footerLink: React.CSSProperties = {
  color: "#556cd6",
  textDecoration: "none",
};
