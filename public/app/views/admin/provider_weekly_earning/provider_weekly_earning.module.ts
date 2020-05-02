import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderWeeklyEarningComponent } from './provider_weekly_earning.component';
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { MyDatePickerModule } from 'mydatepicker';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';
import { MomentModule } from 'angular2-moment';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule, DropdownModule, MomentModule, FormsModule,RouterModule,FooterModule,MyDatePickerModule,Ng2Bs3ModalModule,TranslateModule, ChartsModule
    
  ],
  declarations: [ProviderWeeklyEarningComponent]
})
export class ProviderWeeklyEarningModule { }
