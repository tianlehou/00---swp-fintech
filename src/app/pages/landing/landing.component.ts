import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, throttleTime } from 'rxjs';
import { LandingHeaderComponent } from '@shared/components/landing-header/landing-header.component';
import { APP_VERSION } from '@shared/config/app-version';
import { FiadoHeroSceneComponent } from './fiado-hero-scene/fiado-hero-scene.component';

interface Step {
  index: string;
  title: string;
  bullets: readonly string[];
}

interface KineticGlyph {
  text: string;
  i: number;
  tilt: number;
}

interface KineticWord {
  chars: readonly KineticGlyph[];
  accent: boolean;
  underline: boolean;
}

interface KineticSegment {
  text: string;
  accent?: boolean;
  underline?: boolean;
}

const tiltFor = (i: number): number => (((i * 7) % 5) - 2) * 7;

function kineticWords(text: string): readonly KineticGlyph[] {
  return text.split(' ').map((word, i) => ({ text: word, i, tilt: tiltFor(i) }));
}

function kineticLines(lines: readonly (readonly KineticSegment[])[]): readonly KineticWord[][] {
  let i = 0;
  return lines.map((line) =>
    line.flatMap((segment) =>
      segment.text.split(' ').map((word) => ({
        accent: !!segment.accent,
        underline: !!segment.underline,
        chars: Array.from(word).map((char) => {
          const index = i++;
          return { text: char, i: index, tilt: tiltFor(index) };
        }),
      })),
    ),
  );
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LandingHeaderComponent, FiadoHeroSceneComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  readonly appVersion = APP_VERSION;
  readonly showBackToTop = signal(false);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly tagline =
    'Ayudamos a las tiendas de barrio a cobrar lo que les deben y, con ese historial, a conseguir crédito que hoy los bancos no les dan.';

  readonly steps: readonly Step[] = [
    {
      index: '01',
      title: 'Anota',
      bullets: ['Cliente, monto y fecha en tres toques', 'Sin libreta perdida ni números mal copiados'],
    },
    {
      index: '02',
      title: 'Recuerda',
      bullets: [
        'Recordatorio amable por WhatsApp',
        'Tono de vecino, sin incomodar al comercio',
      ],
    },
    {
      index: '03',
      title: 'Cobra',
      bullets: ['Yappy, transferencia o link de pago', 'La deuda se borra sola al pagar'],
    },
    {
      index: '04',
      title: 'Historial',
      bullets: [
        'Cada pago queda registrado',
        'Puntaje de pagos del comercio y de sus clientes',
      ],
    },
    {
      index: '05',
      title: 'Crédito',
      bullets: [
        'Historial visible para una financiera aliada',
        'Capital de trabajo con datos reales de la tienda',
      ],
    },
  ];

  readonly revenuePillars = [
    {
      label: 'Suscripción Pro',
      detail: 'Unos $9.99 al mes para el comercio.',
    },
    {
      label: 'Cobro digital',
      detail: 'Comisión del 1.5% cuando el cliente paga en la app.',
    },
    {
      label: 'Crédito aliado',
      detail: 'Desde el año 2, comisión por conectar con un socio regulado.',
    },
  ] as const;

  readonly heroTitleLabel = 'Cobra el fiado a tiempo y construye historial crediticio.';

  readonly heroTitle = kineticLines([
    [{ text: 'Cobra el' }, { text: 'fiado', accent: true }],
    [{ text: 'a tiempo y' }, { text: 'construye', accent: true, underline: true }],
    [{ text: 'historial' }, { text: 'crediticio', accent: true, underline: true }],
  ]);

  readonly heroCharCount = this.heroTitle.flat().reduce((n, word) => n + word.chars.length, 0);

  readonly sectionTitle = {
    como: 'Cinco pasos en la bodega y en el bolsillo del cliente',
    problema: 'Por qué esto es fintech y no otra libreta digital',
    modelo: 'Cómo podría ganar el producto',
  } as const;

  readonly sectionWords = {
    como: kineticWords(this.sectionTitle.como),
    problema: kineticWords(this.sectionTitle.problema),
    modelo: kineticWords(this.sectionTitle.modelo),
  } as const;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        this.setupLandingMotion();
        this.setupBackToTop();
      });
    }
  }

  scrollToTop(): void {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  scrollToComo(): void {
    document.getElementById('como')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private setupBackToTop(): void {
    const sync = (): void => {
      this.showBackToTop.set(window.scrollY > window.innerHeight * 0.55);
    };
    sync();
    fromEvent(window, 'scroll', { passive: true })
      .pipe(throttleTime(80), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => sync());
  }

  private static readonly motionViewportBand = {
    topRatio: 0.1,
    bottomRatio: 0.72,
    rootMargin: '-10% 0px -28% 0px',
  } as const;

  private setupLandingMotion(): void {
    const root = this.host.nativeElement;
    const { topRatio, bottomRatio, rootMargin } = LandingComponent.motionViewportBand;

    const collectPanels = (): HTMLElement[] => {
      const nodes = root.querySelectorAll('[data-landing-panel]');
      return Array.from(nodes) as HTMLElement[];
    };

    const setPanelInView = (panel: HTMLElement, inView: boolean): void => {
      panel.classList.toggle('is-in-view', inView);
    };

    const panelOverlapsBand = (panel: HTMLElement): boolean => {
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      const topGate = viewport * topRatio;
      const bottomGate = viewport * bottomRatio;
      const rect = panel.getBoundingClientRect();
      return rect.top < bottomGate && rect.bottom > topGate;
    };

    const syncPanelsInView = (panels: readonly HTMLElement[]): void => {
      for (const panel of panels) {
        setPanelInView(panel, panelOverlapsBand(panel));
      }
    };

    const refreshPanels = (): readonly HTMLElement[] => {
      const panels = collectPanels();
      syncPanelsInView(panels);
      return panels;
    };

    let bound = false;

    const bootstrap = (): void => {
      if (bound) {
        return;
      }
      const panels = collectPanels();
      if (panels.length === 0) {
        return;
      }
      bound = true;
      root.classList.add('landing-motion-ready');

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            setPanelInView(entry.target as HTMLElement, entry.isIntersecting);
          }
        },
        { root: null, rootMargin, threshold: 0 },
      );

      for (const panel of panels) {
        observer.observe(panel);
      }

      refreshPanels();

      fromEvent(window, 'scroll', { passive: true })
        .pipe(throttleTime(40), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => refreshPanels());

      fromEvent(window, 'resize', { passive: true })
        .pipe(throttleTime(80), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => refreshPanels());

      const pollUntil = performance.now() + 1_500;
      const poll = (): void => {
        refreshPanels();
        if (performance.now() < pollUntil) {
          requestAnimationFrame(poll);
        }
      };
      requestAnimationFrame(poll);

      this.destroyRef.onDestroy(() => observer.disconnect());
    };

    bootstrap();
    if (!bound) {
      requestAnimationFrame(() => bootstrap());
    }
  }
}