# Enterprise ERP Suite
### Next-Generation Autonomous Enterprise Resource Planning & Business Intelligence Platform

[![React 19](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5.7](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Recharts](https://img.shields.io/badge/Recharts-3.10-22C55E)](https://recharts.org/)

---

## Executive Overview

The **Enterprise ERP Suite** is a mission-critical, full-stack enterprise resource planning and business intelligence application. Engineered for scalability, precision, and zero-compromise audit compliance, the system unifies warehouse logistics, cryptographic HR vault management, automated ledger accounting, multimodal AI invoice parsing, and executive-grade synthesis into an interface optimized for desktop workflows and mobile operations.

---

## Core System Modules

### 1. Executive Telemetry & Command Center
- **Real-Time KPI Stream**: Live-updating metrics for monthly recurring revenue, operational overhead, inventory turnover velocity, and net margin health.
- **Dynamic Quick Action Hub**: Rapid triggers for batch inventory intake, payroll runs, automated ledger reconciliation, and compliance snapshot exports.
- **System Activity Feed**: Timestamped ledger tracking all user actions, security status changes, and autonomous rebalancing workflows.

### 2. Intelligent Warehouse & Inventory Operations
- **Comprehensive SKU Catalog**: Manage unit costs, retail prices, warehouse bin allocations, reorder thresholds, and safety stock tolerances.
- **Integrated QR & Barcode Generation**: Dynamic on-the-fly vector QR codes (`qrcode`) with high-resolution export for physical inventory tagging.
- **In-Browser Hardware Scanner**: Live camera optical feed and instant drag-and-drop file inspection via `jsQR` for zero-latency barcode scanning.
- **Stock Depletion & Reorder Logic**: Automatic visual tagging for *In Stock*, *Low Stock*, and *Critical Out of Stock* items with one-click purchase order requisitioning.
- **Turnover & Volume Analytics**: Recharts-powered velocity graphs cross-referencing sales velocity against storage costs.

### 3. Human Resource Management (HRMS) & E2EE Vault
- **Personnel Directory**: Multi-department organizational indexing spanning Engineering, Operations, Finance, Product, and Human Capital.
- **Clearance-Based Access Control**: Role-gated clearance hierarchy (Tier 1 to Tier 5 Super Admin) governing access to operational features and compliance logs.
- **Cryptographic E2EE Client Vault**: High-security vault with masked banking credentials, government tax IDs, and confidential payroll routing numbers.
- **Payroll Disbursement Ledger**: Automated deduction computation (federal, state, health, retirement) with automated disbursement logging.

### 4. Financial Operations & Multimodal AI Invoicing
- **General Ledger & Cash Flow**: Real-time accounts receivable vs. accounts payable tracking with automatic margin balancing.
- **AI Document Intake (Gemini 2.5 Flash OCR)**: Multimodal invoice image recognition that parses raw receipts, invoices, and purchase orders into structured line items, vendor tax metadata, dates, and amounts.
- **Invoice Categorization & Tagging**: Dynamic tag filtering (`#recurring`, `#hardware`, `#cloud-ops`, `#logistics`) with click-to-filter ledger drilldowns.
- **Reconciliation Engine**: One-click reconciliation matching unverified bank transactions against approved accounts payable invoices.

### 5. Executive BI Synthesis & Predictive Modeling
- **Autonomous Analytical Briefings**: Server-side Gemini 2.5 Flash analysis generating real-time summaries, bottleneck diagnoses, operational forecasts, and prioritized recommendations.
- **Interactive Conversational ERP Assistant**: Context-aware floating assistant (`/api/chat`) grounded in current ledger balances, inventory shortfalls, and team velocity.
- **Predictive Burn-Rate Modeling**: Visualizations for run-rate burn, gross profit margins, and quarterly projection scenarios.

### 6. Cryptographic Security & Audit Compliance
- **Immutable SHA-256 Ledger Trail**: Cryptographic hashing of every system event, record mutation, and access unmasking.
- **Tamper-Evident Verification**: Real-time hash verification confirming audit log chain integrity.
- **Automated Compliance PDF Export**: Vector-rendered, enterprise-formatted audit packages with auto-table formatting (`jspdf`, `jspdf-autotable`) ready for external compliance auditors.
- **Emergency Lockdown Controls**: Global system lock and session invalidation triggers for incident response protocols.

### 7. Google Workspace & Cloud Synchronization
- **Google Drive Archival**: One-click encrypted snapshot synchronization storing immutable system state in cloud vaults.
- **Google Sheets Live Export**: Instant CSV/tabular dataset generation formatted for executive financial modeling and external spreadsheet ingestion.

---

## Technical Architecture

```
enterprise-erp-suite/
├── server.ts                    # Express.js backend & Gemini AI proxy gateway
├── vite.config.ts              # Vite 8 build pipeline with Tailwind CSS plugin
├── metadata.json               # Platform permissions, capabilities & metadata
├── src/
│   ├── main.tsx                # Client application root entry
│   ├── App.tsx                 # Core application controller & shortcut registry
│   ├── index.css               # Design system tokens & global styling
│   ├── types.ts                # Strict TypeScript domain models & schemas
│   ├── components/
│   │   ├── Header.tsx          # Top navigation, global search & user clearance
│   │   ├── Sidebar.tsx         # Primary module navigation & system health badge
│   │   ├── DashboardView.tsx   # KPI telemetry & command center
│   │   ├── InventoryView.tsx   # Warehouse operations & catalog management
│   │   ├── HRMSView.tsx        # Employee directory, payroll & E2EE vault
│   │   ├── FinanceView.tsx     # Invoices, ledger & reconciliation
│   │   ├── AnalyticsView.tsx   # BI synthesis, forecasting & telemetry charts
│   │   ├── SecurityView.tsx    # Cryptographic SHA-256 logs & compliance
│   │   ├── CommandPalette.tsx  # Universal ⌘K / Ctrl+K search & action modal
│   │   ├── CameraScannerModal.tsx # Optical QR/Barcode camera hardware scanner
│   │   ├── InvoiceScannerModal.tsx # Multimodal Gemini AI invoice OCR parser
│   │   ├── ChatbotDrawer.tsx   # Context-aware floating conversational assistant
│   │   ├── AuditPdfReportModal.tsx # Client-side PDF audit report compiler
│   │   └── SkuQrCodeModal.tsx  # Vector QR code generator for inventory items
```

### Full-Stack Architecture & Security Design
1. **Server-Side API Isolation**: Third-party credentials and the Google Gemini API key remain strictly confined to the backend Express server (`server.ts`). No sensitive API tokens are exposed to the client bundle.
2. **Unified Vite Middleware**: Express serves Vite middleware during development for zero-latency hot module reloads, and serves optimized, pre-compiled static assets (`dist/`) during production.
3. **Single-Bundle CommonJS Server**: `esbuild` compiles `server.ts` into a self-contained `dist/server.cjs` bundle with external package exclusion, ensuring reliable container cold-starts on Google Cloud Run.

---

## Keyboard Shortcuts & Power Navigation

The suite provides keyboard navigation for high-efficiency operators:

| Shortcut | Description |
|---|---|
| `⌘ + K` or `Ctrl + K` | Open Universal Command Palette |
| `/` | Focus global search / command center |
| `?` or `Shift + /` | Open Keyboard Shortcuts Reference Guide |
| `G` then `D` | Jump to **Dashboard** |
| `G` then `I` | Jump to **Inventory** |
| `G` then `H` | Jump to **Human Resources** |
| `G` then `F` | Jump to **Finance & Invoicing** |
| `G` then `A` | Jump to **Analytics & BI** |
| `G` then `S` | Jump to **Security & Audit** |
| `Alt + S` | Quick export ledger to Google Sheets |
| `Alt + D` | Create an instant Google Drive state backup |
| `Alt + R` | Refresh real-time metrics & telemetry stream |
| `Esc` | Dismiss any open modal, scanner, or drawer |

---

## Getting Started

### Prerequisites
- **Node.js**: v20.x or v22.x LTS
- **npm** or **bun**
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### Installation & Environment Setup

1. **Clone or navigate to the repository directory**:
   ```bash
   cd enterprise-erp-suite
   ```

2. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Provide your Gemini API credentials:
   ```env
   GEMINI_API_KEY="your-google-gemini-api-key"
   APP_URL="http://localhost:3000"
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Launch the development server**:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000`.

---

## Production Build & Deployment

### Compilation
Build the client SPA and bundle the Express server for production:
```bash
npm run build
```
This runs:
- `vite build` → Compiles and minifies the frontend assets into `/dist`
- `esbuild server.ts` → Bundles the backend into a standalone CommonJS entry point at `dist/server.cjs`

### Production Run
Launch the production server:
```bash
npm start
```
The server binds to `0.0.0.0:3000` with high-throughput static asset compression and API route handling.

### Docker & Cloud Run Compatibility
The application satisfies all Google Cloud Run and container sandbox mandates:
- Single listening port (`3000`)
- Graceful termination signals
- Safe module resolution compatible with both ESM (`tsx`) and CommonJS runtimes
- Hardware permissions (`camera`) explicitly defined for optical scanning

---

## Compliance, Privacy & Data Protection

- **Cryptographic Event Integrity**: All critical actions generate an immutable record with a SHA-256 hash digest.
- **Zero-Storage Multimodal Parsing**: Invoice images uploaded for AI parsing are processed in memory and never persisted to public storage.
- **Access Obfuscation**: Personal identifiable information (PII) and banking tokens are masked behind strict RBAC policies.

---

## License

Enterprise Proprietary — Designed and engineered for modern business operations.
