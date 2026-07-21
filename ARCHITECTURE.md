\# ARCHITECTURE.md



\## ARGUS - AI Cyber Decision Intelligence Platform



\---



\# 1. Vision



ARGUS is an AI Cyber Decision Intelligence Platform designed for Critical National Infrastructure.



Unlike traditional SIEM platforms that primarily collect logs and generate alerts, ARGUS focuses on reducing the gap between \*\*Detection → Understanding → Decision → Response\*\* by combining telemetry collection, behavioral AI, threat intelligence, explainable reasoning, and contextual remediation into a unified platform.



The objective is \*\*not\*\* to replace existing SIEMs, firewalls, IDS/IPS, or EDRs.



Instead, ARGUS acts as an \*\*AI Decision Intelligence Layer\*\* capable of ingesting telemetry from multiple sources, reasoning over security events, predicting attack progression, and assisting security teams with explainable recommendations.



\---



\# 2. High-Level Architecture



```

&#x20;                  ARGUS Platform



&#x20;       +-------------------------------+

&#x20;       |       ARGUS Edge Agent        |

&#x20;       +---------------+---------------+

&#x20;                       |

&#x20;                       |

&#x20;                       ▼

&#x20;       +-------------------------------+

&#x20;       |    Telemetry Adapter Layer    |

&#x20;       +---------------+---------------+

&#x20;                       |

&#x20;                       ▼

&#x20;       +-------------------------------+

&#x20;       |   Telemetry Normalization     |

&#x20;       +---------------+---------------+

&#x20;                       |

&#x20;                       ▼

&#x20;       +-------------------------------+

&#x20;       |        ARGUS Core API         |

&#x20;       |         (FastAPI)             |

&#x20;       +---------------+---------------+

&#x20;                       |

&#x20;                       ▼

&#x20;             PostgreSQL Database

&#x20;                       |

&#x20;       +---------------+---------------+

&#x20;       |                               |

&#x20;       ▼                               ▼

&#x20;AI Behaviour Engine          Knowledge Engine (RAG)

&#x20;       |                               |

&#x20;       +---------------+---------------+

&#x20;                       |

&#x20;                       ▼

&#x20;             Threat Intelligence Engine

&#x20;                       |

&#x20;                       ▼

&#x20;              MITRE ATT\&CK Mapper

&#x20;                       |

&#x20;                       ▼

&#x20;            Threat Prediction Engine

&#x20;                       |

&#x20;                       ▼

&#x20;            Playbook Recommendation

&#x20;                       |

&#x20;                       ▼

&#x20;              Alert Dispatcher

&#x20;                       |

&#x20;                       ▼

&#x20;         ARGUS Command Center Dashboard

```



\---



\# 3. Core Modules



\## 3.1 ARGUS Edge Agent



Responsibilities:



\- Collect endpoint telemetry

\- Collect system metrics

\- Collect process information

\- Collect authentication events

\- Collect network telemetry

\- Send heartbeat

\- Authenticate with ARGUS Core

\- Push telemetry securely



This is the only component deployed on monitored systems.



\---



\## 3.2 Telemetry Adapter



Responsibilities



Receive telemetry from various sources.



Examples:



\- ARGUS Edge Agent

\- Windows Event Logs

\- Sysmon

\- Zabbix (future)

\- Proxmox (future)

\- VMware (future)

\- Linux Auditd (future)



The Adapter converts vendor-specific formats into an internal ARGUS format.



\---



\## 3.3 Telemetry Normalizer



Purpose



Convert heterogeneous telemetry into a unified schema.



Every downstream service should consume the same standardized telemetry model regardless of source.



\---



\## 3.4 ARGUS Core



The FastAPI backend.



Responsibilities



\- Authentication

\- Agent registration

\- Heartbeat management

\- Telemetry ingestion

\- Database interaction

\- Service orchestration

\- API layer



ARGUS Core should contain \*\*no AI logic\*\*.



AI remains an independent module.



\---



\## 3.5 PostgreSQL



Central storage.



Stores



\- Organizations

\- Agents

\- Telemetry

\- Alerts

\- Incidents

\- Threat Predictions

\- Playbooks

\- MITRE mappings

\- CERT-In references



\---



\## 3.6 AI Behaviour Engine



Purpose



Identify anomalous behavior from telemetry.



Possible techniques



\- Isolation Forest

\- Autoencoder

\- One-Class SVM



Output



Risk Score



No language models are used here.



\---



\## 3.7 Threat Intelligence Engine



Consumes



\- AI Risk Score

\- Telemetry

\- MITRE Knowledge



Produces



\- Attack classification

\- Threat severity

\- Confidence score



\---



\## 3.8 MITRE ATT\&CK Mapper



Maps detected behavior to



\- Tactics

\- Techniques

\- Procedures



Provides explainability.



\---



\## 3.9 Threat Prediction Engine



Predicts likely next stage of attack.



Example



```

Credential Access



↓



Lateral Movement



↓



Privilege Escalation



↓



Data Exfiltration



↓



Ransomware

```



\---



\## 3.10 Knowledge Engine (RAG)



Sources



\- CERT-In Advisories

\- MITRE ATT\&CK

\- Internal Playbooks

\- Future organizational SOPs



Purpose



Retrieve relevant knowledge instead of generating unsupported advice.



\---



\## 3.11 Alert Dispatcher



Responsible for



\- Dashboard notifications

\- Email alerts

\- Incident creation

\- Playbook generation



Future



\- Teams

\- Slack

\- Webhooks

\- SMS



\---



\## 3.12 ARGUS Command Center



Web Dashboard



Provides



\- Live telemetry

\- Threat overview

\- Agent monitoring

\- Threat timeline

\- Digital Twin

\- AI explanations

\- MITRE mapping

\- Incident management

\- Analytics



\---



\# 4. Data Flow



```

ARGUS Edge Agent



↓



Telemetry Adapter



↓



Telemetry Normalizer



↓



ARGUS Core



↓



PostgreSQL



↓



AI Behaviour Engine



↓



Threat Intelligence Engine



↓



MITRE Mapper



↓



Threat Prediction



↓



Knowledge Engine (RAG)



↓



Alert Dispatcher



↓



Dashboard

```



\---



\# 5. Design Principles



The architecture follows these principles:



\- Separation of Concerns

\- Modular Design

\- Extensibility

\- Vendor Neutrality

\- Explainable AI

\- Replaceable AI Components

\- Stateless Backend Services

\- Centralized Telemetry Model

\- API-First Design

\- Future Cloud-Native Deployment



\---



\# 6. Non-Goals (Current Version)



The following are intentionally out of scope for the initial hackathon MVP:



\- Kubernetes deployment

\- Distributed message brokers (Kafka/RabbitMQ)

\- SOAR automation

\- Active endpoint isolation

\- Multi-region deployment

\- Multi-tenant SaaS architecture

\- High availability clustering

\- Auto-scaling infrastructure



These are future roadmap items.



\---



\# 7. Engineering Philosophy



ARGUS is \*\*not\*\* intended to be another SIEM.



Its purpose is to become an \*\*AI-powered Cyber Decision Intelligence Platform\*\* that sits above existing monitoring systems, transforming raw telemetry into actionable intelligence through behavioral analysis, explainable reasoning, threat prediction, and contextual remediation.



Every module should remain independently replaceable, allowing the platform to evolve without major architectural changes.

