import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentComponent } from './document.component';
import {BrowserModule} from "@angular/platform-browser";
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,DropdownModule,BrowserModule,FormsModule,RouterModule,FooterModule,TranslateModule
  ],
  declarations: [DocumentComponent]
})
export class DocumentModule { }
