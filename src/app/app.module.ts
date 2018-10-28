import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { HistoryComponent } from './history/history.component';
import 'rxjs/add/operator/toPromise';
import { HeaderComponent } from './header/header.component';
import {Ng2Webstorage} from 'ngx-webstorage';
import {Routes, RouterModule} from '@angular/router';
const appRoutes: Routes=[
  {path:"upload",component:UploadComponent},
  {path:"history",component:HistoryComponent}
]
@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    HistoryComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    Ng2GoogleChartsModule,
    Ng2Webstorage,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
