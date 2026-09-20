# LedgerCraft

LedgerCraft delivers end-to-end ledger auditing, real-time transaction processing, role-based access control (RBAC), and automated transactional email dispatch. It features a clean, high-contrast monochrome design with clear color indicators for transaction states.

---

## Tech Stack

- **Framework**: Next.js (App Router, Server Actions, Edge Middleware)
- **Database & ORM**: PostgreSQL / SQLite via Prisma ORM
- **State Management**: Zustand
- **Form Handling & Validation**: React Hook Form, Zod
- **UI & Styling**: Radix UI Primitives, Lucide Icons, Vanilla CSS / Tailwind utilities
- **Email Delivery**: React Email components, Resend API, Inbound Webhook Processing
- **Mock Data Seeding**: `@faker-js/faker`

---

## Key Features

### 1. Financial Ledger & Transaction Processing
- Real-time double-entry style transaction recording (`CREDIT` and `DEBIT`).
- Status progression lifecycle: `PENDING` → `COMPLETED` / `FAILED`.
- Multi-field filtering (category, status, date range, amount threshold) with instant search.
- Clean high-contrast table view with direct color status formatting without pill wrappers.

### 2. Comprehensive Audit Trail
- Automated logging of every financial mutation and operational state change.
- Tracks timestamp, actor identity, action type, IP address, and before/after payloads.

### 3. Role-Based Access Control (RBAC)
- Role definitions: `ADMIN`, `MANAGER`, `ANALYST`, and `VIEWER`.
- Route-level security enforced by Next.js Edge middleware.
- Server Actions enforce identity checks and field-level permissions.

### 4. Transactional Emails & Webhook Processing
- Email generation powered by `@react-email/components` and `@react-email/render`.
- Real-time delivery via Resend API (`resend.emails.send`).
- Dedicated webhook handler (`/api/webhooks/resend`) for delivery, open, and bounce tracking.
- Email dispatch history logged directly in the database (`EmailLog`).

### 5. Automated Realistic Data Seeding
- Pre-configured `prisma/seed.ts` using `@faker-js/faker`.
- Seeds 50+ transactions across diverse categories (Payroll, Infrastructure, Revenue, Equipment, Consulting).
- Configures default administrator account (`Royston Soans` / `roystonsoans3@gmail.com`).


### Prerequisites

- Node.js (v18.17 or later)
- npm or pnpm
- A Resend API Key (for email notifications)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/royysoans/Ledger.git
cd Ledger
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="onboarding@resend.dev"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize the Database & Run Seeds

```bash
# Push schema migrations
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed realistic initial data
npx prisma db seed
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/transactions` | Query filtered & paginated transactions |
| `POST` | `/api/transactions` | Create and validate a new transaction |
| `POST` | `/api/webhooks/resend` | Ingest Resend email events (delivered, bounced, opened) |

---

## Database Schema Highlights

- **`User`**: Account identity, email, authentication tokens, and associated `Role`.
- **`Transaction`**: Amount, type (`CREDIT` / `DEBIT`), category, status (`PENDING`, `COMPLETED`, `FAILED`), reference number.
- **`AuditLog`**: Action, entity type, entity ID, metadata JSON, user relationship.
- **`EmailLog`**: Resend message ID, recipient, subject, status, event timestamps.
