import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewReferralDetailComponent } from './view_referral_detail.component';
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { MyDatePickerModule } from 'mydatepicker';

import {BrowserModule} from "@angular/platform-browser";
import { TranslateModule } from 'ng2-translate';

import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,DropdownModule,FormsModule,RouterModule,FooterModule,MyDatePickerModule,TranslateModule,BrowserModule
  ],
  declarations: [ViewReferralDetailComponent]
})
export class ViewReferralDetailModule { }
