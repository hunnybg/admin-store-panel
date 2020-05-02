import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EarningComponent} from './earning.component';
import {DropdownModule} from "ng2-dropdown";
import {FormsModule} from '@angular/forms';
import {RouterModule} from "@angular/router";
import {MyDatePickerModule} from 'mydatepicker';
import {TranslateModule} from 'ng2-translate';
import {FooterModule} from '../../../common/admin/footer/footer.module';
@NgModule({
    imports: [
        CommonModule, DropdownModule, FormsModule, FooterModule, RouterModule, MyDatePickerModule, TranslateModule
    ],
    declarations: [EarningComponent]
})
export class EarningModule {}
