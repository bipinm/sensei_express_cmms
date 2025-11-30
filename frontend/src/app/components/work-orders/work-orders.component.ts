import { ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatRippleModule } from '@angular/material/core';
import { AttachmentPreviewDialogComponent } from './attachment-preview-dialog/attachment-preview-dialog.component';
import { MarkdownViewerComponent } from '../shared/markdown-viewer/markdown-viewer.component';

interface WorkOrderResponse {
  status: string;
  results: number;
  data: WorkOrder[];
}

interface WorkOrder {
  id: number;
  status: string;
  type: string;
  priority: string;
  description: string;
  origin?: string;
  notes?: string;
  resolutionNotes?: string;
  startDate?: string;
  endDate?: string;
  earliestStartDate?: string;
  latestStartDate?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  assets: Asset[];
  activities: WorkActivity[];
  attachments: Attachment[];
  skills: Skill[];
  createdById?: number;
  createdBy?: Person;
}

interface Asset {
  id: number;
  code?: string;
  name: string;
  type: string;
  location?: string;
  status: string;
  notes?: string;
}

interface WorkActivity {
  id: number;
  description: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  startDate?: string;
  endDate?: string;
  durationMinutes?: number;
  status: string;
  person?: Person;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  problemType?: 'MECHANICAL' | 'ELECTRICAL' | 'SOFTWARE' | 'INSPECTION' | 'SAFETY' | 'OTHER';
  notes?: string;
}

interface Skill {
  id: number;
  name: string;
  description?: string;
  notes?: string;
}

interface Attachment {
  id: number;
  name: string;
  type?: string;
  url?: string;
  notes?: string;
}

interface Person {
  id: number;
  name: string;
  type: string;
  email?: string;
}

@Component({
  selector: 'app-work-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatChipsModule,
    MatTabsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatRippleModule,
    MarkdownViewerComponent,
  ],
  templateUrl: './work-orders.component.html',
  styleUrls: ['./work-orders.component.scss'],
})
export class WorkOrdersComponent implements OnInit {
  readonly statusFilters: Array<'ALL' | keyof typeof this.statusPalette> = [
    'ALL',
    'NEW',
    'PLANNED',
    'SCHEDULED',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED',
  ];

  workOrders: WorkOrder[] = [];
  selectedWorkOrder?: WorkOrder;
  loading = false;
  error?: string;

  private readonly workOrdersSignal = signal<WorkOrder[]>([]);
  readonly activeStatus = signal<'ALL' | keyof typeof this.statusPalette>('ALL');
  readonly showAIOnly = signal(false);
  readonly filteredWorkOrders = computed(() => {
    const statusFilter = this.activeStatus();
    const onlyAI = this.showAIOnly();
    const orders = this.workOrdersSignal();

    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesCreator = !onlyAI || order.createdById === 2;
      return matchesStatus && matchesCreator;
    });
  });

  readonly statusPalette: Record<string, string> = {
    NEW: 'info',
    PLANNED: 'primary',
    IN_PROGRESS: 'accent',
    ON_HOLD: 'warn',
    COMPLETED: 'success',
    CANCELLED: 'warn',
  };

  readonly priorityPalette: Record<string, 'primary' | 'accent' | 'warn'> = {
    LOW: 'primary',
    MEDIUM: 'accent',
    HIGH: 'warn',
    CRITICAL: 'warn',
  };

  readonly priorityClassMap: Record<string, string> = {
    LOW: 'priority-chip priority-chip--low',
    MEDIUM: 'priority-chip priority-chip--medium',
    HIGH: 'priority-chip priority-chip--high',
    CRITICAL: 'priority-chip priority-chip--critical',
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchWorkOrders();
  }

  fetchWorkOrders(): void {
    this.loading = true;
    this.error = undefined;
    this.http.get<WorkOrderResponse>('/api/work-orders').subscribe({
      next: (res) => {
        this.workOrders = res.data ?? [];
        this.workOrdersSignal.set(this.workOrders);
        const list = this.filteredWorkOrders();
        this.selectedWorkOrder = list[0];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load work orders';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  setStatusFilter(status: 'ALL' | keyof typeof this.statusPalette): void {
    this.activeStatus.set(status);
    const list = this.filteredWorkOrders();
    this.selectedWorkOrder = list[0];
  }

  toggleAIOnly(change: MatSlideToggleChange): void {
    this.showAIOnly.set(change.checked);
    const list = this.filteredWorkOrders();
    this.selectedWorkOrder = list[0];
  }

  selectWorkOrder(order: WorkOrder): void {
    this.selectedWorkOrder = order;
  }

  trackByWorkOrderId(_: number, order: WorkOrder): number {
    return order.id;
  }

  asArray<T>(items?: T[]): T[] {
    return items ?? [];
  }

  openAttachment(file: Attachment): void {
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

  getPriorityClass(priority: string): string {
    return this.priorityClassMap[priority] ?? 'priority-chip priority-chip--low';
  }
}
