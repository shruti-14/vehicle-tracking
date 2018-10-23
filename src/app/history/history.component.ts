import { Component, OnInit,EventEmitter, Output } from '@angular/core';
import {ElasticService} from '../elastic.service';
import 'rxjs/add/operator/toPromise';
import { generate } from 'rxjs';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  records=[];
  @Output() generateReport = new EventEmitter();
  constructor(private es: ElasticService) { }

  async ngOnInit() {
    console.log("History component loading");
     var uploadedFiles=await this.es.getResults();
     var uploadedFilesArray=uploadedFiles.hits;
     var uploadedFilesElement={};
     console.log(uploadedFiles.hits[0]._source.fileName);
     
     uploadedFilesArray.forEach(element => {
     uploadedFilesElement={
        "xmlFileContents":element._source.xmlFileContents,
        "fileName":element._source.fileName,
        "timeStamp":element._source.submitted
      }
       this.records.push(uploadedFilesElement)
     });
     

  }
  viewReport(e){
    this.generateReport.emit(e);
    console.log(e);
  }
}
