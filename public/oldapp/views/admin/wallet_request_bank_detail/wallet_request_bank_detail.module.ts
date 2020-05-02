import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletRequestBankDetailComponent } from './wallet_request_bank_detail.component';
import {RouterModule} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,RouterModule,TranslateModule,FooterModule
  ],
  declarations: [WalletRequestBankDetailComponent]
})
export class WalletRequestBankDetailModule { }
