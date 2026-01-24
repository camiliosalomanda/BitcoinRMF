# BizAI Platform

AI-powered C-Suite executives for small businesses. Get CFO-level financial insights, CMO marketing strategy, COO operational guidance, and more—all working together as a collaborative AI executive team.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key ([get one here](https://console.anthropic.com/))
- (Optional) Supabase account for database persistence

### Installation

```bash
# Clone or navigate to the project
cd bizai-platform

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Anthropic API key to .env.local
# ANTHROPIC_API_KEY=your_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 💾 Database Setup (Optional)

The app works without a database using local storage. For persistent, multi-device storage, set up Supabase:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Wait for the project to be provisioned

### 2. Run the Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run it to create all tables

### 3. Get Your API Keys

1. Go to **Project Settings** > **API**
2. Copy the **Project URL** and **anon/public key**
3. Add them to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Restart the App

```bash
npm run dev
```

The app will automatically use Supabase when configured.

## 📁 Project Structure

```
bizai-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── chat/          # Executive chat endpoint
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── onboarding/        # Company onboarding wizard
│   │   ├── settings/          # Company settings page
│   │   ├── page.tsx           # Landing page
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   │   └── Sidebar.tsx    # Executive navigation
│   │   ├── executives/        # Executive UI components
│   │   │   ├── ExecutiveChat.tsx
│   │   │   ├── ExecutiveMessages.tsx
│   │   │   └── CollaborationPanel.tsx
│   │   └── OnboardingGuard.tsx
│   │
│   ├── executives/            # Executive module classes
│   │   ├── shared/            # Base executive class
│   │   │   └── BaseExecutive.ts
│   │   ├── cfo/               # CFO module (Alex)
│   │   ├── cmo/               # CMO module (Jordan)
│   │   ├── coo/               # COO module (Morgan)
│   │   ├── cto/               # CTO module (Riley)
│   │   └── chro/              # CHRO module (Taylor)
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── useExecutive.ts    # Executive chat hook
│   │   ├── useCompany.ts      # Company context hook
│   │   └── useConversations.ts
│   │
│   ├── lib/                   # Utilities and services
│   │   ├── store.ts           # Zustand state store
│   │   ├── supabase.ts        # Supabase client
│   │   ├── messagesStore.ts   # Executive messages store
│   │   └── db/                # Database services
│   │       ├── companies.ts
│   │       ├── conversations.ts
│   │       └── executiveMessages.ts
│   │
│   └── types/                 # TypeScript types
│       ├── index.ts
│       ├── executives.ts
│       └── database.ts
│
├── supabase/
│   └── schema.sql             # Database schema
│
├── .env.example               # Environment template
└── README.md
│   │
│   ├── lib/                   # Utilities and stores
│   │   ├── store.ts           # Zustand state store
│   │   ├── executives/        # Executive utilities
│   │   └── orchestration/     # Inter-executive communication
│   │
│   └── types/                 # TypeScript definitions
│       ├── index.ts           # Core types
│       └── executives.ts      # Executive-specific types
│
├── .env.example               # Environment template
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS config
└── tsconfig.json              # TypeScript config
```

## 🏗️ Architecture

### Executive Modules

Each C-level executive is a separate module with:

- **System Prompt**: Role-specific persona and capabilities
- **Domain Logic**: Specialized analysis and recommendations
- **Collaboration Hooks**: Inter-executive communication

```
┌─────────────────────────────────────────────────┐
│            Orchestration Layer                   │
│  (Routes messages, manages shared context)       │
└─────────────────┬───────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    │             │             │             │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐    ┌───▼───┐
│  CFO  │◄──►│  CMO  │◄──►│  COO  │◄──►│ CHRO  │
└───────┘    └───────┘    └───────┘    └───────┘
```

### Currently Available

- ✅ **CFO (Alex)** - Financial strategy, cash flow, budgeting

### Coming Soon

- 🔜 **CMO** - Marketing strategy, campaigns, brand
- 🔜 **COO** - Operations, efficiency, processes
- 🔜 **CHRO** - HR, hiring, culture
- 🔜 **CTO** - Technology, architecture, security

## 💻 Development

### Key Technologies

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Anthropic Claude API** - AI backbone

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding a New Executive

1. Create a new folder in `src/executives/[role]/`
2. Create the executive class extending `BaseExecutive`:

```typescript
// src/executives/cmo/CMOExecutive.ts
import { BaseExecutive } from '../shared/BaseExecutive';

export class CMOExecutive extends BaseExecutive {
  constructor() {
    super({
      role: 'CMO',
      name: 'Jordan',
      description: 'AI Chief Marketing Officer',
      capabilities: ['marketing_strategy', 'campaign_planning'],
      systemPrompt: CMO_SYSTEM_PROMPT,
    });
  }

  async analyzeData(data: unknown) { /* ... */ }
  async generateReport(type: string) { /* ... */ }
  async getInsights() { /* ... */ }
}
```

3. Register in the executive registry
4. Add UI components to `src/components/executives/`
5. Update sidebar configuration

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add your `ANTHROPIC_API_KEY` in Vercel's environment variables.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `DATABASE_URL` | No | PostgreSQL connection (future) |

## 📝 Roadmap

### Phase 1: CFO Module (Current)
- [x] Basic chat interface
- [x] Financial analysis prompts
- [ ] Cash flow forecasting
- [ ] Budget tracking
- [ ] Financial reports

### Phase 2: Multi-Executive
- [ ] CMO module
- [ ] COO module
- [ ] Inter-executive messaging
- [ ] Shared context

### Phase 3: Data Integration
- [ ] Bank account connections
- [ ] Accounting software sync
- [ ] Real-time dashboards

### Phase 4: Advanced Features
- [ ] Automated reports
- [ ] Proactive alerts
- [ ] Mobile app (PWA)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for small businesses
