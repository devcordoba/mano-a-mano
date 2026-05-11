import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  templateUrl: './panel-admin.html',
  styleUrl: './panel-admin.css',
})
export class PanelAdminPage {
  constructor(protected readonly auth: AuthService) {}
}