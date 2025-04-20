# Signhey - Document Signing SaaS

A modern legal document signing SaaS built with Next.js, TypeScript, Supabase authentication, Stripe payments, and a tiered subscription model.

## Features

- **Japanese Minimalist Design**: Clean UI with orange accent colors
- **3-Step Document Signing Process**:
  1. Agreement: Review and sign legal documents
  2. Files: Upload supporting documents
  3. Payment: Complete the transaction with Stripe
- **Dual Operation Modes**:
  - PREVIEW mode for testing without consuming quota
  - LIVE mode for actual document processing with quota limits
- **Tiered Subscription Plans**:
  - Free: 0 LIVE signing quota
  - Pro: $49/month with 30 LIVE signings
  - Enterprise: $149/month with 100 LIVE signings
- **Database Storage**: PostgreSQL for secure data persistence
- **Stripe Integration**: For payment processing
- **Supabase Authentication**: For user management

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Styling**: Tailwind CSS with Japanese minimalist design principles

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account for payment processing
- Supabase account for authentication

### Environment Variables

The following environment variables are required:

```
# Database
DATABASE_URL=postgresql://...

# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up the database:
   ```
   npm run db:push
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.