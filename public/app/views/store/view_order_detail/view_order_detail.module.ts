import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreViewOrderDetailComponent } from './view_order_detail.component';
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,RouterModule
  ],
  declarations: [StoreViewOrderDetailComponent]
})
export class StoreViewOrderDetailModule { }
