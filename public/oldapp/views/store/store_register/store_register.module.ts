import {NgModule} from "@angular/core";
import { CommonModule } from '@angular/common';
import {BrowserModule} from "@angular/platform-browser";
import {store_registerComponent} from "./store_register.component";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { CustomFormsModule } from 'ng2-validation'
    import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
    import {GooglePlaceModule} from 'ng2-google-place-autocomplete';
    import { TranslateModule } from 'ng2-translate';
   import { FooterModule } from '../../../common/store/footer/footer.module';
import { FacebookModule } from 'ngx-facebook';

@NgModule({
    declarations: [store_registerComponent],
    imports     : [CommonModule, CustomFormsModule, FacebookModule, FooterModule, BrowserModule,TranslateModule, RouterModule, FormsModule,Ng2Bs3ModalModule,GooglePlaceModule],
})

export class store_RegisterModule {}