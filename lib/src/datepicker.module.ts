
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DatepickerComponent } from './datepicker.component';
import { DatepickerDirective } from './datepicker.directive';
import { DatepickerControl } from './datepicker.control';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  declarations: [
    DatepickerComponent,
    DatepickerDirective,
    DatepickerControl
  ],
  entryComponents: [
    DatepickerComponent
  ],
  exports: [
    DatepickerComponent,
    DatepickerDirective,
    DatepickerControl
  ],
})
export class DatepickerModule { }
