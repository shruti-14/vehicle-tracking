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
}
