import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import {RouterModule} from "@angular/router";
import { UiSwitchModule } from 'angular2-ui-switch';
import { FormsModule } from '@angular/forms';
import {DropdownModule} from "ng2-dropdown";
import {BrowserModule} from "@angular/platform-browser";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,RouterModule,DropdownModule,UiSwitchModule,FormsModule,FooterModule,BrowserModule,TranslateModule
  ],
  declarations: [AdminComponent]
})
export class AdminModule { }
