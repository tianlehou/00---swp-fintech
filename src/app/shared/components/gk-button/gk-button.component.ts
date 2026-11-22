import { Component, input } from '@angular/core';

@Component({
  selector: 'a[appGkButton]',
  standalone: true,
  template: '<ng-content />',
  styleUrl: './gk-button.component.css',
  host: {
    '[class.is-quiet]': 'variant() === "quiet"',
  },
})
export class GkButtonComponent {
  readonly variant = input<'primary' | 'quiet'>('primary');
}
