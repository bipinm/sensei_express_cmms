import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { Ticket, TicketAttachment } from '../ticket.model';

interface TicketDialogData {
  ticket: Ticket;
}

@Component({
  selector: 'app-ticket-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
  ],
  templateUrl: './ticket-detail-dialog.component.html',
  styleUrls: ['./ticket-detail-dialog.component.scss'],
})
export class TicketDetailDialogComponent {
  readonly ticket: Ticket;

  constructor(
    private dialogRef: MatDialogRef<TicketDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: TicketDialogData
  ) {
    this.ticket = data.ticket;
  }

  get attachments(): TicketAttachment[] {
    return this.ticket.attachments ?? [];
  }

  close(): void {
    this.dialogRef.close();
  }
}
