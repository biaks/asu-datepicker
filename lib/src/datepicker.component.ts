import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

export enum SelectorMode {
  days,
  months,
  years 
};

@Component({
  selector: 'app-datepicker',
  templateUrl: "./datepicker.component.html",
//  styleUrls: [ "./scss-dependencies/datapicker-main.scss" ],
})
export class DatepickerComponent {

  @Input() set position ({top, left}) { this.setCalendarPos (top, left); }
  @Input('value') selectedDate: Date               = new Date();
  @Output()       onCompleted:  EventEmitter<Date> = new EventEmitter<Date>();

  weekDaysNamesShort: Array<string> = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  weekDaysNames: Array<string> = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
  monthNames: Array<string> = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  todayDate: Date = new Date();

  selectorMode = SelectorMode;
  currentMode: SelectorMode = SelectorMode.days;

  selectorPosTop: string = '10px';
  selectorPosLeft: string = '10px';

  setCalendarPos (top: number, left: number) {
    this.selectorPosTop = top + 'px';
    this.selectorPosLeft = left + 'px';
  }

  ok()     { this.onCompleted.emit(this.selectedDate); }
  cancel() { this.onCompleted.emit(null);              }

  getYearsList (count: number): number[] {
    let firstYear = this.getStartYear();
    let years = [];
    for ( let i=0; i < count; i++ ) years.push( firstYear+i );
    return years;
  }
  
  getStartDay() : number {
    let tmpDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
    return -this.correctWeekDay(tmpDate.getDay()) + 1;
  }
  getStartYear(): number {
    let i: number = this.selectedDate.getFullYear();
    i = i - (i % 20);
    return i;
  }
  isTodayDay(day: number) : boolean {
    return (   this.selectedDate.getFullYear() == this.todayDate.getFullYear()
            && this.selectedDate.getMonth()    == this.todayDate.getMonth()
            && day                             == this.todayDate.getDate() );
  }
  isSelectedDay(day: number) : boolean {
    return (   day                             == this.selectedDate.getDate() );
  }
  isSelectedMonth(month: number) {
    return (   month                           == this.selectedDate.getMonth() );
  }
  isSelectedYear(year: number) {
    return (   year                            == this.selectedDate.getFullYear() );
  }
  daysInSelectedMonth (): number {
    let tmpDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth()+1, 0);
    return tmpDate.getDate();
  }
  calculateShowingDay(row: number, col: number) :number {
    return row*7 + col + this.getStartDay()
  }
  isValidDay(day: number): boolean {
    return day > 0 && day <= this.daysInSelectedMonth();
  }
  correctWeekDay(weekDay: number): number {
    if (weekDay == 0) weekDay = 7; // поправим воскресенье
    return weekDay-1; 
  }

  changeSelectedDay(selectedDay: number) {
    if (this.isValidDay(selectedDay))
      this.selectedDate.setDate (selectedDay);
  }
  changeSelectedMonth(month: number) {
    this.selectedDate.setMonth (month);
  }
  changeSelectedYear(year: number) {
    this.selectedDate.setFullYear (year);
  }

  stepNextDay() {
    this.selectedDate.setDate(this.selectedDate.getDate()+1);
  }
  stepPrevDay() {
    this.selectedDate.setDate(this.selectedDate.getDate()-1);
  }
  stepNextMonth() {
    if (this.selectedDate.getMonth() < 11)
      this.selectedDate.setMonth(this.selectedDate.getMonth()+1);
  }
  stepPrevMonth() {
    if (this.selectedDate.getMonth() > 0)
    this.selectedDate.setMonth(this.selectedDate.getMonth()-1);
  }
  stepNextYear() {
    this.selectedDate.setFullYear(this.selectedDate.getFullYear()+1);
  }
  stepPrevYear() {
    this.selectedDate.setFullYear(this.selectedDate.getFullYear()-1);
  }
  stepNext20Years() {
    this.selectedDate.setFullYear(this.selectedDate.getFullYear()+20);
  }
  stepPrev20Years() {
    this.selectedDate.setFullYear(this.selectedDate.getFullYear()-20);
  }
}
