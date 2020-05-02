import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserModule} from "@angular/platform-browser";

import { AddVehicleComponent } from './add_vehicle.component';

import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { TranslateModule } from 'ng2-translate';
import {ImageCropperModule} from 'ng2-img-cropper';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,BrowserModule,FormsModule,FooterModule, UiSwitchModule,Ng2Bs3ModalModule, ImageCropperModule,TranslateModule
  ],
  declarations: [AddVehicleComponent]
})
export class AddVehicleModule { }
