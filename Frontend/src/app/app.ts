import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainNavbar } from '@shared/components/main-navbar/main-navbar';
import { SiteFooter } from '@shared/components/site-footer/site-footer';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MainNavbar, SiteFooter],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
