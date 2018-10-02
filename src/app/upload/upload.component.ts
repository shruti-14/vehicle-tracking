import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

// import { HttpClient, HttpResponse, HttpEventType } from '@angular/common/http';
import { UploadService } from '../upload.service';
import { NgxXml2jsonService } from 'ngx-xml2json';
import {ElasticService} from '../elastic.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  providers:[UploadService,ElasticService]
})
export class UploadComponent implements OnInit {
  isConnected = false;
  status: string;
  selectedFiles: FileList;
  currentFileUpload: File;
  constructor(private uploadService: UploadService,private ngxXml2jsonService: NgxXml2jsonService,private es: ElasticService,private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.es.isAvailable().then(() => {
      this.status = 'OK';
      this.isConnected = true;
    }, error => {
      this.status = 'ERROR';
      this.isConnected = false;
      console.error('Server is down', error);
    }).then(() => {
      this.cd.detectChanges();
    });
  }
  
  selectFile(event) {
    this.selectedFiles = event.target.files;
    this.fileReader(event.target);
  }

  fileReader(target){
    var self=this;
    var file= target.files[0];
    var myReader:FileReader = new FileReader();
    myReader.onloadend=function(e){
      var fileContents = myReader.result;
      // console.log(fileContents);
   //self.xmlToJson(fileContents);
    }
    myReader.readAsText(file);
  }
  // upload() {
  //   this.currentFileUpload = this.selectedFiles.item(0);
  //   this.uploadService.pushFileToStorage(this.currentFileUpload).subscribe(event => {
  //    if (event instanceof HttpResponse) {
  //       console.log('File is completely uploaded!');
  //     }
  //   });
  //   this.selectedFiles = undefined;
  // }
 
  xmlToJson(fileContents){
    const parser = new DOMParser();
    const xml = parser.parseFromString(fileContents, 'text/xml');
    const xmlFileContents = this.ngxXml2jsonService.xmlToJson(xml);
    console.log(xmlFileContents);
    this.es.addToIndex({
      index: 'vehicle_tracker',
      type: 'vehicles',
      id:1,
      body: {
        xmlFileContents:xmlFileContents,
        submitted: new Date().toLocaleString()
      }
    }).then((result) => {
      console.log(result);
      alert('Document added, see log for more info');
    }, error => {
      alert('Something went wrong, see log for more info');
      console.error(error);
    });
  }
  

}
