import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {franchise_loginComponent} from "./franchise_login.component";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { AuthModule } from 'angular2-auth';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { CustomFormsModule } from 'ng2-validation';
import { FooterModule } from '../../../common/franchise/footer/footer.module';
import { FacebookModule } from 'ngx-facebook';

@NgModule({
    declarations: [franchise_loginComponent],
    imports     : [BrowserModule, RouterModule, FacebookModule, FooterModule, Ng2Bs3ModalModule, FormsModule, CustomFormsModule, AuthModule.forRoot(),TranslateModule],
})

export class franchise_LoginModule {}
