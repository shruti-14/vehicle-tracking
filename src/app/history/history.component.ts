import { Component, OnInit } from '@angular/core';
import {ElasticService} from '../elastic.service';
import 'rxjs/add/operator/toPromise';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  records;
  constructor(private es: ElasticService) { }

  async ngOnInit() {
    console.log("History component loading");
    this.records=await this.es.getResults();
    console.log(this.records);
  }
}
