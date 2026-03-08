// Define all core types and enums for the Lingland platform
import { ServiceType, AssignmentStatus, GuestContact, Currency } from './shared/types/common';
import { TenantScopedEntity } from './shared/types/baseEntity';
import { JobStatus } from './domains/jobs/status';
import { Job, JobAssignment } from './domains/jobs/types';
import { allowedTransitions, canTransition } from './domains/jobs/stateMachine';
import { JobEventType, JobEvent } from './domains/jobs/jobEvents';

export type {
  GuestContact,
  Currency,
  JobStatus,
  Job,
  JobAssignment,
  JobEventType,
  JobEvent
};

export {
  ServiceType,
  AssignmentStatus,
  allowedTransitions,
  canTransition
};

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Can manage global settings, system views, and all admin functions
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  INTERPRETER = 'INTERPRETER'
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  profileId?: string;
}


export enum BookingStatus {
  INCOMING = 'INCOMING', // Initial state
  OPENED = 'OPENED', // Interpreter assigned but hasn't accepted
  BOOKED = 'BOOKED', // Interpreter accepted
  ADMIN = 'ADMIN', // Manual standby by admin
  CANCELLED = 'CANCELLED',
  TIMESHEET_SUBMITTED = 'TIMESHEET_SUBMITTED', // Job done, timesheet submitted, awaiting admin verification
  INVOICING = 'INVOICING', // Verified, ready for invoicing
  INVOICED = 'INVOICED', // Invoice generated
  PAID = 'PAID' // Invoice paid
}


export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  requestedByUserId: string;
  serviceType: ServiceType;
  languageFrom: string;
  languageTo: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  locationType: 'ONSITE' | 'ONLINE';
  location?: string;
  address?: string;
  postcode?: string;
  onlineLink?: string;
  status: BookingStatus;
  costCode?: string;
  notes?: string;
  interpreterId?: string;
  interpreterName?: string;
  bookingRef?: string;
  expectedEndTime?: string;
  createdAt?: any;
  updatedAt?: any;
  caseType?: string;
  genderPreference?: 'Male' | 'Female' | 'None';
  guestContact?: GuestContact;
  currency?: string;
  priority?: 'High' | 'Normal' | 'Low';
  totalAmount?: number;
  endTime?: string;
  patientReference?: string;
  adminNotes?: string;
}

export interface BookingAssignment {
  id: string;
  bookingId: string;
  interpreterId: string;
  status: AssignmentStatus;
  offeredAt: string;
  respondedAt?: string;
  bookingSnapshot?: Partial<Booking>;
}

export interface Client extends TenantScopedEntity {
  companyName: string;
  billingAddress: string;
  paymentTermsDays: number;
  contactPerson: string;
  email: string;
  status?: 'ACTIVE' | 'GUEST' | 'SUSPENDED';
  defaultCostCodeType: 'PO' | 'Cost Code' | 'Client Name';
}

export interface Interpreter extends TenantScopedEntity {
  name: string;
  email: string;
  phone: string;
  languages: string[];
  regions: string[];
  qualifications: string[];
  status: 'ACTIVE' | 'ONBOARDING' | 'SUSPENDED' | 'BLOCKED';
  isAvailable: boolean;
  dbsExpiry: string;
  addressLine1?: string;
  postcode?: string;
  dbsDocumentUrl?: string;
  unavailableDates?: string[];
  acceptsDirectAssignment: boolean;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  SUBMITTED = 'SUBMITTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  APPROVED = 'APPROVED'
}

export interface Timesheet extends TenantScopedEntity {
  bookingId: string;
  interpreterId: string;
  clientId: string;
  submittedAt: string;
  actualStart: string;
  actualEnd: string;
  breakDurationMinutes: number;
  adminApproved: boolean;
  adminApprovedAt?: string;
  status: 'SUBMITTED' | 'APPROVED' | 'INVOICING' | 'INVOICED';
  readyForClientInvoice: boolean;
  readyForInterpreterInvoice: boolean;
  unitsBillableToClient: number;
  unitsPayableToInterpreter: number;
  totalClientAmount?: number;
  totalInterpreterAmount?: number;
  clientAmountCalculated: number;
  interpreterAmountCalculated: number;
  clientInvoiceId?: string;
  interpreterInvoiceId?: string;
  supportingDocumentUrl?: string;
}

export type FiscalCategory =
  | 'INTERPRETING_SERVICES'
  | 'TRANSLATION_SERVICES'
  | 'TRAVEL_TIME'
  | 'MILEAGE'
  | 'CANCELLATION_FEE'
  | 'LATE_NOTICE_FEE'
  | 'ADMIN_FEE'
  | 'ADDITIONAL_EXPENSES';

export interface ClientInvoiceItem {
  id: string;
  category: FiscalCategory;
  description: string;
  units: number;
  rate: number;
  total: number;
  quantity?: number;
  taxable?: boolean;
}

export interface InterpreterPaymentItem {
  id: string;
  category: FiscalCategory;
  description: string;
  units: number;
  rate: number;
  total: number;
  taxable?: boolean;
}

export interface ClientInvoice extends TenantScopedEntity {
  clientId: string;
  clientName: string;
  reference: string;
  invoiceNumber?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  currency: string;
  items: ClientInvoiceItem[];
}

export interface InterpreterInvoice extends TenantScopedEntity {
  interpreterId: string;
  interpreterName: string;
  model: 'UPLOAD' | 'SELF_BILL';
  status: InvoiceStatus;
  externalInvoiceReference?: string;
  totalAmount: number;
  issueDate: string;
  items: InterpreterPaymentItem[];
  currency: string;
  uploadedPdfUrl?: string;
}

export interface Rate {
  id: string;
  rateType: 'CLIENT' | 'INTERPRETER';
  serviceType: ServiceType;
  amountPerUnit: number;
  minimumUnits: number;
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface InterpreterApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  postcode: string;
  languages: string[];
  qualifications: string[];
  dbsNumber?: string;
  experienceSummary: string;
  status: ApplicationStatus;
  submittedAt: string;
}

export interface SystemSettings {
  general: {
    companyName: string;
    supportEmail: string;
    businessAddress: string;
    websiteUrl: string;
    logoUrl?: string;
  };
  finance: {
    currency: string;
    vatRate: number;
    vatNumber: string;
    invoicePrefix: string;
    nextInvoiceNumber: number;
    paymentTermsDays: number;
    invoiceFooterText: string;
  };
  operations: {
    minBookingDurationMinutes: number;
    cancellationWindowHours: number;
    timeIncrementMinutes: number;
    defaultOnlinePlatformUrl: string;
  };
  masterData: {
    activeServiceTypes: ServiceType[];
    priorityLanguages: string[];
  };
}


export enum NotificationType {
  INFO = 'INFO',
  JOB_OFFER = 'JOB_OFFER',
  PAYMENT = 'PAYMENT',
  CHAT = 'CHAT',
  SYSTEM = 'SYSTEM',
  URGENT = 'URGENT',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING'
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ChatThread {
  id: string;
  participants: string[]; // uids
  participantNames: Record<string, string>;
  lastMessage?: string;
  lastMessageAt?: string;
  bookingId?: string;
  unreadCount: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  fileUrl?: string;
  fileType?: 'IMAGE' | 'DOCUMENT';
}

export interface ViewFilter {
  statuses?: BookingStatus[];
  dateRange?: 'TODAY' | 'TOMORROW' | 'NEXT_7_DAYS' | 'THIS_MONTH' | 'ALL';
  interpreterId?: string;
  hasInterpreter?: boolean;
}

export type SortableField = 'date' | 'status' | 'client' | 'interpreter' | 'languageTo' | 'duration' | 'amount';
export type FilterableField = 'status' | 'languageTo' | 'serviceType' | 'locationType' | 'interpreterId' | 'date';
export type GroupableField = 'status' | 'languageTo' | 'serviceType' | 'locationType' | 'date';

export type BookingColumnField =
  | 'ref' | 'date' | 'time' | 'client' | 'languageFrom' | 'languageTo'
  | 'serviceType' | 'duration' | 'location' | 'interpreter' | 'status' | 'amount';

export const ALL_BOOKING_COLUMNS: { field: BookingColumnField; label: string }[] = [
  { field: 'ref', label: 'Reference' },
  { field: 'date', label: 'Date' },
  { field: 'time', label: 'Time' },
  { field: 'client', label: 'Client' },
  { field: 'languageFrom', label: 'From Language' },
  { field: 'languageTo', label: 'To Language' },
  { field: 'serviceType', label: 'Service Type' },
  { field: 'duration', label: 'Duration' },
  { field: 'location', label: 'Location' },
  { field: 'interpreter', label: 'Interpreter' },
  { field: 'status', label: 'Status' },
  { field: 'amount', label: 'Amount' },
];

export interface ViewSortRule {
  field: SortableField;
  direction: 'asc' | 'desc';
}

export interface ViewFilterRule {
  id: string;
  field: FilterableField;
  operator: 'is' | 'isNot' | 'contains' | 'isBetween' | 'isAfter' | 'isBefore';
  value: any;
}

export interface BookingView {
  id: string;
  name: string;
  icon?: string;
  isSystem?: boolean;
  // Legacy (kept for backward compat)
  filters: ViewFilter;
  sortBy: 'dateAsc' | 'dateDesc' | 'status' | 'client';
  // Advanced customization
  hiddenFields?: BookingColumnField[];
  filterRules?: ViewFilterRule[];
  groupBy?: GroupableField | '';
  sortRules?: ViewSortRule[];
}

export interface EmailTemplate extends TenantScopedEntity {
  triggerStatus: BookingStatus;
  recipientType: 'CLIENT' | 'INTERPRETER' | 'ADMIN';
  name: string;
  subject: string;
  body: string; // Markdown or HTML content
  allowedVariables: string[]; // e.g., ['{{clientName}}', '{{interpreterName}}', '{{bookingRef}}']
  isActive: boolean;
}

export const EMAIL_VARIABLES = {
  CLIENT: ['{{clientName}}', '{{bookingRef}}', '{{date}}', '{{time}}', '{{location}}', '{{languageFrom}}', '{{languageTo}}', '{{serviceType}}', '{{durationMinutes}}', '{{totalAmount}}'],
  INTERPRETER: ['{{interpreterName}}', '{{bookingRef}}', '{{date}}', '{{time}}', '{{location}}', '{{languageFrom}}', '{{languageTo}}', '{{serviceType}}', '{{durationMinutes}}'],
  ADMIN: ['{{clientName}}', '{{interpreterName}}', '{{bookingRef}}', '{{status}}']
};