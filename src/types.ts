
export enum UserPlan {
    STARTER = "Starter",
    PRO = "Pro",
    BUSINESS = "Business",
    PRO_TEAM = "Pro Team",
    ENTERPRISE = "Enterprise",
    RESELLER = "Reseller"
}

export enum ProjectType {
    RESIDENTIAL = "Residential",
    COMMERCIAL = "Commercial",
    INDUSTRIAL = "Industrial"
}

export enum ProjectScale {
    SMALL = "Small",
    MEDIUM = "Medium",
    LARGE = "Large"
}

export enum ProjectTimeline {
    URGENT = "Urgent",
    STANDARD = "Standard",
    FLEXIBLE = "Flexible"
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
}

export interface EstimateItem {
    id: string;
    name: string;
    qty: number;
    unit: string;
    rate: number;
    total: number;
    category: "Material" | "Labor" | "Permit" | "Sub" | "Equipment";
    csi_division: string;
    retailerName: string;
    storeLink: string;
    logic?: string;
}

export interface EstimateInsight {
    type: "risk" | "market" | "compliance";
    title: string;
    text: string;
    impact: "low" | "medium" | "high";
}

export interface GroundingSource {
    name: string;
    price: number;
    retailer: string;
    link: string;
}

export interface EstimateResult {
    id?: number; // Added for history storage
    projectSummary: string;
    paymentTerms: string;
    items: EstimateItem[];
    insights: EstimateInsight[];
    marketConfidence: number;
    regionalMultiplier: number;
    suggestedAgenda?: string[];
    groundingSources?: GroundingSource[];
    project?: ProjectData;
    isAccepted?: boolean;
    transactionId?: string;
}

export interface SessionData {
    plan: UserPlan;
    subscriptionActive: boolean;
    company: string;
    trade: string;
    signature: string;
    usage: {
        estimatesLimit: number;
        estimatesThisMonth: number;
        usersLimit: number;
        usersCount: number;
        storageLimitBytes: number;
        storageUsedBytes: number;
    };
}

export enum LeadStatus {
    HOT = "Hot",
    WARM = "Warm",
    COLD = "Cold"
}

export interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    trade: string;
    status: LeadStatus;
    score: number;
    summary: string;
    transcript: string;
    createdAt: string;
    actionRequired: boolean;
}

export interface CalendarConfig {
    isConnected: boolean;
    email: string | null;
    syncEnabled: boolean;
    autoBookHotLeads: boolean;
    workingHours: {
        start: string;
        end: string;
        days: string[];
    };
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    attendees: string[];
    type: string;
}

export interface AgentConfiguration {
    id: string;
    isActive: boolean;
    name: string;
    persona: "professional" | "friendly" | "assertive";
    greeting: string;
    voiceId: string;
    qualifyingQuestions: string[];
    smsEnabled: boolean;
    calendarIntegration: boolean;
}
