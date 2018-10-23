import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Vehicle Tracker';
  description = 'Angular - Elasticsearch';
  @Output() generateReportEmit = new EventEmitter();
  displayOlderReport(event){
    this.generateReportEmit.emit(event);
    console.log(event);
  }
}
