import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddFranchiseStoreComponent } from './add_store.component';
import {BrowserModule} from "@angular/platform-browser";
import { CustomFormsModule } from 'ng2-validation';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';

@NgModule({
    imports: [
        CommonModule,BrowserModule,FormsModule, CustomFormsModule, UiSwitchModule,Ng2Bs3ModalModule , FooterModule ,TranslateModule
    ],
    declarations: [AddFranchiseStoreComponent]
})
export class AddFranchiseStoreModule { }
