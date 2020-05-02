import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreHistoryComponent } from './history.component';
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { MyDatePickerModule } from 'mydatepicker';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';
import { MomentModule } from 'angular2-moment';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import {RatingModule} from "ngx-rating";

@NgModule({
  imports: [
    CommonModule, DropdownModule, FormsModule, FooterModule, RatingModule, RouterModule ,MyDatePickerModule, Ng2Bs3ModalModule , TranslateModule, MomentModule
  ],
  declarations: [StoreHistoryComponent]
})
export class StoreHistoryModule { }
