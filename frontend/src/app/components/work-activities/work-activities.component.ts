import { ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AttachmentPreviewDialogComponent } from '../work-orders/attachment-preview-dialog/attachment-preview-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarkdownViewerComponent } from '../shared/markdown-viewer/markdown-viewer.component';

interface WorkActivityResponse {
  status: string;
  results: number;
  data: WorkActivity[];
}

export interface WorkActivity {
  id: number;
  workOrderId: number;
  personId: number;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  plannedStartDate: string;
  actualStartDate?: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  notes?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  problemType: 'MECHANICAL' | 'ELECTRICAL' | 'SOFTWARE' | 'INSPECTION' | 'SAFETY' | 'CALIBRATION' | 'OTHER';
  createdAt: string;
  updatedAt: string;
  person?: {
    id: number;
    name: string;
    email: string;
  };
  workOrder?: {
    id: number;
    description: string;
    status: string;
  };
  asset?: Asset;
  attachments?: Attachment[];
}

interface Asset {
  id: number;
  code: string;
  name: string;
  type: string;
  category: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_SERVICE';
  serialNumber?: string | null;
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
  email?: string;
  type: string;
}

@Component({
  selector: 'app-work-activities',
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
    MatExpansionModule,
    MatTooltipModule,
    MatPaginatorModule,
    MarkdownViewerComponent,
    RouterModule
  ],
  templateUrl: './work-activities.component.html',
  styleUrls: ['./work-activities.component.scss'],
})
export class WorkActivitiesComponent implements OnInit {
  readonly statusFilters: Array<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'> = [
    'ALL',
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
  ];

  activities: WorkActivity[] = [];
  selectedActivity?: WorkActivity;
  loading = false;
  error?: string;

  private readonly activitiesSignal = signal<WorkActivity[]>([]);
  readonly activeStatus = signal<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL');
  readonly showAIOnly = signal(false);
  readonly pageSize = signal(12);
  readonly pageIndex = signal(0);

  readonly filteredActivities = computed(() => {
    const statusFilter = this.activeStatus();
    const onlyAI = this.showAIOnly();
    const activities = this.activitiesSignal();

    return activities.filter((activity) => {
      const matchesStatus = statusFilter === 'ALL' || activity.status === statusFilter;
      const matchesCreator = !onlyAI || activity.personId === 2; // Assuming personId 2 is the AI user
      return matchesStatus && matchesCreator;
    });
  });

  readonly paginatedActivities = computed(() => {
    const pageSize = this.pageSize();
    const pageIndex = this.pageIndex();
    const activities = this.filteredActivities();
    const start = pageIndex * pageSize;
    return activities.slice(start, start + pageSize);
  });

  readonly statusPalette: Record<string, string> = {
    PENDING: 'primary',
    IN_PROGRESS: 'accent',
    COMPLETED: 'success',
    CANCELLED: 'warn',
  };

  readonly priorityClassMap: Record<string, string> = {
    LOW: 'priority-chip--low',
    MEDIUM: 'priority-chip--medium',
    HIGH: 'priority-chip--high',
    CRITICAL: 'priority-chip--critical',
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchActivities();
  }

  fetchActivities(): void {
    this.loading = true;
    this.error = undefined;
    this.cdr.detectChanges();

    this.http.get<WorkActivityResponse>('/api/work-activities').subscribe({
      next: (response) => {
        this.activities = response.data || [];
        this.activitiesSignal.set(this.activities);
        this.resetPagination();
        this.updateSelectedActivity();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch work activities:', err);
        this.error = 'Failed to load work activities. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setStatusFilter(status: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): void {
    this.activeStatus.set(status);
    this.resetPagination();
    this.updateSelectedActivity();
  }

  toggleAIOnly(change: MatSlideToggleChange): void {
    this.showAIOnly.set(change.checked);
    this.resetPagination();
    this.updateSelectedActivity();
  }

  selectActivity(activity: WorkActivity): void {
    this.selectedActivity = activity;
  }

  trackByActivityId(_: number, activity: WorkActivity): number {
    return activity.id;
  }

  asArray<T>(items?: T[]): T[] {
    return items ?? [];
  }

  formatProblemType(problemType?: WorkActivity['problemType']): string {
    return problemType ? problemType.replace('_', ' ') : '—';
  }

  hasAsset(activity?: WorkActivity): boolean {
    return !!activity?.asset;
  }

  getAssetSummary(asset?: Asset): string {
    if (!asset) {
      return '—';
    }
    const parts = [asset.type, asset.category].filter(Boolean);
    return parts.join(' · ') || '—';
  }

  private updateSelectedActivity(): void {
    const list = this.filteredActivities();
    this.selectedActivity = list[0];
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
      panelClass: 'full-screen-dialog'
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  getStatusClass(status: string): string {
    return `status-chip status-chip--${status.toLowerCase().replace('_', '-')}`;
  }

  handlePageChange(event: PageEvent): void {
    if (event.pageSize !== this.pageSize()) {
      this.pageSize.set(event.pageSize);
    }
    this.pageIndex.set(event.pageIndex);
  }

  paginationRangeLabel(): string {
    const total = this.filteredActivities().length;
    if (!total) {
      return 'No activities';
    }

    const pageSize = this.pageSize();
    const pageIndex = this.pageIndex();
    const start = pageIndex * pageSize;
    const end = Math.min(start + pageSize, total);
    return `${start + 1}-${end} of ${total}`;
  }

  private resetPagination(): void {
    this.pageIndex.set(0);
  }
}
