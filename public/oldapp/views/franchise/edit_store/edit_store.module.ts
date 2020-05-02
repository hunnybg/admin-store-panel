import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditFranchiseStoreComponent } from './edit_store.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { CustomFormsModule } from 'ng2-validation'
import { FooterModule } from '../../../common/admin/footer/footer.module';
import { ChartsModule } from 'ng2-charts';
@NgModule({
  imports: [
    CommonModule,BrowserModule,FormsModule,FooterModule, ChartsModule, CustomFormsModule , UiSwitchModule , Ng2Bs3ModalModule,TranslateModule
    ],
  declarations: [EditFranchiseStoreComponent]
})
export class EditFranchiseStoreModule { }
