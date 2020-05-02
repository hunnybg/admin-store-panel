import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreCheckoutOrderComponent } from './checkout_order.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { MyDatePickerModule } from 'mydatepicker';
import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
  imports: [
    CommonModule, BrowserModule, MyDatePickerModule, FooterModule, TranslateModule, FormsModule, Ng2Bs3ModalModule
  ],
  declarations: [StoreCheckoutOrderComponent]
})
export class StoreCheckoutOrderModule { }
