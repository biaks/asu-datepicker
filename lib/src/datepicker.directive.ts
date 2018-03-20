
import { Directive, forwardRef, ElementRef, ViewContainerRef, ComponentFactoryResolver,ComponentRef, HostListener, ComponentFactory } from "@angular/core";
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

  _value: Date;

  // Для директивы сюда придет ссылка на элемент input, в котором будет указана данная директива
  constructor (
    private elem: ElementRef,             // получим указатель на нативный элемент, в котором упомянута директива
    private vcRef: ViewContainerRef,      // с помощью этого соберем компонент календаря из шаблона
    private cfr: ComponentFactoryResolver // с помощью этого найдем фабрику для компонента клендаря
                                          // (компонент календаря должен быть указан в module:entryComponents)
  ) {
    elem.nativeElement.readOnly = true;
  }

  private calendarRef: ComponentRef<DatepickerComponent> = null;

  @HostListener("click") onMouseClick() {
    if (this.calendarRef == null)
      this.showCalendar();
  }

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
    this.calendarRef.instance.selectedDate = new Date(this._value);

    // посчитаем координаты для отображения календаря
    let top: number , left: number;

    let b: ClientRect = document.body.getBoundingClientRect();
    let e: ClientRect = this.elem.nativeElement.getBoundingClientRect();

    top  = +19 + e.top  - b.top  + this.elem.nativeElement.offsetHeight;
    left = -39 + e.left - b.left; // + this.elem.nativeElement.offsetWidth;

    this.calendarRef.instance.setCalendarPos (top, left);

    // подпишемся на событие завершения выбора даты
    this.calendarRef.instance.onCompleted.subscribe(
      (result:boolean) => {
        if (result) {
          if (this.calendarRef.instance.selectedDate != this._value) {
            this.writeValue(this.calendarRef.instance.selectedDate);
            this.onChangeCallback(this.calendarRef.instance.selectedDate);
          }
        }
        this.calendarRef.destroy();
        this.calendarRef = null;
      }
    )
  }

  // всё, что далее - это реализация интерфейса ControlValueAccessor

  writeValue(date: Date): void {
    console.log("writeValue() <- ", date.toJSON());
    this._value = date;
    this.elem.nativeElement.value = date.toLocaleDateString();
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