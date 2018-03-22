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

  savedValue:    Date = null;// = new Date();
  selectedValue: Date = new Date();

  @Input()  set value(date: Date) { this.savedValue = date; this.selectedValue = new Date(date); }
  @Output() valueChange: EventEmitter<Date> = new EventEmitter<Date>();
  @Output() input:       EventEmitter<Date> = new EventEmitter<Date>();

  ok()     { this.valueChange.emit(this.selectedValue); this.input.emit(this.selectedValue); }
  cancel() { this.valueChange.emit(this.savedValue);    this.input.emit(this.savedValue);    }

  selectorPosTop:  string = '10px';
  selectorPosLeft: string = '10px';

  @Input() set position ({top, left}) {
    this.selectorPosTop  = top  + 'px';
    this.selectorPosLeft = left + 'px';
  }

  weekDaysNamesShort: Array<string> = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  weekDaysNames:      Array<string> = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
  monthNames:         Array<string> = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  
  todayDate: Date = new Date();

  selectorMode = SelectorMode;
  currentMode: SelectorMode = SelectorMode.days;

  getYearsList (count: number): number[] {
    let firstYear = this.getStartYear();
    let years = [];
    for ( let i=0; i < count; i++ ) years.push( firstYear+i );
    return years;
  }
  
  getStartDay() : number {
    let tmpDate = new Date(this.selectedValue.getFullYear(), this.selectedValue.getMonth(), 1);
    return -this.correctWeekDay(tmpDate.getDay()) + 1;
  }
  getStartYear(): number {
    let i: number = this.selectedValue.getFullYear();
    i = i - (i % 20);
    return i;
  }
  isTodayDay(day: number) : boolean {
    return (   this.selectedValue.getFullYear() == this.todayDate.getFullYear()
            && this.selectedValue.getMonth()    == this.todayDate.getMonth()
            && day                              == this.todayDate.getDate() );
  }
  isSelectedDay(day: number) : boolean {
    return (   day                             == this.selectedValue.getDate() );
  }
  isSelectedMonth(month: number) {
    return (   month                           == this.selectedValue.getMonth() );
  }
  isSelectedYear(year: number) {
    return (   year                            == this.selectedValue.getFullYear() );
  }
  daysInSelectedMonth (): number {
    let tmpDate = new Date(this.selectedValue.getFullYear(), this.selectedValue.getMonth()+1, 0);
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
      this.selectedValue.setDate (selectedDay);
  }
  changeSelectedMonth(month: number) {
    this.selectedValue.setMonth (month);
  }
  changeSelectedYear(year: number) {
    this.selectedValue.setFullYear (year);
  }

  stepNextDay() {
    this.selectedValue.setDate(this.selectedValue.getDate()+1);
  }
  stepPrevDay() {
    this.selectedValue.setDate(this.selectedValue.getDate()-1);
  }
  stepNextMonth() {
    if (this.selectedValue.getMonth() < 11)
      this.selectedValue.setMonth(this.selectedValue.getMonth()+1);
  }
  stepPrevMonth() {
    if (this.selectedValue.getMonth() > 0)
    this.selectedValue.setMonth(this.selectedValue.getMonth()-1);
  }
  stepNextYear() {
    this.selectedValue.setFullYear(this.selectedValue.getFullYear()+1);
  }
  stepPrevYear() {
    this.selectedValue.setFullYear(this.selectedValue.getFullYear()-1);
  }
  stepNext20Years() {
    this.selectedValue.setFullYear(this.selectedValue.getFullYear()+20);
  }
  stepPrev20Years() {
    this.selectedValue.setFullYear(this.selectedValue.getFullYear()-20);
  }
}
