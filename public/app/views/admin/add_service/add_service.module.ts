import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddServiceComponent } from './add_service.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import {TooltipModule} from "ngx-tooltip";
import { TranslateModule } from 'ng2-translate';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';

@NgModule({
  imports: [
    CommonModule,BrowserModule,FormsModule, UiSwitchModule,TooltipModule,TranslateModule,Ng2Bs3ModalModule
  ],
  declarations: [AddServiceComponent]
})
export class AddServiceModule { }
