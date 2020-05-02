import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDetailComponent } from './add_detail.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import {TooltipModule} from "ngx-tooltip";
import { TranslateModule } from 'ng2-translate';

@NgModule({
  imports: [
    CommonModule,BrowserModule,FormsModule, UiSwitchModule,TooltipModule,TranslateModule
  ],
  declarations: [AddDetailComponent]
})
export class AddDetailModule { }
