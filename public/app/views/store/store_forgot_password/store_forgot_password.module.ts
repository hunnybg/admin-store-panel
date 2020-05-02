import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreForgotPasswordComponent } from './store_forgot_password.component';
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { TranslateModule } from 'ng2-translate';
import { CustomFormsModule } from 'ng2-validation'
import { FooterModule } from '../../../common/store/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,FormsModule,FooterModule,CustomFormsModule,RouterModule,TranslateModule
  ],
  declarations: [StoreForgotPasswordComponent]
})
export class StoreForgotPasswordModule { }
