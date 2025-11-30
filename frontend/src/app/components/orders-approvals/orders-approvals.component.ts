import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-orders-approvals',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './orders-approvals.component.html',
  styleUrls: ['./orders-approvals.component.scss'],
})
export class OrdersApprovalsComponent {}
