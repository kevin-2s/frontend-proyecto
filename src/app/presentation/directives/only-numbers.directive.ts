import { Directive, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[onlyNumbers]',
  standalone: true
})
export class OnlyNumbersDirective {
  constructor(@Optional() @Self() private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const initialValue = input.value;
    // Permite únicamente dígitos del 0 al 9.
    const cleanedValue = initialValue.replace(/[^0-9]/g, '');
    if (initialValue !== cleanedValue) {
      input.value = cleanedValue;
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue(cleanedValue, { emitEvent: false });
      }
    }
  }
}
