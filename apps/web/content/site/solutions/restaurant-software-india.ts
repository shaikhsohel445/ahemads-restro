import type { SolutionPage } from "./types";

// India market page, English only (no Arabic version exists, so no hreflang
// pair). Every India-specific behaviour here is opt-in: new restaurants are
// created with Saudi defaults and switched to INR / Asia/Kolkata / INDIA_GST
// in Settings.
export const restaurantSoftwareIndia: SolutionPage = {
  slug: "restaurant-software-india",
  locales: ["en"],
  related: ["restaurant-billing-software", "restaurant-pos-software", "kitchen-display-system", "qr-ordering-system"],
  copy: {
    en: {
      metaTitle: "Restaurant Software India: GST & UPI | Ahemad's Restro",
      metaDescription:
        "Restaurant POS and billing for India: GST receipts with CGST/SGST split and GSTIN, INR pricing, UPI QR at checkout, KOT and kitchen display. Book a demo now.",
      keywords: [
        "restaurant software India",
        "restaurant billing software India",
        "GST billing software for restaurants",
        "restaurant POS with UPI",
        "KOT billing software",
        "restaurant management software India",
      ],
      navLabel: "Restaurant software for India",
      h1: "Restaurant software with GST billing and UPI for India",
      intro:
        "Switch Ahemad's Restro to Indian settings and your receipts show GST split into CGST and SGST with your GSTIN, prices are in rupees, and guests can scan a UPI QR code with the exact amount filled in.",
      problem: {
        title: "What Indian restaurants look for in billing software",
        paragraphs: [
          "Restaurant owners in India usually judge billing software on a few practical points: does the bill show GST correctly with CGST and SGST, is the GSTIN printed, can a guest pay by UPI without the cashier typing the amount into their own phone, and does the kitchen get a KOT the moment an order is placed.",
          "Ahemad's Restro handles these through settings rather than a separate product. Pick India GST as the branch's tax regime, INR as the currency and Asia/Kolkata as the time zone, add your UPI ID, and the POS, receipts and reports follow those choices.",
        ],
      },
      capabilities: {
        title: "India-specific features",
        items: [
          { icon: "currency", title: "GST with CGST/SGST split", body: "With the India GST regime and tax-inclusive pricing, receipts break the GST amount into equal CGST and SGST lines. Each menu item carries its own GST rate." },
          { icon: "billing", title: "GSTIN on every receipt", body: "Enter the branch GSTIN once and it prints on browser and thermal receipts." },
          { icon: "qr", title: "UPI QR at checkout", body: "Choose UPI and the POS shows a QR code with your UPI ID and the bill amount pre-filled; it also appears on the customer display. Staff confirm the payment before completing the bill." },
          { icon: "menu", title: "Menus the Indian way", body: "Vegetarian and non-vegetarian marks on every item, half and custom portions, modifiers and combos." },
          { icon: "kds", title: "KOT and kitchen display", body: "Orders go to the right kitchen station's display and can print as a KOT on a network thermal printer or through the browser." },
          { icon: "pos", title: "Delivery by PIN code", body: "Set delivery zones by postal PIN code with a delivery fee, minimum order and ETA, then assign drivers and track each delivery." },
          { icon: "reports", title: "GST summary by rate", body: "See taxable value and GST by rate for any period, alongside sales, item, payment-method and staff reports with Excel, CSV and PDF export." },
        ],
      },
      local: {
        title: "Set up for India in Settings",
        points: [
          "Branch & tax: choose India GST and enter the GSTIN",
          "Restaurant: choose INR as the currency",
          "Restaurant: set the time zone to Asia/Kolkata",
          "Restaurant: add your UPI ID and payee name for the checkout QR",
          "Menu: set the GST rate on each item",
        ],
        note: "New restaurants start with Saudi defaults (SAR, Asia/Riyadh, Saudi VAT), so make these changes before you take your first order. Confirm the GST rates that apply to you with your chartered accountant.",
      },
      limits: {
        title: "Not included",
        points: [
          "No GST e-invoicing or IRN generation integration.",
          "No payment gateway: UPI payments are not verified automatically, so staff confirm them before completing the bill.",
          "No integration with food-delivery aggregators such as Swiggy or Zomato.",
          "Receipts split GST into CGST and SGST only; there is no IGST line.",
          "The interface is in English and Arabic; Hindi and other Indian languages are not available.",
        ],
      },
      faq: [
        {
          q: "Does the receipt show CGST and SGST separately?",
          a: "Yes. When a branch uses the India GST regime with tax-inclusive prices, the receipt shows the GST included in the total as equal CGST and SGST lines, along with your GSTIN.",
        },
        {
          q: "How does UPI payment work?",
          a: "Add your UPI ID in Settings. At checkout, choosing UPI shows a QR code that opens any UPI app with your ID and the bill amount filled in. Because there is no payment gateway, the cashier checks that the money has arrived before completing the payment.",
        },
        {
          q: "Which GST rate should I use?",
          a: "Set the rate on each menu item according to your registration and the items you sell. The software applies the rates you enter; your chartered accountant should confirm them.",
        },
        {
          q: "Does it support GST e-invoicing?",
          a: "No. GST e-invoicing and IRN generation are not integrated. The software prints GST receipts and gives you a GST summary by rate for your accountant.",
        },
        {
          q: "Can I print KOTs?",
          a: "Yes. Kitchen order tickets can be printed through the browser or sent to a network thermal printer that is reachable from the internet, in addition to the on-screen kitchen display.",
        },
      ],
      cta: {
        title: "See GST billing and UPI in a demo",
        body: "Request a demo and Wem Studios will contact you to set up a branch with your GST rates, UPI ID and menu, and walk through billing and KOTs.",
      },
      image: {
        src: "/images/product/screens/mobile-pos-en.webp",
        alt: "Ahemad's Restro POS on a phone with menu items and the current order",
      },
    },
  },
};
