import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { DashboardNav } from '../dashboard-nav/dashboard-nav';
import type { DashboardNavItem } from '../dashboard-nav/dashboard-nav';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DashboardNav],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  readonly navItems = input.required<DashboardNavItem[]>();
  readonly showSidebar = input(true);
}
