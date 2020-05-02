import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MassNotificationComponent } from './mass_notification.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,BrowserModule,FormsModule,TranslateModule,FooterModule
  ],
  declarations: [MassNotificationComponent]
})
export class MassNotificationModule { }
