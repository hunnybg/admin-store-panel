import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreEditOrderComponent } from './edit_order.component';
import {RouterModule} from "@angular/router";
import { UiSwitchModule } from 'angular2-ui-switch';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import {DropdownModule} from "ng2-dropdown";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

@NgModule({
  imports: [
    CommonModule,RouterModule,FooterModule,UiSwitchModule,BrowserModule,FormsModule,DropdownModule, TranslateModule, Ng2Bs3ModalModule
  ],
  declarations: [StoreEditOrderComponent]
})
export class StoreEditOrderModule { }
