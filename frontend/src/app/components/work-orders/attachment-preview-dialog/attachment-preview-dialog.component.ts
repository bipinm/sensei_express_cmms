import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface AttachmentDialogData {
  file: {
    name: string;
    url: string;
    type?: string;
    notes?: string;
  };
}

@Component({
  selector: 'app-attachment-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './attachment-preview-dialog.component.html',
  styleUrls: ['./attachment-preview-dialog.component.scss'],
})
export class AttachmentPreviewDialogComponent {
  readonly safeUrl?: SafeResourceUrl;

  constructor(
    private dialogRef: MatDialogRef<AttachmentPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AttachmentDialogData,
    private sanitizer: DomSanitizer
  ) {
    if (this.data.file?.url) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.file.url);
    }
  }

  get file() {
    return this.data.file;
  }

  close(): void {
    this.dialogRef.close();
  }
}
