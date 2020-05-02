import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from '@angular/forms';
import {AddCountryComponent} from './add_country.component';
import {UiSwitchModule} from 'angular2-ui-switch';
import {TooltipModule} from "ngx-tooltip";
import {TranslateModule} from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
    imports: [
        CommonModule, BrowserModule, FormsModule,FooterModule, UiSwitchModule, TooltipModule, TranslateModule
    ],
    declarations: [AddCountryComponent]
})
export class AddCountryModule {}
