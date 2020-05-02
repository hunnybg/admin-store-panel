import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppUpdateSettingComponent } from './app_update_setting.component';
import {RouterModule} from "@angular/router";
import { UiSwitchModule } from 'angular2-ui-switch';
import { FormsModule } from '@angular/forms';
import {BrowserModule} from "@angular/platform-browser";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,RouterModule,UiSwitchModule,FooterModule,FormsModule,BrowserModule,TranslateModule
  ],
  declarations: [AppUpdateSettingComponent]
})
export class AppUpdateSettingModule { }
