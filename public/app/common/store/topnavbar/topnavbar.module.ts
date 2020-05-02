import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {TopnavbarComponent} from "./topnavbar.component";
import {RouterModule} from "@angular/router";
import { PushNotificationComponent } from 'ng2-notifications/ng2-notifications';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import {DropdownModule} from "ng2-dropdown";

@NgModule({
    declarations: [TopnavbarComponent, PushNotificationComponent],
    imports     : [BrowserModule,RouterModule,Ng2Bs3ModalModule, DropdownModule ,TranslateModule],
    exports     : [TopnavbarComponent],
})

export class TopnavbarModule {}
