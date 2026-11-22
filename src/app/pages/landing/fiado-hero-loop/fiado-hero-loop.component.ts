import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FiadoHeroSpeechService } from '@shared/services/fiado-hero-speech.service';
import {
  FIADO_HERO_LOOP_CUES,
  type FiadoLoopView,
} from './fiado-hero-loop.cues';

@Component({
  selector: 'app-fiado-hero-loop',
  standalone: true,
  templateUrl: './fiado-hero-loop.component.html',
  styleUrl: './fiado-hero-loop.component.css',
})
export class FiadoHeroLoopComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly speech = inject(FiadoHeroSpeechService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly cues = FIADO_HERO_LOOP_CUES;
  readonly shelfRows = [150, 195, 240, 285] as const;

  readonly sceneIndex = signal(0);
  readonly playing = signal(false);
  readonly muted = signal(false);

  readonly currentCue = computed(() => this.cues[this.sceneIndex()] ?? this.cues[0]);
  readonly currentView = computed<FiadoLoopView>(() => this.currentCue().view);
  readonly subtitle = computed(() => this.currentCue().t);
  readonly progressPct = computed(
    () => ((this.sceneIndex() + 1) / this.cues.length) * 100,
  );

  private loopGeneration = 0;
  private started = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.setupAutoplayWhenVisible();
    });

    this.destroyRef.onDestroy(() => {
      this.loopGeneration += 1;
      this.playing.set(false);
      this.speech.stop();
    });
  }

  togglePlay(): void {
    if (this.playing()) {
      this.pause();
      return;
    }
    void this.play();
  }

  toggleMute(): void {
    const next = !this.muted();
    this.muted.set(next);
    if (next) {
      this.speech.stop();
    } else if (this.playing()) {
      void this.speech.speak(this.currentCue().s);
    }
  }

  private pause(): void {
    this.loopGeneration += 1;
    this.playing.set(false);
    this.speech.stop();
  }

  private async play(): Promise<void> {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    const gen = ++this.loopGeneration;
    this.playing.set(true);

    let index = this.sceneIndex();
    while (this.playing() && gen === this.loopGeneration) {
      this.sceneIndex.set(index);
      const cue = this.cues[index];
      const started = Date.now();

      if (!this.muted()) {
        await this.speech.speak(cue.s);
      }

      const elapsed = Date.now() - started;
      const remain = cue.min * 1000 - elapsed;
      if (remain > 0) {
        await this.waitMs(remain / 1000);
      }
      if (gen !== this.loopGeneration) {
        return;
      }

      index = (index + 1) % this.cues.length;
    }
  }

  private waitMs(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, seconds * 1000);
    });
  }

  private setupAutoplayWhenVisible(): void {
    const root = this.host.nativeElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible && !this.started) {
          this.started = true;
          void this.play();
          return;
        }
        if (!visible && this.playing()) {
          this.pause();
          this.started = false;
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(root);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}