import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface DashboardNavItem {
  id: string;
  label: string;
  routerLink: string;
}

@Component({
  selector: 'app-dashboard-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard-nav.html',
  styleUrl: './dashboard-nav.css',
})
export class DashboardNav {
  readonly items = input.required<DashboardNavItem[]>();
}
