import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreProviderComponent } from './provider.component';

import {TooltipModule} from "ngx-tooltip";
import {BrowserModule} from "@angular/platform-browser";
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { UiSwitchModule } from 'angular2-ui-switch';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';
import {MyDatePickerModule} from "mydatepicker";

@NgModule({
  imports: [
    CommonModule,DropdownModule,TooltipModule,BrowserModule,FormsModule,MyDatePickerModule,RouterModule,FooterModule,UiSwitchModule,Ng2Bs3ModalModule,TranslateModule
  ],
  declarations: [StoreProviderComponent]
})
export class StoreProviderModule { }
