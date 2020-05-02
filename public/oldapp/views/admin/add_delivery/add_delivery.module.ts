import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDeliveryComponent } from './add_delivery.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { TranslateModule } from 'ng2-translate';
import {ImageCropperModule} from 'ng2-img-cropper';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,BrowserModule,FooterModule,FormsModule,Ng2Bs3ModalModule, ImageCropperModule, UiSwitchModule,TranslateModule
  ],
  declarations: [AddDeliveryComponent]
})
export class AddDeliveryModule { }
