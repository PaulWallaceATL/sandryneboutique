export interface PolicySection {
  heading: string;
  body: string[];
}

export interface Policy {
  slug: string;
  title: string;
  intro: string;
  sections: PolicySection[];
}

export const POLICIES: Policy[] = [
  {
    slug: "shipping",
    title: "Shipping",
    intro:
      "Every Sandryne order is prepared with care and shipped in protective, recyclable packaging.",
    sections: [
      {
        heading: "Processing time",
        body: [
          "Orders are processed within 1–2 business days. Orders placed on weekends or holidays begin processing the next business day.",
        ],
      },
      {
        heading: "Delivery",
        body: [
          "Standard shipping (3–7 business days) is calculated at checkout based on your address.",
          "Orders over $200 ship free within the United States.",
          "Once your order ships, you will receive a confirmation email with tracking information.",
        ],
      },
      {
        heading: "International",
        body: [
          "We currently ship within the United States and Canada. Duties and taxes on international orders are the responsibility of the recipient.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns & Exchanges",
    intro:
      "We want you to love every piece. If something isn't right, we make it easy to return or exchange.",
    sections: [
      {
        heading: "Return window",
        body: [
          "Returns are accepted within 14 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached.",
          "Final sale items, jewelry, and accessories are not eligible for return unless defective.",
        ],
      },
      {
        heading: "How to start a return",
        body: [
          "Email us at hello@sandryneboutique.com with your order number and the items you'd like to return. We'll respond within one business day with instructions.",
          "Return shipping costs are the responsibility of the customer unless the item arrived damaged or incorrect.",
        ],
      },
      {
        heading: "Refunds",
        body: [
          "Once your return is received and inspected, refunds are issued to the original payment method within 5–10 business days.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    intro:
      "Your privacy matters to us. This policy explains what we collect, why, and how we protect it.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "When you place an order or create an account, we collect your name, email address, shipping address, and order history.",
          "Payment card details are processed securely by our payment provider (Heartland / Global Payments) and never touch our servers.",
        ],
      },
      {
        heading: "How we use it",
        body: [
          "We use your information to fulfill orders, provide customer support, and — if you opt in — send you news about new arrivals and offers.",
          "We never sell your personal information to third parties.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may request access to, correction of, or deletion of your personal data at any time by contacting hello@sandryneboutique.com.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    intro:
      "By using sandryneboutique.com, you agree to the following terms.",
    sections: [
      {
        heading: "Orders & pricing",
        body: [
          "All prices are listed in USD. We reserve the right to correct pricing errors and to cancel orders affected by them, with a full refund.",
          "Placing an order constitutes an offer to purchase; orders are confirmed once payment is authorized.",
        ],
      },
      {
        heading: "Product availability",
        body: [
          "Inventory is limited and curated. If an item becomes unavailable after you order, we will notify you promptly and refund the affected items.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "All content on this site — photography, copy, and branding — is the property of Sandryne Boutique and may not be reproduced without permission.",
        ],
      },
      {
        heading: "Contact",
        body: [
          "Questions about these terms can be sent to hello@sandryneboutique.com.",
        ],
      },
    ],
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return POLICIES.find((p) => p.slug === slug);
}
