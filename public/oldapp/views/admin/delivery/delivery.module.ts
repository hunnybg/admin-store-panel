import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryComponent } from './delivery.component';

import {RouterModule} from "@angular/router";
import { UiSwitchModule } from 'angular2-ui-switch';
import { FormsModule } from '@angular/forms';
import {DropdownModule} from "ng2-dropdown";
import {BrowserModule} from "@angular/platform-browser";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,RouterModule,DropdownModule,UiSwitchModule,FooterModule,FormsModule,BrowserModule,TranslateModule
  ],
  declarations: [DeliveryComponent]
})
export class DeliveryModule { }
