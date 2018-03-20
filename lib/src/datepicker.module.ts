import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DatepickerComponent } from './datepicker.component';
import { DatepickerDirective } from './datepicker.directive';
import { DatepickerControl } from './datepicker.control';

@NgModule({
  declarations: [
    DatepickerComponent,
    DatepickerDirective,
    DatepickerControl
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  exports: [
    DatepickerComponent,
    DatepickerDirective,
    DatepickerControl
  ]
})
export class DatepickerModule { }
