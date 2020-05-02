import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherSettingComponent } from './other_setting.component';
import {RouterModule} from "@angular/router";
import { UiSwitchModule } from 'angular2-ui-switch';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,RouterModule,UiSwitchModule,FooterModule,FormsModule,TranslateModule
  ],
  declarations: [OtherSettingComponent]
})
export class OtherSettingModule { }
