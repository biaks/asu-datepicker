import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { DatepickerModule } from 'datepicker';
import { DatepickerComponent } from 'datepicker';
// import { DatepickerDirective } from 'datepicker';
// import { DatepickerControl } from 'datepicker';

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
