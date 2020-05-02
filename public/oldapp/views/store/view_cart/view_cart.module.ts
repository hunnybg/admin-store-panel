import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreViewCartComponent } from './view_cart.component';
import {RouterModule} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,RouterModule ,FooterModule, TranslateModule
  ],
  declarations: [StoreViewCartComponent]
})
export class StoreViewCartModule { }
