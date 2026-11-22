import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FiadoHeroSpeechService {
  private voicesReady: Promise<void>;

  constructor() {
    this.voicesReady = new Promise((resolve) => {
      if (typeof speechSynthesis === 'undefined') {
        resolve();
        return;
      }
      const done = (): void => {
        speechSynthesis.removeEventListener('voiceschanged', done);
        resolve();
      };
      if (speechSynthesis.getVoices().length > 0) {
        resolve();
        return;
      }
      speechSynthesis.addEventListener('voiceschanged', done);
      window.setTimeout(done, 400);
    });
  }

  stop(): void {
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  }

  async speak(text: string): Promise<void> {
    if (typeof speechSynthesis === 'undefined') {
      return;
    }
    await this.voicesReady;
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-PA';
      utterance.rate = 0.94;
      utterance.pitch = 1.08;
      const voice = this.pickSpanishFemaleVoice();
      if (voice) {
        utterance.voice = voice;
      }
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    });
  }

  private pickSpanishFemaleVoice(): SpeechSynthesisVoice | null {
    const voices = speechSynthesis.getVoices();
    const spanish = voices.filter((v) => v.lang.toLowerCase().startsWith('es'));
    if (spanish.length === 0) {
      return null;
    }
    const femaleHint =
      /(mari|helena|paulina|lucia|laura|female|mujer|sabina|monica|españa|premium|natural)/i;
    const ranked = [...spanish].sort((a, b) => {
      const aF = femaleHint.test(a.name) ? 1 : 0;
      const bF = femaleHint.test(b.name) ? 1 : 0;
      if (aF !== bF) {
        return bF - aF;
      }
      const aPa = a.lang.toLowerCase().includes('pa') ? 1 : 0;
      const bPa = b.lang.toLowerCase().includes('pa') ? 1 : 0;
      return bPa - aPa;
    });
    return ranked[0] ?? spanish[0];
  }
}