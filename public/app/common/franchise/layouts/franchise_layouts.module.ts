import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {BrowserModule} from "@angular/platform-browser";

import {franchise_blankComponent} from "./franchise_blank.component";
import {franchise_basicComponent} from "./franchise_basic.component";

import {NavigationModule} from "../navigation/navigation.module";
import {TopnavbarModule} from "../topnavbar/topnavbar.module";
import {FooterModule} from "../footer/footer.module";



@NgModule({
    declarations: [franchise_blankComponent,franchise_basicComponent],
    imports     : [BrowserModule, RouterModule, NavigationModule,  TopnavbarModule, FooterModule],
    exports     : [franchise_blankComponent,franchise_basicComponent]
})

export class FranchiseLayoutsModule {}
