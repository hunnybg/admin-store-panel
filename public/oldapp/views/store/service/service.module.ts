import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreServiceComponent} from './service.component';
import {RouterModule} from "@angular/router";
import {DropdownModule} from "ng2-dropdown";
import {FormsModule} from '@angular/forms';
import {TranslateModule} from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';
import { UiSwitchModule } from 'angular2-ui-switch';

@NgModule({
    imports: [
        CommonModule, RouterModule, DropdownModule,FooterModule, UiSwitchModule, FormsModule, TranslateModule
    ],
    declarations: [StoreServiceComponent]
})
export class StoreServiceModule {}
