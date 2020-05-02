import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseStoreViewOrderComponent } from './view_order.component';
import {RouterModule} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/franchise/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,RouterModule ,FooterModule, TranslateModule
  ],
  declarations: [FranchiseStoreViewOrderComponent]
})
export class FranchiseStoreViewOrderModule { }
