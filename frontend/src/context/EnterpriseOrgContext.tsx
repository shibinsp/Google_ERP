import React, { createContext, useContext, useState, useEffect } from 'react';

export interface EnterpriseOrg {
  id: string;
  name: string;
  division: string;
  region: string;
  currency: string;
  complianceLevel: string;
  activeAgentsCount: number;
}

export const ENTERPRISE_ORGS: EnterpriseOrg[] = [
  {
    id: 'org-global-corp',
    name: 'Acme Global Holdings Inc.',
    division: 'Global Enterprise Core',
    region: 'North America / Multi-Region',
    currency: 'USD ($)',
    complianceLevel: 'SOC2 Type II + FedRAMP',
    activeAgentsCount: 6,
  },
  {
    id: 'org-emea-mfg',
    name: 'Acme Industrial EMEA GmbH',
    division: 'Heavy Manufacturing & Assembly',
    region: 'Frankfurt / Europe',
    currency: 'EUR (€)',
    complianceLevel: 'GDPR + ISO 27001',
    activeAgentsCount: 5,
  },
  {
    id: 'org-apac-logistics',
    name: 'Acme Logistics APAC Pte.',
    division: 'Supply Chain & Maritime Freight',
    region: 'Singapore / Asia-Pacific',
    currency: 'SGD (S$)',
    complianceLevel: 'Cross-Border Privacy Rules (CBPR)',
    activeAgentsCount: 4,
  },
  {
    id: 'org-na-saas',
    name: 'Acme Cloud & AI Labs LLC',
    division: 'Autonomous Agent Research',
    region: 'San Francisco / Silicon Valley',
    currency: 'USD ($)',
    complianceLevel: 'HIPAA + SOC2 Type II',
    activeAgentsCount: 6,
  },
];

interface EnterpriseOrgContextType {
  currentOrg: EnterpriseOrg;
  switchOrg: (orgId: string) => void;
  allOrgs: EnterpriseOrg[];
}

const EnterpriseOrgContext = createContext<EnterpriseOrgContextType | undefined>(undefined);

export const EnterpriseOrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentOrg, setCurrentOrg] = useState<EnterpriseOrg>(() => {
    const saved = localStorage.getItem('erp_active_org_id');
    const found = ENTERPRISE_ORGS.find((o) => o.id === saved);
    return found || ENTERPRISE_ORGS[0];
  });

  const switchOrg = (orgId: string) => {
    const org = ENTERPRISE_ORGS.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('erp_active_org_id', org.id);
    }
  };

  useEffect(() => {
    localStorage.setItem('erp_active_org_id', currentOrg.id);
  }, [currentOrg]);

  return (
    <EnterpriseOrgContext.Provider value={{ currentOrg, switchOrg, allOrgs: ENTERPRISE_ORGS }}>
      {children}
    </EnterpriseOrgContext.Provider>
  );
};

export const useEnterpriseOrg = (): EnterpriseOrgContextType => {
  const context = useContext(EnterpriseOrgContext);
  if (!context) {
    throw new Error('useEnterpriseOrg must be used within an EnterpriseOrgProvider');
  }
  return context;
};
