import { Injectable } from '@angular/core';
import * as elasticsearch from 'elasticsearch-browser';
import { Client } from 'elasticsearch-browser';
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
  countDocuments(){
    // this.client.count({index: 'vehicle_tracker',type: 'vehicles'},function(err,resp,status) {  
    //   console.log("vehicles",resp);
    // });
    this.client.search({  
      index: 'vehicle_tracker',
      type: 'vehicles',
      body: {
        query: {
          match: { "submitted": "13/10/2018, 19:02:32" }
        },
      }
    },function (error, response,status) {
        if (error){
          console.log("search error: "+error)
        }
        else {
          console.log("--- Response ---");
          // console.log(response);
          console.log("--- Hits ---");
          response.hits.hits.forEach(function(hit){
            console.log(hit);
          })
        }
    });
  }
}
