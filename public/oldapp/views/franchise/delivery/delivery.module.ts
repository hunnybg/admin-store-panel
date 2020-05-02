import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseStoreDeliveryComponent } from './delivery.component';
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
//import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/franchise/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,DropdownModule,FormsModule,FooterModule,RouterModule,TranslateModule
  ],
  declarations: [FranchiseStoreDeliveryComponent]
})
export class FranchiseStoreDeliveryModule { }
