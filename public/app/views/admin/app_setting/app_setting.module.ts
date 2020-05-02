import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSettingComponent } from './app_setting.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { TranslateModule } from 'ng2-translate';

@NgModule({
  imports: [
    CommonModule,BrowserModule,FormsModule,TranslateModule
  ],
  declarations: [AppSettingComponent]
})
export class AppSettingModule { }
