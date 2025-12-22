# MNEE Pay Checkout Integration

This project serves as a live testbench and reference implementation for integrating the **@mnee-pay/checkout** SDK. It demonstrates how to embed crypto payment flows into a Next.js application, handling various use cases like donations, e-commerce, and digital content paywalls.

## 🚀 Features

The application showcases four distinct integration patterns:

- **❤️ Donation Flow**: A clean interface for accepting variable or fixed-amount crypto donations. Demonstrates customization options for the checkout button.
- **🛒 E-commerce Integration**: A product page simulation where users can view item details and purchase physical goods using MNEE Pay.
- **🔒 Paywall Access**: A digital rights management (DRM) example that unlocks premium content (articles, videos) only after a successful payment is confirmed.
- **📡 Webhook Inspector**: A real-time dashboard to visualize incoming webhook events from the MNEE Pay platform, useful for debugging payment status updates.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB (via Mongoose) for logging webhooks
- **Icons**: Lucide React
- **Payment SDK**: `@mnee-pay/checkout`

## 🏁 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A running MongoDB instance (local or Atlas)

### 1. Installation

Clone the repository and install the dependencies. Note that this project relies on a local tarball for the MNEE Pay SDK.

```bash
git clone https://github.com/prince-rockwallet/mnee-pay-checkout-integration
cd mnee-pay-checkout-integration

# Install dependencies
npm install
```

### 2\. Environment Configuration

Create a `.env` file in the root directory based on the provided example.

```bash
cp .env.example .env
```

Open `.env` and configure your variables:

```env
# Connection string for your MongoDB database
MONGODB_URI="mongodb://localhost:27017/mnee_pay_logs"

# The base URL for the MNEE Pay API (defaulting to local dev environment)
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001/api"
```

### 3\. Running the Development Server

Start the application in development mode:

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

## 📖 Usage Guide

Upon launching the app, you will see a dashboard with cards for the different modules.

1.  **Select a Module**: Click on "Donation Flow", "E-commerce", or "Paywall".
2.  **Enter Configuration ID**: You will be prompted to enter a **Button ID** or **Product ID**. These IDs correspond to the configuration created in your MNEE Pay admin dashboard.
3.  **Test Checkout**: The app will fetch the configuration and render the `MneeCheckout` component. You can proceed through the payment flow.
4.  **Monitor Webhooks**: Navigate to the Webhook Inspector to see the JSON payloads sent by the payment server upon transaction success.

## 📂 Project Structure

```
├── app/
│   ├── api/             # API routes (Webhook receiver)
│   ├── donation/        # Donation page logic
│   ├── ecommerce/       # E-commerce product page logic
│   ├── paywall/         # Content unlocking logic
│   └── page.tsx         # Main landing dashboard
├── components/
│   └── MneeCheckoutWrapper.tsx  # Dynamic import wrapper for the SDK
├── lib/
│   └── mongodb.ts       # Database connection helper
├── models/
│   └── WebhookLog.ts    # Mongoose schema for webhook events
└── public/              # Static assets
```

## 🤝 Contributing

Contributions are welcome\! Please feel free to submit a Pull Request.

---
