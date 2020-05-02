import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditItemComponent } from './edit_item.component';

import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { SwiperModule } from 'angular2-useful-swiper';
import { TranslateModule } from 'ng2-translate';
import {ImageCropperModule} from 'ng2-img-cropper';
import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
    declarations: [ EditItemComponent],
    imports: [
        CommonModule,BrowserModule,FormsModule, ImageCropperModule, UiSwitchModule,Ng2Bs3ModalModule,TranslateModule , FooterModule ,SwiperModule
    ],

})
export class EditItemModule { }
