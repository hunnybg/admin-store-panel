import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminViewCartComponent } from './admin_view_cart.component';
import {RouterModule} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,RouterModule ,FooterModule, TranslateModule
  ],
  declarations: [AdminViewCartComponent]
})
export class AdminViewCartModule { }
