import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { settingComponent } from './setting.component';
import {RouterModule} from "@angular/router";
import { TranslateModule } from 'ng2-translate';

@NgModule({
  imports: [
    CommonModule,RouterModule,TranslateModule
  ],
  declarations: [settingComponent]
})
export class SettingModule { }
