import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchisesComponent } from './franchises.component';
import {BrowserModule} from "@angular/platform-browser";
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { UiSwitchModule } from 'angular2-ui-switch';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import {TooltipModule} from "ngx-tooltip";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,DropdownModule,BrowserModule,FormsModule,FooterModule,RouterModule,UiSwitchModule,Ng2Bs3ModalModule,TooltipModule,TranslateModule
  ],
  declarations: [FranchisesComponent]
})
export class FranchisesModule { }
