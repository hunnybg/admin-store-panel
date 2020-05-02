import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditFranchiseItemComponent } from './edit_item.component';

import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SwiperModule } from 'angular2-useful-swiper';
import { TranslateModule } from 'ng2-translate';

import { FooterModule } from '../../../common/franchise/footer/footer.module';

@NgModule({
    declarations: [ EditFranchiseItemComponent],
    imports: [
        CommonModule,BrowserModule,FormsModule, UiSwitchModule,Ng2Bs3ModalModule,TranslateModule , FooterModule ,SwiperModule
    ],

})
export class EditFranchiseItemModule { }
