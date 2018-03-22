
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

  _value: Date;

  @Input()  set value(date: Date) {
    if (this._value != date) {
      this._value = date;                                               // запишем во внутреннюю переменную
      this.elem.nativeElement.value = this._value.toLocaleDateString(); // отрисуем значение в представлении
      this.onChangeCallback(this._value);                               // вызовим событие изменения для reactiveForms
      this.valueChange.emit(this._value);                              // вызовим событие изменения для двухстороннего связывания [(value)]
      //this.input.emit(this._value);                                     // вызовим событие изменения как стандартный input (input)
    }
  }
  @Output() valueChange: EventEmitter<Date> = new EventEmitter<Date>();
  
  // тут интересная херня - если невозможно прочитать value (нету get value), тогда reactiveForms пытаются ловить стандартное событие input
  // при этом, это должен быть nativeInputEvent, в котором должно быть поле event.value
  // вот так не будет работать:
  //@Output() input:       EventEmitter<Date> = new EventEmitter<Date>();
  // поэтому для reactiveForms вставим getter, возвращающий значение:
  get value () { return this._value };

  // Для директивы сюда придет ссылка на элемент input, в котором будет указана данная директива
  constructor (
    private elem: ElementRef,             // получим указатель на нативный элемент, в котором упомянута директива
    private vcRef: ViewContainerRef,      // с помощью этого соберем компонент календаря из шаблона
    private cfr: ComponentFactoryResolver // с помощью этого найдем фабрику для компонента клендаря
                                          // (компонент календаря должен быть указан в module:entryComponents)
  ) {
    elem.nativeElement.readOnly = true;
  }

  // ниже отображение календаря (компонент DatepickerComponent)

  @HostListener("click") onMouseClick() {
    if (this.calendarRef == null)
      this.showCalendar();
  }

  private calendarRef: ComponentRef<DatepickerComponent> = null;

  showCalendar() {
    
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
    document.querySelector("body").appendChild(this.calendarRef.location.nativeElement);
    // инициализируем дату в календаре
    this.calendarRef.instance.value = new Date(this._value);

    // посчитаем координаты для отображения календаря
    let top: number , left: number;

    let b: ClientRect = document.body.getBoundingClientRect();
    let e: ClientRect = this.elem.nativeElement.getBoundingClientRect();

    top  = +19 + e.top  - b.top  + this.elem.nativeElement.offsetHeight;
    left = -39 + e.left - b.left; // + this.elem.nativeElement.offsetWidth;

    this.calendarRef.instance.position = {top, left};

    // подпишемся на событие завершения выбора даты
    this.calendarRef.instance.valueChange.subscribe(
      ( event: Date ) => {
        this.value = event;
        this.calendarRef.destroy();
        this.calendarRef = null;
      }
    )
  }

  // ниже реализация интерфейса ControlValueAccessor

  writeValue(date: Date): void {
    this.value = date;
  }

  // Function to call when the rating changes.
  onChangeCallback = (value: Date) => {};

  // Allows Angular to register a function to call when the model (rating) changes.
  // Save the function as a property to call later here.
  registerOnChange(fn: (value: Date) => void): void {
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