import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { DatepickerModule } from 'asu-datepicker';
import { DatepickerComponent } from 'asu-datepicker';
// import { DatepickerDirective } from 'asu-datepicker';
// import { DatepickerControl } from 'asu-datepicker';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    DatepickerModule,
  ],
  providers: [],
  entryComponents: [DatepickerComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
