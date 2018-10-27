import { Component, OnInit, ChangeDetectorRef, Input,OnChanges } from '@angular/core';

// import { HttpClient, HttpResponse, HttpEventType } from '@angular/common/http';
import { UploadService } from '../upload.service';
import { NgxXml2jsonService } from 'ngx-xml2json';
import {ElasticService} from '../elastic.service';
import { element } from 'protractor';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
  providers:[UploadService,ElasticService]
})
export class UploadComponent implements OnInit,OnChanges {
  isConnected = false;
  report=[];
  status: string;
  selectedFiles: FileList;
  fileContents;
  @Input() historyClickedFileData:{fileName:string,timeStamp:string,xmlFileContents:Object}
  pieData=[
    ['Vehicles', 'Number of vehicles']
  ];
  currentFileUpload: File;
  pieChartData;
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
  ngOnChanges(changes) {
    if (changes['historyClickedFileData']&& Object.keys(changes.historyClickedFileData.currentValue).length !== 0 && changes.historyClickedFileData.currentValue.constructor === Object) {
      // this.data = 'Hello ' + this.name;
      console.log(this.historyClickedFileData);
      var xmlFileContents=this.historyClickedFileData.xmlFileContents;
      var timeStamp=this.historyClickedFileData.timeStamp;
      var fileName=this.historyClickedFileData.fileName;
      this.reportGeneration(xmlFileContents,timeStamp,fileName);
    }
  }
  selectFile(event) {
    this.selectedFiles = event.target.files;
    this.fileReader(event.target);
  }
  fileReader(target){
    var self=this;
    var file= target.files[0];
    var fileName=file.name;
    var myReader:FileReader = new FileReader();
    myReader.onloadend=function(e){
      self.fileContents = myReader.result;
      self.xmlToJson(self.fileContents,fileName);
    }
    myReader.readAsText(file);
  } 
  xmlToJson(fileContents,fileName){
    var self=this;
    const parser = new DOMParser();
    const xml = parser.parseFromString(fileContents, 'text/xml');
    var xmlFileContents = this.ngxXml2jsonService.xmlToJson(xml);
    var timeStamp = new Date().toLocaleString();
    self.reportGeneration(xmlFileContents,timeStamp,fileName);
 
    this.storeData(xmlFileContents,timeStamp,fileName);       
  }

reportGeneration(xmlFileContents,timeStamp,fileName){
  var self=this;
  self.report=[];
  self.pieData=[
    ['Vehicles', 'Number of vehicles']
  ]
  var vehicleList=xmlFileContents['vehicles'].vehicle;
  var vehicleDetail={};
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
      "timestamp":timeStamp,
      "fileName":fileName
    }
    self.report.push(vehicleDetail);
  });
  console.log(self.report);
  var answer=[];
  var setOfVehicles = new Set([]);
  self.report.forEach(element=>{
   setOfVehicles.add(element.name);  
 });
 setOfVehicles.forEach(setelement=>{
   var count=0;
   self.report.forEach(e=>{
     if(e.name===setelement){
       count++;
     }
   });  
   answer.push([setelement,count]);
 });

  answer.forEach(element=>{
   self.pieData.push(element);
  });
  console.log(self.pieData);
  self.pieChartData ={
   chartType: 'PieChart',
   dataTable: this.pieData,
   options: {'title': 'Tasks',
   'width': 800,
   'height': 640,
   colors: ['#e0440e', '#e6693e', '#ec8f6e', '#f3b49f', '#f6c7b6'],
   is3D: true}
   
 };
}  
storeData(xmlFileContents,timeStamp,fileName){
    this.es.addToIndex({
      index: 'vehicle_tracker',
      type: 'vehicles',
      id:'_' + Math.random().toString(36).substr(2, 9),
      submitted: timeStamp,
      body: {
        xmlFileContents:xmlFileContents,
        submitted: timeStamp,
        fileName:fileName
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
  getHistoryList(){    
    console.log("History button listening");
    this.es.getAllReports();
    
  }
}
