import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsComponent } from './payments.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { CustomFormsModule } from 'ng2-validation'
import { FooterModule } from '../../../common/store/footer/footer.module';
import { NavigationModule } from '../../../common/store/navigation/navigation.module';
import { ChartsModule } from 'ng2-charts';
import { MyDatePickerModule } from 'mydatepicker';

@NgModule({
    imports: [
      CommonModule, MyDatePickerModule, BrowserModule,FormsModule,FooterModule, NavigationModule, ChartsModule, CustomFormsModule , UiSwitchModule , Ng2Bs3ModalModule,TranslateModule
    ],
    declarations: [PaymentsComponent]
})
export class PaymentsModule { }
