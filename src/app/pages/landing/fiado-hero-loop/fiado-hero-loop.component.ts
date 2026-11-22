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
import { FIADO_HERO_LOOP_CUES, type FiadoLoopView } from './fiado-hero-loop.cues';

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

  readonly sceneIndex = signal(0);
  readonly playing = signal(false);
  readonly finished = signal(false);

  readonly currentCue = computed(() => this.cues[this.sceneIndex()] ?? this.cues[0]);
  readonly currentView = computed<FiadoLoopView>(() => this.currentCue().view);
  readonly subtitle = computed(() => this.currentCue().t);
  readonly progressPct = computed(
    () => ((this.sceneIndex() + 1) / this.cues.length) * 100,
  );

  private runGeneration = 0;
  private autoplayAttempted = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    afterNextRender(() => {
      this.setupAutoplayOnceWhenVisible();
    });

    this.destroyRef.onDestroy(() => {
      this.runGeneration += 1;
      this.playing.set(false);
      this.speech.stop();
    });
  }

  togglePlay(): void {
    if (this.playing()) {
      this.pause();
      return;
    }
    if (this.finished()) {
      this.sceneIndex.set(0);
      this.finished.set(false);
    }
    void this.runPlayback();
  }

  private pause(): void {
    this.runGeneration += 1;
    this.playing.set(false);
    this.speech.stop();
  }

  private async runPlayback(): Promise<void> {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    const gen = ++this.runGeneration;
    this.playing.set(true);
    this.finished.set(false);

    let index = this.sceneIndex();

    for (; index < this.cues.length; index += 1) {
      if (gen !== this.runGeneration) {
        return;
      }

      this.sceneIndex.set(index);
      const cue = this.cues[index];
      const started = Date.now();

      await this.speech.speak(cue.s);

      const elapsed = Date.now() - started;
      const remain = cue.min * 1000 - elapsed;
      if (remain > 0) {
        await this.waitMs(remain / 1000);
      }
      if (gen !== this.runGeneration) {
        return;
      }
    }

    this.playing.set(false);
    this.finished.set(true);
  }

  private waitMs(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, seconds * 1000);
    });
  }

  private setupAutoplayOnceWhenVisible(): void {
    const root = this.host.nativeElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (!visible || this.autoplayAttempted) {
          return;
        }
        this.autoplayAttempted = true;
        this.sceneIndex.set(0);
        this.finished.set(false);
        void this.runPlayback();
      },
      { threshold: 0.35 },
    );

    observer.observe(root);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}