import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewFranchiseStoreDetailComponent } from './view_store_detail.component';
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,RouterModule
  ],
  declarations: [ViewFranchiseStoreDetailComponent]
})
export class ViewFranchiseStoreDetailModule { }
