import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddAdvertiseComponent } from './add_advertise.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import {RouterModule,Routes} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { MyDatePickerModule } from 'mydatepicker';
import { FooterModule } from '../../../common/admin/footer/footer.module';

import {ImageCropperModule} from 'ng2-img-cropper';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';


@NgModule({
  imports: [
    CommonModule,RouterModule,BrowserModule,MyDatePickerModule,Ng2Bs3ModalModule, ImageCropperModule,FormsModule,FooterModule, UiSwitchModule , TranslateModule 
  ],
  declarations: [AddAdvertiseComponent]
})
export class AddAdvertiseModule { }
