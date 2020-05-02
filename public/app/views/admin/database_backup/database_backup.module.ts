import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseBackupComponent } from './database_backup.component';
import {RouterModule} from "@angular/router";
import { UiSwitchModule } from 'angular2-ui-switch';
import { FormsModule } from '@angular/forms';
import {DropdownModule} from "ng2-dropdown";
import {BrowserModule} from "@angular/platform-browser";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';
import { MyDatePickerModule } from 'mydatepicker';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

@NgModule({
  imports: [
    CommonModule,RouterModule,MyDatePickerModule,Ng2Bs3ModalModule,DropdownModule,UiSwitchModule,FormsModule,FooterModule,BrowserModule,TranslateModule
  ],
  declarations: [DatabaseBackupComponent]
})
export class DatabaseBackupModule { }
