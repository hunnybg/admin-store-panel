import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {store_loginComponent} from "./store_login.component";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { AuthModule } from 'angular2-auth';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { CustomFormsModule } from 'ng2-validation';
import { FooterModule } from '../../../common/store/footer/footer.module';
import { FacebookModule } from 'ngx-facebook';

@NgModule({
    declarations: [store_loginComponent],
    imports     : [BrowserModule, RouterModule, FacebookModule, FooterModule, Ng2Bs3ModalModule, FormsModule, CustomFormsModule, AuthModule.forRoot(),TranslateModule],
})

export class store_LoginModule {}
