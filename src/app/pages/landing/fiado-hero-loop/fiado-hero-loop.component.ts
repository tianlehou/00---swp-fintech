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
  readonly elapsedSec = signal(0);

  readonly currentCue = computed(() => this.cues[this.sceneIndex()] ?? this.cues[0]);
  readonly currentView = computed<FiadoLoopView>(() => this.currentCue().view);
  readonly subtitle = computed(() => this.currentCue().t);
  readonly totalDurationSec = this.cues.reduce((sum, cue) => sum + cue.min, 0);

  readonly timeCurrent = computed(() => this.formatTime(this.elapsedSec()));
  readonly timeTotal = computed(() => this.formatTime(this.totalDurationSec));

  readonly playButtonLabel = computed(() => {
    if (this.playing()) {
      return 'Pausar video';
    }
    if (this.finished()) {
      return 'Volver a ver el video';
    }
    return 'Reproducir video';
  });

  private runGeneration = 0;
  private autoplayAttempted = false;
  private sceneEpochMs = 0;
  private elapsedTicker: number | null = null;

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
      this.stopElapsedTicker();
    });
  }

  onVideoSurfaceClick(): void {
    this.togglePlay();
  }

  togglePlay(): void {
    if (this.playing()) {
      this.pause();
      return;
    }
    if (this.finished()) {
      this.sceneIndex.set(0);
      this.finished.set(false);
      this.elapsedSec.set(0);
    }
    void this.runPlayback();
  }

  private pause(): void {
    this.runGeneration += 1;
    this.playing.set(false);
    this.speech.stop();
    this.syncElapsed();
    this.stopElapsedTicker();
  }

  private async runPlayback(): Promise<void> {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    const gen = ++this.runGeneration;
    this.playing.set(true);
    this.finished.set(false);
    this.startElapsedTicker();

    let index = this.sceneIndex();

    for (; index < this.cues.length; index += 1) {
      if (gen !== this.runGeneration) {
        return;
      }

      this.sceneIndex.set(index);
      this.sceneEpochMs = Date.now();
      this.syncElapsed();
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
    this.elapsedSec.set(this.totalDurationSec);
    this.stopElapsedTicker();
  }

  private formatTime(totalSeconds: number): string {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private startElapsedTicker(): void {
    this.stopElapsedTicker();
    this.syncElapsed();
    this.elapsedTicker = window.setInterval(() => this.syncElapsed(), 250);
  }

  private stopElapsedTicker(): void {
    if (this.elapsedTicker !== null) {
      window.clearInterval(this.elapsedTicker);
      this.elapsedTicker = null;
    }
  }

  private syncElapsed(): void {
    const idx = this.sceneIndex();
    let base = 0;
    for (let i = 0; i < idx; i += 1) {
      base += this.cues[i].min;
    }
    const cue = this.cues[idx];
    if (!cue) {
      this.elapsedSec.set(this.totalDurationSec);
      return;
    }
    const inScene = Math.min(cue.min, (Date.now() - this.sceneEpochMs) / 1000);
    const next = Math.min(this.totalDurationSec, base + inScene);
    this.elapsedSec.set(next);
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
        this.elapsedSec.set(0);
        void this.runPlayback();
      },
      { threshold: 0.35 },
    );

    observer.observe(root);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}