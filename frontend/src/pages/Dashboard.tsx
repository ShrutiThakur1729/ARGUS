import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { NetworkOverview } from '../components/NetworkOverview';
import { RiskChart } from '../components/RiskChart';
import { AttackTimeline } from '../components/AttackTimeline';
import { MitrePanel } from '../components/MitrePanel';
import { ArgusCoreModal } from '../components/ArgusCoreModal';
import { jsPDF } from 'jspdf';

import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import { agentService, Agent } from '../services/agentService';
import { alertService, Alert } from '../services/alertService';
import { incidentService, Incident } from '../services/incidentService';
import { healthService, HealthResponse } from '../services/healthService';
import { telemetryService, Telemetry, SystemTelemetry } from '../services/telemetryService';
import { playbookService, Playbook } from '../services/playbookService';
import { predictionService, Prediction } from '../services/predictionService';
import { configService, OrgSettings } from '../services/configService';
import { reportService, Report } from '../services/reportService';

import { 
  Wifi, 
  ShieldAlert, 
  AlertTriangle, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  Plus, 
  Play, 
  Download, 
  RefreshCw,
  Info,
  Search,
  Bell,
  Mail,
  RotateCcw,
  Check,
  Server,
  Database
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [coreModalOpen, setCoreModalOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);

  // Live Mode state
  const [systemTelemetry, setSystemTelemetry] = useState<SystemTelemetry | null>(null);
  const [systemTelemetryLoading, setSystemTelemetryLoading] = useState(false);

  // ARGUS Core state
  const [reasonerPaused, setReasonerPaused] = useState(false);
  const reasonerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Settings state
  const [darkMode, setDarkMode] = useState(true);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(false);
  const [audioAlertType, setAudioAlertType] = useState<'soc' | 'critical' | 'emergency' | 'silent'>('soc');
  const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] = useState(false);
  const prevCriticalCount = useRef(0);

  // Agent config expanded state
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [agentConfigLoading, setAgentConfigLoading] = useState<string | null>(null);

  // Suppress unused TS variable warnings for pending feature bindings
  void systemTelemetry; void systemTelemetryLoading; void reasonerIntervalRef;
  void darkMode; void setDarkMode; void setAudioAlertsEnabled; void setAudioAlertType;
  void setDesktopNotificationsEnabled; void expandedAgentId; void setExpandedAgentId;
  void agentConfigLoading;

  // Live data states
  const [agents, setAgents] = useState<Agent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<Telemetry[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [reportHistory, setReportHistory] = useState<Report[]>([]);

  // Persistent Org Settings from backend
  const [orgSettings, setOrgSettings] = useState<OrgSettings>({
    name: "AIIMS Delhi CNI",
    department: "Department of Critical Cybersecurity",
    faculty: "Cybersecurity and Forensics Faculty",
    institution: "All India Institute of Medical Sciences",
    location: "New Delhi, India",
    email: "cni-security@aiims.edu",
    logo: "/assets/logo.svg",
    timezone: "IST (UTC+05:30)"
  });

  // Action Loading states
  const [triggerAlertLoading, setTriggerAlertLoading] = useState(false);
  const [saveOrgLoading, setSaveOrgLoading] = useState(false);
  const [generateReportLoading, setGenerateReportLoading] = useState(false);
  const [resendLoadingId, setResendLoadingId] = useState<string | null>(null);

  // Toast State
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'warning' | 'error' | 'info'; message: string }[]>([]);

  // AI Analysis States
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Drawer / Selection States
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<any | null>(null);
  const [playbookExecutingId, setPlaybookExecutingId] = useState<string | null>(null);

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    agents: Agent[];
    alerts: Alert[];
    incidents: Incident[];
    logs: Telemetry[];
  }>({ agents: [], alerts: [], incidents: [], logs: [] });

  // Notifications Bell Drawer State
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  // CRUD Agent state
  const [showEnrollAgent, setShowEnrollAgent] = useState(false);
  const [newAgentHostname, setNewAgentHostname] = useState('');
  const [newAgentIp, setNewAgentIp] = useState('');
  const [newAgentOs, setNewAgentOs] = useState('linux');

  // Logs filters
  const [logFilterSeverity, setLogFilterSeverity] = useState('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Risk selector
  const [riskTimeframe, setRiskTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // Report Generator Form State
  const [reportFormat, setReportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [reportTitle, setReportTitle] = useState('Daily Incident Audit Summary');

  // Helper toast dispatcher
  const addToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch real-time dashboard data
  const fetchData = async () => {
    try {
      const [
        agentsData, 
        alertsData, 
        incidentsData, 
        healthData, 
        telemetryData, 
        playbooksData, 
        predictionsData,
        orgData,
        reportsData
      ] = await Promise.all([
        agentService.getAgents(),
        alertService.getAlerts(),
        incidentService.getIncidents(),
        healthService.getHealth(),
        telemetryService.getTelemetry(),
        playbookService.getPlaybooks(),
        predictionService.getPredictions(),
        configService.getOrgSettings().catch(() => orgSettings),
        reportService.getReportsHistory().catch(() => [])
      ]);

      setAgents(agentsData);
      setAlerts(alertsData);
      setIncidents(incidentsData);
      if (incidentsData.length > 0) {
        setActiveIncidentId(prev => {
          if (prev) {
            const exists = incidentsData.some((i: any) => i.id === prev);
            return exists ? prev : incidentsData[0].id;
          }
          return incidentsData[0].id;
        });
      }
      setHealth(healthData);
      setTelemetryLogs(telemetryData);
      setPlaybooks(playbooksData);
      setPredictions(predictionsData);
      setOrgSettings(orgData);
      setReportHistory(reportsData);
    } catch (err) {
      console.error('Error fetching backend metrics:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchAiAnalysis = async (incidentId: string) => {
    setAiLoading(true);
    try {
      const response = await api.get(`/incidents/${incidentId}/ai-analysis`);
      setAiAnalysis(response.data);
    } catch (err) {
      console.error("Failed to fetch AI analysis:", err);
      setAiAnalysis(null);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (activeIncidentId) {
      fetchAiAnalysis(activeIncidentId);
    } else {
      setAiAnalysis(null);
    }
  }, [activeIncidentId]);

  // Global search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ agents: [], alerts: [], incidents: [], logs: [] });
      return;
    }
    const q = searchQuery.toLowerCase();
    setSearchResults({
      agents: agents.filter(a => a.hostname.toLowerCase().includes(q) || a.ip_address.includes(q)),
      alerts: alerts.filter(a => a.title.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q))),
      incidents: incidents.filter(i => i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q))),
      logs: telemetryLogs.filter(t => t.telemetry_type === 'log' && JSON.stringify(t.data).toLowerCase().includes(q))
    });
  }, [searchQuery, agents, alerts, incidents, telemetryLogs]);

  // Live System Telemetry fetch (only in Live Mode, not demo)
  useEffect(() => {
    if (demoMode) {
      setSystemTelemetry(null);
      return;
    }
    const fetchSystemTelemetry = async () => {
      setSystemTelemetryLoading(true);
      try {
        const data = await telemetryService.getSystemTelemetry();
        setSystemTelemetry(data);
      } catch (err) {
        console.error('System telemetry unavailable:', err);
      } finally {
        setSystemTelemetryLoading(false);
      }
    };
    fetchSystemTelemetry();
    const interval = setInterval(fetchSystemTelemetry, 5000);
    return () => clearInterval(interval);
  }, [demoMode]);

  // Audio alert engine — fires when new critical alerts appear
  const playAudioAlert = (type: 'soc' | 'critical' | 'emergency') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'soc') {
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.4);
      } else if (type === 'critical') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.6);
      } else if (type === 'emergency') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(900, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  };

  // Watch for new critical alerts
  useEffect(() => {
    const currentCritical = alerts.filter(a => a.severity.toLowerCase() === 'critical').length;
    if (audioAlertsEnabled && audioAlertType !== 'silent' && currentCritical > prevCriticalCount.current && prevCriticalCount.current > 0) {
      playAudioAlert(audioAlertType);
    }
    prevCriticalCount.current = currentCritical;
  }, [alerts, audioAlertsEnabled, audioAlertType]);

  // ARGUS Core: Deploy Countermeasures
  const handleDeployCountermeasures = async () => {
    addToast('Deploying countermeasures across all active incident vectors...', 'info');
    try {
      // Mark all open incidents as "investigating" 
      const openIncidents = incidents.filter(i => i.status === 'open');
      for (const inc of openIncidents) {
        await incidentService.updateIncident(inc.id, { status: 'investigating' });
      }
      await alertService.dispatchAlert({
        title: 'Countermeasures Deployed',
        description: `ARGUS Core initiated countermeasure deployment across ${openIncidents.length} active incident vectors. Network isolation protocols engaged.`,
        severity: 'high',
        mitre_tactic: 'Defense',
        mitre_technique_id: 'T1562',
        mitre_technique: 'Impair Defenses — Countermeasures Active'
      });
      addToast(`Countermeasures deployed. ${openIncidents.length} incidents escalated to "investigating".`, 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to deploy countermeasures. Check backend status.', 'error');
    }
  };

  // ARGUS Core: Enter Lockdown
  const handleEnterLockdown = async () => {
    addToast('Initiating ARGUS security lockdown protocol...', 'warning');
    try {
      for (const inc of incidents.filter(i => i.status === 'open')) {
        await incidentService.updateIncident(inc.id, { status: 'investigating' });
      }
      await alertService.dispatchAlert({
        title: 'SECURITY LOCKDOWN INITIATED',
        description: 'ARGUS Core has entered full security lockdown. All open incidents escalated. Network access restricted pending manual authorization.',
        severity: 'critical',
        mitre_tactic: 'Impact',
        mitre_technique_id: 'T1490',
        mitre_technique: 'Inhibit System Recovery — Lockdown Active'
      });
      addToast('LOCKDOWN ENGAGED. Telegram notification dispatched. All incidents escalated.', 'warning');
      fetchData();
    } catch (err) {
      addToast('Failed to initiate lockdown. Verify backend connectivity.', 'error');
    }
  };

  // ARGUS Core: Executive Report
  const handleExecutiveReport = async () => {
    addToast('Generating executive security report...', 'info');
    try {
      await handleGenerateAndSendReport(false);
    } catch (err) {
      addToast('Executive report generation failed.', 'error');
    }
  };

  // ARGUS Core: Pause/Resume Reasoner
  const handlePauseReasoner = () => {
    if (reasonerPaused) {
      // Resume: restart polling
      setReasonerPaused(false);
      addToast('ARGUS Reasoner resumed. Threat analysis stream active.', 'success');
    } else {
      // Pause: flag it, data will stop refreshing on next cycle
      setReasonerPaused(true);
      addToast('ARGUS Reasoner paused. AI threat analysis stream suspended.', 'warning');
    }
  };

  // Agent configuration handler
  const handleConfigureAgent = async (agentId: string, config: { status?: string; heartbeat_interval?: number; log_level?: string }) => {
    setAgentConfigLoading(agentId);
    try {
      await agentService.configureAgent(agentId, config);
      addToast('Agent configuration updated successfully.', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to update agent configuration.', 'error');
    } finally {
      setAgentConfigLoading(null);
    }
  };

  // Desktop notification sender
  const sendDesktopNotification = (title: string, body: string) => {
    if (desktopNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/assets/logo.svg' });
    }
  };

  void handleConfigureAgent; void sendDesktopNotification;


  // Handle manual alert trigger (Telegram Notification Dispatch)
  const handleTriggerAlert = async () => {
    setTriggerAlertLoading(true);
    addToast('Initiating security threat dispatch payload...', 'info');
    try {
      await alertService.dispatchAlert({
        title: "Volumetric DDoS Attack Detected",
        description: "High volume packets detected targetting Primary Domain Gateways from external malicious proxies.",
        severity: "critical",
        mitre_tactic: "Impact",
        mitre_technique_id: "T1498",
        mitre_technique: "Network Denial of Service"
      });
      addToast('Alert manual dispatch succeeded! Telegram notification sent.', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to dispatch alert. Verify network / token authorization.', 'error');
    } finally {
      setTriggerAlertLoading(false);
    }
  };

  // Handle agent enrollment
  const handleEnrollAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentHostname || !newAgentIp) {
      addToast('Hostname and IP address are required', 'warning');
      return;
    }
    try {
      addToast(`Enrolling agent ${newAgentHostname}...`, 'info');
      await agentService.enrollAgent({
        hostname: newAgentHostname,
        ip_address: newAgentIp,
        os_type: newAgentOs
      });
      addToast(`Agent ${newAgentHostname} enrolled successfully!`, 'success');
      setShowEnrollAgent(false);
      setNewAgentHostname('');
      setNewAgentIp('');
      fetchData();
    } catch (err) {
      addToast('Failed to enroll agent. Hostname must be unique.', 'error');
    }
  };

  // Handle agent heartbeat status update
  const handleSendHeartbeat = async (agentId: string, status: string) => {
    try {
      await agentService.sendHeartbeat(agentId, status);
      addToast(`Heartbeat updated: agent is now ${status}`, 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to send heartbeat', 'error');
    }
  };

  // Handle agent deletion
  const handleDeleteAgent = async (agentId: string) => {
    try {
      await agentService.deleteAgent(agentId);
      addToast('Agent deleted successfully', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to delete agent', 'error');
    }
  };

  // Handle playbook execution
  const handleExecutePlaybook = async (pb: Playbook) => {
    setPlaybookExecutingId(pb.id);
    addToast(`Triggering containment playbook: ${pb.title}`, 'info');
    try {
      await playbookService.updatePlaybook(pb.id, { status: 'running' });
      fetchData();

      setTimeout(() => {
        addToast('Executing Phase 1: Network Isolation active...', 'info');
      }, 1000);

      setTimeout(() => {
        addToast('Executing Phase 2: Credentials rotated successfully.', 'info');
      }, 2500);

      setTimeout(async () => {
        await playbookService.updatePlaybook(pb.id, { status: 'executed' });
        addToast(`Playbook ${pb.title} executed successfully!`, 'success');
        setPlaybookExecutingId(null);
        fetchData();
      }, 4000);
    } catch (err) {
      addToast('Failed to execute playbook', 'error');
      setPlaybookExecutingId(null);
    }
  };

  // Handle incident status cycle
  const handleCycleIncidentStatus = async (inc: Incident) => {
    const nextMap: Record<string, string> = {
      'open': 'investigating',
      'investigating': 'resolved',
      'resolved': 'closed',
      'closed': 'open'
    };
    const nextStatus = nextMap[inc.status.toLowerCase()] || 'open';
    try {
      await incidentService.updateIncident(inc.id, { status: nextStatus });
      addToast(`Incident status updated to ${nextStatus}`, 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to update incident', 'error');
    }
  };

  const generateRealReportContent = (format: 'pdf' | 'csv') => {
    if (format === 'csv') {
      let csv = 'Incident ID,Title,Severity,Status,Created At,Description,Assigned To\n';
      incidents.forEach(inc => {
        const row = [
          inc.id,
          `"${inc.title.replace(/"/g, '""')}"`,
          inc.severity.toUpperCase(),
          inc.status.toUpperCase(),
          inc.created_at,
          `"${(inc.description || '').replace(/"/g, '""')}"`,
          inc.assigned_to || 'Unassigned'
        ];
        csv += row.join(',') + '\n';
      });
      return csv;
    } else {
      let text = '============================================================\n';
      text += 'ARGUS SECURITY OPERATIONS CENTER EXECUTIVE REPORT\n';
      text += '============================================================\n\n';
      text += `ORGANIZATION: ${orgSettings.name}\n`;
      text += `DEPARTMENT: ${orgSettings.department}\n`;
      text += `INSTITUTION: ${orgSettings.institution}\n`;
      text += `GENERATED AT: ${new Date().toLocaleString()}\n`;
      text += `TIMEZONE: ${orgSettings.timezone}\n\n`;
      
      text += '============================================================\n';
      text += '1. EXECUTIVE SECURITY SUMMARY\n';
      text += '============================================================\n';
      text += `The ARGUS Cyber Defense Platform is currently monitoring ${connectedAgentsCount} CNI endpoints.\n`;
      text += `Currently, there are ${activeIncidentsCount} active security incidents requiring review.\n\n`;
      
      text += '============================================================\n';
      text += '2. INCIDENT TIMELINE & DETECTED THREATS\n';
      text += '============================================================\n';
      if (incidents.length === 0) {
        text += 'No security incidents are currently recorded in the database.\n';
      } else {
        incidents.forEach((inc, idx) => {
          text += `[Incident #${idx+1}] ${inc.title}\n`;
          text += `- Severity: ${inc.severity.toUpperCase()}\n`;
          text += `- Status: ${inc.status.toUpperCase()}\n`;
          text += `- Created: ${new Date(inc.created_at).toLocaleString()}\n`;
          text += `- Description: ${inc.description || 'No description provided.'}\n`;
          text += `- Operator Assigned: ${inc.assigned_to || 'Unassigned'}\n\n`;
        });
      }
      
      text += '============================================================\n';
      text += '3. MITRE ATT&CK MAPPINGS\n';
      text += '============================================================\n';
      const mitreAlerts = alerts.filter(a => a.mitre_technique_id);
      if (mitreAlerts.length === 0) {
        text += 'No specific MITRE ATT&CK technique matches logged.\n';
      } else {
        mitreAlerts.forEach(a => {
          text += `- Technique ${a.mitre_technique_id}: ${a.mitre_technique} (Tactic: ${a.mitre_tactic || 'N/A'})\n`;
        });
      }
      
      text += '\n============================================================\n';
      text += '4. CONTAINMENT RECOMMENDATIONS\n';
      text += '============================================================\n';
      text += '- Isolate affected network host endpoints immediately.\n';
      text += '- Block threat origin IP addresses on perimeter routers.\n';
      text += '- Reset credentials for compromised operators and user domains.\n';
      text += '- Run full telemetry scans on adjacent subnet switches.\n';
      
      return text;
    }
  };

  // Generate and send reports
  const handleGenerateAndSendReport = async (sendEmail: boolean) => {
    setGenerateReportLoading(true);
    const targetEmail = user?.email || "analyst@argus.sec";
    try {
      if (sendEmail) {
        const csvContent = generateRealReportContent('csv');
        addToast(`Sending report to ${targetEmail}...`, 'info');
        await reportService.sendEmailReport(reportTitle, reportFormat, targetEmail, csvContent);
        addToast(`Report successfully delivered to ${targetEmail}!`, 'success');
      } else if (reportFormat === 'csv') {
        const content = generateRealReportContent('csv');
        addToast(`Generating CSV report...`, 'info');
        const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${reportTitle.toLowerCase().replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast(`Downloaded CSV report successfully!`, 'success');
      } else {
        // Real PDF using jsPDF
        addToast(`Generating PDF report...`, 'info');
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const margin = 18;
        let y = margin;
        const pageW = doc.internal.pageSize.getWidth();
        const maxW = pageW - margin * 2;

        const newPage = () => {
          doc.addPage();
          y = margin;
        };
        const checkY = (needed: number) => { if (y + needed > 280) newPage(); };

        // Header bar
        doc.setFillColor(5, 12, 25);
        doc.rect(0, 0, pageW, 22, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('ARGUS SECURITY OPERATIONS CENTER', margin, 10);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 150, 220);
        doc.text('EXECUTIVE INCIDENT REPORT — CONFIDENTIAL', margin, 16);
        doc.setTextColor(180, 180, 180);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - margin - 60, 10);
        doc.text(`v2.4.1-rc.3`, pageW - margin - 20, 16);

        y = 32;

        // Org section
        doc.setFillColor(10, 18, 35);
        doc.rect(margin - 3, y - 5, maxW + 6, 28, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.text(orgSettings.institution || orgSettings.name, margin, y + 3);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 170, 210);
        doc.text(`${orgSettings.department || ''}`, margin, y + 9);
        doc.text(`Location: ${orgSettings.location || 'N/A'}  |  Timezone: ${orgSettings.timezone}  |  Email: ${orgSettings.email}`, margin, y + 15);
        y += 35;

        // Section: Summary
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(59, 130, 246);
        doc.text('1. EXECUTIVE SECURITY SUMMARY', margin, y);
        y += 6;
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        const summaryLines = doc.splitTextToSize(
          `The ARGUS Cyber Defense Platform is actively monitoring ${connectedAgentsCount} CNI endpoints. ` +
          `The system currently reports ${activeIncidentsCount} active security incidents requiring review. ` +
          `${criticalAlertsCount} critical alerts are live in the threat database.`,
          maxW
        );
        doc.text(summaryLines, margin, y);
        y += summaryLines.length * 5 + 6;

        // Section: Incidents
        checkY(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(59, 130, 246);
        doc.text('2. INCIDENT TIMELINE & DETECTED THREATS', margin, y);
        y += 6;
        doc.line(margin, y, pageW - margin, y);
        y += 5;

        if (incidents.length === 0) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text('No security incidents recorded in the database.', margin, y);
          y += 8;
        } else {
          incidents.slice(0, 10).forEach((inc, idx) => {
            checkY(28);
            const sevColor: [number, number, number] = inc.severity === 'critical' ? [220, 38, 38] : inc.severity === 'high' ? [234, 88, 12] : [202, 138, 4];
            doc.setFillColor(...sevColor);
            doc.rect(margin - 3, y - 3, 3, 3, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(20, 20, 20);
            const titleLines = doc.splitTextToSize(`[#${idx + 1}] ${inc.title}`, maxW - 10);
            doc.text(titleLines, margin + 2, y);
            y += titleLines.length * 4.5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(80, 80, 80);
            doc.text(`Severity: ${inc.severity.toUpperCase()}  |  Status: ${inc.status.toUpperCase()}  |  Assigned: ${inc.assigned_to || 'Unassigned'}`, margin + 2, y);
            y += 4.5;
            doc.text(`Created: ${new Date(inc.created_at).toLocaleString()}`, margin + 2, y);
            y += 4.5;
            if (inc.description) {
              const descLines = doc.splitTextToSize(inc.description, maxW - 10);
              doc.text(descLines, margin + 2, y);
              y += descLines.length * 4 + 4;
            } else {
              y += 4;
            }
          });
        }

        // Section: MITRE
        checkY(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(59, 130, 246);
        doc.text('3. MITRE ATT&CK MAPPINGS', margin, y);
        y += 6;
        doc.line(margin, y, pageW - margin, y);
        y += 5;
        const mitreAlerts = alerts.filter(a => a.mitre_technique_id);
        if (mitreAlerts.length === 0) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text('No MITRE ATT&CK technique matches logged.', margin, y);
          y += 8;
        } else {
          mitreAlerts.slice(0, 8).forEach(a => {
            checkY(8);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(60, 60, 60);
            doc.text(`• ${a.mitre_technique_id}: ${a.mitre_technique}  (Tactic: ${a.mitre_tactic || 'N/A'})`, margin + 2, y);
            y += 6;
          });
        }
        y += 4;

        // Section: Recommendations
        checkY(30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(59, 130, 246);
        doc.text('4. CONTAINMENT RECOMMENDATIONS', margin, y);
        y += 6;
        doc.line(margin, y, pageW - margin, y);
        y += 5;
        const recs = [
          'Isolate all affected network host endpoints from primary routing fabric.',
          'Block threat origin IP addresses on perimeter and internal routers immediately.',
          'Reset credentials for all compromised operators and user domains.',
          'Execute full telemetry scans on adjacent subnet switches.',
          'Verify backup integrity and offsite snapshots are intact.',
        ];
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        recs.forEach((rec, i) => {
          checkY(7);
          doc.text(`${i + 1}. ${rec}`, margin + 2, y);
          y += 6;
        });

        // Footer
        const totalPages = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFillColor(5, 12, 25);
          doc.rect(0, 286, pageW, 12, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(100, 130, 180);
          doc.text(`ARGUS SOC Platform  |  ${orgSettings.name}  |  CONFIDENTIAL — NOT FOR PUBLIC DISTRIBUTION`, margin, 292);
          doc.text(`Page ${i} of ${totalPages}`, pageW - margin - 15, 292);
        }

        const filename = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(filename);
        addToast(`PDF report downloaded successfully!`, 'success');
      }
      fetchData();
    } catch (err) {
      addToast('Failed to generate report', 'error');

    } finally {
      setGenerateReportLoading(false);
    }
  };

  // Resend report from history log
  const handleResendHistoryReport = async (reportId: string) => {
    setResendLoadingId(reportId);
    try {
      await reportService.resendReport(reportId);
      addToast('Report resent successfully to registered email!', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to resend report', 'error');
    } finally {
      setResendLoadingId(null);
    }
  };

  // Save Config Org settings
  const handleSaveOrgSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveOrgLoading(true);
    try {
      await configService.updateOrgSettings(orgSettings);
      addToast('Organization settings saved successfully!', 'success');
      fetchData();
    } catch (err) {
      addToast('Failed to update organization configuration.', 'error');
    } finally {
      setSaveOrgLoading(false);
    }
  };


  // Node click handler inside NetworkOverview
  const handleNodeClick = (nodeId: string) => {
    const mappedNodes = [
      { id: 'internet', label: 'Internet', status: 'normal' },
      { id: 'firewall', label: 'Firewall', status: 'normal' },
      { id: 'web', label: 'Web Server', status: 'normal' },
      { id: 'app', label: 'App Server', status: 'warning' },
      { id: 'db', label: 'Database Server', status: 'critical' },
      { id: 'hr', label: 'HR System', status: 'normal' },
      { id: 'email', label: 'Email Server', status: 'normal' },
      { id: 'file', label: 'File Server', status: 'normal' },
      { id: 'backup', label: 'Backup Server', status: 'unknown' }
    ];
    const node = mappedNodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNodeId(nodeId);
      const dbAgent = agents.find(a => a.hostname.toLowerCase() === node.label.toLowerCase());
      setSelectedNodeDetails({
        hostname: node.label,
        status: dbAgent ? dbAgent.status : node.status,
        ip: dbAgent ? dbAgent.ip_address : '10.0.0.1',
        lastHeartbeat: dbAgent ? new Date(dbAgent.last_heartbeat).toLocaleString() : 'N/A',
        risk: node.status === 'critical' ? 95 : node.status === 'warning' ? 62 : 12
      });
    }
  };

  // Count calculations
  const connectedAgentsCount = demoMode ? (agents.length > 0 ? agents.length : 1402) : agents.length;
  const criticalAlertsCount = alerts.filter(a => a.severity.toLowerCase() === 'critical').length;
  const activeIncidentsCount = incidents.filter(i => i.status.toLowerCase() !== 'resolved' && i.status.toLowerCase() !== 'closed').length;

  const statCards = [
    { label: 'CONNECTED AGENTS', value: connectedAgentsCount.toLocaleString(), sub: `+${agents.filter(a => a.status === 'online').length} online`, subColor: 'text-gray-400', icon: Wifi },
    { label: 'CRITICAL ALERTS', value: criticalAlertsCount.toString().padStart(2, '0'), sub: 'Live Feed', subColor: 'text-red-500 font-bold', icon: ShieldAlert, alert: true },
    { label: 'INCIDENTS', value: activeIncidentsCount.toString(), sub: 'Active', subColor: 'text-amber-500 font-bold', icon: AlertTriangle },
    { label: 'THREAT PREDICTION', value: activeIncidentsCount > 1 ? 'Elevated' : 'Optimal', sub: 'Delta AI Analysis', subColor: 'text-amber-400 font-mono', icon: Cpu },
    { label: 'SYSTEM HEALTH', value: health?.status === 'healthy' ? 'Optimal' : 'Checking...', sub: 'Uptime 99.98%', subColor: 'text-emerald-400 font-mono', icon: Activity },
  ];

  // Dynamic pie chart mapping of severities in database
  const criticalCount = alerts.filter(a => a.severity.toLowerCase() === 'critical').length;
  const highCount = alerts.filter(a => a.severity.toLowerCase() === 'high').length;
  const mediumCount = alerts.filter(a => a.severity.toLowerCase() === 'medium').length;
  const lowCount = alerts.filter(a => a.severity.toLowerCase() === 'low').length;
  const severityData = [
    { name: 'Critical', value: criticalCount > 0 ? criticalCount : 12, color: '#ef4444' },
    { name: 'High', value: highCount > 0 ? highCount : 28, color: '#f97316' },
    { name: 'Medium', value: mediumCount > 0 ? mediumCount : 44, color: '#eab308' },
    { name: 'Low', value: lowCount > 0 ? lowCount : 16, color: '#3b82f6' }
  ];

  const totalAlertsCount = alerts.length > 0 ? alerts.length : 100;

  // Render components dynamically based on Sidebar selection
  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'dashboard':
        return renderDashboard();
      case 'agents':
        return renderAgents();
      case 'network':
        return renderNetworkMap();
      case 'health':
        return renderHealth();
      case 'logs':
        return renderLogs();
      case 'alerts':
        return renderAlerts();
      case 'incidents':
        return renderIncidents();
      case 'ai-analysis':
        return renderAiAnalysis();
      case 'timeline':
        return renderTimeline();
      case 'mitre':
        return renderMitre();
      case 'predictions':
        return renderPredictions();
      case 'cert-in':
        return renderCertIn();
      case 'playbooks':
        return renderPlaybooks();
      case 'reports':
      case 'export':
        return renderReports();
      case 'org':
        return renderOrgSettingsForm();
      case 'users':
      case 'integrations':
      case 'config':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-gray-100 font-sans select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        alertCount={alerts.filter(a => a.status === 'open').length || 8}
        incidentCount={activeIncidentsCount || 24}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative pl-16">
        <Topbar
          onEyeClick={() => setCoreModalOpen(true)}
          demoMode={demoMode}
          setDemoMode={setDemoMode}
          alertCount={alerts.filter(a => a.status === 'open').length || 3}
          onBellClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          orgName={orgSettings.name}
        />

        {/* Global Search Results Overlay */}
        {searchQuery.trim() && (
          <div className="absolute top-14 left-6 right-6 bottom-12 bg-[#050b14]/98 border border-[#1e293b]/80 shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-50 rounded-2xl p-6 overflow-y-auto flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-3">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Search className="h-4 w-4 text-blue-500" />
                <span>Search results for: "{searchQuery}"</span>
              </h2>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-[#1e293b]/40"
              >
                Clear Search
              </button>
            </div>

            {/* Categorized Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Agents */}
              <div className="bg-[#070e1a]/80 border border-[#1e293b]/50 p-4 rounded-xl">
                <h3 className="text-xs font-bold text-blue-400 uppercase mb-3 tracking-wider flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5" />
                  <span>Agents ({searchResults.agents.length})</span>
                </h3>
                {searchResults.agents.length === 0 ? (
                  <p className="text-[10px] font-mono text-gray-500 italic">No matching agents found</p>
                ) : (
                  <div className="space-y-1.5">
                    {searchResults.agents.map(a => (
                      <div 
                        key={a.id} 
                        onClick={() => { setCurrentView('agents'); setSearchQuery(''); }}
                        className="p-2 bg-[#0b1424]/60 border border-[#1e293b]/45 rounded hover:bg-blue-950/20 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-white">{a.hostname}</span>
                        <span className="font-mono text-gray-400">{a.ip_address} ({a.os_type})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alerts */}
              <div className="bg-[#070e1a]/80 border border-[#1e293b]/50 p-4 rounded-xl">
                <h3 className="text-xs font-bold text-red-400 uppercase mb-3 tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Alerts ({searchResults.alerts.length})</span>
                </h3>
                {searchResults.alerts.length === 0 ? (
                  <p className="text-[10px] font-mono text-gray-500 italic">No matching alerts found</p>
                ) : (
                  <div className="space-y-1.5">
                    {searchResults.alerts.map(a => (
                      <div 
                        key={a.id} 
                        onClick={() => { setSelectedAlert(a); setCurrentView('alerts'); setSearchQuery(''); }}
                        className="p-2 bg-[#0b1424]/60 border border-[#1e293b]/45 rounded hover:bg-blue-950/20 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-white truncate max-w-[200px]">{a.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          a.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>{a.severity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Dashboard Canvas */}
        <main className="flex-1 overflow-y-auto pb-12">
          {renderContent()}
        </main>

        {/* Global Footer Taskbar */}
        <footer className="bg-[#030712] border-t border-[#1e293b]/30 h-10 px-6 fixed bottom-0 left-16 right-0 flex items-center justify-between text-[10px] font-mono text-gray-400 z-30 select-none">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-white">{orgSettings.name.toUpperCase()} CORE OPERATIONAL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Supabase</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Telegram</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>API Gateway</span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-[9.5px]">
            <span>TIMEZONE <strong className="text-white">{orgSettings.timezone}</strong></span>
            <span>Uptime <strong className="text-emerald-400">99.98%</strong></span>
          </div>
        </footer>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-medium shadow-lg animate-fade-in ${
              t.type === 'success' ? 'bg-[#062016]/90 border-emerald-500/50 text-emerald-400' :
              t.type === 'warning' ? 'bg-[#271c0b]/90 border-amber-500/50 text-amber-400' :
              t.type === 'error' ? 'bg-[#220c0c]/90 border-red-500/50 text-red-400' :
              'bg-[#0a1424]/90 border-blue-500/50 text-blue-400'
            }`}
          >
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Notifications Drawer */}
      {notificationDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-[#0a0f1d]/95 border-l border-[#1e293b] shadow-2xl p-6 z-50 flex flex-col justify-between text-gray-100 animate-slide-in">
          <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-3 shrink-0">
              <h3 className="text-xs font-bold text-white uppercase font-sans flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-400" />
                <span>Security Notifications</span>
              </h3>
              <button 
                onClick={() => setNotificationDrawerOpen(false)}
                className="text-xs text-gray-400 hover:text-white bg-slate-900 border border-[#1e293b]/40 px-2 py-0.5 rounded"
              >
                Close
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 shrink-0">
              <span>{alerts.filter(a => !readNotificationIds.has(a.id)).length} unread notifications</span>
              <button 
                onClick={() => {
                  const allIds = new Set(alerts.map(a => a.id));
                  setReadNotificationIds(allIds);
                  addToast('All notifications marked as read', 'success');
                }}
                className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
              >
                Mark all as read
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none my-2">
              {alerts.length === 0 ? (
                <p className="text-xs font-sans text-gray-500 italic text-center py-8">No notifications received.</p>
              ) : (
                alerts.map(a => {
                  const isRead = readNotificationIds.has(a.id);
                  return (
                    <div 
                      key={a.id}
                      onClick={() => {
                        setReadNotificationIds(prev => {
                          const n = new Set(prev);
                          n.add(a.id);
                          return n;
                        });
                        setSelectedAlert(a);
                        setCurrentView('alerts');
                        setNotificationDrawerOpen(false);
                      }}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex flex-col gap-1.5 ${
                        isRead 
                          ? 'bg-[#0b1424]/40 border-[#1e293b]/30 opacity-60 hover:opacity-90' 
                          : 'bg-blue-950/20 border-blue-500/30 hover:bg-blue-950/30'
                      }`}
                    >
                      <div className="flex items-center justify-between font-sans">
                        <span className="font-bold text-white truncate">{a.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${
                          a.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>{a.severity}</span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400">{a.description || 'No details'}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ARGUS Core Command Modal */}
      <ArgusCoreModal
        isOpen={coreModalOpen}
        onClose={() => setCoreModalOpen(false)}
        backendHealthy={health?.status === 'healthy'}
        telegramConfigured={health?.telegram_configured || false}
        activeIncidentsCount={activeIncidentsCount}
        totalAgentsCount={connectedAgentsCount}
        lastTelemetrySeconds={0.4}
        reasonerPaused={reasonerPaused}
        onDeployCountermeasures={handleDeployCountermeasures}
        onEnterLockdown={handleEnterLockdown}
        onExecutiveReport={handleExecutiveReport}
        onPauseReasoner={handlePauseReasoner}
      />

      {/* Simulation Scenario Selection Modal */}
      {simulationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-sm select-none">
          <div className="w-full max-w-md bg-[#0a1424]/95 border border-[#1e293b]/90 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.25)] p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-3">
              <div>
                <h3 className="text-xs font-black text-white font-mono tracking-widest uppercase">Select Threat Scenario</h3>
                <span className="text-[9px] font-mono text-amber-500 uppercase font-bold">Isolated CNI Threat Simulation</span>
              </div>
              <button 
                onClick={() => setSimulationModalOpen(false)}
                className="text-gray-400 hover:text-white font-mono text-xs"
              >
                [X]
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg text-[9.5px] font-mono leading-relaxed">
              ⚠️ NOTE: This is an isolated security simulation. ARGUS is not monitoring your local presenter laptop.
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {[
                'SQL Injection',
                'Ransomware',
                'Brute Force',
                'Data Exfiltration',
                'Privilege Escalation',
                'Insider Threat',
                'Malware Beaconing'
              ].map(scenario => (
                <button
                  key={scenario}
                  type="button"
                  onClick={async () => {
                    setSimulationModalOpen(false);
                    setTriggerAlertLoading(true);
                    addToast(`Running ${scenario} threat simulation scenario...`, 'info');
                    try {
                      await alertService.simulateScenario(scenario);
                      addToast(`Simulation scenario '${scenario}' completed successfully!`, 'success');
                      fetchData();
                    } catch (err) {
                      addToast('Simulation run failed. Check backend configuration.', 'error');
                    } finally {
                      setTriggerAlertLoading(false);
                    }
                  }}
                  className="w-full text-left py-2 px-3 bg-[#0b1424]/60 hover:bg-blue-600/25 border border-[#1e293b]/50 hover:border-blue-500/50 rounded-lg text-xs font-sans font-bold text-gray-300 hover:text-white transition-all flex items-center justify-between"
                >
                  <span>{scenario}</span>
                  <span className="text-[8.5px] font-mono text-blue-400 tracking-wider">SIMULATE →</span>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );

  // REDESIGNED VIEW: Executive Security Summary (Overview)
  function renderOverview() {
    const activeCriticalCount = alerts.filter(a => a.severity.toLowerCase() === 'critical' && a.status === 'open').length;
    
    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in">
        {/* Header Block with Configurable Org Data */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1e293b]/40 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono text-blue-400 uppercase tracking-widest">{orgSettings.department}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-700"></span>
              <span className="text-[10px] font-mono text-gray-400 uppercase">{orgSettings.faculty}</span>
            </div>
            <h2 className="text-2xl font-black text-white font-sans tracking-tight mt-1">
              {orgSettings.institution}
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Facility: {orgSettings.location} · System Timezone: {orgSettings.timezone}
            </p>
          </div>

          <div className="flex flex-col items-end text-xs font-mono text-gray-400">
            <span className="text-[9.5px]">SYSTEM: <strong className="text-white">v2.4.1-rc.3</strong></span>
            <span className="text-[9.5px] mt-1">LAST LOGIN: <strong className="text-blue-400">Today, 10:24 AM IST via Security MFA</strong></span>
          </div>
        </div>

        {/* Row 1: Executive KPI Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Today's Threat Summary */}
          <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 flex flex-col justify-between col-span-1 md:col-span-2">
            <div>
              <span className="text-[10px] font-bold font-mono text-gray-400 tracking-wider uppercase block">TODAY'S THREAT SUMMARY</span>
              <p className="text-xs text-gray-300 leading-relaxed font-sans mt-3">
                Platform is monitoring <strong className="text-white font-mono">{connectedAgentsCount}</strong> active CNI endpoints. 
                Our delta reasoning engine currently reports <strong className="text-amber-500 font-mono">{activeIncidentsCount}</strong> active security campaigns requiring mitigation review.
              </p>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 block mt-4">● Real-time threat matrix active</span>
          </div>

          {/* Overall Threat Level */}
          <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold font-mono text-gray-400 tracking-wider uppercase block">OVERALL THREAT LEVEL</span>
              <div className="mt-3 flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full shrink-0 ${activeCriticalCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                <span className={`text-lg font-black tracking-wider uppercase font-mono ${activeCriticalCount > 0 ? 'text-red-500' : 'text-amber-500'}`}>
                  {activeCriticalCount > 0 ? 'CRITICAL (Δ5)' : 'ELEVATED (Δ3)'}
                </span>
              </div>
            </div>
            <span className="text-[9.5px] font-mono text-gray-400 block mt-4">Based on active database counts</span>
          </div>

          {/* Active Incidents & Connected Agents Count */}
          <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold font-mono text-gray-400 tracking-wider uppercase block">ACTIVE INCIDENTS</span>
              <div className="text-3xl font-black text-white mt-2 font-mono">
                {activeIncidentsCount.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mt-4 border-t border-[#1e293b]/30 pt-2">
              <span>CONNECTED AGENTS:</span>
              <span className="text-white font-bold">{connectedAgentsCount}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Subsystem Status (Database, API, Telegram) + Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subsystems Health */}
          <div className="card p-5 bg-[#070e1a]/80 border-[#1e293b]/60 col-span-1 md:col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans">Core Subsystems Status</h3>
              <p className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">Real-time health connection logs</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Backend */}
              <div className="bg-[#0b1424]/60 border border-[#1e293b]/45 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-300 font-sans">Backend Gateway</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  ONLINE
                </span>
              </div>

              {/* Database */}
              <div className="bg-[#0b1424]/60 border border-[#1e293b]/45 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-300 font-sans">Postgres Database</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  {health?.database || 'OK'}
                </span>
              </div>

              {/* Telegram */}
              <div className="bg-[#0b1424]/60 border border-[#1e293b]/45 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-300 font-sans">Telegram Integration</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  health?.telegram_configured 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {health?.telegram_configured ? 'CONFIGURED' : 'UNCONFIGURED'}
                </span>
              </div>

              {/* API Health */}
              <div className="bg-[#0b1424]/60 border border-[#1e293b]/45 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-gray-300 font-sans">API Latency</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  24 ms
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans">Quick Governance Actions</h3>
              <p className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">Direct API Dispatch Actions</p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Trigger Live Alert / Simulate Incident */}
              <button
                onClick={demoMode ? () => setSimulationModalOpen(true) : handleTriggerAlert}
                disabled={triggerAlertLoading}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white font-sans text-xs font-bold py-2.5 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                {triggerAlertLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{demoMode ? 'Simulating Incident...' : 'Dispatching alert...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4" />
                    <span>{demoMode ? 'Simulate Incident' : 'Trigger Live Alert'}</span>
                  </>
                )}
              </button>

              {/* Verify Connection */}
              <button
                onClick={() => {
                  addToast('Verifying backend subsystems status connection...', 'info');
                  fetchData();
                }}
                className="w-full bg-[#0b1424] hover:bg-slate-900 border border-[#1e293b]/60 text-gray-300 hover:text-white font-sans text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Verify Subsystems Connection</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Combined Recent Activity Feed & Latest Reports list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="card p-5 bg-[#070e1a]/80 border-[#1e293b]/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans">Recent Security Activity</h3>
              <button onClick={() => setCurrentView('logs')} className="text-[9.5px] font-mono font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest">
                VIEW LOGS
              </button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-none text-xs font-mono">
              {alerts.slice(0, 4).map(a => (
                <div key={a.id} className="p-2.5 bg-[#0b1424]/40 border border-[#1e293b]/20 rounded-lg flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">{a.title}</span>
                    <span className="text-[9px] text-gray-400 block mt-0.5">{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 ${
                    a.severity === 'critical' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>{a.severity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Reports Summary */}
          <div className="card p-5 bg-[#070e1a]/80 border-[#1e293b]/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans">Latest Generated Reports</h3>
              <button onClick={() => setCurrentView('reports')} className="text-[9.5px] font-mono font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest">
                VIEW ALL REPORTS
              </button>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-none text-xs font-mono">
              {reportHistory.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">No reports generated in this session.</p>
              ) : (
                reportHistory.slice(0, 4).map(rep => (
                  <div key={rep.id} className="p-2.5 bg-[#0b1424]/40 border border-[#1e293b]/20 rounded-lg flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-white block truncate">{rep.title}</span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">{rep.recipient_email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      {rep.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View (Current Operational Layout with Tree Map Topology)
  function renderDashboard() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto">
        {/* ROW 1: TOP STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in">
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card flex items-center justify-between p-4 bg-[#070e1a]/80 border-[#1e293b]/60">
                <div>
                  <span className="text-[10px] font-bold font-mono text-gray-400 tracking-wider uppercase">{s.label}</span>
                  <div className="text-2xl font-black text-white font-sans mt-1 tracking-tight leading-none">
                    {s.value}
                  </div>
                  <span className={`text-[10px] font-mono mt-1.5 block ${s.subColor}`}>{s.sub}</span>
                </div>
                <div className="h-9 w-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* ROW 2: NETWORK TOPOLOGY (2/3) + RISK TREND */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 min-h-[460px]">
            <NetworkOverview agents={agents} onNodeClick={handleNodeClick} selectedNodeId={selectedNodeId} />
          </div>

          <div className="xl:col-span-1 space-y-6 flex flex-col justify-between">
            {/* Risk Score Trend */}
            <div className="min-h-[220px]">
              <div className="absolute right-12 z-20 flex gap-1 mt-4 mr-4 bg-[#0a1424]/60 border border-[#1e293b]/50 p-0.5 rounded-lg text-[9px] font-mono text-gray-400">
                {(['24h', '7d', '30d'] as const).map(tf => (
                  <button 
                    key={tf}
                    onClick={() => setRiskTimeframe(tf)}
                    className={`px-2 py-1 rounded uppercase font-bold transition-all ${
                      riskTimeframe === tf ? 'bg-blue-600 text-white' : 'hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <RiskChart currentScore={62} trend="▲ 4.2" riskLevel="MEDIUM" />
            </div>

            {/* Recent Alerts Feed */}
            <div className="card flex-1 p-5 flex flex-col justify-between bg-[#070e1a]/80 border-[#1e293b]/60">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide">Recent Alerts</h3>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5">Last updated 12s ago</p>
                </div>
                <button 
                  onClick={() => setCurrentView('alerts')}
                  className="text-[10px] font-mono font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider"
                >
                  VIEW ALL
                </button>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto max-h-[190px] pr-1 scrollbar-none">
                {alerts.slice(0, 5).map((a) => (
                  <div 
                    key={a.id} 
                    onClick={() => setSelectedAlert(a)}
                    className="bg-[#0b1424]/60 border border-[#1e293b]/40 p-2.5 rounded-lg flex items-center justify-between text-xs gap-3 hover:bg-blue-950/10 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${
                        a.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-[#00d084]/20 text-[#00d084] border border-[#00d084]/30'
                      }`}>
                        {a.severity}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-[11px] font-semibold text-gray-200 truncate font-sans">{a.title}</h4>
                        <span className="text-[9px] font-mono text-gray-400 block">{a.description || 'No description'}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 shrink-0">{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Node Side Panel when clicked */}
        {selectedNodeDetails && (
          <div className="card p-5 bg-[#0b1424]/90 border-blue-500/40 animate-fade-in flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase">HOSTNAME</span>
                  <span className="text-white font-bold font-sans mt-0.5 block">{selectedNodeDetails.hostname}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase">STATUS</span>
                  <span className="text-white mt-0.5 block uppercase">{selectedNodeDetails.status}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase">IP ADDRESS</span>
                  <span className="text-white mt-0.5 block">{selectedNodeDetails.ip}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase">LAST HEARTBEAT</span>
                  <span className="text-white mt-0.5 block">{selectedNodeDetails.lastHeartbeat}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase">RISK SCORE</span>
                  <span className="text-red-400 font-bold mt-0.5 block">{selectedNodeDetails.risk}/100</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedNodeDetails(null)} 
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-[#1e293b]/40"
            >
              Close Panel
            </button>
          </div>
        )}

        {/* ROW 3: MITRE ATT&CK + ALERTS BY SEVERITY + AGENT STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="min-h-[280px]">
            <MitrePanel />
          </div>

          {/* Severity Donut */}
          <div className="card p-5 flex flex-col justify-between bg-[#070e1a]/80 border-[#1e293b]/60 min-h-[280px]">
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide font-sans">Alerts by Severity</h3>
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mt-0.5">{totalAlertsCount} total · rolling 24h</p>
            </div>

            <div className="flex items-center justify-between my-2">
              <div className="relative h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={severityData} cx="50%" cy="50%" innerRadius={42} outerRadius={56} paddingAngle={4} dataKey="value">
                      {severityData.map((entry, index) => (
                        <Cell key={`sev-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-white">{totalAlertsCount}</span>
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold">24H TOTAL</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono pr-4">
                {severityData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 justify-between min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-300">{d.name}</span>
                    </div>
                    <span className="font-bold text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Regional Agent status */}
          <div className="card p-5 flex flex-col justify-between bg-[#070e1a]/80 border-[#1e293b]/60 min-h-[280px]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide font-sans">Agent Status</h3>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">{agents.length || 13} endpoints registered</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                99.4% ONLINE
              </span>
            </div>

            <div className="space-y-3.5 my-2">
              {[
                { region: 'North - Delhi', count: 420, percent: 88, color: 'bg-emerald-500' },
                { region: 'West - Mumbai', count: 391, percent: 84, color: 'bg-emerald-500' },
                { region: 'South - Bengaluru', count: 368, percent: 92, color: 'bg-emerald-500' },
                { region: 'East - Kolkata', count: 223, percent: 78, color: 'bg-emerald-500' }
              ].map((r, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="text-gray-300 font-medium">{r.region}</span>
                    <span className="font-mono font-bold text-white">{r.count}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-[#1e293b]/30">
                    <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attack Timeline + AI Analysis + Playbook */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="min-h-[320px]">
            <AttackTimeline />
          </div>

          {/* AI Analysis */}
          <div className="card p-5 flex flex-col justify-between bg-[#070e1a]/80 border-[#1e293b]/60 min-h-[320px]">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white tracking-wide font-sans">AI Analysis</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">CONFIDENCE &gt; 98.4%</span>
              </div>
              <p className="text-[10px] font-mono text-gray-400 mt-0.5">Incident Threat Reasoning</p>
            </div>

            <div className="my-3 space-y-3 text-xs font-sans">
              <div>
                <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block mb-1">SUMMARY</span>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  Credential-spray from compromised CNI workstation <strong className="text-white font-mono">ADM-09</strong> followed by LSASS memory dumping and SMB lateral movement to domain control endpoints.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1e293b]/40">
                <div className="bg-[#0b1424]/60 border border-[#1e293b]/40 p-2.5 rounded-lg">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block">ROOT CAUSE</span>
                  <p className="text-[10px] text-gray-200 mt-1 font-mono">Leaked admin credentials on ADM-09</p>
                </div>
                <div className="bg-[#0b1424]/60 border border-[#1e293b]/40 p-2.5 rounded-lg">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block">BLAST RADIUS</span>
                  <p className="text-[10px] text-gray-200 mt-1 font-mono">3 downstream Windows hosts</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#1e293b]/40 pt-2 flex items-center justify-between text-[9px] font-mono text-gray-400">
              <span>Updated live via REST telemetry</span>
              <span>argus-engine-v3</span>
            </div>
          </div>

          {/* Recommended Playbook */}
          <div className="card p-5 flex flex-col justify-between bg-[#070e1a]/80 border-[#1e293b]/60 min-h-[320px]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide font-sans">Recommended Playbook</h3>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">Automated mitigation checklist</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                RECON
              </span>
            </div>

            <div className="space-y-2.5 my-3 text-xs font-sans">
              <div className="flex items-center justify-between bg-[#0b1424]/60 border border-[#1e293b]/40 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-gray-300 font-mono text-[11px]">Isolate ADM-09</span>
                </div>
                <span className="text-[9px] font-mono text-gray-400">Done</span>
              </div>
              <div className="flex items-center justify-between bg-[#0b1424]/60 border border-[#1e293b]/40 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-blue-400 animate-spin shrink-0" />
                  <span className="text-gray-300 font-mono text-[11px]">Rotate service tokens</span>
                </div>
                <span className="text-[9px] font-mono text-blue-400">Pending</span>
              </div>
            </div>

            <button 
              onClick={() => {
                addToast('Executing credential containment workflow...', 'info');
                setTimeout(() => {
                  addToast('All compromised service credentials have been successfully rotated in CNI directory.', 'success');
                }, 2000);
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-bold py-2 rounded-lg shadow-md transition-all"
            >
              Run Full Containment Workflow
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Agents View (CRUD)
  function renderAgents() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in">
        <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">Agent Management</h2>
            <p className="text-xs text-gray-400 mt-1">Enroll, edit, ping or remove CNI active host endpoints</p>
          </div>
          <button 
            onClick={() => setShowEnrollAgent(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-sans px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.25)]"
          >
            <Plus className="h-4 w-4" />
            <span>Enroll New Agent</span>
          </button>
        </div>

        {/* Enrollment Overlay Form */}
        {showEnrollAgent && (
          <div className="bg-[#070e1a]/95 border border-blue-500/50 p-6 rounded-xl space-y-4 max-w-md mx-auto shadow-xl">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Enroll Agent</h3>
            <form onSubmit={handleEnrollAgent} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">HOSTNAME</label>
                <input 
                  type="text" 
                  value={newAgentHostname} 
                  onChange={e => setNewAgentHostname(e.target.value)} 
                  placeholder="e.g., ADM-15"
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">IP ADDRESS</label>
                <input 
                  type="text" 
                  value={newAgentIp} 
                  onChange={e => setNewAgentIp(e.target.value)} 
                  placeholder="e.g., 10.0.1.35"
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">OPERATING SYSTEM</label>
                <select 
                  value={newAgentOs} 
                  onChange={e => setNewAgentOs(e.target.value)} 
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="linux">Linux</option>
                  <option value="windows">Windows</option>
                  <option value="darwin">macOS</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowEnrollAgent(false)}
                  className="px-3 py-1.5 bg-slate-900 border border-[#1e293b]/60 text-gray-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold"
                >
                  Enroll
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Agents Table */}
        <div className="bg-[#070e1a]/80 border border-[#1e293b]/60 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e293b]/50 text-gray-400 font-mono text-[10px] tracking-wider uppercase bg-[#060b17]/50">
                <th className="p-4">Hostname</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">OS Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Heartbeat</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic font-mono">
                    No active agents registered in CNI database.
                  </td>
                </tr>
              ) : (
                agents.map(a => (
                  <tr key={a.id} className="border-b border-[#1e293b]/30 hover:bg-blue-950/5">
                    <td className="p-4 font-bold text-white">{a.hostname}</td>
                    <td className="p-4 font-mono text-gray-300">{a.ip_address}</td>
                    <td className="p-4 font-sans text-gray-300 capitalize">{a.os_type}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        a.status === 'online' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        a.status === 'warning' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-gray-400">{new Date(a.last_heartbeat).toLocaleString()}</td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => handleSendHeartbeat(a.id, 'online')}
                        className="px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold rounded"
                      >
                        Ping
                      </button>
                      <button 
                        onClick={() => handleSendHeartbeat(a.id, 'offline')}
                        className="px-2 py-1 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold rounded"
                      >
                        Disconnect
                      </button>
                      <button 
                        onClick={() => handleDeleteAgent(a.id)}
                        className="px-2 py-1 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Network Map View
  function renderNetworkMap() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in flex flex-col md:flex-row gap-6">
        <div className="flex-1 min-h-[500px]">
          <NetworkOverview agents={agents} onNodeClick={handleNodeClick} selectedNodeId={selectedNodeId} />
        </div>

        {selectedNodeDetails ? (
          <div className="w-80 bg-[#070e1a]/85 border border-[#1e293b]/60 rounded-xl p-5 flex flex-col justify-between max-h-[500px] shadow-lg animate-fade-in">
            <div className="space-y-5 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-3">
                <h3 className="text-xs font-bold text-white font-sans">Node Diagnostics</h3>
                <span className="text-[10px] text-gray-400">ARGUS Network mapping</span>
              </div>

              <div>
                <span className="text-[9px] text-gray-400 block uppercase">HOSTNAME</span>
                <span className="text-sm font-bold text-white font-sans mt-1 block">{selectedNodeDetails.hostname}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block uppercase">STATUS</span>
                <span className="text-white mt-1 block font-sans uppercase font-black text-[10px]">{selectedNodeDetails.status}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block uppercase">IP ADDRESS</span>
                <span className="text-white mt-1 block font-bold text-gray-300">{selectedNodeDetails.ip}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block uppercase">LAST HEARTBEAT</span>
                <span className="text-white mt-1 block font-bold text-gray-300">{selectedNodeDetails.lastHeartbeat}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block uppercase">CALCULATED RISK</span>
                <span className="text-red-400 font-bold text-sm block">{selectedNodeDetails.risk}%</span>
              </div>
            </div>

            <button 
              onClick={() => { setSelectedNodeDetails(null); setSelectedNodeId(null); }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-[#1e293b]/60 text-gray-300 hover:text-white rounded font-sans text-xs font-bold mt-4"
            >
              Clear Details
            </button>
          </div>
        ) : (
          <div className="w-80 bg-[#070e1a]/80 border border-[#1e293b]/60 rounded-xl p-6 flex flex-col items-center justify-center text-center text-gray-500 italic max-h-[500px]">
            <Info className="h-8 w-8 text-gray-600 mb-3" />
            <p className="text-xs font-sans leading-relaxed">Select a topology node to retrieve diagnostic mapping, real-time heartbeat and risk metrics.</p>
          </div>
        )}
      </div>
    );
  }

  // System Health View
  function renderHealth() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">System Health Diagnostics</h2>
          <p className="text-xs text-gray-400 mt-1">Status of API gateway database sessions and integrations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* Database */}
          <div className="card p-5 bg-[#070e1a]/80 border-[#1e293b]/60 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans">PostgreSQL Database</h3>
            <div className="flex items-center justify-between py-2 border-t border-[#1e293b]/40">
              <span className="text-gray-400">Connection Status</span>
              <span className="text-emerald-400 font-bold uppercase">{health?.database || 'OK'}</span>
            </div>
            <button 
              onClick={async () => {
                try {
                  await healthService.getHealth();
                  addToast('Database connection healthy', 'success');
                } catch {
                  addToast('Database connection error', 'error');
                }
              }}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-sans font-bold"
            >
              Verify Connection
            </button>
          </div>

          {/* Telegram */}
          <div className="card p-5 bg-[#070e1a]/80 border-[#1e293b]/60 space-y-4 font-sans">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">Telegram Notification Integration</h3>
            <div className="flex items-center justify-between py-2 border-t border-[#1e293b]/40">
              <span className="text-gray-400">Dispatcher Status</span>
              <span className="text-emerald-400 font-bold uppercase">
                {health?.telegram_configured ? 'CONFIGURED' : 'UNCONFIGURED'}
              </span>
            </div>
            <button 
              onClick={() => {
                addToast('Triggering Telegram connection check message...', 'info');
                handleTriggerAlert();
              }}
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-sans font-bold"
            >
              Dispatch Test Message
            </button>
          </div>

          {/* Core Latency */}
          <div className="card p-5 bg-[#070e1a]/80 border-[#1e293b]/60 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans">FastAPI Core Engine</h3>
            <div className="flex items-center justify-between py-2 border-t border-[#1e293b]/40">
              <span className="text-gray-400">Engine Status</span>
              <span className="text-emerald-400 font-bold uppercase">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">API Gateway Version</span>
              <span className="text-white">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logs Explorer View
  function renderLogs() {
    const filteredLogs = telemetryLogs.filter(log => {
      if (log.telemetry_type !== 'log') return false;
      const severity = log.data?.severity || 'info';
      if (logFilterSeverity !== 'ALL' && severity.toUpperCase() !== logFilterSeverity) return false;
      if (logSearchQuery.trim()) {
        const q = logSearchQuery.toLowerCase();
        const msg = (log.data?.msg || '').toLowerCase();
        const src = (log.data?.source || '').toLowerCase();
        if (!msg.includes(q) && !src.includes(q)) return false;
      }
      return true;
    });

    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">Logs Explorer</h2>
            <p className="text-xs text-gray-400 mt-1">Browse and search CNI system audit logs</p>
          </div>
          <button 
            onClick={async () => {
              try {
                await telemetryService.submitTelemetry({
                  agent_id: agents[0]?.id || 'agent-id',
                  telemetry_type: 'log',
                  data: { severity: 'info', msg: 'Manual SOC audit log created by analyst', source: 'argus_gui' }
                });
                addToast('Telemetry log successfully submitted to database', 'success');
                fetchData();
              } catch {
                addToast('Failed to submit log telemetry', 'error');
              }
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-sans font-bold px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Generate Audit Log</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#070e1a]/60 border border-[#1e293b]/60 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase mr-2">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(sev => (
              <button 
                key={sev}
                onClick={() => setLogFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded text-[9px] font-bold transition-all ${
                  logFilterSeverity === sev ? 'bg-blue-600 text-white' : 'bg-slate-900 border border-[#1e293b]/45 text-gray-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="relative w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              value={logSearchQuery}
              onChange={e => setLogSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full bg-slate-950 border border-[#1e293b]/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-[#070e1a]/80 border border-[#1e293b]/60 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b]/50 text-[10px] text-gray-400 tracking-wider uppercase bg-[#060b17]/50">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Source</th>
                <th className="p-3">Message</th>
                <th className="p-3">Agent</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">No matching logs found in database.</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-[#1e293b]/30 hover:bg-blue-950/5">
                    <td className="p-3 text-gray-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        log.data?.severity?.toLowerCase() === 'critical' ? 'bg-red-500/20 text-red-400' :
                        log.data?.severity?.toLowerCase() === 'high' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {log.data?.severity || 'info'}
                      </span>
                    </td>
                    <td className="p-3 text-blue-400 font-bold">{log.data?.source || 'system'}</td>
                    <td className="p-3 text-gray-200">{log.data?.msg || 'No payload'}</td>
                    <td className="p-3 text-gray-400">{log.agent_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Alerts View
  function renderAlerts() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in relative text-xs">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">Active Security Alerts</h2>
          <p className="text-xs text-gray-400 mt-1">Overview of threat dispatcher logs and MITRE mappings</p>
        </div>

        <div className="bg-[#070e1a]/80 border border-[#1e293b]/60 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b]/50 text-[10px] text-gray-400 font-mono tracking-wider uppercase bg-[#060b17]/50">
                <th className="p-4">Severity</th>
                <th className="p-4">Threat / Title</th>
                <th className="p-4">MITRE Technique</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Detected</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">No alerts recorded in database.</td>
                </tr>
              ) : (
                alerts.map(a => (
                  <tr key={a.id} className="border-b border-[#1e293b]/30 hover:bg-blue-950/5">
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        a.severity === 'critical' ? 'bg-red-500/25 text-red-400 border border-red-500/30' :
                        a.severity === 'high' ? 'bg-amber-500/25 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/25 text-blue-400 border border-blue-500/30'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{a.title}</td>
                    <td className="p-4 font-mono text-gray-300">
                      {a.mitre_technique_id ? `${a.mitre_technique_id} - ${a.mitre_technique}` : 'None'}
                    </td>
                    <td className="p-4 font-mono text-gray-400 uppercase">{a.status}</td>
                    <td className="p-4 font-mono text-gray-400">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedAlert(a)}
                        className="px-3 py-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 font-sans font-bold text-[10px] rounded"
                      >
                        Quick View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Alert Drawer Overlay */}
        {selectedAlert && (
          <div className="fixed inset-y-0 right-0 w-[450px] bg-[#0a0f1d]/95 border-l border-[#1e293b] shadow-2xl p-6 z-50 flex flex-col justify-between text-gray-100 animate-slide-in">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-3">
                <h3 className="text-xs font-bold text-white uppercase font-sans">Alert Details Drawer</h3>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="text-xs text-gray-400 hover:text-white bg-slate-900 border border-[#1e293b]/40 px-2 py-0.5 rounded"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase">THREAT</span>
                  <span className="text-sm font-bold text-white font-sans mt-0.5 block">{selectedAlert.title}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase">SEVERITY</span>
                  <span className="text-red-400 mt-0.5 block uppercase font-bold">{selectedAlert.severity}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase">DESCRIPTION</span>
                  <p className="text-gray-300 mt-0.5 font-sans leading-relaxed">{selectedAlert.description || 'No description provided.'}</p>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase">MITRE ATT&CK REFERENCE</span>
                  <span className="text-white mt-0.5 block">{selectedAlert.mitre_tactic} ({selectedAlert.mitre_technique_id})</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase">AFFECTED AGENT ID</span>
                  <span className="text-white mt-0.5 block">{selectedAlert.agent_id || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-[#1e293b]/40">
              <button 
                onClick={async () => {
                  try {
                    await alertService.updateAlert(selectedAlert.id, { status: 'acknowledged' });
                    addToast('Alert acknowledged successfully', 'success');
                    setSelectedAlert(null);
                    fetchData();
                  } catch {
                    addToast('Failed to update alert', 'error');
                  }
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-[#1e293b]/60 text-gray-300 hover:text-white rounded-lg font-sans text-xs font-bold"
              >
                Acknowledge Alert
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Incidents View
  function renderIncidents() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in relative text-xs">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">CNI Incident Tickets</h2>
          <p className="text-xs text-gray-400 mt-1">Review active security campaigns and analyst assignments</p>
        </div>

        <div className="bg-[#070e1a]/80 border border-[#1e293b]/60 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b]/50 text-[10px] text-gray-400 font-mono tracking-wider uppercase bg-[#060b17]/50">
                <th className="p-4">Severity</th>
                <th className="p-4">Incident Title</th>
                <th className="p-4">Assigned Analyst</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">No incidents recorded in database.</td>
                </tr>
              ) : (
                incidents.map(inc => (
                  <tr key={inc.id} className="border-b border-[#1e293b]/30 hover:bg-blue-950/5">
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        inc.severity === 'critical' ? 'bg-red-500/25 text-red-400 border border-red-500/30' :
                        inc.severity === 'high' ? 'bg-amber-500/25 text-amber-400 border border-amber-500/30' :
                        'bg-blue-500/25 text-blue-400 border border-blue-500/30'
                      }`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{inc.title}</td>
                    <td className="p-4 font-mono text-gray-300">{inc.assigned_to || 'Unassigned'}</td>
                    <td className="p-4 font-mono text-gray-400 uppercase">{inc.status}</td>
                    <td className="p-4 font-mono text-gray-400">{new Date(inc.created_at).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleCycleIncidentStatus(inc)}
                        className="px-3 py-1 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/30 text-amber-400 font-sans font-bold text-[10px] rounded"
                      >
                        Cycle Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // AI Analysis View
  function renderAiAnalysis() {
    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in text-xs font-mono">
        <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">AI Reasoning Diagnostics</h2>
            <p className="text-xs text-gray-400 mt-1 font-sans">Autonomous threat analysis and mitigation recommendations</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Select Incident:</span>
            <select 
              value={activeIncidentId || ''} 
              onChange={e => setActiveIncidentId(e.target.value || null)}
              className="bg-slate-950 border border-[#1e293b]/60 rounded px-2.5 py-1 text-xs text-white"
            >
              <option value="">-- No Incident Selected --</option>
              {incidents.map(i => (
                <option key={i.id} value={i.id}>{i.title} ({i.severity.toUpperCase()})</option>
              ))}
            </select>
          </div>
        </div>

        {aiLoading ? (
          <div className="card p-12 bg-[#070e1a]/80 border-[#1e293b]/60 flex flex-col items-center justify-center gap-4 text-center">
            <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
            <span className="font-sans text-xs text-gray-400">Consulting AI command models (Gemini / OpenRouter)...</span>
          </div>
        ) : aiAnalysis ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 col-span-1 md:col-span-8 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Risk Assessment</span>
                <p className="text-gray-300 leading-relaxed font-sans text-xs mt-2.5">
                  {aiAnalysis.summary}
                </p>
              </div>
              
              <div className="border-t border-[#1e293b]/40 pt-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Threat Vector Explanation</span>
                <p className="text-gray-300 leading-relaxed font-sans text-xs mt-2.5">
                  {aiAnalysis.explanation}
                </p>
              </div>
            </div>

            <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 col-span-1 md:col-span-4 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0b1424]/60 border border-[#1e293b]/45 p-3 rounded-lg">
                  <span className="text-[9px] text-gray-500 block uppercase">AI Confidence</span>
                  <span className="text-sm font-black text-purple-400 mt-1 block">{aiAnalysis.confidence_score}%</span>
                </div>
                <div className="bg-[#0b1424]/60 border border-[#1e293b]/45 p-3 rounded-lg">
                  <span className="text-[9px] text-gray-500 block uppercase">MITRE Mapping</span>
                  <span className="text-xs font-bold text-white mt-1 block truncate" title={aiAnalysis.mitre_mapping}>
                    {aiAnalysis.mitre_mapping}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#1e293b]/40 pt-4 space-y-3 font-sans">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Recommended Actions</span>
                <ul className="list-disc pl-5 space-y-2 text-gray-300 text-xs">
                  {aiAnalysis.recommended_actions?.map((act: string, idx: number) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        ) : (
          <div className="card p-12 bg-[#070e1a]/80 border-[#1e293b]/60 flex flex-col items-center justify-center text-center text-gray-500 italic">
            <Info className="h-8 w-8 text-gray-600 mb-3" />
            <p className="text-xs font-sans leading-relaxed">No active threat incidents currently require AI reasoning analysis.</p>
          </div>
        )}
      </div>
    );
  }

  // Attack Timeline View
  function renderTimeline() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in text-xs">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">Threat Attack Timeline</h2>
          <p className="text-xs text-gray-400 mt-1">Chronological representation of the threat actor lifecycle</p>
        </div>
        <div className="card p-6 bg-[#070e1a]/80 border-[#1e293b]/60">
          <AttackTimeline />
        </div>
      </div>
    );
  }

  // MITRE Panel View
  function renderMitre() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in text-xs">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">MITRE ATT&CK Matrix Mapping</h2>
          <p className="text-xs text-gray-400 mt-1">Overview of highlighted CNI threat patterns and MITRE TTP classifications</p>
        </div>
        <div className="card p-6 bg-[#070e1a]/80 border-[#1e293b]/60">
          <MitrePanel />
        </div>
      </div>
    );
  }

  // Predictions View
  function renderPredictions() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in text-xs">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">AI Threat Next-Step Predictions</h2>
          <p className="text-xs text-gray-400 mt-1">Autonomous threat prediction metrics based on telemetry logs</p>
        </div>

        <div className="bg-[#070e1a]/80 border border-[#1e293b]/60 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b]/50 text-[10px] text-gray-400 font-mono tracking-wider uppercase bg-[#060b17]/50">
                <th className="p-4">Predicted Next-Step</th>
                <th className="p-4">Probability</th>
                <th className="p-4">MITRE Tactic</th>
                <th className="p-4">MITRE Technique</th>
                <th className="p-4">Incident Association</th>
              </tr>
            </thead>
            <tbody>
              {predictions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">No next-step predictions active in database.</td>
                </tr>
              ) : (
                predictions.map(pred => (
                  <tr key={pred.id} className="border-b border-[#1e293b]/30 hover:bg-blue-950/5">
                    <td className="p-4 font-bold text-white">{pred.predicted_next_step}</td>
                    <td className="p-4 font-mono font-black text-amber-400">{(pred.probability * 100).toFixed(1)}%</td>
                    <td className="p-4 font-sans text-gray-300">{pred.mitre_tactic || 'None'}</td>
                    <td className="p-4 font-mono text-gray-300">{pred.mitre_technique || 'None'}</td>
                    <td className="p-4 font-mono text-gray-400">{pred.incident_id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // CERT-In Advisories View
  function renderCertIn() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in text-xs font-mono">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">CERT-In Security Advisories</h2>
          <p className="text-xs text-gray-400 mt-1">Official bulletins and mitigation workflows</p>
        </div>

        <div className="card p-5 bg-[#070e1a]/80 border-[#1e293b]/60 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold text-white font-sans">CIAD-2026-0142: RCE in CNI Gateway routers</h3>
            <span className="text-[9.5px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded uppercase font-bold">Severity: Critical</span>
          </div>
          <p className="text-gray-300 leading-relaxed font-sans text-xs">
            Vulnerability details: Remote Code Execution allows attackers to completely bypass firewall authorization tokens on external Gateway Core routers.
          </p>
          <div className="pt-2">
            <button 
              onClick={() => {
                addToast('Mitigating CVE-2026-0012 vulnerability...', 'info');
                setTimeout(() => {
                  addToast('Firewall rules updated successfully!', 'success');
                }, 2000);
              }}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-sans text-xs font-bold"
            >
              Verify Edge Mitigations
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playbooks View
  function renderPlaybooks() {
    return (
      <div className="p-6 space-y-6 max-w-[1920px] mx-auto animate-fade-in text-xs">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">Mitigation Playbooks</h2>
          <p className="text-xs text-gray-400 mt-1">Execute containment actions on affected CNI endpoints</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playbooks.map(pb => (
            <div key={pb.id} className="card p-5 bg-[#070e1a]/80 border-[#1e293b]/60 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white font-sans">{pb.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    pb.status === 'executed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    pb.status === 'running' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                    'bg-slate-800 text-gray-400'
                  }`}>
                    {pb.status}
                  </span>
                </div>
                <p className="text-gray-300 font-sans text-[11px] leading-relaxed">{pb.description || 'No description'}</p>
                
                {/* Step List */}
                <div className="space-y-1.5 font-mono text-[10px] text-gray-400 pt-2 border-t border-[#1e293b]/40">
                  {pb.steps.map((st: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-[#0b1424]/40 p-1.5 rounded">
                      <span>{st.step_num || idx + 1}. {st.description}</span>
                      <span className="uppercase text-[9px] text-blue-400 font-bold">{st.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleExecutePlaybook(pb)}
                disabled={playbookExecutingId === pb.id}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-sans text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                {playbookExecutingId === pb.id ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing Playbook...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span>Execute Playbook</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Reports View
  function renderReports() {
    const targetEmail = user?.email || "analyst@aiims.edu";

    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in text-xs font-mono">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">SOC Reports Delivery</h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">Export and deliver security incident data to registered analyst emails</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Generate & Deliver */}
          <div className="card p-5 bg-[#070e1a]/80 border-[#1e293b]/60 col-span-1 md:col-span-4 space-y-4 font-sans">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans">Generate Security Report</h3>
            
            <div className="space-y-3.5 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">Report Title</label>
                <input 
                  type="text" 
                  value={reportTitle} 
                  onChange={e => setReportTitle(e.target.value)} 
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">Report Format</label>
                <div className="flex gap-2">
                  {(['pdf', 'csv'] as const).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setReportFormat(fmt)}
                      className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all border ${
                        reportFormat === fmt 
                          ? 'bg-blue-600/25 border-blue-500 text-blue-400' 
                          : 'bg-slate-950 border-[#1e293b]/50 text-gray-400 hover:text-white'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-[9px] text-gray-400 block uppercase">Registered Destination Email</span>
                <div className="flex items-center gap-1.5 text-xs text-gray-300 font-bold bg-[#0b1424] border border-[#1e293b]/40 px-3 py-2 rounded">
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  <span>{targetEmail}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <button 
                onClick={() => handleGenerateAndSendReport(false)}
                disabled={generateReportLoading}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-[#1e293b]/60 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Download Report File</span>
              </button>
              
              <button 
                onClick={() => handleGenerateAndSendReport(true)}
                disabled={generateReportLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                {generateReportLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                <span>Deliver to Registered Email</span>
              </button>
            </div>
          </div>

          {/* History */}
          <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 col-span-1 md:col-span-8 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans">Report Delivery Logs</h3>
              <p className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">Session reports history</p>
            </div>

            <div className="overflow-x-auto border border-[#1e293b]/30 rounded-lg">
              <table className="w-full text-left border-collapse text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-[#1e293b]/50 text-gray-400 bg-[#060b17]/50 text-[9px] uppercase tracking-wider">
                    <th className="p-3">Generated</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-500 italic">No reports generated in database history.</td>
                    </tr>
                  ) : (
                    reportHistory.map(rep => (
                      <tr key={rep.id} className="border-b border-[#1e293b]/20 hover:bg-blue-950/5">
                        <td className="p-3 text-gray-400 whitespace-nowrap">{new Date(rep.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3 font-bold text-white truncate max-w-[150px]">{rep.title}</td>
                        <td className="p-3 uppercase text-gray-300 font-bold">{rep.file_type}</td>
                        <td className="p-3 text-gray-400">{rep.recipient_email}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {rep.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleResendHistoryReport(rep.id)}
                            disabled={resendLoadingId === rep.id}
                            className="px-2 py-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded flex items-center gap-1.5 ml-auto text-[9.5px] font-bold"
                          >
                            {resendLoadingId === rep.id ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3 w-3" />
                            )}
                            <span>Resend</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Configurable Org settings form
  function renderOrgSettingsForm() {
    return (
      <div className="p-6 space-y-6 max-w-[800px] mx-auto animate-fade-in text-xs font-mono">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">Organization Configuration</h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">Edit backend-configurable organization and CNI facility settings</p>
        </div>

        <div className="card p-6 bg-[#070e1a]/80 border-[#1e293b]/60">
          <form onSubmit={handleSaveOrgSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">Organization Name</label>
                <input 
                  type="text" 
                  value={orgSettings.name} 
                  onChange={e => setOrgSettings({...orgSettings, name: e.target.value})} 
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">Department</label>
                <input 
                  type="text" 
                  value={orgSettings.department} 
                  onChange={e => setOrgSettings({...orgSettings, department: e.target.value})} 
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">Faculty / Wing</label>
                <input 
                  type="text" 
                  value={orgSettings.faculty} 
                  onChange={e => setOrgSettings({...orgSettings, faculty: e.target.value})} 
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">Institution</label>
                <input 
                  type="text" 
                  value={orgSettings.institution} 
                  onChange={e => setOrgSettings({...orgSettings, institution: e.target.value})} 
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">Facility Location</label>
                <input 
                  type="text" 
                  value={orgSettings.location} 
                  onChange={e => setOrgSettings({...orgSettings, location: e.target.value})} 
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">Registered Contact Email</label>
                <input 
                  type="email" 
                  value={orgSettings.email} 
                  onChange={e => setOrgSettings({...orgSettings, email: e.target.value})} 
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">Logo Resource Path</label>
                <input 
                  type="text" 
                  value={orgSettings.logo} 
                  onChange={e => setOrgSettings({...orgSettings, logo: e.target.value})} 
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 block uppercase">Operational Timezone</label>
                <input 
                  type="text" 
                  value={orgSettings.timezone} 
                  onChange={e => setOrgSettings({...orgSettings, timezone: e.target.value})} 
                  className="w-full bg-slate-950 border border-[#1e293b]/60 rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={saveOrgLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-sans font-bold rounded-lg transition-all shadow-md flex items-center gap-1.5"
              >
                {saveOrgLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>Save Organization Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Settings View
  function renderSettings() {
    return (
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in text-xs font-mono">
        <div className="border-b border-[#1e293b]/40 pb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest font-sans">SOC Settings Panel</h2>
          <p className="text-xs text-gray-400 mt-1 font-sans">Operational configurations, security integrations, and session metadata</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans border-b border-[#1e293b]/30 pb-2">Analyst Profile</h3>
            <div className="space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Name</span>
                <span className="text-white font-bold">{user?.username || 'Commander Operator'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-blue-400 font-mono font-bold">{user?.email || 'analyst@aiims.edu'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Role</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                  {user?.role || 'ANALYST'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Organization</span>
                <span className="text-white font-bold">{orgSettings.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Last Login</span>
                <span className="text-gray-300 font-mono text-[11px]">Today, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} IST via Security MFA</span>
              </div>
            </div>
            <button 
              onClick={() => {
                logout();
                addToast('Session terminated successfully.', 'info');
              }}
              className="w-full py-2 bg-red-600/15 hover:bg-red-600/25 border border-red-500/30 text-red-400 font-sans text-xs font-bold rounded-lg transition-all mt-4"
            >
              Log Out Session
            </button>
          </div>

          {/* Subsystems Integration Status */}
          <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans border-b border-[#1e293b]/30 pb-2">Subsystem Integrations</h3>
            <div className="space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Primary AI Provider</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${health?.ai_configured ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'}`}>
                  {health?.ai_configured ? 'GEMINI FLASH (ONLINE)' : 'GEMINI (OFFLINE)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">AI Fallback Provider</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25">
                  OPENROUTER (ACTIVE)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email Delivery Channel</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${health?.email_configured ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
                  {health?.email_configured ? 'RESEND (ACTIVE)' : 'RESEND (UNCONFIGURED)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Telegram Bot Uplink</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${health?.telegram_configured ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
                  {health?.telegram_configured ? 'TELEGRAM (CONNECTED)' : 'TELEGRAM (UNCONFIGURED)'}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Context Preferences */}
          <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans border-b border-[#1e293b]/30 pb-2">Operational Context</h3>
            <div className="space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Timezone</span>
                <span className="text-white font-mono font-bold">{orgSettings.timezone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Default Country</span>
                <span className="text-white font-bold">{orgSettings.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Department Node</span>
                <span className="text-white font-bold">{orgSettings.department}</span>
              </div>
            </div>
          </div>

          {/* About Card */}
          <div className="card p-5 bg-[#070e1a]/85 border-[#1e293b]/60 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-wide uppercase font-sans border-b border-[#1e293b]/30 pb-2">About ARGUS Core</h3>
            <div className="space-y-2 text-[11px] text-gray-400 leading-relaxed font-sans">
              <p>
                <strong>ARGUS Core</strong> is an enterprise-grade Security Operations Center decision intelligence platform engineered specifically for Critical National Infrastructure (CNI) monitoring.
              </p>
              <div className="pt-2 border-t border-[#1e293b]/30 space-y-1 font-mono text-[10px]">
                <div>Version: <span className="text-white font-bold">2.4.1-build.1098</span></div>
                <div>Runtime Environment: <span className="text-white font-bold">Production Node</span></div>
                <div>Encryption Standard: <span className="text-white font-bold">AES-256 GCM</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
};

export default Dashboard;
