import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export enum SelectorMode {
  days,
  months,
  years 
};

export enum DatapickerResultTypes{
  InterimDate,
  SelectedDate,
  Cancel,
}

export interface IDatapickerResult{
  type:DatapickerResultTypes,
  date?:Date,
  dateStr?:string,
}

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
  @Input()  useNativeDate:boolean = false;
  @Output() valueChange: EventEmitter<Date|string> = new EventEmitter<Date|string>();
  @Output() input:       EventEmitter<Date|string> = new EventEmitter<Date|string>();

  public result$:BehaviorSubject<IDatapickerResult> = new BehaviorSubject(null)

  ok(){
    let value = this.useNativeDate ? this.selectedValue : this.getFormattedDate(this.selectedValue);
    console.log('[DEV][DATAPICKER][OK]', value);
    this.valueChange.emit(value);
    this.input.emit(value);

    this.nextSelectedValue();
  }
  cancel(){
    this.result$.next({type: DatapickerResultTypes.Cancel})
  }

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
    let tmpDate = new Date(this.selectedValue.getUTCFullYear(), this.selectedValue.getUTCMonth(), 1);
    return -this.correctWeekDay(tmpDate.getUTCDay()) + 1;
  }
  getStartYear(): number {
    let i: number = this.selectedValue.getUTCFullYear();
    i = i - (i % 20);
    return i;
  }
  isTodayDay(day: number) : boolean {
    return (   this.selectedValue.getUTCFullYear() == this.todayDate.getUTCFullYear()
            && this.selectedValue.getUTCMonth()    == this.todayDate.getUTCMonth()
            && day                              == this.todayDate.getUTCDate() );
  }
  isSelectedDay(day: number) : boolean {
    return (   day                             == this.selectedValue.getUTCDate() );
  }
  isSelectedMonth(month: number) {
    return (   month                           == this.selectedValue.getUTCMonth() );
  }
  isSelectedYear(year: number) {
    return (   year                            == this.selectedValue.getUTCFullYear() );
  }
  daysInSelectedMonth (): number {
    let tmpDate = new Date(this.selectedValue.getUTCFullYear(), this.selectedValue.getUTCMonth()+1, 0);
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

  changeSelectedDay(selectedDay: number) {
    if (this.isValidDay(selectedDay)){
      this.selectedValue.setUTCDate(selectedDay);
      this.nextInterimValue();
    }
  }
  changeSelectedMonth(month: number) {
    this.selectedValue.setUTCMonth(month);
    this.nextInterimValue();
  }
  changeSelectedYear(year: number) {
    this.selectedValue.setUTCFullYear(year);
    this.nextInterimValue();
  }

  stepNextDay() {
    this.selectedValue.setUTCDate(this.selectedValue.getUTCDate()+1);
    this.nextInterimValue();
  }
  stepPrevDay() {
    this.selectedValue.setUTCDate(this.selectedValue.getUTCDate()-1);
    this.nextInterimValue();
  }
  stepNextMonth() {
    if (this.selectedValue.getUTCMonth() < 11){
      this.selectedValue.setUTCMonth(this.selectedValue.getUTCMonth()+1);
      this.nextInterimValue();
    }
  }
  stepPrevMonth() {
    if (this.selectedValue.getUTCMonth() > 0){
      this.selectedValue.setUTCMonth(this.selectedValue.getUTCMonth()-1);
      this.nextInterimValue();
    }
  }
  stepNextYear() {
    this.selectedValue.setUTCFullYear(this.selectedValue.getUTCFullYear()+1);
    this.nextInterimValue();
  }
  stepPrevYear() {
    this.selectedValue.setUTCFullYear(this.selectedValue.getUTCFullYear()-1);
    this.nextInterimValue();
  }
  stepNext20Years() {
    this.selectedValue.setUTCFullYear(this.selectedValue.getUTCFullYear()+20);
    this.nextInterimValue();
  }
  stepPrev20Years() {
    this.selectedValue.setUTCFullYear(this.selectedValue.getUTCFullYear()-20);
    this.nextInterimValue();
  }

  public nextInterimValue( date?:Date ){
    this.selectedValue = date || this.selectedValue;
    this.result$.next({
      type: DatapickerResultTypes.InterimDate,
      date: this.selectedValue,
      dateStr: this.getFormattedDate(this.selectedValue),
    })
  }

  private nextSelectedValue(){
    this.result$.next({
      type: DatapickerResultTypes.SelectedDate,
      date: this.selectedValue,
      dateStr: this.getFormattedDate(this.selectedValue),
    })
  }

  private getFormattedDate( date:Date ): string {
    if( date && date.toISOString ) return date.toISOString().substr(0,10);
    else return '';
  }
}
