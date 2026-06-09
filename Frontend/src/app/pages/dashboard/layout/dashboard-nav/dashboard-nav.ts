import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

export interface DashboardNavLeaf {
  id: string;
  label: string;
  routerLink: string;
}

export interface DashboardNavGroup {
  id: string;
  label: string;
  children: DashboardNavLeaf[];
}

export type DashboardNavItem = DashboardNavLeaf | DashboardNavGroup;

export function isNavGroup(item: DashboardNavItem): item is DashboardNavGroup {
  return 'children' in item;
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
  readonly #router = inject(Router);
  readonly items = input.required<DashboardNavItem[]>();
  readonly #openGroups = signal<Set<string>>(new Set());

  readonly #currentUrl = toSignal(
    this.#router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.#router.url),
      startWith(this.#router.url),
    ),
    { initialValue: this.#router.url },
  );

  constructor() {
    effect(() => {
      const url = this.#currentUrl() ?? '';
      const toOpen = new Set<string>();
      for (const item of this.items()) {
        if (isNavGroup(item) && item.children.some((child) => url.startsWith(child.routerLink))) {
          toOpen.add(item.id);
        }
      }
      if (toOpen.size > 0) {
        this.#openGroups.update((current) => {
          const next = new Set(current);
          toOpen.forEach((id) => next.add(id));
          return next;
        });
      }
    });
  }

  protected isNavGroup(item: DashboardNavItem): item is DashboardNavGroup {
    return isNavGroup(item);
  }

  protected isGroupOpen(id: string): boolean {
    return this.#openGroups().has(id);
  }

  protected toggleGroup(id: string): void {
    this.#openGroups.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }
}
