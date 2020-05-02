import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {TopnavbarComponent} from "./topnavbar.component";
import {RouterModule} from "@angular/router";
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';


@NgModule({
    declarations: [TopnavbarComponent],
    imports     : [BrowserModule,RouterModule,Ng2Bs3ModalModule  ,TranslateModule],
    exports     : [TopnavbarComponent],
})

export class TopnavbarModule {}
