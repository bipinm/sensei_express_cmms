import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatMenuModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isExpanded = true;
  selectedPageLabel = '';

  private routeLabelMap = new Map<string, { label: string; parentLabel?: string }>();
  private routeSubscription?: Subscription;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.buildRouteLabelMap();
    this.setSelectedPage(this.router.url);
    this.routeSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.setSelectedPage(event.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  menuGroups: NavItem[] = [
    {
      label: 'Service Desk',
      icon: 'support_agent',
      children: [
        { label: 'Tickets', icon: 'confirmation_number', route: '/tickets' },
        { label: 'Knowledge Base', icon: 'book', route: '/knowledge-base' },
        { label: 'Agents', icon: 'contact_phone', route: '/agents' },
        { label: 'Analytics', icon: 'analytics', route: '/ticket-analytics' },
      ],
    },
    {
      label: 'Maintenance',
      icon: 'precision_manufacturing',
      children: [
        { label: 'Work Orders', icon: 'assignment', route: '/work-orders' },
        { label: 'Work Activities', icon: 'construction', route: '/work-activities' },
        { label: 'Approvals', icon: 'approval', route: '/orders-approvals' },
        { label: 'Analytics', icon: 'analytics', route: '/mo-analytics' }
      ],
    },
    
    {
      label: 'Scheduling',
      icon: 'event',
      children: [
        { label: 'Scheduling Board', icon: 'calendar_month', route: '/scheduling' },
        { label: 'Auto Schedule', icon: 'smart_toy', route: '/auto-schedule' },
      ],
    },
    {
      label: 'Purchasing',
      icon: 'shopping_cart',
      children: [
        { label: 'Orders', icon: 'inventory_2', route: '/purchase-orders' },
        { label: 'Approvals', icon: 'approval', route: '/po-approvals' },
        { label: 'Billing', icon: 'money', route: '/billing' },
        { label: 'Analytics', icon: 'analytics', route: '/po-analytics' },
      ],
    },
    {
      label: 'Master Data',
      icon: 'storage',
      children: [
        { label: 'Assets', icon: 'inventory', route: '/master-data/assets' },
        { label: 'Persons', icon: 'person', route: '/master-data/persons' },
        { label: 'Skills', icon: 'school', route: '/master-data/skills' },
        { label: 'Attachments', icon: 'attach_file', route: '/master-data/attachments' },
      ],
    },
    {
      label: 'Settings',
      icon: 'settings',
      children: [
        { label: 'Users', icon: 'account_box', route: '' },
        { label: 'Application', icon: 'settings_applications', route: '' }
      ],
    },
  ];

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleGroup(group: NavItem): void {
    group.expanded = !group.expanded;
  }

  openSettings(): void {
    // Placeholder for settings navigation
    console.log('Navigate to settings');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private buildRouteLabelMap(): void {
    this.routeLabelMap.clear();
    this.menuGroups.forEach((group) => this.registerNavItem(group));
  }

  private registerNavItem(item: NavItem, parentLabel?: string): void {
    if (item.route) {
      this.routeLabelMap.set(item.route, { label: item.label, parentLabel });
    }

    item.children?.forEach((child) => this.registerNavItem(child, item.label));
  }

  private setSelectedPage(currentUrl: string): void {
    const sanitizedUrl = currentUrl.split('?')[0];

    const matchedEntry = Array.from(this.routeLabelMap.entries())
      .filter(([route]) => route && sanitizedUrl.startsWith(route))
      .sort((a, b) => b[0].length - a[0].length)[0];

    if (matchedEntry) {
      const { label, parentLabel } = matchedEntry[1];
      this.selectedPageLabel = parentLabel ? `${parentLabel} > ${label}` : label;
    } else {
      this.selectedPageLabel = '';
    }
  }
}
