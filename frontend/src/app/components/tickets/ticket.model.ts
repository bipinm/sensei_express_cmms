export interface TicketAttachment {
  id: number;
  name: string;
  type?: string;
  url?: string;
  srcPath?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketCreator {
  id: number;
  name: string;
  email?: string;
  type?: string;
}

export interface Ticket {
  id: number;
  ticketId: string;
  status: 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  type: 'INCIDENT' | 'REQUEST' | 'PROBLEM' | 'OTHER';
  subType?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  attachments?: TicketAttachment[];
  createdById?: number;
  createdBy?: TicketCreator;
}

export interface TicketResponse {
  status: string;
  results: number;
  data: Ticket[];
}
