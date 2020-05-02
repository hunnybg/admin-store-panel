import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {TopnavbarComponent} from "./topnavbar.component.ts";
import { TranslateModule } from 'ng2-translate';

@NgModule({
    declarations: [TopnavbarComponent],
    imports     : [BrowserModule,TranslateModule],
    exports     : [TopnavbarComponent],
})

export class TopnavbarModule {}