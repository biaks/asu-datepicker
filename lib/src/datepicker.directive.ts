
import { Directive, forwardRef, ElementRef, ViewContainerRef, ComponentFactoryResolver,ComponentRef, HostListener, ComponentFactory } from "@angular/core";
import { Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { DatepickerComponent } from "./datepicker.component";

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
  inputDateInString: boolean = false;
  _value: Date;

  // на вход может приходить:
  // пустая строка ""
  // строка с датой вида "DD.MM.YYYY"
  // null - считаем это пустой датой в формате Date
  // Date
  @Input() set value (newValue: string|Date) {

    console.log ("datepicker::set value => " + newValue);

    if (typeof newValue == "object") this.inputDateInString = false;
    else                             this.inputDateInString = true;

    this.tryToEmitChange (newValue);
  }
  @Output() valueChange: EventEmitter<string|Date> = new EventEmitter<string|Date>();
  
  tryToEmitChange (newValue: string|Date) {
    this.setNativeElementValue (newValue);
    let newDateValue = this.getDateValue(newValue);
    console.log ("datepicker::tryToEmitChange("+newValue+") => " + 'saved:' + this._value +' transf:'+ newDateValue);
    if (this._value !== newDateValue) {
      this._value = newDateValue;
      if (this.inputDateInString) {
        this.onChangeCallback(this.date2string(this._value)); // вызовим событие изменения для reactiveForms
        this.valueChange.emit(this.date2string(this._value)); // вызовим событие изменения для двухстороннего связывания [(value)]
      }
      else {
        this.onChangeCallback(this._value); // вызовим событие изменения для reactiveForms
        this.valueChange.emit(this._value); // вызовим событие изменения для двухстороннего связывания [(value)]
      }
    }
  }

  getDateValue (value: string|Date): Date {
    if (typeof value == "object") return value;
    else                          return this.string2date(value);
  }

  string2date (rawValue: string): Date {

    if (rawValue.length != 10) {
      console.log ("datepicker::string2date("+rawValue+") => error length");
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue) == false) {
      console.log ("datepicker::string2date("+rawValue+") => error format YYYY-MM-DD");
      return null;
    }

    let year  = parseInt(rawValue.substr(0,4));
    let month = parseInt(rawValue.substr(5,2));
    let day   = parseInt(rawValue.substr(8,2));
    
    if (year < 1900 || year > 2100 || month == 0 || month > 12 || day == 0 || day > 31) {
      console.log ("datepicker::string2date("+rawValue+") => error min max values");
      return null;
    }

    let date = new Date(year, month-1, day);
    //console.log ("datepicker::string2date("+rawValue+") =>" + date);
    return date;

  }

  setNativeElementValue (value: string|Date) {
    if (typeof value == "object") this.elem.nativeElement.value = this.date2string(value);
    else                          this.elem.nativeElement.value = value;
  }
  
  To2 (val: number): string {
    return (val<10 ? "0"+val.toString() : val.toString());
  }

  date2string(date: Date): string {
    if (date) {
      let result = date.getFullYear() +'-'+ this.To2(date.getMonth()+1) +'-'+ this.To2(date.getDate());
      //console.log ("datepicker::date2string("+date+") => " + result);
      return result;
    }
    else return "";
  }

  private destroyCalendar() {
    if (this.calendarRef) {
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

  // тут интересная херня - если невозможно прочитать value (нету get value), тогда reactiveForms пытаются ловить стандартное событие input
  // при этом, это должен быть nativeInputEvent, в котором должно быть поле event.value
  // вот так не будет работать:
  //@Output() input:       EventEmitter<Date> = new EventEmitter<Date>();
  // поэтому для reactiveForms вставим getter, возвращающий значение:
  get value (): string|Date {
    if (this.inputDateInString) return this.date2string(this._value);
    else                        return this._value;
  };

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
  }

  // ниже отображение календаря (компонент DatepickerComponent)

  @HostListener("click") onMouseClick() {
    console.log ("datepicker::onMouseClick()");
    if (this.calendarRef) this.destroyCalendar();
    else                  this.showCalendar();
  }
//  @HostListener("focus") onFocus() {
//    console.log ("datepicker::onFocus()");
//    this.showCalendar();
//  }
  @HostListener("keyup", ['$event']) onKeyup(event) {
    let rawValue = event.target.value;
    console.log ("datepicker::onKeyup("+JSON.stringify(rawValue)+")");
    this.destroyCalendar();
    this.tryToEmitChange (rawValue);
  }

  private calendarRef: ComponentRef<DatepickerComponent> = null;

  showCalendar() {

    if (this.calendarRef) return;

    console.log ("datepicker::showCalendar()");

    // https://habrahabr.ru/company/infowatch/blog/330030 - Динамический Angular или манипулируй правильно
    // https://angular.io/guide/dynamic-component-loader - Dynamic Component Loader
    // https://www.concretepage.com/angular-2/angular-2-4-dynamic-component-loader-example - Angular 2/4 Dynamic Component Loader Example
    
    // найдем фабрику для указанного компонента
    // такие фабрики автоматически сздаются angular при помещении названия компонента в
    // module:entryComponents:
    let cf: ComponentFactory<DatepickerComponent> = this.cfr.resolveComponentFactory(DatepickerComponent);
    // создадим компонент (автоматом вставляется в DOM после текущего компонента)
    this.calendarRef = this.vcRef.createComponent(cf);

    // инициализируем дату в календаре
    this.calendarRef.instance.value = this._value;

    // подпишемся на событие завершения выбора даты
    this.calendarRef.instance.valueChange.subscribe(
      ( newValue: Date ) => {
        console.log ("datepicker::valueChange => "+event.toLocaleString());
        this.tryToEmitChange (newValue);
      }
    )

    this.calendarRef.instance.onMouseLeave.subscribe(
      ( newValue: Date ) => {
        console.log ("datepicker::onMouseLeave => "+event.toLocaleString());
        this.tryToEmitChange (newValue);
        this.destroyCalendar();
      }
    )

  }

  // ниже реализация интерфейса ControlValueAccessor

  writeValue( date:string|Date ): void {
    console.log('datepicker::writeValue ('+date+')', {date})
    this.value = date;
  }

  // Function to call when the rating changes.
  onChangeCallback = (value: Date | string) => {};

  // Allows Angular to register a function to call when the model (rating) changes.
  // Save the function as a property to call later here.
  registerOnChange(fn: (value: Date | string) => void): void {
    this.onChangeCallback = fn;
  }

  // Function to call when the input is touched (when a star is clicked).
  onTouchedCallback = () => {};

  // Allows Angular to register a function to call when the input has been touched.
  // Save the function as a property to call later here.
  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

}