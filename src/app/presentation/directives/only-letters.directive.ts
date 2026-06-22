import { Directive, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[onlyLetters]',
  standalone: true
})
export class OnlyLettersDirective {
  constructor(@Optional() @Self() private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const initialValue = input.value;
    // Permite letras (incluyendo acentos y ñ/Ñ) y espacios.
    const cleanedValue = initialValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]/g, '');
    if (initialValue !== cleanedValue) {
      input.value = cleanedValue;
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(cleanedValue, { emitEvent: false });
      }
    }
  }
}
