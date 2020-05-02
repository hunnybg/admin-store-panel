import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {BrowserModule} from "@angular/platform-browser";

import {store_blankComponent} from "./store_blank.component";
import {store_basicComponent} from "./store_basic.component";

import {NavigationModule} from "../navigation/navigation.module";
import {TopnavbarModule} from "../topnavbar/topnavbar.module";
import {FooterModule} from "../footer/footer.module";



@NgModule({
    declarations: [store_blankComponent,store_basicComponent],
    imports     : [BrowserModule, RouterModule, NavigationModule,  TopnavbarModule, FooterModule],
    exports     : [store_blankComponent,store_basicComponent]
})

export class StoreLayoutsModule {}
