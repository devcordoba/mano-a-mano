import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-mam-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mam-card.html',
  styleUrl: './mam-card.css',
})
export class MamCard {
  readonly padded = input(true);
}
