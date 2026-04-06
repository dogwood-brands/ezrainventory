# Ezra Portal

<div align="center">
  <img src="public/logo.svg" alt="Ezra Logo" width="120" />
  <h3>Enterprise AI Automation Platform for Franchise Operations</h3>
  <p>Client Portal & Marketing Site</p>
</div>

---

## Overview

Ezra is a **managed AI automation platform** designed for franchisors, franchisees, and multi-unit operators. This repository contains the front-end codebase for both the public marketing website and the secure client portal.

### Key Features

- **Universal POS Integration**: Connects to Zenoti, Stripe, Toast, Square, and more
- **Automated Data Extraction**: Intelligent automation for systems without APIs
- **Real-time Analytics**: Comprehensive dashboards for sales, labor, and operations
- **Multi-location Support**: Scales from 3 to 200+ locations per client
- **Role-based Access**: Support for franchisors, franchisees, and managers

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| State | React Context |
| Date Handling | date-fns |

---

## Ezra Modules

### Ezra Sales (`/app/sales`)
Real-time sales intelligence across all locations.
- Revenue tracking and goal monitoring
- Service vs. product mix analysis
- Top/bottom performer rankings
- Daily trend visualization

### Ezra Scheduling (`/app/scheduling`)
Labor optimization and scheduling intelligence.
- Idle time detection (labor hours with zero revenue)
- Time-of-day traffic analysis
- SRPH (Sales Revenue Per Hour) tracking
- Overtime monitoring and alerts
- AI-generated scheduling recommendations

**Routes:**
- `/app/scheduling` — Multi-location overview ranked by idle %
- `/app/scheduling/[storeId]` — Store drilldown with hourly insights

### Ezra Exponential (`/app/exponential`)
Customer retention and follow-up automation.
- Visit frequency bucketing (4-week, 6-week, 8-week segments)
- SMS campaign tracking via Twilio integration
- Uptake effectiveness measurement
- Retention risk scoring by location

**Routes:**
- `/app/exponential` — Portfolio overview with segment breakdown
- `/app/exponential/[storeId]` — Store drilldown with guest samples

### Ezra LP (`/app/lp`)
Loss prevention and anomaly detection.
- Risk score monitoring
- Refund/discount pattern alerts
- Transaction anomaly flagging

---

## Project Structure

```
ezra-portal/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (marketing)/        # Public marketing site
│   │   │   ├── page.tsx        # Home/Landing
│   │   │   ├── about/          # About page
│   │   │   ├── bots/           # Product pages
│   │   │   ├── contact/        # Contact form
│   │   │   ├── privacy/        # Privacy policy
│   │   │   └── terms/          # Terms of service
│   │   ├── (auth)/             # Authentication
│   │   │   └── login/          # Login page
│   │   └── app/                # Client portal (protected)
│   │       ├── page.tsx        # Executive dashboard
│   │       ├── sales/          # Ezra Sales module
│   │       ├── scheduling/     # Ezra Scheduling module
│   │       │   └── [storeId]/  # Store drilldown
│   │       ├── exponential/    # Ezra Exponential module
│   │       │   └── [storeId]/  # Store drilldown
│   │       ├── lp/             # Ezra LP module
│   │       ├── locations/      # Location management
│   │       │   └── [storeId]/  # Location detail
│   │       ├── reports/        # Reports section
│   │       └── settings/       # User settings
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base primitives (Button, Card, Input, DataTable)
│   │   ├── charts/             # Chart wrappers (ChartCard)
│   │   ├── dashboard/          # Dashboard components (KPICard)
│   │   └── layout/             # Layout components (Sidebar, TopBar)
│   ├── data/                   # Mock data modules
│   │   ├── mockClients.ts
│   │   ├── mockLocations.ts
│   │   ├── mockSalesData.ts
│   │   ├── mockSchedulingData.ts
│   │   └── mockExponentialData.ts
│   ├── hooks/                  # Custom React hooks
│   │   ├── useLocations.ts
│   │   ├── useOverviewMetrics.ts
│   │   ├── useSalesData.ts
│   │   ├── useSchedulingData.ts
│   │   └── useExponentialData.ts
│   ├── lib/                    # Utility functions
│   │   ├── utils.ts
│   │   └── formatters.ts
│   ├── context/                # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   └── types/                  # TypeScript definitions
│       └── index.ts
├── public/                     # Static assets
├── tailwind.config.js          # Tailwind configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ezra-portal.git
cd ezra-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Authentication

This build uses a restricted login system for demo purposes.

### Allowed Emails

| Email | Demo Banner | Use Case |
|-------|-------------|----------|
| `dogwoodtesting@meetezra.bot` | No | Internal testing |
| `rob@breezemarketing.ca` | Yes | Partner preview |

All other emails will be rejected with "Invalid credentials".

### Modifying Access

**Add/remove allowed emails:**
```typescript
// src/context/AuthContext.tsx
const ALLOWED_EMAILS = [
  'dogwoodtesting@meetezra.bot',
  'rob@breezemarketing.ca',
  // Add more emails here
];
```

**Change demo banner trigger:**
```typescript
// src/app/app/layout.tsx
const DEMO_BANNER_EMAIL = 'rob@breezemarketing.ca';
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Mock Data

All dashboard data is generated via mock modules for demo purposes.

### Data Modules

| Module | Description |
|--------|-------------|
| `mockLocations.ts` | 24 store locations across MN, TX, CA, FL |
| `mockSalesData.ts` | Daily sales records with revenue, tickets, tips |
| `mockSchedulingData.ts` | Hourly labor buckets, idle time, SRPH metrics |
| `mockExponentialData.ts` | Customer segments, campaign activity, uptake rates |

### Replacing with Real Data

1. Update `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
2. Modify hooks in `/src/hooks/` to call real API endpoints
3. Ensure API response shapes match existing TypeScript interfaces

---

## Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Ezra Cyan 500 | `#06b6d4` | Primary brand, buttons, accents |
| Ezra Cyan 400 | `#22d3ee` | Hover states, gradients |
| Success 500 | `#22c55e` | Positive metrics, 4-week segment |
| Warning 500 | `#f59e0b` | Caution states, 6-week segment |
| Danger 500 | `#ef4444` | Alerts, 8-week segment |
| Surface 900 | `#18181b` | Dark mode background |

### Typography

- **Display**: Bold headlines, tight letter-spacing
- **Body**: Clean, readable content text
- **Mono**: Code and technical data

---

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

```env
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.ezra.ai
```

---

## Version History

| Version | Description |
|---------|-------------|
| Ezra 1.0 | Initial build with Sales, LP, Locations |
| meetezra.bot | Restricted login + conditional demo banner |
| meetezra.bot + Scheduling | Full Ezra Scheduling module |
| meetezra.bot + Exponential | Full Ezra Exponential module |

---

## License

Proprietary - Ezra AI, Inc. All rights reserved.

---

<div align="center">
  <p>Built with ❤️ by the Ezra Engineering Team</p>
</div>
