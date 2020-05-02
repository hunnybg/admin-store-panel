import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DeliveriesComponent} from './deliveries.component';
import {DropdownModule} from "ng2-dropdown";
import {FormsModule} from '@angular/forms';
import {RouterModule} from "@angular/router";
import {TranslateModule} from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

@NgModule({
    imports: [
        CommonModule, DropdownModule, FormsModule, RouterModule,FooterModule, TranslateModule,Ng2Bs3ModalModule
    ],
    declarations: [DeliveriesComponent]
})
export class DeliveriesModule {}
