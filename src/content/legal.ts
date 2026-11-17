import scraped from "./legal.json";

// Returns, Terms, Privacy and Cookies: BDSG's published texts (bdsgbrands.com, effective Aug 21, 2026),
// pulled into legal.json. Shipping and Membership below are assembled from what BDSG publishes;
// blocks typed "tbc" are facts BDSG must supply before launch and render highlighted.
export type Block = { t: "h2" | "h3" | "p" | "li" | "tbc"; text: string; label?: string };
export type Doc = { title: string; effective: string; summary: string; blocks: Block[] };

const summaries: Record<string, string> = {
  returns: "Unopened products within 15 days. Damaged or wrong items are always handled.",
  terms: "The rules for using this site and buying from BDSG Brands, LLC.",
  privacy: "What we collect, why, who we share it with and the choices you have.",
  cookies: "The cookies this site uses and how to control them.",
};

const shipping: Doc = {
  title: "Shipping Policy",
  effective: "Pending BDSG approval",
  summary: "Where we ship, what it costs and when it arrives.",
  blocks: [
    { t: "h2", text: "1. Where we ship" },
    { t: "p", text: "BDSG ships direct-to-consumer orders to addresses in the United States." },
    { t: "tbc", text: "Confirm the destinations served: all 50 states, or the contiguous 48 only; and whether APO/FPO, PO boxes, Puerto Rico and other U.S. territories are accepted." },
    { t: "h2", text: "2. Shipping costs" },
    { t: "li", label: "Free shipping:", text: "standard shipping is free on qualifying direct-to-consumer orders of $70.00 or more, unless a different offer is displayed at checkout." },
    { t: "li", label: "Greatness Members:", text: "free shipping on eligible orders of $50.00 or more." },
    { t: "tbc", text: "Confirm the standard rate for orders under the free-shipping threshold (flat fee or carrier-calculated) and whether an expedited option is offered." },
    { t: "h2", text: "3. Processing and delivery times" },
    { t: "tbc", text: "Confirm order processing time (business days before an order ships), carriers used and estimated transit time." },
    { t: "p", text: "Delivery dates are estimates unless BDSG expressly guarantees otherwise. BDSG is not responsible for delays caused by circumstances outside its reasonable control, including carrier delays, weather, governmental actions, transportation interruptions, or inaccurate addresses supplied by the customer." },
    { t: "h2", text: "4. Your address" },
    { t: "p", text: "Customers are responsible for providing complete and accurate shipping information. Orders returned to BDSG because of an incorrect or incomplete address may be reshipped at the customer's cost or refunded less original shipping." },
    { t: "h2", text: "5. Taxes" },
    { t: "p", text: "Applicable sales taxes and shipping charges are disclosed at checkout before you pay." },
    { t: "h2", text: "6. Damaged, missing or incorrect orders" },
    { t: "p", text: "If your order arrives damaged, leaking, incorrect or incomplete, contact BDSG promptly with your order number and photographs. These problems are handled under Section 2 of the Return & Refund Policy and are not treated as ordinary returns." },
    { t: "h2", text: "7. Contact" },
    { t: "p", text: "BDSG Brands, LLC, West Jordan, Utah 84084. Website: bdsgbrands.com" },
  ],
};

const membership: Doc = {
  title: "Greatness Program Membership Terms",
  effective: "Pending BDSG approval",
  summary: "$55 to join, $35 a year after that, renews automatically. How to cancel and when refunds apply.",
  blocks: [
    { t: "p", text: "These terms summarize the Greatness Program membership offered by BDSG Brands, LLC. Section 6 of the Return & Refund Policy governs membership fees and cancellations, and the BDSG Greatness Program & Partner Agreement controls where it applies." },
    { t: "tbc", text: "BDSG to supply the full Greatness Program & Partner Agreement (wholesale and referral reward rules) so it can be published here or linked." },
    { t: "h2", text: "1. What the membership is" },
    { t: "p", text: "The Greatness Program is a one-year membership valid for one full year from the date of enrollment." },
    { t: "li", label: "Member pricing:", text: "discounts of up to 10% on BDSG formulas." },
    { t: "li", label: "Free shipping:", text: "on eligible orders of $50.00 or more." },
    { t: "li", label: "Priority access:", text: "early access to new product launches and limited editions." },
    { t: "li", label: "Community and content:", text: "access to the Greatness Program community and monthly wellness content." },
    { t: "li", label: "Referral code:", text: "a unique code to share; referral rewards follow the program rules." },
    { t: "h2", text: "2. Price and automatic renewal" },
    { t: "li", label: "Initial enrollment:", text: "$55.00, charged when you join." },
    { t: "li", label: "Annual renewal:", text: "$35.00 per year, charged automatically at the end of each membership year until you cancel." },
    { t: "p", text: "You agree to the automatic renewal by checking the renewal box when you join. For memberships subject to Utah Code Title 13, Chapter 70, BDSG sends a renewal notice at least 30 and not more than 60 days before renewal stating the renewal date, total renewal cost, cancellation options, and the cancellation deadline." },
    { t: "h2", text: "3. Cancelling and refunds" },
    { t: "li", label: "Within 24 hours of joining:", text: "the $55.00 enrollment fee is refunded if BDSG receives a written cancellation request within 24 hours after the timestamp of enrollment. The membership and its benefits end immediately." },
    { t: "li", label: "After 24 hours:", text: "the enrollment fee is non-refundable and not prorated, except where applicable law requires otherwise. Cancelling stops future renewals; benefits remain until the end of the paid term." },
    { t: "li", label: "Before renewal:", text: "cancellation must be received at least 24 hours before the scheduled renewal charge and no later than 8:00 PM Eastern Time (6:00 PM Mountain Time) on the cancellation-deadline date in your renewal notice." },
    { t: "li", label: "Missed deadline:", text: "the renewal may process automatically and the $35.00 renewal fee is non-refundable. No partial-year refunds or prorated credits, except where applicable law requires otherwise." },
    { t: "h2", text: "4. How to cancel" },
    { t: "p", text: "Use the Member account portal or the cancellation method identified on bdsgbrands.com. BDSG may also provide an email, web form, or other written electronic method." },
    { t: "h2", text: "5. Product returns for members" },
    { t: "p", text: "Members follow the same product-return rules as all customers: unopened products within 15 calendar days of purchase. Membership does not extend the return window." },
    { t: "h2", text: "6. Contact" },
    { t: "p", text: "BDSG Brands, LLC, West Jordan, Utah 84084. Website: bdsgbrands.com" },
  ],
};

const fromScrape = Object.fromEntries(
  Object.entries(scraped as Record<string, Omit<Doc, "summary">>).map(([k, d]) => [k, { ...d, summary: summaries[k] }]),
);

export const legal: Record<string, Doc> = { ...fromScrape, shipping, membership };
export const legalOrder: [string, string][] = [
  ["shipping", "Shipping"],
  ["returns", "Returns & refunds"],
  ["membership", "Membership terms"],
  ["terms", "Terms of sale"],
  ["privacy", "Privacy"],
  ["cookies", "Cookies"],
];
