import { Injectable } from '@angular/core';
import * as elasticsearch from 'elasticsearch-browser';
import { Client } from 'elasticsearch-browser';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/toPromise';
@Injectable({
  providedIn: 'root'
})
export class ElasticService {
  private client: Client;

  constructor() {
    if (!this.client) {
      this._connect();
    }
  }
  private _connect() {
    this.client = new elasticsearch.Client({
      host: 'localhost:9200',
      log: 'trace'
    });
  }
 
  private connect() {
    this.client = new Client({
      host: 'http://localhost:9200',
      log: 'trace'
    });
  }

  //adding file in elastic
  addToIndex(value): any {
    return this.client.create(value);
  }
  isAvailable(): any {
    return this.client.ping({
      requestTimeout: Infinity,
      body: 'hello working!'
    });
  }

  async getResults(){
    var hitsArray;
    var result = await this.client.search({  
      index: 'vehicle_tracker',
      type: 'vehicles1',
      body:{
        // query: {
        //     match: {
        //         "_id": '_r0wni5czq'
        //     }
        // }
    }
    }).then(response => {
        console.log("--- Response ---");
         console.log(response);
         console.log("--- Hits ---");
        // response.hits.hits.forEach(function(hit){
        //   console.log(hit);
        // });
        hitsArray= response.hits;
        //return response.hits;
  });
  console.log(hitsArray);
  return hitsArray;
  }  

  async getAllReports(){
    var hitsArray;
    // this.client.count({index: 'vehicle_tracker',type: 'vehicles'},function(err,resp,status) {  
    //   console.log("vehicles",resp);
    // });

    // return result;
    var result=await this.getResults();
    return result;
  }

  
}
