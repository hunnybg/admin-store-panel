import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProductsComponent } from './products.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import {RouterModule,Routes} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';
import {RatingModule} from "ngx-rating";
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import {ImageCropperModule} from 'ng2-img-cropper';
import {DropdownModule} from "ng2-dropdown";
@NgModule({
  imports: [
    CommonModule,RouterModule, BrowserModule, DropdownModule, Ng2Bs3ModalModule, ImageCropperModule, FormsModule,FooterModule, UiSwitchModule , TranslateModule ,RatingModule
  ],
  declarations: [AdminProductsComponent]
})
export class AdminProductsModule { }
