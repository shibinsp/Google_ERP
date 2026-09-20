export type UserRole =
  | 'super_admin'
  | 'finance_controller'
  | 'supply_chain_mgr'
  | 'hr_director'
  | 'compliance_auditor';

export interface RoleProfile {
  id: UserRole;
  title: string;
  department: string;
  badgeColor: string;
  description: string;
  allowedModules: Array<'inventory' | 'hrms' | 'finance' | 'analytics' | 'security' | 'integrations' | 'agentic_mesh' | 'workflow_builder' | 'mcp_protocol' | 'governance' | 'manufacturing' | 'crm_sales' | 'ooux_framework' | 'design_tokens' | 'micro_frontends' | 'agentic_ux' | 'ux_roi_analytics'>;
  canExecutePayroll: boolean;
  canApprovePayments: boolean;
  canManageInventory: boolean;
  canViewAuditLogs: boolean;
  canAccessEncryptionKeys: boolean;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Electronics' | 'Raw Materials' | 'Components' | 'Packaging' | 'Finished Goods';
  warehouseLocation: string; // e.g. "WH-North / Bay 4 / Shelf B"
  currentStock: number;
  safetyStock: number;
  reorderPoint: number;
  maxCapacity: number;
  unitCost: number;
  unitPrice: number;
  turnoverRatio: number; // e.g. 8.4x / year
  daysSalesOfInventory: number; // DSI
  lastRestocked: string;
  status: 'optimal' | 'low_stock' | 'critical' | 'overstocked';
  supplier: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  itemId: string;
  sku: string;
  itemName: string;
  type: 'inbound_receipt' | 'outbound_dispatch' | 'warehouse_transfer' | 'audit_adjustment';
  quantity: number;
  origin: string;
  destination: string;
  operator: string;
  referenceNumber: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  department: 'Engineering' | 'Supply Chain' | 'Finance' | 'Human Resources' | 'Operations' | 'Sales';
  roleTitle: string;
  employmentType: 'Full-time' | 'Contract' | 'Executive';
  startDate: string;
  grossSalaryAnnual: number;
  monthlyNet: number;
  allocatedHoursPerWeek: number;
  currentAllocatedHours: number; // e.g. 38/40
  activeProjectCount: number;
  performanceRating: number; // 1-5
  // Encrypted sensitive fields (AES-GCM ciphertext + IV)
  encryptedTaxId: string;
  maskedTaxId: string; // e.g. "***-**-8492"
  encryptedBankAccount: string;
  maskedBankAccount: string; // e.g. "Chase Bank •••• 9841"
  directDepositStatus: 'verified' | 'pending' | 'suspended';
}

export interface ResourceAllocation {
  id: string;
  projectName: string;
  code: string;
  department: string;
  leadEmployee: string;
  teamSize: number;
  hoursAllocatedTotal: number;
  hoursUtilized: number;
  budgetAllocated: number;
  budgetSpent: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  health: 'optimal' | 'warning' | 'overloaded';
  completionRate: number; // 0-100%
  deadline: string;
}

export interface PayrollRecord {
  id: string;
  periodName: string; // e.g., "September 2026 - Bi-Weekly Cycle 2"
  payDate: string;
  employeeCount: number;
  totalGrossPay: number;
  federalTaxWithheld: number;
  stateTaxWithheld: number;
  benefitsDeductions: number;
  totalNetPay: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'dispatched';
  authorizedBy?: string;
  batchReference: string;
  directDepositDispatchedAt?: string;
  gmailNotificationSent: boolean;
}

export interface FinancialMetric {
  totalRevenueYTD: number;
  grossProfitMargin: number; // percentage
  operatingExpensesMonthly: number;
  netIncomeMonthly: number;
  accountsReceivableOutstanding: number;
  accountsPayableOutstanding: number;
  cashOnHand: number;
  burnRateMonthly: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  partyName: string;
  type: 'payable' | 'receivable';
  amount: number;
  taxAmount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  category: string;
  paymentGateway?: string;
  createdDate: string;
  lineItems?: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  scannedImageUrl?: string;
  confidenceScore?: number;
  notes?: string;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: {
    label: string;
    actionType: 'navigate' | 'filter' | 'scan_invoice';
    target?: string;
  }[];
}

export interface ExtractedInvoiceData {
  invoiceNumber: string;
  partyName: string;
  type: 'payable' | 'receivable';
  amount: number;
  taxAmount: number;
  dueDate: string;
  createdDate: string;
  category: string;
  status?: 'paid' | 'pending' | 'overdue';
  notes?: string;
  confidence?: number;
  tags?: string[];
  lineItems?: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}


export interface PaymentGatewayConfig {
  id: 'stripe' | 'paypal' | 'square' | 'wire_ach';
  name: string;
  status: 'active' | 'sandbox' | 'offline';
  supportedMethods: string[];
  processingFee: string;
  totalProcessedMonth: number;
  successRate: number;
  webhookStatus: 'connected' | 'degraded';
}

export interface PaymentGatewayTransaction {
  id: string;
  transactionId: string;
  gateway: 'stripe' | 'paypal' | 'square' | 'wire_ach';
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  customerName: string;
  customerEmail: string;
  description: string;
  status: 'succeeded' | 'processing' | 'refunded' | 'failed';
  timestamp: string;
  paymentMethod: string; // e.g. "Visa ending in 4242"
  feeAmount: number;
  e2eEncryptedToken: string; // cryptographic hash token
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  module: 'Inventory' | 'HRMS' | 'Finance' | 'Security' | 'Integrations' | 'Gateway';
  details: string;
  ipAddress: string;
  cryptographicHash: string; // Tamper-evident SHA-256 seal
}

export interface NotificationAlert {
  id: string;
  type: 'low_stock' | 'payroll_update' | 'security_mfa' | 'payment_gateway';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'critical' | 'warning' | 'info';
  relatedId?: string;
  gmailDispatched?: boolean;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  category: 'inventory' | 'finance' | 'hrms' | 'analytics' | 'security';
  enabled: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  mfaVerified: boolean;
  mfaMethod: 'totp_authenticator' | 'sms' | 'security_key';
  sessionExpiry: string;
  ipAddress: string;
  googleConnected: boolean;
  googleEmail?: string;
  googlePhoto?: string;
}

export interface ForecastTimelinePoint {
  day: number;
  date: string;
  historicalActualStock?: number;
  projectedStock: number;
  upperConfidenceBound: number;
  lowerConfidenceBound: number;
  reorderThreshold: number;
  safetyThreshold: number;
  isProjected: boolean;
}

export interface StockForecast {
  itemId: string;
  sku: string;
  itemName: string;
  category: string;
  currentStock: number;
  safetyStock: number;
  reorderPoint: number;
  maxCapacity: number;
  unitCost: number;
  supplier: string;
  warehouseLocation: string;
  // Velocity & Statistical Metrics
  averageDailyDemand: number; // units consumed per day (velocity)
  demandVelocityTrend: 'accelerating' | 'stable' | 'decelerating';
  velocityChangePercent: number; // percentage change vs previous period
  leadTimeDays: number; // supplier delivery lead time (days)
  daysUntilReorderPoint: number; // days until reaching reorderPoint
  suggestedReorderDate: string; // ISO date YYYY-MM-DD
  daysUntilStockout: number; // days until stock hits 0
  projectedStockoutDate: string; // ISO date YYYY-MM-DD
  // Depletion projection fields based on historical outbound movement trends
  projectedDepletionDate: string; // ISO date YYYY-MM-DD for zero stock depletion
  daysUntilDepletion: number; // days until complete stock depletion
  historicalOutboundBurnRate: number; // units/day derived from historical outbound movement trend
  outboundMovementCount: number; // number of outbound dispatches and negative audit adjustments
  depletionRiskLevel: 'critical_depleted' | 'urgent_7d' | 'moderate_14d' | 'healthy_15d_plus';
  recommendedReorderQuantity: number; // Recommended order quantity based on EOQ / capacity
  urgency: 'critical_immediate' | 'reorder_soon' | 'optimal';
  modelConfidence: number; // percentage, e.g. 95%
  historicalMovementsCount: number;
  totalHistoricalDispatched: number;
  projectionTimeline: ForecastTimelinePoint[];
}

export interface YoYRevenuePoint {
  period: string; // e.g. "Q1", "Q2", "Q3", "Q4" or "Jan", "Feb"
  periodLabel: string;
  fy2025Revenue: number;
  fy2026Revenue: number;
  fy2025GrossProfit: number;
  fy2026GrossProfit: number;
  targetRevenue: number;
  yoyGrowthRate: number; // percentage, e.g. 24.5
  grossMargin2025: number; // percentage
  grossMargin2026: number; // percentage
  hardwareRevenue2026: number;
  softwareServicesRevenue2026: number;
  growthDriver: string;
}

export interface InventoryTurnoverTrendPoint {
  period: string;
  periodLabel: string;
  turnoverRatio: number; // Annualized turns (e.g. 8.4x)
  daysSalesOfInventory: number; // DSI in days (e.g. 43d)
  inventoryValuation: number; // In USD
  cogsQuarterly: number; // Cost of goods sold in USD
  benchmarkTurnover: number; // Industry peer median (e.g. 7.5x)
  workingCapitalFreed: number; // Cumulative liberated cash ($)
  holdingCostRate: number; // % annual holding cost
}

export interface CategoryTurnoverMetric {
  category: string;
  turnoverRatio: number;
  daysSalesOfInventory: number;
  inventoryValue: number;
  annualCogs: number;
  benchmarkRatio: number;
  velocityRating: 'World Class' | 'High Velocity' | 'Optimal' | 'Moderate' | 'Slow Mover';
  color: string;
}

// Enterprise Agentic Architecture Framework (EAAF) & Agentic Mesh
export interface EAAFAgent {
  id: string;
  name: string;
  classification: 'simple_reflex' | 'model_based' | 'goal_based' | 'utility_based';
  runtime: 'LangGraph' | 'CrewAI' | 'Amazon Strands' | 'Custom Serverless';
  domain: 'Finance' | 'Supply Chain' | 'HRMS' | 'Operations' | 'Security';
  status: 'active' | 'evaluating' | 'paused' | 'kill_switched';
  utilityScore: number; // 0-100%
  lastAction: string;
  lastActionTimestamp: string;
  tokenVaultPolicy: string; // e.g. "OAuth 2.1 Scope: ledger.write"
  killSwitchTriggered: boolean;
  maxSpendThresholdUSD: number;
  currentSpendUSD: number;
}

// Model Context Protocol (MCP) Integration Engine
export interface MCPTool {
  id: string;
  name: string;
  category: 'ERP Data Discovery' | 'Financial Ledger' | 'Supply Chain Routing' | 'HR Ontology';
  description: string;
  jsonSchema: string; // JSON schema string
  endpoint: string;
  rbacPermission: string;
  zeroDataRetention: boolean;
  status: 'connected' | 'standby' | 'rate_limited';
  callCount24h: number;
}

// Dynamic Skills Ontology & Workforce Capability
export interface SkillsOntologyNode {
  id: string;
  skillName: string;
  category: string;
  inferredFrom: string; // e.g. "Performance Reviews & GitHub commits"
  proficiencyLevel: 'Expert' | 'Advanced' | 'Intermediate';
  demandRating: 'High Growth' | 'Stable' | 'Critical Shortage';
  gapRiskScore: number; // 0-100%
  employeesCount: number;
}

// Predictive Employee Attrition & XAI
export interface EmployeeAttritionRisk {
  employeeId: string;
  fullName: string;
  department: string;
  roleTitle: string;
  flightRiskScore: number; // 0-100%
  flightRiskLevel: 'Critical Risk' | 'High Risk' | 'Moderate' | 'Low';
  xaiFactors: {
    factor: string;
    weight: number; // contribution %
    description: string;
  }[];
  recommendedAction: string;
}

// EU AI Act & COSO Compliance Suite
export interface EUAIActModuleRecord {
  id: string;
  moduleName: string;
  riskCategory: 'unacceptable' | 'high_risk' | 'limited_risk' | 'minimal_risk';
  friaCompleted: boolean;
  friaDate?: string;
  humanOversightRequired: boolean;
  article4LiteracyVerified: boolean;
  auditLogRetentionDays: number; // 180+ days
  status: 'compliant' | 'review_required' | 'action_needed';
}

// Financial Hallucination Mitigation (PCAOB & NIST Compliant)
export interface HallucinationGuardrailCheck {
  id: string;
  queryId: string;
  timestamp: string;
  userPrompt: string;
  ragSourceDocument: string;
  sourceTraceabilityUrl: string;
  numericalReconciliationPassed: boolean;
  glDiscrepancyAmount: number;
  provenanceFlagged: boolean;
  humanReviewerSignoff: boolean;
}

// Empirical ROI & Value Realization
export interface EmpiricalROIMetric {
  key: string;
  title: string;
  currentValue: string;
  baselineValue: string;
  targetValue: string;
  improvementPercentage: number;
  financialImpactUSD: number;
  domain: string;
  iconName: string;
}

// Manufacturing & MRP Suite
export interface BOMComponent {
  componentSku: string;
  componentName: string;
  quantityRequired: number;
  unitCost: number;
  extendedCost: number;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  finishedGoodSku: string;
  finishedGoodName: string;
  targetQuantity: number;
  completedQuantity: number;
  startDate: string;
  targetCompletionDate: string;
  status: 'draft' | 'in_production' | 'qa_inspection' | 'completed';
  shopFloorStation: string;
  allocatedBom: BOMComponent[];
  unitProductionCost: number;
  totalOrderCost: number;
}

// Sales & CRM Quote-to-Order Suite
export interface CustomerAccount {
  id: string;
  accountNumber: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  creditLimitUSD: number;
  outstandingBalanceUSD: number;
  tier: 'Enterprise Platinum' | 'Gold Volume' | 'Standard Corporate';
  status: 'active' | 'hold';
}

export interface SalesQuote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  createdDate: string;
  validUntil: string;
  subtotal: number;
  discountPercent: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'quote_sent' | 'approved' | 'converted_to_order';
  lineItems: {
    sku: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  quoteReference?: string;
  customerName: string;
  orderDate: string;
  promisedShipDate: string;
  totalAmount: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'fulfilled';
  shippingCarrier: string;
  trackingNumber: string;
}

// Multi-Entity GL Consolidation & Multi-Currency Treasury
export interface MultiEntityConsolidation {
  entityId: string;
  entityName: string;
  region: string;
  baseCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'SGD';
  exchangeRateToUSD: number;
  localRevenue: number;
  consolidatedRevenueUSD: number;
  localOperatingExpenses: number;
  consolidatedOpExUSD: number;
}

// Lot & Serial Number Traceability
export interface LotSerialRecord {
  id: string;
  sku: string;
  itemName: string;
  lotNumber: string;
  serialNumber: string;
  manufacturingDate: string;
  expirationDate: string;
  warehouseLocation: string;
  status: 'active' | 'quarantine' | 'dispatched';
}

// Object-Oriented UX (OOUX) ORCA Framework
export interface OOUXObject {
  id: string;
  name: string;
  description: string;
  attributes: {
    coreContent: string[];
    metadata: string[];
    stateValues: string[];
  };
  relationships: {
    targetObject: string;
    cardinality: '1:1' | '1:N' | 'N:M';
    description: string;
  }[];
  callsToAction: {
    action: string;
    requiredRole: UserRole;
    impact: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

// W3C Design Tokens Community Group (DTCG) Format
export interface DesignToken {
  id: string;
  name: string;
  category: 'color' | 'typography' | 'spacing' | 'elevation' | 'motion';
  layer: 'primitive' | 'semantic' | 'component';
  value: string;
  aliasOf?: string;
  comment?: string;
}

// Webpack Module Federation Micro-Frontend Remote Config
export interface MicroFrontendConfig {
  id: string;
  name: string;
  filename: string;
  scope: string;
  exposedModules: Record<string, string>;
  remotes: Record<string, string>;
  sharedDependencies: string[];
  status: 'online' | 'degraded' | 'offline';
  latencyMs: number;
}

// 6-Pattern Agentic UX State & Generative UI Payload
export interface AgenticUXState {
  id: string;
  agentName: string;
  autonomyLevel: number; // 0 - 100%
  intentPreview: {
    actionName: string;
    targetResource: string;
    affectedCount: number;
    riskTier: 'low' | 'moderate' | 'critical';
  };
  explainableRationale: {
    rulesApplied: string[];
    sourceKnowledgeBase: string;
    algorithmReasoning: string;
  };
  confidenceSignal: {
    score: number; // 0.0 - 1.0
    status: 'high_confidence' | 'human_oversight_required';
  };
  actionAuditLog: {
    timestamp: string;
    action: string;
    rollbackAvailable: boolean;
  }[];
}

// System Usability Scale (SUS), NASA-TLX & ROI Financial Metrics
export interface UXUsabilityBenchmark {
  id: string;
  moduleName: string;
  susScore: number; // 0 - 100
  umuxLiteScore: number; // 0 - 100
  nasaTlxWorkload: {
    mentalDemand: number; // 1 - 100
    temporalDemand: number;
    effort: number;
  };
  operationalMetrics: {
    taskSuccessRate: number; // percentage
    timeOnTaskSeconds: number;
    userErrorRate: number; // percentage
    annualDollarsSaved: number;
  };
}


