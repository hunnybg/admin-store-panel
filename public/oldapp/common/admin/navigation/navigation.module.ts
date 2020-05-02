import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {RouterModule} from "@angular/router";
import {NavigationComponent} from "./navigation.component.ts";
import { TranslateModule } from 'ng2-translate';

@NgModule({
    declarations: [NavigationComponent],
    imports     : [BrowserModule, RouterModule,TranslateModule],
    exports     : [NavigationComponent],
})

export class NavigationModule {}