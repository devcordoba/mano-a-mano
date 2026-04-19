import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Hero } from './hero/hero';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Hero],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mano-a-mano';
}