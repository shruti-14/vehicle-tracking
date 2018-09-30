import { Injectable } from '@angular/core';
import { Client } from 'elasticsearch';
@Injectable({
  providedIn: 'root'
})
export class ElasticService {
  private client: Client;

  constructor() {
    if (!this.client) {
      this.connect();
    }
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
}
