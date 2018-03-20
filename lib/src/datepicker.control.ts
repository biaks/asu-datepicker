
import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { DatepickerDirective } from './datepicker.directive';

@Component({
  selector: 'app-datepicker-input',
  template: `{{_value.toLocaleDateString()}}`,
  styles: [],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatepickerControl),
    multi: true
    }
  ]
})
export class DatepickerControl extends DatepickerDirective {

  //get accessor
  get value(): Date {
    return this._value;
  };

  //set accessor including call the onchange callback
  set value(v: Date) {
    if (v !== this._value) {
      this.writeValue(v);
      this.onChangeCallback(v);
    }
  }

  //Set touched on blur
  onBlur() {
    this.onTouchedCallback();
  }   
  
}
