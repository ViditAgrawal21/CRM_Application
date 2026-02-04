export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  monthlyMeetingTarget?: number;
  monthlyVisitTarget?: number;
  monthlyRevenueTarget?: number;
  monthlyBonus?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'prospect' | 'converted' | 'spam';
export type LeadType = 'lead' | 'data';

export interface Lead {
  id: string;
  type: LeadType;
  date: string;
  name: string;
  phone: string;
  configuration: string;
  location: string;
  remark?: string;
  status: LeadStatus;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assignedUser?: User;
  is_deleted?: boolean;
  deleted_by?: string;
  deleted_at?: string;
  deleted_by_user?: User;
}

export interface CreateLeadData {
  type: LeadType;
  date: string;
  name: string;
  phone: string;
  configuration: string;
  location: string;
  remark?: string;
  assignedTo?: string;
}

export type FollowupStatus = 'pending' | 'done' | 'cancelled';

export interface Followup {
  id: string;
  lead_id: string;
  reminder_at: string;
  status: FollowupStatus;
  outcome?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Meeting {
  id: string;
  lead_id: string;
  scheduled_at: string;
  location: string;
  status: MeetingStatus;
  outcome?: string;
  notes?: string;
  remark?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  user?: User;
}

export interface Visit {
  id: string;
  lead_id: string;
  scheduled_at: string;
  site_location: string;
  status: MeetingStatus;
  outcome?: string;
  notes?: string;
  remark?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  user?: User;
}

export interface Template {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  lead_id: string;
  text: string;
  created_by: string;
  created_at: string;
  user?: User;
}

export type LogAction = 'call' | 'whatsapp' | 'template' | 'meeting' | 'visit' | 'note' | 'status_change';

export interface Log {
  id: string;
  lead_id: string;
  action: LogAction;
  duration?: number;
  outcome?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  user?: User;
}

export interface Property {
  id: string;
  projectName: string;
  builders: string;
  location: string;
  configuration: string;
  price: string;
  possession: string;
  link: string;
  contactUs: string;
}

export interface DashboardStats {
  overview: {
    totalLeads: number;
    pendingFollowups: number;
    missedFollowups: number;
    upcomingMeetings: number;
    upcomingVisits: number;
  };
  leadsByStatus: Record<LeadStatus, number>;
  thisMonth: {
    meetings: number;
    visits: number;
  };
  team?: {
    total: number;
    active: number;
    inactive: number;
  };
  // For targets in Reports screen
  leadsAdded: number;
  leadsTarget: number;
  meetings: number;
  meetingsTarget: number;
}

export interface DailyReport {
  reportDate: string;
  callsMade: number;
  followupsDone: number;
  meetings: number;
  visits: number;
  leadsAdded: number;
  dealsClosed: number;
  visitsToday?: number;
  meetingsToday?: number;
  totalCalls?: number;
  prospects?: ProspectEntry[];
  nextDayPlan?: string;
  userName?: string;
}

export interface ProspectEntry {
  leadId: string;
  name: string;
  phone: string;
  status: string;
}

export interface MonthlyReport {
  month: string;
  userName?: string;
  userRole?: string;
  totalCalls: number;
  totalFollowups: number;
  totalMeetings: number;
  totalVisits: number;
  leadsAdded: number;
  dealsClosed: number;
  conversionRate: number;
  targetAchievement: number;
  targets?: {
    meetings: number;
    visits: number;
    revenue: number;
    bonus: number;
  };
  achieved?: {
    meetings: number;
    visits: number;
    revenue: number;
  };
  performance?: {
    meetingPercentage: number;
    visitPercentage: number;
    revenuePercentage: number;
  };
  bonusEarned?: number;
}

// Bulk Upload Types
export interface BulkUploadRecord {
  customerName: string;
  customerNumber: string;
  configuration: string;
  location: string;
  remark?: string;
  assignTo?: string | null;
}

export interface BulkUploadRequest {
  type: LeadType;
  date: string;
  records: BulkUploadRecord[];
}

export interface BulkUploadResponse {
  uploadId: string;
  total: number;
  inserted: number;
  duplicates: number;
  errors: number;
  errorDetails: Array<{
    recordIndex: number;
    phone: string;
    reason: string;
  }>;
  duplicateDetails: Array<{
    recordIndex: number;
    phone: string;
    name: string;
  }>;
}

// Daily Report Save Types
export interface SaveDailyReportData {
  reportDate: string;
  visitsToday: number;
  meetingsToday: number;
  totalCalls: number;
  prospects: ProspectEntry[];
  nextDayPlan: string;
}
