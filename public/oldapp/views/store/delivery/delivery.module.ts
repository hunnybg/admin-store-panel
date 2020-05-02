import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreDeliveryComponent } from './delivery.component';
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';


@NgModule({
  imports: [
    CommonModule,DropdownModule,FormsModule,FooterModule,RouterModule,Ng2Bs3ModalModule,TranslateModule
  ],
  declarations: [StoreDeliveryComponent]
})
export class StoreDeliveryModule { }
