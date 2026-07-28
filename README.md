<div align="center">

# 🛡️ ARGUS

### AI-Powered Cyber Resilience Platform for Critical National Infrastructure (CNI)

**ET AI Hackathon 2.0 2026 • Problem Statement 7**

### *Seeing Every Threat Before It Strikes.*

---

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-ARGUS-blue?style=for-the-badge)](https://argus-core.netlify.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/ShrutiThakur1729/ARGUS)
[![Demo Video](https://img.shields.io/badge/🎥_Demo_Video-Google_Drive-red?style=for-the-badge)](YOUR_DRIVE_LINK)

[![Frontend](https://img.shields.io/badge/Frontend-Netlify-00C7B7?logo=netlify&logoColor=white)]
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)]
[![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)]
[![Monitoring](https://img.shields.io/badge/Monitoring-Sentry-362D59?logo=sentry&logoColor=white)]
[![Analytics](https://img.shields.io/badge/Analytics-PostHog-000000?logo=posthog&logoColor=white)]

</div>

---

# 📌 Overview

ARGUS is an AI-powered Security Operations Center (SOC) platform designed to enhance the cyber resilience of Critical National Infrastructure (CNI) through intelligent monitoring, AI-assisted threat analysis, incident management, executive reporting and real-time stakeholder communication.

Developed for **ET AI Hackathon 2.0 (Problem Statement 7)**, ARGUS combines cloud-native architecture, artificial intelligence and enterprise cybersecurity workflows into a unified operational platform.

Unlike conventional monitoring dashboards that simply display alerts, ARGUS assists security analysts throughout the complete incident lifecycle by providing:

- AI-assisted incident analysis
- MITRE ATT&CK mapping
- Executive-ready reports
- Automated notifications
- Organization-centric security management
- Interactive SOC monitoring

The platform has been designed using a modular architecture, allowing future expansion towards autonomous security operations, threat intelligence enrichment and AI-driven cyber resilience.

---

# 🚀 Live Deployment

| Component | Status |
|-----------|--------|
| 🌐 Frontend | ✅ Netlify |
| ⚙ Backend API | ✅ Render |
| 🗄 Database | ✅ Supabase PostgreSQL |
| 🔐 Authentication | ✅ Google OAuth + JWT |
| 🤖 AI Services | ✅ Gemini Flash + OpenRouter |
| 📊 Monitoring | ✅ Sentry |
| 📈 Product Analytics | ✅ PostHog |

---

# 📸 Platform Preview

<p align="center">

<img src="docs/images/dashboard.png" width="95%">

</p>

> **ARGUS Security Operations Center Dashboard providing centralized monitoring, AI-assisted threat analysis, executive reporting and operational visibility.**

---

# 🏗 System Architecture

<p align="center">

<img src="docs/images/system-architecture.png" width="100%">

</p>

### Architecture Overview

```
                        ┌───────────────────────────┐
                        │      React Frontend       │
                        │ Dashboard • Reports • UI  │
                        └─────────────┬─────────────┘
                                      │
                               REST APIs / JWT
                                      │
                        ┌─────────────▼─────────────┐
                        │      FastAPI Backend      │
                        │ Auth • APIs • Services    │
                        └─────────────┬─────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼

┌────────────────┐         ┌──────────────────┐         ┌────────────────────┐
│ AI Services    │         │ Supabase         │         │ Notifications      │
│ Gemini Flash   │         │ PostgreSQL       │         │ Telegram Bot       │
│ OpenRouter     │         │ Authentication   │         │ Resend Email       │
└────────────────┘         └──────────────────┘         └────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│ AI Analysis • MITRE ATT&CK • Reports • Recommendations     │
└────────────────────────────────────────────────────────────┘

Monitoring & Observability
Sentry • PostHog
```

---

# 🧩 Core Modules

| Module | Purpose |
|--------|---------|
| 🔐 **Authentication** | JWT authentication, Google OAuth, role-based access control (RBAC), and organization onboarding |
| 📊 **SOC Dashboard** | Centralized monitoring of incidents, alerts, telemetry, system health, and operational analytics |
| 🚨 **Incident Management** | Incident lifecycle management, severity classification, investigation workflow, and response tracking |
| 🤖 **AI Threat Intelligence** | AI-powered threat summarization, MITRE ATT&CK mapping, risk assessment, and response recommendations |
| 📄 **Executive Reporting** | AI-assisted PDF & CSV report generation with executive summaries and incident insights |
| 🏢 **Organization Management** | Multi-organization support, user administration, institution configuration, and profile management |
| 🔔 **Notification Engine** | Real-time Telegram alerts, email notifications, and automated stakeholder communication |
| ⚙️ **System Monitoring** | Sentry error monitoring, PostHog product analytics, and application observability |

---

# ✨ Key Features

## 🤖 AI-Powered Security Intelligence

- AI-assisted incident analysis
- MITRE ATT&CK mapping
- Executive threat summaries
- Threat prioritisation
- AI-generated response recommendations
- Gemini Flash integration
- OpenRouter AI failover

---

## 📊 Security Operations Center

- Unified SOC dashboard
- Incident monitoring
- Threat analytics
- Interactive operational metrics
- Security overview
- Organization-level visibility

---

## 🚨 Incident Management

- Incident lifecycle tracking
- Severity classification
- Investigation workflow
- AI-assisted response
- Timeline management
- Evidence tracking

---

## 📄 Executive Reporting

- PDF report generation
- CSV export
- Executive summaries
- AI-generated recommendations
- Incident timelines
- Risk assessment

---

## 🔐 Enterprise Security

- Google OAuth
- JWT Authentication
- RBAC
- Secure API access
- Organization onboarding
- Protected routes

---
# 🛠 Technology Stack

| Layer | Technologies |
|--------|--------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | FastAPI, Python, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth, Google OAuth, JWT |
| **Artificial Intelligence** | Gemini Flash, OpenRouter (Fallback) |
| **Notifications** | Telegram Bot API, Resend Email |
| **Monitoring** | Sentry |
| **Analytics** | PostHog |
| **Deployment** | Netlify, Render |
| **Version Control** | Git, GitHub |

---

# 📂 Project Structure

```text
ARGUS/
│
├── backend/
│   ├── api/                  # REST API routes
│   ├── core/                 # Authentication & security
│   ├── database/             # Database configuration
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Business logic
│   ├── router/               # Internal routing modules
│   ├── config.py             # Environment configuration
│   └── main.py               # FastAPI application
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   └── assets/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   └── images/
│
├── requirements.txt
├── netlify.toml
├── README.md
└── .env.example
```

---

# ⚙ Environment Variables

Create a `.env` file before running the application.

| Variable | Description | Required |
|-----------|-------------|:--------:|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET_KEY` | Secret key used for JWT signing | ✅ |
| `JWT_ALGORITHM` | JWT signing algorithm | ✅ |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiration time | ✅ |
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |
| `OPENROUTER_API_KEY` | OpenRouter fallback API key | Optional |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot token | Optional |
| `TELEGRAM_CHAT_ID` | Telegram destination chat | Optional |
| `RESEND_API_KEY` | Resend email API key | Optional |
| `EMAIL_FROM` | Sender email address | Optional |

---

# 🚀 Local Development

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Git

---

## Backend Setup

```bash
# Clone repository

git clone https://github.com/ShrutiThakur1729/ARGUS.git

cd ARGUS

# Create virtual environment

python -m venv .venv

# Activate (Windows)

.venv\Scripts\activate

# Activate (Linux/macOS)

source .venv/bin/activate

# Install dependencies

pip install -r requirements.txt

# Run FastAPI

uvicorn backend.main:app --reload --port 8001
```

Backend API:

```
http://localhost:8001
```

Swagger Documentation:

```
http://localhost:8001/docs
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# ☁ Production Deployment

| Component | Platform |
|-----------|----------|
| Frontend | Netlify |
| Backend | Render |
| Database | Supabase PostgreSQL |
| Authentication | Google OAuth + Supabase |
| Monitoring | Sentry |
| Analytics | PostHog |

---

## Frontend Build

```bash
cd frontend

npm run build
```

---

## Backend Deployment

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

---

# 🔌 External Integrations

| Service | Purpose |
|----------|---------|
| **Supabase** | Authentication, PostgreSQL database and user management |
| **Google OAuth** | Secure social authentication |
| **Gemini Flash** | AI-powered threat analysis and incident summarisation |
| **OpenRouter** | AI provider failover |
| **Telegram Bot API** | Real-time security notifications |
| **Resend** | Executive email report delivery |
| **Sentry** | Error monitoring and application observability |
| **PostHog** | Product analytics and user behaviour insights |

---

# 🔒 Security Features

- JWT Authentication
- Google OAuth
- Role-Based Access Control (RBAC)
- Protected API Endpoints
- Organization-based User Isolation
- Secure Environment Variable Configuration
- AI Provider Failover
- Cloud-native Deployment
- Error Monitoring (Sentry)
- Product Analytics (PostHog)

---

# 📡 API Overview

| Endpoint | Description |
|----------|-------------|
| `/api/v1/auth` | Authentication & authorization |
| `/api/v1/incidents` | Incident management |
| `/api/v1/alerts` | Security alerts |
| `/api/v1/telemetry` | Telemetry collection |
| `/api/v1/reports` | Report generation |
| `/api/v1/playbooks` | Response playbooks |
| `/api/v1/predictions` | AI predictions |
| `/api/v1/config` | System configuration |
| `/health` | Service health monitoring |

---
# 📈 Project Status

| Component | Status |
|-----------|:------:|
| Secure Authentication | ✅ |
| Google OAuth | ✅ |
| Organization Management | ✅ |
| SOC Dashboard | ✅ |
| Incident Management | ✅ |
| AI Threat Intelligence | ✅ |
| Executive Reporting | ✅ |
| Telegram Notifications | ✅ |
| Email Notifications | ✅ |
| FastAPI Backend | ✅ |
| Supabase Integration | ✅ |
| Netlify Deployment | ✅ |
| Render Deployment | ✅ |
| Sentry Monitoring | ✅ |
| PostHog Analytics | ✅ |

---

# 🎯 Why ARGUS?

Critical National Infrastructure (CNI) environments require rapid threat detection, accurate incident response, and clear communication between technical teams and decision-makers.

ARGUS addresses these challenges by combining AI-assisted threat intelligence, centralized incident management, executive reporting, and cloud-native deployment into a unified Security Operations Center (SOC) platform.

Instead of relying on multiple disconnected security tools, ARGUS enables security analysts to monitor incidents, investigate threats, generate reports, and communicate with stakeholders from a single interface.

---

# 🛣 Roadmap

The current implementation establishes the foundation for an enterprise-grade AI-powered SOC platform.

### Phase 1 (Completed)

- ✅ Secure Authentication
- ✅ Google OAuth
- ✅ Organization Management
- ✅ SOC Dashboard
- ✅ Incident Management
- ✅ AI Threat Analysis
- ✅ Executive Reporting
- ✅ Telegram Notifications
- ✅ Email Notifications
- ✅ Cloud Deployment
- ✅ Monitoring & Analytics

---

### Phase 2 (Planned)

- 🔄 Endpoint Monitoring Agent
- 🔄 Live Host Telemetry Collection
- 🔄 Threat Intelligence Feed Integration
- 🔄 SIEM Integrations (Microsoft Sentinel, Splunk, IBM QRadar)
- 🔄 Advanced Incident Correlation
- 🔄 Compliance & Audit Reporting

---

### Phase 3 (AI Evolution)

- 🧠 Qdrant Vector Database for Threat Knowledge Retrieval
- 🤖 LangGraph Multi-Agent Security Orchestration
- 📚 MITRE ATT&CK Knowledge Base
- 🔍 Semantic Search Across Incidents & Playbooks
- ⚡ AI-Assisted Threat Hunting
- 📈 Predictive Risk Analytics

---

# 🌐 Deployment

| Service | Platform |
|----------|----------|
| Frontend | Netlify |
| Backend | Render |
| Database | Supabase PostgreSQL |
| Authentication | Google OAuth + JWT |
| Monitoring | Sentry |
| Product Analytics | PostHog |

---

# 📊 Architecture Highlights

- Modular React + FastAPI architecture
- REST-based communication
- JWT-secured API access
- Cloud-native deployment
- Organization-based multi-user support
- AI-assisted incident analysis
- Executive reporting pipeline
- Real-time notification services
- Production monitoring with Sentry
- Product analytics using PostHog

---

# 🚀 Future Vision

ARGUS is designed as a scalable platform that can evolve beyond a hackathon prototype into a production-ready cyber resilience solution.

Future iterations will focus on:

- AI-driven autonomous incident response
- Retrieval-Augmented Generation (RAG) using Qdrant
- Multi-agent orchestration with LangGraph
- Enterprise SIEM & SOAR integration
- Threat intelligence enrichment
- Predictive attack simulation
- Multi-tenant deployment
- Compliance automation
- Security posture analytics

---

# 👥 Team

<div align="center">

## Team Aikya ∞

### ET AI Hackathon 2.0 2026

**Problem Statement 7**

**AI-Driven Cyber Resilience for Critical National Infrastructure**

</div>

| Name | Role |
|------|------|
| **Shruti Thakur** | Project Lead • Full Stack Development • AI Integration • Cloud Deployment |

---

# 🙏 Acknowledgements

ARGUS was developed using modern open-source technologies and cloud services.

Special thanks to:

- FastAPI
- React
- Supabase
- Google Gemini
- OpenRouter
- Netlify
- Render
- Sentry
- PostHog
- Resend
- Telegram Bot API

---

# 📜 License

This project was built for the ET AI Hackathon 2.0 2026. All rights reserved.

---

<div align="center">

## ⭐ Support

If you found ARGUS interesting, consider giving this repository a ⭐.

It helps others discover the project and supports future development.

---

### 🛡️ ARGUS

### *Seeing Every Threat Before It Strikes.*

Built with ❤️ by **Team Aikya ∞**

</div>
