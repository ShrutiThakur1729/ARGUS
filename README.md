<div align="center">

# 🛡️ ARGUS

### AI-Powered Cyber Resilience Platform for Critical National Infrastructure (CNI)

**ET AI Hackathon 2026 | Problem Statement 7**

### *Seeing Every Threat Before It Strikes.*

---

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-ARGUS-blue?style=for-the-badge)](https://argus-core.netlify.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/ShrutiThakur1729/ARGUS)
[![Demo Video](https://img.shields.io/badge/🎥_Demo_Video-Google_Drive-red?style=for-the-badge)](https://drive.google.com/drive/folders/1Vy5D02lPtHvET1jmbXQ8d6whsz5Hek70?usp=sharing)

</div>

---

# 📌 Overview

ARGUS is an **AI-powered Security Operations Center (SOC)** platform developed to strengthen the cyber resilience of **Critical National Infrastructure (CNI)** through intelligent monitoring, AI-assisted threat analysis, incident simulation, automated reporting, and real-time communication.

Designed as a solution for the **ET AI Hackathon 2026 (Problem Statement 7: AI-Driven Cyber Resilience for Critical National Infrastructure)**, ARGUS combines Artificial Intelligence with enterprise cybersecurity workflows to help security analysts detect, investigate, understand, and respond to cyber threats more efficiently.

Unlike traditional dashboards that simply display alerts, ARGUS assists throughout the complete incident lifecycle by generating AI-powered threat summaries, MITRE ATT&CK mappings, executive reports, and automated notifications through a centralized Security Operations Center (SOC).

---

# 🚀 Live Project

### 🌐 Live Application

https://argus-core.netlify.app/

### 💻 GitHub Repository

https://github.com/ShrutiThakur1729/ARGUS

### 🎥 Demo Video, PPT & Documentation

https://drive.google.com/drive/folders/1Vy5D02lPtHvET1jmbXQ8d6whsz5Hek70?usp=sharing

---

# 📸 Prototype Preview

Experience ARGUS through its enterprise-grade Security Operations Center interface.

---

## Secure Authentication

<p align="center">
<img src="docs/images/login.png" width="90%">
</p>

Google OAuth, JWT Authentication, Organization Login and Secure Session Management.

---

## Enterprise SOC Dashboard

<p align="center">
<img src="docs/images/dashboard.png" width="95%">
</p>

Centralized monitoring dashboard displaying threat metrics, incident summaries, AI insights, topology visualization, security analytics and operational health.

---

## AI Threat Intelligence

<p align="center">
<img src="docs/images/ai-analysis.png" width="95%">
</p>

AI-generated executive summaries, MITRE ATT&CK mapping, confidence scoring and recommended response actions powered by Gemini Flash with OpenRouter fallback.

---

## Incident Simulation

<p align="center">
<img src="docs/images/simulation.png" width="95%">
</p>

Generate realistic cybersecurity scenarios including SQL Injection, Ransomware, Brute Force, Data Exfiltration, Insider Threat and Malware Beaconing.

---

## Command Center

<p align="center">
<img src="docs/images/command-center.png" width="95%">
</p>

Centralized operational console providing quick security actions, incident response workflows, report generation and AI-assisted SOC operations.

---

## Executive Reporting

<p align="center">
<img src="docs/images/report.png" width="95%">
</p>

Generate executive-ready PDF and CSV reports containing timelines, affected assets, MITRE mappings, AI recommendations and risk summaries.

---

# ✨ Key Features

## 🤖 AI-Powered Threat Intelligence

- AI-assisted incident analysis
- Executive threat summaries
- Threat confidence scoring
- MITRE ATT&CK Mapping
- AI-generated recommendations
- Threat prioritization
- Gemini Flash Integration
- OpenRouter AI Fallback

---

## 📊 Enterprise SOC Dashboard

- Real-time security monitoring
- Live operational metrics
- Threat analytics
- Network topology visualization
- Attack timeline
- AI reasoning panel
- Interactive command center

---

## 🚨 Incident Management

- Incident lifecycle tracking
- Alert prioritization
- Severity classification
- Investigation timeline
- Evidence collection
- Dashboard synchronization

---

## 🎭 Incident Simulation Engine

Supports realistic cybersecurity simulations including:

- SQL Injection
- Ransomware
- Brute Force
- Data Exfiltration
- Insider Threat
- Privilege Escalation
- Malware Beaconing

Every simulation automatically:

- Creates database records
- Updates SOC dashboard
- Triggers AI analysis
- Generates executive reports
- Sends Telegram notifications
- Refreshes security metrics

---

## 📄 Executive Report Generation

Generate detailed reports in:

- PDF
- CSV

Reports include:

- Executive Summary
- Incident Timeline
- Affected Assets
- MITRE ATT&CK Mapping
- Risk Assessment
- AI Recommendations
- Containment Strategy

Reports can be downloaded or automatically emailed to registered users.

---

## 📨 Integrated Communication

- Telegram Security Alerts
- Executive Email Reports
- Notification History
- Delivery Logs
- Alert Templates

---

## 🔐 Enterprise Authentication

- Google OAuth
- Email Authentication
- JWT Authorization
- Secure Session Management
- Organization-Based Access
- Role-Based Access Control (RBAC)

---

## 🏢 Organization Management

- Multi-Organization Support
- Institution Configuration
- Analyst Profiles
- Department Management
- Organization Branding
- Timezone Configuration

---

## ☁ Cloud-Native Deployment

- React + TypeScript Frontend
- FastAPI Backend
- Supabase PostgreSQL
- REST APIs
- Modular Architecture
- AI Provider Failover
- Enterprise Scalability

---

# 🏗 System Architecture

<p align="center">
<img src="docs/images/system-architecture.png" width="100%">
</p>

> **High-Level Architecture of ARGUS illustrating the interaction between the Presentation Layer, Backend Services, Artificial Intelligence, Cloud Infrastructure, Database and Communication Services.**

---

# 🔄 Operational Workflow

<p align="center">
<img src="docs/images/workflow.png" width="100%">
</p>

> **End-to-End operational workflow from user authentication to AI analysis, incident response, reporting and stakeholder notification.**

---

# 🛠 Technology Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python, SQLAlchemy, Pydantic |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth, Google OAuth, JWT |
| AI Services | Gemini Flash, OpenRouter |
| Notifications | Telegram Bot API, Resend Email |
| Deployment | Netlify, Render |
| Monitoring | Sentry, PostHog |

---

# 📂 Project Structure

```text
ARGUS
│
├── backend/
│   ├── api/
│   ├── services/
│   ├── models/
│   ├── schemas/
│   ├── dispatcher/
│   ├── ai/
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── assets/
│   └── package.json
│
├── docs/
│   └── images/
│
├── scripts/
├── README.md
├── .env.example
└── netlify.toml
```
# ⚙️ Required Environment Variables

All integrations are configured using environment variables inside the `.env` file.

Copy `.env.example` before starting the project.

| Variable | Description | Required |
|-----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | ✅ |
| JWT_SECRET_KEY | HS256 JWT Secret Key | ✅ |
| JWT_ALGORITHM | JWT Algorithm (HS256) | ✅ |
| ACCESS_TOKEN_EXPIRE_MINUTES | JWT Expiry Duration | ✅ |
| SUPABASE_URL | Supabase Project URL | Optional |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Service Role Key | Optional |
| TELEGRAM_BOT_TOKEN | Telegram Bot Token | Optional |
| TELEGRAM_CHAT_ID | Telegram Chat ID | Optional |
| GEMINI_API_KEY | Google Gemini API Key | Optional |
| OPENROUTER_API_KEY | OpenRouter API Key | Optional |
| RESEND_API_KEY | Resend Email API Key | Optional |
| EMAIL_FROM | Sender Email Address | Optional |

---

# 💻 Development Setup

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

---

## Backend Installation

```bash
# Navigate to backend
cd backend

# Create Virtual Environment
python -m venv .venv

# Activate (Windows)
.venv\Scripts\activate

# Activate (Linux/macOS)
source .venv/bin/activate

# Install Dependencies
pip install -r requirements.txt

# Start Backend
uvicorn backend.main:app --reload --port 8000
```

---

## Frontend Installation

```bash
# Navigate to frontend

cd frontend

# Install Packages

npm install

# Start Development Server

npm run dev
```

---

# 🚀 Production Deployment

## Build Frontend

```bash
cd frontend

npm run build
```

---

## Run Backend

```bash
cd backend

uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

# 🔌 Integration Guide

## 🟢 Supabase

Configure:

```
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Supabase is responsible for:

- PostgreSQL Database
- Authentication
- User Profiles
- Organization Data
- Incident Storage
- Dashboard Metrics
- Reports

---

## 🤖 Google Gemini

```
GEMINI_API_KEY=
```

Used for:

- Threat Intelligence
- AI Incident Analysis
- Executive Summaries
- MITRE ATT&CK Mapping
- Risk Assessment
- Recommended Response Actions

---

## 🔄 OpenRouter (AI Fallback)

```
OPENROUTER_API_KEY=
```

If Gemini becomes unavailable or reaches quota limits, ARGUS automatically switches to OpenRouter to maintain uninterrupted AI-assisted analysis.

---

## 📨 Telegram Integration

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Automatically sends:

- Critical Alerts
- Incident Notifications
- Threat Updates
- AI Recommendations
- Executive Security Alerts

---

## 📧 Resend Email

```
RESEND_API_KEY=
EMAIL_FROM=
```

Supports:

- Executive PDF Reports
- CSV Reports
- Automated Email Delivery
- Delivery Logs

During development, Resend Sandbox Mode restricts delivery to verified recipients or `onboarding@resend.dev`.

---

# 📈 Prototype Status

| Module | Status |
|----------|---------|
| Secure Authentication | ✅ |
| Google OAuth | ✅ |
| Enterprise Dashboard | ✅ |
| AI Threat Analysis | ✅ |
| Incident Simulation | ✅ |
| MITRE ATT&CK Mapping | ✅ |
| Executive Reports | ✅ |
| Telegram Integration | ✅ |
| Email Delivery | ✅ |
| Organization Management | ✅ |
| Command Center | ✅ |
| Integrations Module | ✅ |
| Agent Configuration | ✅ |
| Live Endpoint Telemetry | ✅ |
| AI Provider Failover | ✅ |
| Dashboard Analytics | ✅ |
| Sentry Monitoring | ✅ |
| PostHog Analytics | ✅ |

---

# 💰 Estimated Deployment Cost

| Service | Prototype Cost |
|----------|----------------|
| Netlify | Free Tier |
| Render | Free Tier |
| Supabase | Free Tier |
| Gemini Flash | Free Tier |
| OpenRouter | Optional |
| Telegram Bot API | Free |
| Resend | Free Tier |
| Google OAuth | Free |
| Sentry | Free Tier |
| PostHog | Free Tier |

## Prototype Cost

### **≈ ₹0 / Month**

using available free tiers.

---

## Small Organization Deployment

Estimated monthly operational cost:

**₹2,000 – ₹6,000 / month**

depending upon:

- AI Usage
- Email Volume
- Backend Resources
- Storage
- Traffic

---

# 📸 Additional Screenshots

## Dashboard Analytics

<p align="center">
<img src="docs/images/dashboard-analytics.png" width="95%">
</p>

---

## Incident Timeline

<p align="center">
<img src="docs/images/timeline.png" width="95%">
</p>

---

## Organization Management

<p align="center">
<img src="docs/images/organization.png" width="95%">
</p>

---

## Integrations Panel

<p align="center">
<img src="docs/images/integrations.png" width="95%">
</p>

---

## Agent Configuration

<p align="center">
<img src="docs/images/agent-config.png" width="95%">
</p>

---

## Settings

<p align="center">
<img src="docs/images/settings.png" width="95%">
</p>

---

# 🎯 Why ARGUS?

ARGUS bridges the gap between traditional Security Operations Centers and AI-driven cyber resilience by combining intelligent threat analysis, automated incident response, executive reporting, and real-time communication into one unified platform.

Instead of relying on multiple disconnected security tools, ARGUS provides security analysts with an end-to-end operational environment that improves investigation speed, enhances situational awareness, and supports informed decision-making through Artificial Intelligence.

---

# 🔮 Future Roadmap

The current prototype establishes a strong foundation for enterprise cybersecurity operations. Planned future enhancements include:

- Endpoint Monitoring Agent
- Live Endpoint Telemetry
- Threat Intelligence Feed Integration
- SIEM Integration (Splunk, QRadar, Microsoft Sentinel)
- SOAR Playbook Automation
- AI Threat Hunting
- Predictive Threat Analytics
- Mobile SOC Companion Application
- Multi-Tenant Enterprise Deployment
- Sentry Performance Monitoring
- PostHog Product Analytics
- Automated Compliance Reporting
- AI-Powered Incident Correlation

---

# 🏆 Achievements

✔ AI-Powered Threat Intelligence

✔ Enterprise SOC Dashboard

✔ Intelligent Incident Simulation

✔ Automated Executive Reporting

✔ Telegram & Email Notifications

✔ Cloud-Native Architecture

✔ Multi-Organization Support

✔ Secure Authentication

✔ AI Provider Failover

✔ Modular & Scalable Design

---

# 👥 Team Aikya ∞

## Project

**ARGUS**

### ET AI Hackathon 2026

**Problem Statement 7**

**AI-Driven Cyber Resilience for Critical National Infrastructure**

---

# 🙏 Acknowledgements

Special thanks to the open-source technologies and cloud platforms that made ARGUS possible:

- React
- FastAPI
- Supabase
- Google Gemini
- OpenRouter
- Netlify
- Render
- Resend
- Telegram Bot API

---

# 📜 License

This project has been developed for educational, research, and hackathon purposes.

---

<div align="center">

## ⭐ Support the Project

If you found ARGUS interesting, consider giving this repository a ⭐.

### 🌐 Live Demo

https://argus-core.netlify.app/

### 💻 GitHub Repository

https://github.com/ShrutiThakur1729/ARGUS

### 🎥 Demo Video & Project Resources

https://drive.google.com/drive/folders/1Vy5D02lPtHvET1jmbXQ8d6whsz5Hek70?usp=sharing

---

### Made with ❤️ by Team Aikya ∞

**ET AI Hackathon 2026**

*"Seeing Every Threat Before It Strikes."*

</div>
# 🏆 Hackathon Submission

**Hackathon:** ET AI Hackathon 2026

**Problem Statement:** PS-7 – AI-Driven Cyber Resilience for Critical National Infrastructure

**Team:** Aikya ∞
