import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserModule} from "@angular/platform-browser";

import { AllCityComponent } from './all-city.component';
import { FormsModule } from '@angular/forms';
import {TranslateModule} from 'ng2-translate';
import {FooterModule} from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
      CommonModule, BrowserModule, FormsModule, TranslateModule, FooterModule
  ],
  declarations: [AllCityComponent]
})
export class AllCityModule { }
