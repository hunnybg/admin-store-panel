import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewDocumentComponent } from './view_document.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { MyDatePickerModule } from 'mydatepicker';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,BrowserModule,FormsModule ,FooterModule, MyDatePickerModule,TranslateModule
  ],
  declarations: [ViewDocumentComponent]
})
export class ViewDocumentModule { }
