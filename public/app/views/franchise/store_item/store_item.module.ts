import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseStoreItemComponent } from './store_item.component';
import {RouterModule} from "@angular/router";
import { UiSwitchModule } from 'angular2-ui-switch';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import {DropdownModule} from "ng2-dropdown";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/franchise/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,RouterModule,FooterModule,UiSwitchModule,BrowserModule,FormsModule,DropdownModule, TranslateModule
  ],
  declarations: [FranchiseStoreItemComponent]
})
export class FranchiseStoreItemModule { }
