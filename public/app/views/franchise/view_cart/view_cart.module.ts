import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseStoreViewCartComponent } from './view_cart.component';
import {RouterModule} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/franchise/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,RouterModule ,FooterModule, TranslateModule
  ],
  declarations: [FranchiseStoreViewCartComponent]
})
export class FranchiseStoreViewCartModule { }
