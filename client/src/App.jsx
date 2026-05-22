import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Classify from './pages/Classify.jsx';
import Screen from './pages/Screen.jsx';
import TradeTools from './pages/TradeTools.jsx';
import FtzAdmissionReconciliation from './pages/FtzAdmissionReconciliation.jsx';

// // === Batch 02 Gaps & Frontend Mounts ===
import CfTariffComplianceOptimization from './pages/CfTariffComplianceOptimization.jsx';
import CfSupplyChainVisibility from './pages/CfSupplyChainVisibility.jsx';
import CfAutomationOfDeclarations from './pages/CfAutomationOfDeclarations.jsx';
import CfSanctionsScreeningAgent from './pages/CfSanctionsScreeningAgent.jsx';
import GapDutiesLacksAiTariffOptimizationEndpoint from './pages/GapDutiesLacksAiTariffOptimizationEndpoint.jsx';
import GapShipmentsLacksAiDelayPrediction from './pages/GapShipmentsLacksAiDelayPrediction.jsx';
import GapSanctionsLacksAiRiskScreeningAgent from './pages/GapSanctionsLacksAiRiskScreeningAgent.jsx';
import GapDocumentsLacksAiDeclarationAutoGeneration from './pages/GapDocumentsLacksAiDeclarationAutoGeneration.jsx';
import GapNoWebhooksForCarrierOrGovernmentApiPushes from './pages/GapNoWebhooksForCarrierOrGovernmentApiPushes.jsx';
import GapNoSmsPushNotifications from './pages/GapNoSmsPushNotifications.jsx';
import GapNoPaymentDutyCollectionWorkflow from './pages/GapNoPaymentDutyCollectionWorkflow.jsx';
import GapNoCalendarScheduling from './pages/GapNoCalendarScheduling.jsx';
import GapNoMobileApiSurface from './pages/GapNoMobileApiSurface.jsx';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

const navStyle = {
  display: 'flex', gap: '1rem', padding: '1rem 2rem',
  background: '#1a2340', alignItems: 'center'
};

const logoStyle = {
  color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginRight: '2rem'
};

const linkStyle = ({ isActive }) => ({
  color: isActive ? '#60a5fa' : '#94a3b8',
  textDecoration: 'none', fontWeight: 500, padding: '0.4rem 0.8rem',
  borderRadius: '6px', background: isActive ? 'rgba(96,165,250,0.1)' : 'transparent'
});

const contentStyle = { padding: '2rem', maxWidth: '1200px', margin: '0 auto' };

export default function App() {
  return (
    <BrowserRouter>
      <nav style={navStyle}>
        <span style={logoStyle}>AI Customs</span>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/classify" style={linkStyle}>Classify</NavLink>
        <NavLink to="/screen" style={linkStyle}>Screen</NavLink>
        <NavLink to="/trade-tools" style={linkStyle}>Trade Tools</NavLink>
        <NavLink to="/ftz-reconciliation" style={linkStyle}>FTZ Reconcile</NavLink>
      </nav>
      <div style={contentStyle}>
        <Routes>
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classify" element={<Classify />} />
          <Route path="/screen" element={<Screen />} />
          <Route path="/trade-tools" element={<TradeTools />} />
          <Route path="/ftz-reconciliation" element={<FtzAdmissionReconciliation />} />
        
        {/* // === Batch 02 Gaps & Frontend Mounts === */}
        <Route path="/cf/tariff-compliance-optimization" element={<CfTariffComplianceOptimization />} />
        <Route path="/cf/supply-chain-visibility" element={<CfSupplyChainVisibility />} />
        <Route path="/cf/automation-of-declarations" element={<CfAutomationOfDeclarations />} />
        <Route path="/cf/sanctions-screening-agent" element={<CfSanctionsScreeningAgent />} />
        <Route path="/gap/duties-lacks-ai-tariff-optimization-endpoint" element={<GapDutiesLacksAiTariffOptimizationEndpoint />} />
        <Route path="/gap/shipments-lacks-ai-delay-prediction" element={<GapShipmentsLacksAiDelayPrediction />} />
        <Route path="/gap/sanctions-lacks-ai-risk-screening-agent" element={<GapSanctionsLacksAiRiskScreeningAgent />} />
        <Route path="/gap/documents-lacks-ai-declaration-auto-generation" element={<GapDocumentsLacksAiDeclarationAutoGeneration />} />
        <Route path="/gap/no-webhooks-for-carrier-or-government-api-pushes" element={<GapNoWebhooksForCarrierOrGovernmentApiPushes />} />
        <Route path="/gap/no-sms-push-notifications" element={<GapNoSmsPushNotifications />} />
        <Route path="/gap/no-payment-duty-collection-workflow" element={<GapNoPaymentDutyCollectionWorkflow />} />
        <Route path="/gap/no-calendar-scheduling" element={<GapNoCalendarScheduling />} />
        <Route path="/gap/no-mobile-api-surface" element={<GapNoMobileApiSurface />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}
