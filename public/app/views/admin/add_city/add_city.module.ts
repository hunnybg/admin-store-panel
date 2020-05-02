import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { AddCityComponent } from './add_city.component';
import {GooglePlaceModule} from 'ng2-google-place-autocomplete';
import { UiSwitchModule } from 'angular2-ui-switch';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';
import {TooltipModule} from "ngx-tooltip";
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';

@NgModule({
  imports: [
   CommonModule,BrowserModule,FormsModule, UiSwitchModule,FooterModule, GooglePlaceModule,TranslateModule, TooltipModule, Ng2Bs3ModalModule
  ],
  declarations: [AddCityComponent]
})
export class AddCityModule {}
