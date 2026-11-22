export type FiadoLoopView = 'anota' | 'recuerda' | 'cobra' | 'historial' | 'credito';

export interface FiadoLoopCue {
  view: FiadoLoopView;
  /** Subtítulo en pantalla. */
  t: string;
  /** Texto para voz (español). */
  s: string;
  /** Segundos mínimos si no hay síntesis de voz. */
  min: number;
}

export const FIADO_HERO_LOOP_CUES: readonly FiadoLoopCue[] = [
  {
    view: 'anota',
    t: 'Anota: cliente, monto y fecha en tres toques.',
    s: 'En la bodega anotas el fiado en la app: cliente, monto y fecha. Tres toques y listo.',
    min: 5,
  },
  {
    view: 'recuerda',
    t: 'Recuerda: aviso amable por WhatsApp.',
    s: 'El sistema le manda al cliente un recordatorio amable por WhatsApp, con tono de vecino.',
    min: 5,
  },
  {
    view: 'cobra',
    t: 'Cobra: Yappy, transferencia o link.',
    s: 'El cliente paga con Yappy, transferencia o un link de pago, y la deuda se borra sola.',
    min: 5,
  },
  {
    view: 'historial',
    t: 'Historial: cada pago suma confianza.',
    s: 'Cada pago queda registrado y construye un puntaje de pagos para la tienda y sus clientes.',
    min: 5,
  },
  {
    view: 'credito',
    t: 'Crédito: historial que el banco no veía.',
    s: 'Con ese historial, una financiera aliada puede ofrecerte capital de trabajo.',
    min: 4,
  },
] as const;