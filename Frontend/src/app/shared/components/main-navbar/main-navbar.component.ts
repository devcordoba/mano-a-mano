import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-main-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './main-navbar.component.html',
  styleUrl: './main-navbar.component.css',
})
export class MainNavbarComponent {
  constructor(protected readonly auth: AuthService) {}
}
