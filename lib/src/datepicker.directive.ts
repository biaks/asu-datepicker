
import { Directive, forwardRef, ElementRef, ViewContainerRef, ComponentFactoryResolver,ComponentRef, HostListener, ComponentFactory } from "@angular/core";
import { Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { DatepickerComponent, DatapickerResultTypes } from "./datepicker.component";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { Subscription } from 'rxjs/Subscription';


// https://alligator.io/angular/custom-form-control/ - Using ControlValueAccessor to Create Custom Form Controls in Angular
// https://habrahabr.ru/company/tinkoff/blog/323270/ - Формы и кастомные поля ввода в Angular 2+

// http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel - Angular 2: Connect your custom control to ngModel with Control Value Accessor.
// http://qaru.site/questions/89205/angular-2-custom-form-input - Angular 2 пользовательских ввода формы

@Directive({
  selector: "[ngx-datepicker]",
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatepickerDirective),
    multi: true
    }
  ]
})
export class DatepickerDirective implements ControlValueAccessor {

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

  private get _rawValue(){ return this.elem.nativeElement.value; }
  _initDateValue: Date;
  _isNativeDate: boolean = false;

  @Input() set value( rawDateValue:any ){
    this._isNativeDate = rawDateValue instanceof Date;
    console.log('[DEV][DATAPICKER][INPUT]', {isNativeDate: this._isNativeDate, rawDateValue, rawValue: this._rawValue, dateValue: this._initDateValue})
    if( this.elem.nativeElement.value !== rawDateValue ){
      this.elem.nativeElement.value = rawDateValue;
      this.reactValue(rawDateValue);
    }
  }
  @Output() valueChange: EventEmitter<Date> = new EventEmitter<Date>();
  
  // тут интересная херня - если невозможно прочитать value (нету get value), тогда reactiveForms пытаются ловить стандартное событие input
  // при этом, это должен быть nativeInputEvent, в котором должно быть поле event.value
  // вот так не будет работать:
  //@Output() input:       EventEmitter<Date> = new EventEmitter<Date>();
  // поэтому для reactiveForms вставим getter, возвращающий значение:
  get value () { return this.elem.nativeElement.value };

  // Для директивы сюда придет ссылка на элемент input, в котором будет указана данная директива
  constructor (
    private elem: ElementRef,             // получим указатель на нативный элемент, в котором упомянута директива
    private vcRef: ViewContainerRef,      // с помощью этого соберем компонент календаря из шаблона
    private cfr: ComponentFactoryResolver // с помощью этого найдем фабрику для компонента клендаря
                                          // (компонент календаря должен быть указан в module:entryComponents)
  ) {
    // elem.nativeElement.readOnly = true;
  }

  ngOnInit(){
    Observable.fromEvent(this.elem.nativeElement, 'keyup')
      .map((evt: any) => evt.target.value)
      .debounceTime(200)
      .distinctUntilChanged()
      .subscribe(( rawValue:string )=>{
        console.log('[DEV][DATAPICKER][KEYUP]', {rawValue, _rawValue: this._rawValue, dateValue: this._initDateValue})
        // this._rawValue = rawValue;
        if( rawValue.length === 10 ){
          let date = this.getParsedDate(rawValue);
          if( this.isValidDate(date) )
            this.calendarRef.instance.nextInterimValue(date);
        }else{
          this.reactValue(rawValue);
        }
      });
  }

  // ниже отображение календаря (компонент DatepickerComponent)

  @HostListener("click") onMouseClick() {
    if( !this.calendarRef ) this.showCalendar();
  }
  @HostListener("focus") onFocus() {
    if( !this.calendarRef ) this.showCalendar();
  }

  private calendarRef: ComponentRef<DatepickerComponent> = null;

  showCalendar() {
    console.log('[DEV][DATAPICKER][NEW]', {isNativeDate: this._isNativeDate, rawValue: this._rawValue, dateValue: this._initDateValue});
    // https://habrahabr.ru/company/infowatch/blog/330030 - Динамический Angular или манипулируй правильно
    // https://angular.io/guide/dynamic-component-loader - Dynamic Component Loader
    // https://www.concretepage.com/angular-2/angular-2-4-dynamic-component-loader-example - Angular 2/4 Dynamic Component Loader Example
    
    // найдем фабрику для указанного компонента
    // такие фабрики автоматически сздаются angular при помещении названия компонента в
    // module:entryComponents:
    let cf: ComponentFactory<DatepickerComponent> = this.cfr.resolveComponentFactory(DatepickerComponent);
    // создадим компонент (автоматом вставляется в DOM после текущего компонента)
    this.calendarRef = this.vcRef.createComponent(cf);
    // переместим компонент в body (чтобы не него не влияли текущие css стили)
    //document.querySelector("body").appendChild(this.calendarRef.location.nativeElement);

    // this._rawValue = this.elem.nativeElement.value;
    this._initDateValue = this._isNativeDate ? this._rawValue : this.getParsedDate(this._rawValue);

    // инициализируем дату в календаре
    this.calendarRef.instance.value = this._initDateValue;
    this.calendarRef.instance.useNativeDate = this._isNativeDate;

    // посчитаем координаты для отображения календаря
    //let top: number , left: number;

    //let b: ClientRect = document.body.getBoundingClientRect();
    //let e: ClientRect = this.elem.nativeElement.getBoundingClientRect();

    //top  = +19 + e.top  - b.top  + this.elem.nativeElement.offsetHeight;
    //left = -39 + e.left - b.left; // + this.elem.nativeElement.offsetWidth;

    //this.calendarRef.instance.position = {top, left};

    // подпишемся на событие завершения выбора даты
    let datapickerSubscription:Subscription;
    datapickerSubscription = this.calendarRef.instance.result$.subscribe(
      datapickerResult =>{
        console.log('[DEV][DATAPICKER][RESULT]', datapickerResult, console.log('[DEV][DATAPICKER][INPUT]', {isNativeDate: this._isNativeDate, rawValue: this._rawValue, dateValue: this._initDateValue}));
        let value = this._rawValue;
        if( datapickerResult )
          switch( datapickerResult.type ){
            case DatapickerResultTypes.InterimDate:
              value = this._isNativeDate ? datapickerResult.date : datapickerResult.dateStr;
              break;
            case DatapickerResultTypes.SelectedDate:
              value = this._isNativeDate ? datapickerResult.date : datapickerResult.dateStr;
              this.destroyDatapicker();
              break;
            case DatapickerResultTypes.Cancel:
              datapickerSubscription.unsubscribe();
              value = this._rawValue;
              this.destroyDatapicker();
              break;
          }
        this.value = value;
        this.reactValue(value);
      }
    )
    this.calendarRef.instance.valueChange.subscribe(
      ( nextValue: Date ) => {
        console.log('[DEV][DATAPICKER][CHANGE]', {nextValue, current: this.value, next: this._isNativeDate ? nextValue : this.getFormattedDate(nextValue)});
      }
    )
  }

  // ниже реализация интерфейса ControlValueAccessor

  writeValue( date:string|Date ): void {
    console.log('[DEV][DATAPICKER][WRITE]', {date})
    this.value = date;
  }

  // Function to call when the rating changes.
  onChangeCallback = ( value:string|Date )=>{};

  // Allows Angular to register a function to call when the model (rating) changes.
  // Save the function as a property to call later here.
  registerOnChange(fn:( value:string|Date ) => void): void {
    this.onChangeCallback = fn;
  }

  // Function to call when the input is touched (when a star is clicked).
  onTouchedCallback = () => {};

  // Allows Angular to register a function to call when the input has been touched.
  // Save the function as a property to call later here.
  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  // Implementation
  private getParsedDate( rawValue:any ): Date {
    let date = null;
    try{
      if( rawValue )
        date = new Date(rawValue);
      else
        date = new Date();
    }catch( e ){
      console.warn('[!] Невозможно распощнать дату', rawValue);
    }
    return date;
  }

  private getFormattedDate( date:Date ): string {
    if( date && date.toISOString ) return date.toISOString().substr(0,10);
    else return '';
  }

  private destroyDatapicker(){
    if( this.calendarRef ){
      this.calendarRef.destroy();
      this.calendarRef = null;
    }
  }

  private isValidDate( date:any ){
    if( Object.prototype.toString.call(date) === "[object Date]" ){
      if( isNaN(date.getTime()) ) return false
      else return true
    }
    else return false;
  }

  private reactValue( value:any ){
    this.onChangeCallback(value); // вызовим событие изменения для reactiveForms
    this.valueChange.emit(value); // вызовим событие изменения для двухстороннего связывания [(value)]
    //this.input.emit(this._value); // вызовим событие изменения как стандартный input (input)
  }
}