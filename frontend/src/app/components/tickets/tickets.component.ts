import { ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MarkdownViewerComponent } from '../shared/markdown-viewer/markdown-viewer.component';
import { Ticket, TicketResponse, TicketAttachment } from './ticket.model';
import { AttachmentPreviewDialogComponent } from '../work-orders/attachment-preview-dialog/attachment-preview-dialog.component';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatListModule,
    MatDividerModule,
    MatTabsModule,
    MatDialogModule,
    MarkdownViewerComponent,
  ],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
})
export class TicketsComponent implements OnInit {
  readonly statusFilters: Array<'ALL' | Ticket['status']> = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  readonly statusPalette: Record<Ticket['status'], 'primary' | 'accent' | 'warn' | 'info' | 'success'> = {
    OPEN: 'primary',
    PENDING: 'info',
    IN_PROGRESS: 'accent',
    RESOLVED: 'success',
    CLOSED: 'warn',
  };

  readonly priorityIcons: Record<Ticket['priority'], string> = {
    LOW: 'low_priority',
    MEDIUM: 'flag',
    HIGH: 'priority_high',
    CRITICAL: 'report_problem',
  };

  readonly priorityPalette: Record<Ticket['priority'], 'primary' | 'accent' | 'warn'> = {
    LOW: 'primary',
    MEDIUM: 'accent',
    HIGH: 'warn',
    CRITICAL: 'warn',
  };

  readonly priorityClassMap: Record<Ticket['priority'], string> = {
    LOW: 'priority-chip priority-chip--low',
    MEDIUM: 'priority-chip priority-chip--medium',
    HIGH: 'priority-chip priority-chip--high',
    CRITICAL: 'priority-chip priority-chip--critical',
  };

  loading = false;
  error?: string;
  aiAnalysis?: string;
  aiLoading = false;
  aiError?: string;
  selectedTicket?: Ticket;

  private readonly ticketsSignal = signal<Ticket[]>([]);
  readonly activeStatus = signal<'ALL' | Ticket['status']>('ALL');
  readonly filteredTickets = computed(() => {
    const filter = this.activeStatus();
    const tickets = this.ticketsSignal();
    if (filter === 'ALL') {
      return tickets;
    }
    return tickets.filter((t) => t.status === filter);
  });

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchTickets();
  }

  fetchTickets(): void {
    this.loading = true;
    this.error = undefined;

    this.http.get<TicketResponse>('/api/tickets').subscribe({
      next: (res) => {
        this.ticketsSignal.set(res.data ?? []);
        this.selectedTicket = this.ticketsSignal()[0];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load tickets';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  setStatusFilter(status: 'ALL' | Ticket['status']): void {
    this.activeStatus.set(status);
  }

  trackByTicketId(_: number, ticket: Ticket): number {
    return ticket.id;
  }

  selectTicket(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.aiAnalysis = undefined;
    this.aiError = undefined;
  }

  getChipColor(status: Ticket['status']): string {
    return this.statusPalette[status] || 'primary';
  }

  getPriorityColor(priority: Ticket['priority']): 'primary' | 'accent' | 'warn' {
    return this.priorityPalette[priority] || 'primary';
  }

  getPriorityClass(priority: Ticket['priority']): string {
    return this.priorityClassMap[priority] ?? 'priority-chip priority-chip--low';
  }

  asArray<T>(items?: T[]): T[] {
    return items ?? [];
  }

  openAttachment(file: TicketAttachment): void {
    if (!file?.url) {
      return;
    }

    this.dialog.open(AttachmentPreviewDialogComponent, {
      data: { file },
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
    });
  }

  private isWeatherTicket(ticket?: Ticket | null): boolean {
    if (!ticket) return false;
    return (ticket.subType || '').toLowerCase() === 'weather';
  }

  private isDamageIssueTicket(ticket?: Ticket | null): boolean {
    if (!ticket) return false;
    return (
      (ticket.type || '').toLowerCase() === 'issue' &&
      (ticket.subType || '').toLowerCase() === 'damage'
    );
  }

  canAnalyze(ticket?: Ticket | null): boolean {
    return this.isWeatherTicket(ticket) || this.isDamageIssueTicket(ticket);
  }

  analysisTooltip(ticket?: Ticket | null): string {
    if (!ticket) {
      return 'Select a ticket to run analysis';
    }
    if (this.canAnalyze(ticket)) {
      return '';
    }
    return 'AI analysis is available for Weather or Issue/Damage tickets only';
  }

  analyzeTicket(): void {
    const ticket = this.selectedTicket;
    if (!ticket || !this.canAnalyze(ticket) || this.aiLoading) {
      console.warn('[Tickets] Analyze blocked for ticket', ticket?.id, {
        hasTicket: !!ticket,
        canAnalyze: this.canAnalyze(ticket),
        aiLoading: this.aiLoading,
      });
      return;
    }

    console.log('[Tickets] Triggering AI analysis', {
      ticketId: ticket.id,
      ticketType: ticket.type,
      ticketSubType: ticket.subType,
    });
    this.aiLoading = true;
    this.aiError = undefined;
    this.aiAnalysis = undefined;

    this.http.post<{ status: string; data: { analysis: string } }>(`/api/tickets/${ticket.id}/analyze`, {}).subscribe({
      next: (res) => {
        console.log('[Tickets] AI analysis success', {
          ticketId: ticket.id,
          responseLength: res?.data?.analysis?.length ?? 0,
        });
        this.aiAnalysis = res?.data?.analysis || 'No insights returned.';
        this.aiLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[Tickets] AI analysis failed', err);
        this.aiError = err?.error?.message || 'AI analysis failed';
        this.aiLoading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
