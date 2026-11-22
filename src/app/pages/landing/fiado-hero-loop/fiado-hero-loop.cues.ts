export type FiadoLoopView = 'inicio' | 'nuevo' | 'whatsapp' | 'pago' | 'credito';

export interface FiadoLoopCue {
  view: FiadoLoopView;
  /** Ruta bajo `public/`. */
  image: string;
  /** Subtítulo en pantalla. */
  t: string;
  /** Texto para voz (español). */
  s: string;
  /** Segundos mínimos por escena. */
  min: number;
}

export const FIADO_HERO_LOOP_CUES: readonly FiadoLoopCue[] = [
  {
    view: 'inicio',
    image: 'fiado-prototype/01-inicio.png',
    t: 'Rosa ve cuánto le deben y a quién cobrar hoy.',
    s:
      'Rosa abre la bodega y en un vistazo ve cuánto le deben, cuánto recuperó este mes y quién hay que cobrar hoy.',
    min: 6,
  },
  {
    view: 'nuevo',
    image: 'fiado-prototype/02-nuevo-fiado.png',
    t: 'Anota el fiado: cliente, monto y fecha.',
    s:
      'Para un fiado nuevo elige al cliente, el monto y cuándo paga. Los recordatorios por WhatsApp quedan activos.',
    min: 6,
  },
  {
    view: 'whatsapp',
    image: 'fiado-prototype/03-whatsapp.png',
    t: 'El cliente recibe un recordatorio amable.',
    s:
      'Ana recibe el mensaje en WhatsApp con el monto y un botón para pagar. Rosa no tiene que pedir la plata en persona.',
    min: 6,
  },
  {
    view: 'pago',
    image: 'fiado-prototype/04-pago.png',
    t: 'Paga con Yappy u otro medio.',
    s:
      'El cliente paga con Yappy, transferencia o código en la tienda. Al pagar, la cuenta de Rosa se actualiza sola.',
    min: 6,
  },
  {
    view: 'credito',
    image: 'fiado-prototype/05-credito.png',
    t: 'El historial abre la puerta al crédito.',
    s:
      'El score de cobros y el historial muestran confianza. Una financiera aliada puede ofrecer capital de trabajo.',
    min: 6,
  },
] as const;