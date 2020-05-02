import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorePromoCodeComponent } from './promo_code.component';
import {BrowserModule} from "@angular/platform-browser";
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';
import { UiSwitchModule } from 'angular2-ui-switch';

@NgModule({
  imports: [
    CommonModule,DropdownModule,BrowserModule,FormsModule,FooterModule,RouterModule,TranslateModule,UiSwitchModule
  ],
  declarations: [StorePromoCodeComponent]
})
export class StorePromoCodeModule { }
