import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDocumentComponent } from './add_document.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { TranslateModule } from 'ng2-translate';
@NgModule({
  imports: [
    CommonModule,BrowserModule,FormsModule, UiSwitchModule,TranslateModule
  ],
  declarations: [AddDocumentComponent]
})
export class AddDocumentModule { }
