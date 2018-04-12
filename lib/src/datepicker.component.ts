import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-datepicker',
  templateUrl: "./datepicker.component.html",
//  styleUrls: [ "./scss-dependencies/datapicker-main.scss" ],
})
export class DatepickerComponent {

  // пример использования параметра с двухсторонним связыванием:

  // https://angular.io/guide/template-syntax
  //
  // варианты указания связывания:
  //   size  ="myConst" - можно использовать только если:
  //                      - size может принять текстовое значение
  //                      - myConst - это константная строка
  //                      - это инициализированное значение никгда не будет меняться
  //  [size] ="myProperty"  ->   bind-size="myProperty"  --> это всегда свойство компонента (property)
  //  (size) ="myExtention" ->     on-size="myExtention" --> есть дефолтный параметр $event, можно его чему-то присвоить или передать в функцию
  // [(size)]="myProperty"  -> bindon-size="myProperty"
  //
  // [(size)]="myProperty"
  //   @Input ('size')       set setValue(value: number) { this.value = value; }
  //   @Output('sizeChange') emitter: EventEmitter<number> = new EventEmitter<number>();
  //
  // или без переименовывания в Input/Output:
  // [(size)]="myProperty"
  //   @Output() sizeChange: EventEmitter<number> = new EventEmitter<number>();
  //   @Input()  set size(value: number) { this.value = value; }
  //
  // или без переименовывания в Input/Output и без сеттера:
  // [(size)]="myProperty"
  //   @Output() sizeChange: EventEmitter<number> = new EventEmitter<number>();
  //   @Input()  size:       number;
  //
  // варианты последующего использование
  // <our-component [(size)]="sizeValue"></our-component>
  // <our-component [size]="sizeValue" (sizeChange)="sizeValue=$event"></our-component>

  _value: Date = null;
  @Input()  set value (newValue: Date) {
    console.log('calendar:set value('+newValue+')');
    this._value = newValue;
    if (newValue != null) {
      this.currentYear = newValue.getFullYear();
      this.currentMonth = newValue.getMonth();
    }
    else {
      this.currentYear = this.todayDate.getFullYear();
      this.currentMonth = this.todayDate.getMonth();
    }
  }
  get value (): Date { return this._value; }
  @Output() valueChange:  EventEmitter<Date> = new EventEmitter<Date>();
  @Output() onMouseLeave: EventEmitter<Date> = new EventEmitter<Date>();
  @HostListener("mouseleave") _onMouseLeave() { this.onMouseLeave.emit(this.value); }

  clear() {
    this.value = null;
  }

  weekDaysNamesShort: Array<string> = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  weekDaysNames:      Array<string> = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
  monthNames:         Array<string> = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  
  todayDate:    Date   = new Date();
  currentYear:  number = this.todayDate.getFullYear();
  currentMonth: number = this.todayDate.getMonth();
  
  currentMode: string = "days"; // can be: days, months, years

  getSelectedDayText(): string {
    if (this.value) return this.value.getDate().toString();
    else            return "";
  }
  getSelectedMonthText(): string {
    if (this.value) return this.monthNames[this.value.getMonth()];
    else            return "";
  }
  getSelectedFullYearText(): string {
    if (this.value) return this.value.getFullYear().toString();
    else            return "";
  }

  //getSelectedWeekDayName(): string {
  //  if (this.value) return this.weekDaysNames[this.correctWeekDay(this.value.getDay())];
  //  else            return "";
  //}

  getYearsList (): number[] {
    let firstYear = this.getStartYear();
    let years = [];
    for ( let i = 0; i < 20; i++ ) years.push( firstYear+i );
    return years;
  }
  
  getStartDay() : number {
    let tmpDate = new Date(this.currentYear, this.currentMonth, 1);
    return -this.correctWeekDay(tmpDate.getDay()) + 1;
  }
  getStartYear(): number {
    let i: number = this.currentYear;
    i = i - (i % 20);
    return i;
  }
  isTodayDay(day: number) : boolean {
    return (   this.currentYear  == this.todayDate.getFullYear()
            && this.currentMonth == this.todayDate.getMonth()
            && day               == this.todayDate.getDate() );
  }
  isSelectedDay(day: number) : boolean {
    if (this.value == null) return false;
    return (   this.currentYear  == this.value.getFullYear()
            && this.currentMonth == this.value.getMonth()
            && day               == this.value.getDate() );
  }
  isCurrentMonth(month: number) {
    return ( month == this.currentMonth );
  }
  isCurrentYear(year: number) {
    return ( year  == this.currentYear );
  }
  daysInSelectedMonth (): number {
    let tmpDate = new Date(this.currentYear, this.currentMonth+1, 0);
    return tmpDate.getUTCDate();
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

  selectTodayDay () {
    this.value = new Date();
    this.currentMonth = this.value.getMonth();
    this.currentYear = this.value.getUTCFullYear();
    this.valueChange.emit(this.value);
  }

  changeDay(selectedDay: number) {
    if (this.isValidDay(selectedDay)) {
      let tmpDate = new Date(this.currentYear, this.currentMonth, selectedDay);
      if (   this.value
          && this.value.getDate()     == selectedDay
          && this.value.getFullYear() == this.currentYear
          && this.value.getMonth()    == this.currentMonth ) {
        this._value = null;
      }
      else {
        this.value = tmpDate;
      }
      this.valueChange.emit(this.value);
    }
  }
  changeCurrentMonth(month: number) {
    this.currentMonth = month;
  }
  changeCurrentYear(year: number) {
    this.currentYear = year;
  }

  stepNextDay() {
    if (this.value) {
      this.value.setDate(this.value.getDate()+1);
      this.valueChange.emit(this.value);
    }
  }
  stepPrevDay() {
    if (this.value) {
      this.value.setDate(this.value.getDate()-1);
      this.valueChange.emit(this.value);
    }
  }
  stepNextMonth() {
    if (this.currentMonth < 11) {
      this.currentMonth++;
    }
  }
  stepPrevMonth() {
    if (this.currentMonth > 0) {
      this.currentMonth--;
    }
  }
  stepNextYear() {
    this.currentYear++;
  }
  stepPrevYear() {
    this.currentYear--;
  }
  stepNext20Years() {
    this.currentYear += 20;
  }
  stepPrev20Years() {
    this.currentYear -= 20;
  }

}
