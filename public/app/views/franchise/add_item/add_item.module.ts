import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddFranchiseItemComponent } from './add_item.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/franchise/footer/footer.module';

@NgModule({
    imports: [
        CommonModule,BrowserModule,FormsModule, UiSwitchModule,Ng2Bs3ModalModule , FooterModule ,TranslateModule
    ],
    declarations: [AddFranchiseItemComponent]
})
export class AddFranchiseItemModule { }
