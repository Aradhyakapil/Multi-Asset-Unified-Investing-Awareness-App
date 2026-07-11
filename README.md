# WealthWise — Multi-Asset Unified Investing & Awareness Super App

A full-stack fintech application that consolidates fragmented Indian investment portfolios across brokers (Zerodha, Groww, NSDL), enables alternate asset discovery (REITs, InvITs, Bonds), and provides AI-powered suitability analysis — all in one premium dark-mode interface.



https://github.com/user-attachments/assets/52c11620-0dbc-4614-9ede-cb52794e3e12


## 🏗️ Architecture

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/7feea8e0-11a1-40a2-a93f-c29be4d51cb7" />


## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

### 1. Start the Backend

```powershell
cd backend
mvn spring-boot:run
```

Backend starts at **http://localhost:8080**. Auto-seeds demo data on first run.

**Demo credentials:** `demo@wealthwise.in` / `demo123`

### 2. Start the Frontend

```powershell
cd frontend
node node_modules\next\dist\bin\next dev --port 3000
```

Frontend starts at **http://localhost:3000**

> **Note:** Due to the `&` in the project folder name, use `node` to run Next.js directly instead of `npm run dev`.

## 📱 Features

| Feature | Description |
|---------|-------------|
| **Unified Dashboard** | Consolidated portfolio view across Zerodha, Groww, NSDL |
| **Asset Discovery** | Browse Equities, REITs, InvITs, Corporate/Govt Bonds |
| **Invest Flow** | Knowledge check quiz → simulated investment |
| **AI Co-Pilot** | Rule-based suitability analysis + chat assistant |
| **Risk Profile** | 5-question assessment → Conservative/Moderate/Aggressive |
| **Mock Ingestion** | Simulates Account Aggregator / CAS sync |

## 🔑 Key API Endpoints

### Auth
- `POST /api/auth/login` — JWT login
- `POST /api/auth/register` — New user registration

### Portfolio
- `GET /api/portfolio/summary` — Net worth, allocation, performance
- `GET /api/portfolio/holdings` — All holdings across brokers

### Assets
- `GET /api/assets/discover` — Asset catalog (filterable by type/risk)
- `GET /api/assets/{id}` — Single asset detail

### AI
- `POST /api/ai/suitability` — Asset suitability check
- `POST /api/ai/chat` — Finance assistant chat
- `POST /api/ai/knowledge-check` — Pre-investment quiz generation

### Profile
- `GET /api/profile` — Get risk profile
- `PUT /api/profile/risk` — Update risk level

### Ingestion
- `POST /api/ingestion/sync` — Trigger mock broker sync

## 🗄️ Database

**Development:** H2 in-memory (auto-configured, no setup needed)
- H2 console: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:wealthwise`

**Production:** PostgreSQL via docker-compose
```powershell
docker-compose up -d
```
Then update `application.yml` to use the PostgreSQL datasource.

## 🎨 Design System

- **Dark mode first** — `#0a0a0f` background, premium fintech aesthetic
- **Brand colors:** Indigo (`#6366f1`) + Violet (`#8b5cf6`) + Emerald (`#06d6a0`)
- **Typography:** Inter (Google Fonts)
- **Charts:** Recharts (PieChart, AreaChart)
- **Icons:** Lucide React

## 🛡️ Security

- Stateless JWT authentication (24-hour tokens)
- BCrypt password hashing
- CORS configured for `localhost:3000`
- Spring Security filter chain with public/protected route segmentation

## 📁 Project Structure

```
├── backend/
│   └── src/main/java/com/wealthwise/
│       ├── controller/       # REST endpoints
│       ├── service/          # Business logic
│       ├── model/            # JPA entities
│       ├── repository/       # Spring Data repositories
│       ├── dto/              # Request/Response DTOs
│       ├── security/         # JWT filter + token provider
│       ├── event/            # Portfolio cache invalidation events
│       ├── config/           # Security, CORS config
│       └── seed/             # Demo data seeder
│
└── frontend/
    └── src/
        ├── app/              # Next.js pages (Dashboard, Discover, Invest, Profile)
        ├── components/
        │   ├── ai/           # AI Co-Pilot panel
        │   ├── dashboard/    # Charts, holdings table
        │   ├── discover/     # Asset cards
        │   └── shared/       # Sidebar, loading states
        ├── store/            # Zustand stores (auth, portfolio)
        └── lib/              # API client, utilities
```
