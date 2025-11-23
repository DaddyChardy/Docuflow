
export enum UserRole {
  STUDENT_LEADER = 'Student Leader',
  ADVISER = 'Organization Adviser',
  ADMIN = 'Campus Admin',
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
}

export enum DocumentType {
  ACTIVITY_PROPOSAL = 'Activity Proposal',
  BUDGET_REQ = 'Budgetary Requirements',
  RESOLUTION = 'Resolution',
  OFFICIAL_LETTER = 'Official Letter',
  CONSTITUTION = 'Constitution & By-Laws',
  MEETING_MINUTES = 'Meeting Minutes',
}

export interface GeneratedDocument {
  id: string;
  title: string;
  type: DocumentType;
  content: string;
  createdAt: Date;
  status: 'Draft' | 'Final';
}

export interface BudgetLineItem {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
