import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewComponent } from './review.component';
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { MyDatePickerModule } from 'mydatepicker';
import { TranslateModule } from 'ng2-translate';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,DropdownModule,FormsModule,RouterModule,MyDatePickerModule,Ng2Bs3ModalModule,FooterModule,TranslateModule
  
  ],
  declarations: [ReviewComponent]
})
export class ReviewModule { }
