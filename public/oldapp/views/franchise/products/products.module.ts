import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseProductsComponent } from './products.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import {RouterModule,Routes} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/franchise/footer/footer.module';
import {RatingModule} from "ngx-rating";
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

@NgModule({
  imports: [
    CommonModule,RouterModule,BrowserModule, Ng2Bs3ModalModule, FormsModule,FooterModule, UiSwitchModule , TranslateModule ,RatingModule
  ],
  declarations: [FranchiseProductsComponent]
})
export class FranchiseProductsModule { }
