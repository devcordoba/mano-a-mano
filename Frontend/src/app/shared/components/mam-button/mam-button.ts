import { Component, input, ChangeDetectionStrategy } from '@angular/core';

export type MamButtonVariant = 'primary' | 'secondary' | 'outline';

@Component({
  selector: 'app-mam-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mam-button.html',
  styleUrl: './mam-button.css',
})
export class MamButton {
  readonly variant = input<MamButtonVariant>('primary');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly extraClass = input('');
}
