import { ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AttachmentPreviewDialogComponent } from '../work-orders/attachment-preview-dialog/attachment-preview-dialog.component';

type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_SERVICE';

interface AssetResponse {
  status: string;
  results: number;
  data: Asset[];
}

interface Asset {
  id: number;
  code: string;
  name: string;
  type: string;
  category: string;
  serialNumber?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  installationDate?: string | null;
  status: AssetStatus;
  createdAt?: string;
  updatedAt?: string;
  attachments?: Attachment[];
  skills?: Skill[];
  workOrders?: WorkOrder[];
}

interface WorkOrder {
  id: number;
  status: string;
  type: string;
  priority?: string;
  description?: string;
}

interface Attachment {
  id: number;
  name: string;
  type?: string;
  url?: string;
  notes?: string;
}

interface Skill {
  id: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDividerModule,
    MatRippleModule,
    MatDialogModule,
    MatTabsModule,
  ],
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
})
export class AssetsComponent implements OnInit {
  readonly statusFilters: Array<'ALL' | AssetStatus> = ['ALL', 'ACTIVE', 'INACTIVE', 'OUT_OF_SERVICE'];

  assets: Asset[] = [];
  selectedAsset?: Asset;
  selectedMapUrl: SafeResourceUrl | null = null;
  loading = false;
  error?: string;

  private readonly assetsSignal = signal<Asset[]>([]);
  readonly activeStatus = signal<'ALL' | AssetStatus>('ALL');
  readonly filteredAssets = computed(() => {
    const statusFilter = this.activeStatus();
    const list = this.assetsSignal();

    return list.filter((asset) => statusFilter === 'ALL' || asset.status === statusFilter);
  });

  readonly statusClassMap: Record<AssetStatus, string> = {
    ACTIVE: 'status-chip status-chip--active',
    INACTIVE: 'status-chip status-chip--inactive',
    OUT_OF_SERVICE: 'status-chip status-chip--out',
  };

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchAssets();
  }

  fetchAssets(): void {
    this.loading = true;
    this.error = undefined;

    this.http.get<AssetResponse>('/api/assets').subscribe({
      next: (res) => {
        this.assets = res.data ?? [];
        this.assetsSignal.set(this.assets);
        const list = this.filteredAssets();
        this.selectedAsset = list[0];
        this.selectedMapUrl = this.buildMapUrl(this.selectedAsset);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load assets';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  setStatusFilter(status: 'ALL' | AssetStatus): void {
    this.activeStatus.set(status);
    const list = this.filteredAssets();
    this.selectedAsset = list[0];
    this.selectedMapUrl = this.buildMapUrl(this.selectedAsset);
  }

  selectAsset(asset: Asset): void {
    this.selectedAsset = asset;
    this.selectedMapUrl = this.buildMapUrl(asset);
  }

  trackByAssetId(_: number, asset: Asset): number {
    return asset.id;
  }

  asArray<T>(value?: T[] | null): T[] {
    return value ?? [];
  }

  getStatusClass(status?: AssetStatus | string | null): string {
    if (!status) {
      return 'status-chip';
    }
    return this.statusClassMap[status as AssetStatus] ?? 'status-chip';
  }

  formatCoordinate(value?: number | string | null): string {
    if (value === undefined || value === null || value === '') {
      return '—';
    }

    const parsed = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(parsed)) {
      return String(value);
    }
    return parsed.toFixed(4);
  }

  private buildMapUrl(asset?: Asset | null): SafeResourceUrl | null {
    if (!asset || asset.latitude === undefined || asset.longitude === undefined) {
      return null;
    }

    const lat = typeof asset.latitude === 'string' ? Number(asset.latitude) : asset.latitude;
    const lon = typeof asset.longitude === 'string' ? Number(asset.longitude) : asset.longitude;

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return null;
    }

    const url = `https://maps.google.com/maps?q=${lat},${lon}&z=13&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
}
