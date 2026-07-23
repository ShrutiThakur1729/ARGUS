<div align="center">

# 🛡️ ARGUS

### AI-Powered Cyber Resilience Platform for Critical National Infrastructure (CNI)

**ET AI Hackathon 2026 | Problem Statement 7**

*Seeing Every Threat Before It Strikes.*

---

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-ARGUS-blue?style=for-the-badge)](https://argus-core.netlify.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/ShrutiThakur1729/ARGUS)
[![Demo Video](https://img.shields.io/badge/🎥_Demo_Video-Google_Drive-red?style=for-the-badge)](https://drive.google.com/drive/folders/1Vy5D02lPtHvET1jmbXQ8d6whsz5Hek70?usp=sharing)

</div>

---

# 📌 Overview

ARGUS is an **AI-powered Security Operations Center (SOC)** platform designed to enhance the cyber resilience of **Critical National Infrastructure (CNI)**. It integrates Artificial Intelligence, real-time monitoring, intelligent threat analysis, incident simulation, executive reporting, and automated communication into a unified enterprise cybersecurity platform.

Built as a solution for the **ET AI Hackathon 2026 (Problem Statement 7)**, ARGUS assists cybersecurity analysts throughout the complete incident lifecycle, from detection and investigation to reporting and response.

---

# 🚀 Live Project

### 🌐 Live Application

https://argus-core.netlify.app/

### 💻 GitHub Repository

https://github.com/ShrutiThakur1729/ARGUS

### 🎥 Demo Video & Supporting Documents

https://drive.google.com/drive/folders/1Vy5D02lPtHvET1jmbXQ8d6whsz5Hek70?usp=sharing

---

# ✨ Key Features

## 🤖 AI-Powered Threat Intelligence

- AI-assisted incident analysis
- Executive threat summaries
- MITRE ATT&CK Mapping
- Confidence scoring
- Threat prioritization
- Response recommendations
- Gemini AI integration
- OpenRouter AI fallback

---

## 📊 Enterprise SOC Dashboard

- Real-time security overview
- Network topology visualization
- Security analytics
- Threat timeline
- Incident monitoring
- Live operational metrics
- AI command center

---

## 🚨 Incident Management

- Incident lifecycle tracking
- Alert prioritization
- Severity classification
- Investigation timeline
- Evidence management
- Dashboard synchronization

---

## 🎭 Incident Simulation Engine

Supports realistic cybersecurity simulations:

- SQL Injection
- Ransomware
- Brute Force
- Insider Threat
- Privilege Escalation
- Malware Beaconing
- Data Exfiltration

Each simulation automatically:

- Creates database records
- Updates dashboard metrics
- Generates AI analysis
- Produces executive reports
- Sends Telegram alerts
- Updates incident timeline

---

## 📄 Executive Report Generation

Generate professional reports in:

- PDF
- CSV

Includes:

- Executive Summary
- Timeline
- Affected Assets
- MITRE ATT&CK Mapping
- Risk Assessment
- AI Recommendations
- Containment Strategy

Reports can be downloaded or delivered directly through email.

---

## 📨 Integrated Communication

- Telegram Security Alerts
- Email Report Delivery
- Delivery History
- Notification Logs
- Executive Alert Templates

---

## 🔐 Secure Authentication

- Google OAuth
- Email Authentication
- JWT Authorization
- Organization-based Access
- Role-Based Access Control (RBAC)
- Secure Session Management

---

## 🏢 Organization Management

- Multi-Organization Support
- Analyst Profiles
- Institution Settings
- Department Configuration
- Timezone Management

---

## ☁ Cloud-Native Deployment

- React + TypeScript
- FastAPI
- Supabase PostgreSQL
- REST APIs
- Modular Architecture
- AI Provider Failover

---

# 🏗 System Architecture

```
                           Users
                             │
                             ▼
                  React + TypeScript Frontend
                             │
                             ▼
                    FastAPI REST Backend
                             │
      ┌──────────────────────┼───────────────────────┐
      ▼                      ▼                       ▼
 Supabase DB          Gemini Flash AI         OpenRouter AI
      │
      ▼
 Telegram Bot        Resend Email API
```

---

# 🛠 Technology Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python, SQLAlchemy, Pydantic |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth, Google OAuth, JWT |
| Artificial Intelligence | Gemini Flash, OpenRouter |
| Notifications | Telegram Bot API, Resend Email API |
| Deployment | Netlify, Render |
| Monitoring *(Planned)* | Sentry, PostHog |

---

# 📂 Project Structure

```
ARGUS
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docs/
├── scripts/
├── README.md
├── .env.example
└── netlify.toml
```

---

# ⚙ Required Environment Variables

All integrations are configured using environment variables inside `.env`.

Copy `.env.example` before starting the project.

| Variable | Description | Required |
|-----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | ✅ |
| JWT_SECRET_KEY | HS256 JWT Secret | ✅ |
| JWT_ALGORITHM | JWT Algorithm | ✅ |
| ACCESS_TOKEN_EXPIRE_MINUTES | JWT Expiry | ✅ |
| SUPABASE_URL | Supabase Project URL | Optional |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Service Role Key | Optional |
| TELEGRAM_BOT_TOKEN | Telegram Bot Token | Optional |
| TELEGRAM_CHAT_ID | Telegram Chat ID | Optional |
| GEMINI_API_KEY | Google Gemini API Key | Optional |
| OPENROUTER_API_KEY | OpenRouter API Key | Optional |
| RESEND_API_KEY | Resend API Key | Optional |
| EMAIL_FROM | Sender Email | Optional |

---

# 💻 Development Setup

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

---

## Backend Installation

```bash
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt

uvicorn backend.main:app --reload --port 8000
```

---

## Frontend Installation

```bash
cd frontend

npm install

npm run dev
```

---

# 🚀 Production Setup

## Build Frontend

```bash
cd frontend

npm run build
```

---

## Start Backend

```bash
cd backend

uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

# 🔌 Integration Guide

## Supabase

Configure:

- DATABASE_URL
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Used for:

- PostgreSQL Database
- Authentication
- User Profiles
- Organization Data
- Incident Storage

---

## Google Gemini

```
GEMINI_API_KEY=
```

Provides:

- Threat Analysis
- Executive Summaries
- MITRE ATT&CK Mapping
- AI Recommendations
- Risk Assessment

---

## OpenRouter

```
OPENROUTER_API_KEY=
```

ARGUS automatically falls back to OpenRouter if Gemini becomes unavailable or exceeds quota limits.

---

## Telegram

Configure:

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Automatically sends:

- Critical Alerts
- Incident Notifications
- Threat Updates
- Executive Notifications

---

## Resend Email

Configure:

```
RESEND_API_KEY=
EMAIL_FROM=
```

Supports:

- Executive Report Delivery
- PDF Attachments
- Delivery Logs

During development, Resend sandbox mode only allows verified recipient emails or `onboarding@resend.dev`.

---

# 📈 Prototype Status

| Module | Status |
|----------|---------|
| Authentication | ✅ |
| Google OAuth | ✅ |
| Dashboard | ✅ |
| AI Analysis | ✅ |
| Incident Simulation | ✅ |
| MITRE Mapping | ✅ |
| Executive Reports | ✅ |
| Email Delivery | ✅ |
| Telegram Alerts | ✅ |
| Organization Management | ✅ |
| Integrations Panel | ✅ |
| Agent Configuration | ✅ |
| Live Endpoint Telemetry | 🚧 In Progress |
| Sentry Monitoring | 📅 Planned |
| PostHog Analytics | 📅 Planned |

---

# 💰 Estimated Deployment Cost

| Service | Prototype Cost |
|----------|----------------|
| Netlify | Free |
| Render | Free |
| Supabase | Free |
| Gemini Flash | Free Tier |
| OpenRouter | Optional |
| Telegram Bot | Free |
| Resend | Free Tier |

**Estimated Prototype Deployment Cost:** **₹0/month (Free Tier)**

---

# 🔮 Future Roadmap

- Live Endpoint Monitoring Agent
- SIEM Integration
- SOAR Automation
- Threat Intelligence Feeds
- AI Threat Hunting
- Mobile SOC Application
- Sentry Monitoring
- PostHog Analytics
- Multi-Tenant Deployment
- Automated Playbook Execution

---

# 👥 Team

**Project:** ARGUS

**Hackathon:** ET AI Hackathon 2026

**Problem Statement:** PS-7 – AI-Driven Cyber Resilience for Critical National Infrastructure

---

# 📜 License

This project is developed for educational, research, and hackathon purposes.

---

<div align="center">

### ⭐ If you found ARGUS interesting, consider giving this repository a Star!

Made with ❤️ for **ET AI Hackathon 2026**

</div>
