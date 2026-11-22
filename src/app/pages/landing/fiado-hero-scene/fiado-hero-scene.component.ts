import { Component } from '@angular/core';

@Component({
  selector: 'app-fiado-hero-scene',
  standalone: true,
  templateUrl: './fiado-hero-scene.component.html',
  styleUrl: './fiado-hero-scene.component.css',
})
export class FiadoHeroSceneComponent {
  readonly shelfRows = [150, 195, 240, 285];
}