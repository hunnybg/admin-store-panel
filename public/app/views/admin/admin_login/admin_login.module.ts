import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {CommonModule} from '@angular/common';
import {admin_loginComponent} from "./admin_login.component";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';


@NgModule({
    declarations: [admin_loginComponent],
    imports: [BrowserModule, CommonModule, FormsModule,RouterModule ,Ng2Bs3ModalModule,TranslateModule],
})

export class admin_LoginModule {}