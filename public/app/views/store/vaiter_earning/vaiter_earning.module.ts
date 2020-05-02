import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VaiterEarningComponent } from './vaiter_earning.component';
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { MyDatePickerModule } from 'mydatepicker';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';
import { MomentModule } from 'angular2-moment';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,ChartsModule,DropdownModule,FormsModule,FooterModule,RouterModule,MyDatePickerModule,TranslateModule,MomentModule
  ],
  declarations: [VaiterEarningComponent]
})
export class VaiterEarningModule { }
