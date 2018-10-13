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
  report=[];
  status: string;
  selectedFiles: FileList;
  fileContents;
  currentFileUpload: File;
  pieChartData =  {
    chartType: 'PieChart',
    dataTable: [
      ['Task', 'Hours per Day'],
      ['Work',     11],
      ['Eat',      2],
      ['Commute',  2],
      ['Watch TV', 2],
      ['Sleep',    7]
    ],
    options: {'title': 'Tasks'},
    chartArea: {width: 900, height: 900}
  };
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
      self.fileContents = myReader.result;
      self.xmlToJson(self.fileContents);
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
    var self=this;
    const parser = new DOMParser();
    const xml = parser.parseFromString(fileContents, 'text/xml');
    var xmlFileContents = this.ngxXml2jsonService.xmlToJson(xml);
  //  console.log(xmlFileContents['vehicles'].vehicle[0]);
   var vehicleList=xmlFileContents['vehicles'].vehicle;
   var vehicleDetail={};
   var timeStamp = new Date().toLocaleString();
   vehicleList.forEach(element => {
     console.log(element);
     var powerTrain=self.powerTrainValue(element);
     var wheels=self.wheelsValue(element);     
     var frame=element.frame.material;
     var vehicleName=self.nameOfvehicle(frame,powerTrain,wheels);
     vehicleDetail={
       "name":vehicleName,
       "id":element.id,
       "frame":frame,
       "powerTrain":powerTrain,
       "wheels":wheels,
       "timestamp":timeStamp
     }
     self.report.push(vehicleDetail);
   });
    // this.storeData(xmlFileContents,timeStamp);       
  }
  
  storeData(xmlFileContents,timeStamp){
    this.es.addToIndex({
      index: 'vehicle_tracker',
      type: 'vehicles',
      id:'_' + Math.random().toString(36).substr(2, 9),
      submitted: timeStamp,
      body: {
        xmlFileContents:xmlFileContents,
        submitted: timeStamp
      }
    }).then((result) => {
      console.log(result);
      alert('Document added, see log for more info');
    }, error => {
      alert('Something went wrong, see log for more info');
      console.error(error);
    });
  }
  powerTrainValue(element){
    var powerTrain;
    var powerTrainJson=element.powertrain;
      if(powerTrainJson.hasOwnProperty('human')){
        powerTrain='Human';
      }else if(powerTrainJson.hasOwnProperty('Internal combustion')){
        powerTrain='Internal Combustion';
      }
      else if(powerTrainJson.hasOwnProperty('Bernoulli')){
        powerTrain='Bernoulli';
      }
    return powerTrain;
  }
  wheelsValue(element){
    var wheelsArray=element.wheels.wheel;
    var wheelsValue="";
    var count=0;
    if(!wheelsArray){
      wheelsValue="none";
    }else{
      var wheelsArrayLength=wheelsArray.length;
      wheelsValue=wheelsArrayLength+" "+wheelsArray[wheelsArrayLength-1].material+"(";
      
        wheelsArray.forEach(element => {          
          if(count===wheelsArrayLength-1){
            wheelsValue=wheelsValue+element.position;
          }else{
            count++;
            wheelsValue=wheelsValue+element.position+", ";
          }
        });
        wheelsValue=wheelsValue+")";      
    }    
    return wheelsValue;
  }
  nameOfvehicle(frame,powerTrain,wheels){
    var nameOfvehicle;
    if(wheels === "none" && frame === "plastic"){
      nameOfvehicle="Hang Glider";
    }
    else if(frame === "plastic"){
      nameOfvehicle="Big Wheel";
    }
    else if(frame === "metal" && powerTrain === "Human"){
      nameOfvehicle="Bicycle";
    }
    else if(frame === "metal" && powerTrain === "Internal Combustion"){
      var numberOfWheels=wheels.split(" ");
      if(numberOfWheels[0]===2){
        nameOfvehicle="Motorcycle";
      }else{
        nameOfvehicle="Car";
      }
    }
    return nameOfvehicle;
  }
  onClickMe(){
    document.write(this.fileContents);
  }
}
