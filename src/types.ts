
export enum ProjectType {
  RESIDENTIAL = 'Residential',
  COMMERCIAL = 'Commercial',
  INDUSTRIAL = 'Industrial'
}

export enum ProjectScale {
  SMALL = 'Small / Fit-out',
  MEDIUM = 'Medium / Reno',
  LARGE = 'Large / Structural'
}

export enum ProjectTimeline {
  STANDARD = 'Standard (3-4 weeks)',
  RUSH = 'Rush (1-2 weeks)',
  EXTENDED = 'Extended (8+ weeks)'
}

export enum UserPlan {
  ESSENTIAL = 'Essential (Pay-per-use)',
  GROWTH = 'Growth (Standard)',
  SCALE = 'Scale (Enterprise)'
}

export interface SessionData {
  signature: string;
  plan: UserPlan;
  company: string;
  trade: string;
  subscriptionActive: boolean;
  expiryDate?: string;
}

export interface LineItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  rate: number;
  total: number;
  category: 'Material' | 'Labor' | 'Permit' | 'Sub' | 'Equipment';
  csi_division: string;
  retailerName: string;
  storeLink: string;
  logic?: string;
}

export interface StrategicInsight {
  type: 'risk' | 'market' | 'compliance';
  title: string;
  text: string;
  impact: 'low' | 'medium' | 'high';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface EstimateResult {
  projectSummary: string;
  paymentTerms: string;
  items: LineItem[];
  insights: StrategicInsight[];
  marketConfidence: number;
  regionalMultiplier: number;
  groundingSources?: GroundingSource[];
  suggestedAgenda?: string[];
}

export interface ProjectData {
  scope: string;
  location: string;
  size: string;
  description: string;
  projectType: ProjectType;
  projectScale: ProjectScale;
  timeline: ProjectTimeline;
  estimateFee: number;
  isAccepted?: boolean;
  transactionId?: string;
}
