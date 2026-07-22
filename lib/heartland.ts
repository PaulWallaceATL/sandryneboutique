import "server-only";
import {
  Address,
  CreditCardData,
  PorticoConfig,
  ServicesContainer,
} from "globalpayments-api";

export function heartlandConfigured(): boolean {
  return Boolean(process.env.HEARTLAND_SECRET_KEY);
}

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const config = new PorticoConfig();
  config.secretApiKey = process.env.HEARTLAND_SECRET_KEY!;
  config.developerId = process.env.HEARTLAND_DEVELOPER_ID || "000000";
  config.versionNumber = process.env.HEARTLAND_VERSION_NUMBER || "0000";
  ServicesContainer.configureService(config);
  configured = true;
}

export interface ChargeInput {
  /** Single-use payment token from Heartland hosted fields */
  token: string;
  /** Amount in dollars */
  amount: number;
  postalCode: string;
  streetAddress: string;
}

export interface ChargeResult {
  ok: boolean;
  transactionId?: string;
  message?: string;
}

export async function chargeCard(input: ChargeInput): Promise<ChargeResult> {
  ensureConfigured();

  const card = new CreditCardData();
  card.token = input.token;

  const address = new Address();
  address.postalCode = input.postalCode;
  address.streetAddress1 = input.streetAddress;

  try {
    const response = await card
      .charge(input.amount)
      .withCurrency("USD")
      .withAddress(address)
      .execute();

    if (response.responseCode === "00") {
      return { ok: true, transactionId: response.transactionId };
    }
    return {
      ok: false,
      message: declineMessage(response.responseCode, response.responseMessage),
    };
  } catch (err) {
    console.error("Heartland charge failed:", err);
    return {
      ok: false,
      message: "We couldn't process your payment. Please check your card details and try again.",
    };
  }
}

function declineMessage(code: string | undefined, raw: string | undefined): string {
  switch (code) {
    case "02":
    case "03":
    case "05":
      return "Your card was declined. Please try a different card or contact your bank.";
    case "51":
      return "Your card was declined due to insufficient funds.";
    case "54":
      return "Your card has expired. Please use a different card.";
    default:
      return raw
        ? `Payment failed: ${raw}. Please try again.`
        : "Payment failed. Please try again.";
  }
}
