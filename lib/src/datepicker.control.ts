
import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { DatepickerDirective } from './datepicker.directive';

@Component({
  selector: 'app-datepicker-input',
  template: `{{_value && _value.toLocaleDateString ? _value.toLocaleDateString() : ''}}`,
  styles: [],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatepickerControl),
    multi: true
    }
  ]
})
export class DatepickerControl extends DatepickerDirective {

  //Set touched on blur
  onBlur() {
    this.onTouchedCallback();
  }   
  
}
