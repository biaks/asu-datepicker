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

  myControl1: FormControl = new FormControl(new Date(2016,6-1,6));
  myControl2: FormControl = new FormControl(new Date(2017,7-1,7));
  myControl3: FormControl = new FormControl(new Date(2018,8-1,8));

  date4Value: Date = new Date(2019,9-1,9);

  setDate1() {
    this.myControl1.setValue (new Date());
  }

  setDate2() {
    this.myControl2.setValue (new Date());
  }

  setDate3() {
    this.myControl3.setValue (new Date());
  }

  setDate4() {
    this.date4Value = new Date();
  }

  date4ValueText: string = "";
  date4ValueCompleted(event: Date) {
    if (event != null)
      this.date4ValueText = "Selected " + event.toLocaleDateString();
    else
      this.date4ValueText = "Select canceled";
  }

  ngOnInit(): void {
    console.log("onInit(): run");
  }

}
