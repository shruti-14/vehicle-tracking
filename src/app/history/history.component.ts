import { Component, OnInit } from '@angular/core';
import {ElasticService} from '../elastic.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  records;
  constructor(private es: ElasticService) { }

  ngOnInit() {
    console.log("History component loading");
    this.records=this.es.getAllReports();
    console.log(this.records);
  }
}
