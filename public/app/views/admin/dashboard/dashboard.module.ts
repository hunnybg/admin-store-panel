import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { ChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { FooterModule } from '../../../common/admin/footer/footer.module';
import { MyDatePickerModule } from 'mydatepicker';
import { TranslateModule } from 'ng2-translate';

@NgModule({
  imports: [
    CommonModule , ChartsModule , FormsModule , FooterModule, MyDatePickerModule, TranslateModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
