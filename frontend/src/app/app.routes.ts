import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { WorkOrdersComponent } from './components/work-orders/work-orders.component';
import { WorkActivitiesComponent } from './components/work-activities/work-activities.component';
import { AssetsComponent } from './components/assets/assets.component';
import { PersonsComponent } from './components/persons/persons.component';
import { SkillsComponent } from './components/skills/skills.component';
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { OrdersApprovalsComponent } from './components/orders-approvals/orders-approvals.component';
import { SchedulingComponent } from './components/scheduling/scheduling.component';
import { TicketsComponent } from './components/tickets/tickets.component';
import { FeaturePlaceholderComponent } from './components/placeholders/feature-placeholder.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'work-orders', pathMatch: 'full' },
      { path: 'tickets', component: TicketsComponent },
      {
        path: 'knowledge-base',
        component: FeaturePlaceholderComponent,
        data: {
          title: 'Knowledge Base',
          description: 'Articles, SOPs, and troubleshooting guides will live here.',
        },
      },
      {
        path: 'agents',
        component: FeaturePlaceholderComponent,
        data: {
          title: 'Agents Directory',
          description: 'Manage service desk agents and their workloads.',
        },
      },
      { path: 'work-orders', component: WorkOrdersComponent },
      { path: 'work-activities', component: WorkActivitiesComponent },
      { path: 'attachments', component: AttachmentsComponent },
      { path: 'orders-approvals', component: OrdersApprovalsComponent },
      {
        path: 'ticket-analytics',
        component: FeaturePlaceholderComponent,
        data: {
          title: 'Ticket Analytics',
          description: 'Visualize KPIs like SLA adherence and backlog health.',
        },
      },
      { path: 'persons', component: PersonsComponent },
      { path: 'skills', component: SkillsComponent },
      { path: 'assets', component: AssetsComponent },
      { path: 'scheduling', component: SchedulingComponent },
      {
        path: 'auto-schedule',
        component: FeaturePlaceholderComponent,
        data: {
          title: 'Auto Schedule',
          description: 'AI-powered scheduling suggestions will appear here.',
        },
      },
      {
        path: 'mo-analytics',
        component: FeaturePlaceholderComponent,
        data: {
          title: 'Maintenance Analytics',
          description: 'Track maintenance KPIs and performance trends.',
        },
      },
      { path: 'master-data/assets', component: AssetsComponent },
      { path: 'master-data/persons', component: PersonsComponent },
      { path: 'master-data/skills', component: SkillsComponent },
      { path: 'master-data/attachments', component: AttachmentsComponent },
      { path: 'master-data/work-activities', component: WorkActivitiesComponent },
      {
        path: 'purchase-orders',
        component: FeaturePlaceholderComponent,
        data: {
          title: 'Purchase Orders',
          description: 'Track procurement requests and supplier orders.',
        },
      },
      {
        path: 'po-approvals',
        component: FeaturePlaceholderComponent,
        data: {
          title: 'PO Approvals',
          description: 'Approve or reject purchasing requests in one place.',
        },
      },
      {
        path: 'billing',
        component: FeaturePlaceholderComponent,
        data: {
          title: 'Billing',
          description: 'Invoice and payment workflows coming soon.',
        },
      },
      {
        path: 'po-analytics',
        component: FeaturePlaceholderComponent,
        data: {
          title: 'Purchasing Analytics',
          description: 'Monitor spend, savings, and supplier performance.',
        },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
