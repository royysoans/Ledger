import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface TransactionAlertEmailProps {
  recipient: string;
  amount: number;
  category: string;
  reference?: string;
  timestamp?: string;
}

export const TransactionAlertEmail = ({
  recipient,
  amount,
  category,
  reference,
  timestamp,
}: TransactionAlertEmailProps) => {
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

  return (
    <Html>
      <Head />
      <Preview>Transaction Confirmation - {formattedAmount}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Transaction Confirmation</Heading>
          <Text style={paragraph}>
            A transactional mutation was completed with the following parameters:
          </Text>
          <Section style={card}>
            <Text style={label}>RECIPIENT</Text>
            <Text style={value}>{recipient}</Text>
            <Hr style={hr} />
            <Text style={label}>AMOUNT</Text>
            <Text style={amountValue}>{formattedAmount}</Text>
            <Hr style={hr} />
            <Text style={label}>CATEGORY</Text>
            <Text style={value}>{category}</Text>
            {reference && (
              <>
                <Hr style={hr} />
                <Text style={label}>REFERENCE</Text>
                <Text style={value}>{reference}</Text>
              </>
            )}
            {timestamp && (
              <>
                <Hr style={hr} />
                <Text style={label}>TIMESTAMP</Text>
                <Text style={value}>{timestamp}</Text>
              </>
            )}
          </Section>
          <Text style={footer}>
            Automated lifecycle event triggered by FST1 Enterprise Core.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "32px 16px",
  maxWidth: "520px",
};

const heading = {
  fontSize: "20px",
  fontWeight: "600",
  letterSpacing: "-0.5px",
  color: "#18181b",
};

const paragraph = {
  fontSize: "14px",
  color: "#71717a",
  lineHeight: "20px",
  marginBottom: "16px",
};

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e4e4e7",
  padding: "20px",
};

const label = {
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  color: "#a1a1aa",
  textTransform: "uppercase" as const,
  margin: "4px 0 2px 0",
};

const value = {
  fontSize: "14px",
  fontWeight: "500",
  color: "#18181b",
  margin: "0 0 4px 0",
};

const amountValue = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#09090b",
  margin: "0 0 4px 0",
};

const hr = {
  borderColor: "#f4f4f5",
  margin: "12px 0",
};

const footer = {
  fontSize: "12px",
  color: "#a1a1aa",
  marginTop: "24px",
  textAlign: "center" as const,
};

export default TransactionAlertEmail;
