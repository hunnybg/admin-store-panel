import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewInvoiceComponent } from './view_invoice.component';
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,RouterModule
  ],
  declarations: [ViewInvoiceComponent]
})
export class ViewInvoiceModule { }
