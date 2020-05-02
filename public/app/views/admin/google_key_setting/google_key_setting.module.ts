import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleKeySettingComponent } from './google_key_setting.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,BrowserModule,FormsModule,FooterModule, UiSwitchModule,TranslateModule
  ],
  declarations: [GoogleKeySettingComponent]
})
export class GoogleKeySettingModule { }
