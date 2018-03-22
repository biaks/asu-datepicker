import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: "./app.component.html",
//  styleUrls: ["./scss-dependencies/app-main.scss"]
})
export class AppComponent implements OnInit {

  // https://medium.com/@maks.zhitlov/reactive-forms-in-angular-2f8abe884f79 - Реактивные формы (Reactive Forms) в Angular 2+
  // http://stepansuvorov.com/blog/2017/07/angular-forms-and-validation/ - Формы и валидация данных в Angular

  formControl1: FormControl = new FormControl(new Date(2011,1-1,1));
  formControl2: FormControl = new FormControl(new Date(2012,2-1,2));

  date1: Date = new Date(2013,3-1,3);
  date2: Date = new Date(2014,4-1,4);
  date3: Date = new Date(2015,5-1,5);

  setFormControl1() { this.formControl1.setValue (new Date()); }
  setFormControl2() { this.formControl2.setValue (new Date()); }

  setDate1() { this.date1 = new Date(); }
  setDate2() { this.date2 = new Date(); }
  setDate3() { this.date3 = new Date(); }

  ngOnInit(): void {
    console.log("onInit(): run");
  }

}
