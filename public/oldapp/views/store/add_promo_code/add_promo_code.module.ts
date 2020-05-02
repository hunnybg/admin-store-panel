import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreAddPromoCodeComponent } from './add_promo_code.component';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from "@angular/platform-browser";
import {RouterModule} from "@angular/router";
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import { UiSwitchModule } from 'angular2-ui-switch';
import { MyDatePickerModule } from 'mydatepicker';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
    imports: [
        CommonModule, BrowserModule,MyDatePickerModule, FooterModule, RouterModule, FormsModule, Ng2Bs3ModalModule,UiSwitchModule,TranslateModule
    ],
    declarations: [StoreAddPromoCodeComponent]
})
export class StoreAddPromoCodeModule { }
