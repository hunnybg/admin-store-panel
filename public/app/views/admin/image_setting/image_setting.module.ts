import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageSettingComponent } from './image_setting.component';
import {DropdownModule} from "ng2-dropdown";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from '@angular/forms';
import {GooglePlaceModule} from 'ng2-google-place-autocomplete';
import {TranslateModule} from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';
@NgModule({
  imports: [
    CommonModule, DropdownModule, BrowserModule,FooterModule, FormsModule, GooglePlaceModule, TranslateModule
    ],
  declarations: [ImageSettingComponent]
})
export class ImageSettingModule { }
