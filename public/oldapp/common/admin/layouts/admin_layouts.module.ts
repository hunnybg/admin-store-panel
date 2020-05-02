import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {BrowserModule} from "@angular/platform-browser";

import {admin_blankComponent} from "./admin_blank.component.ts";
import {admin_basicComponent} from "./admin_basic.component.ts";

import {NavigationModule} from "../navigation/navigation.module";
import {TopnavbarModule} from "../topnavbar/topnavbar.module";
import {FooterModule} from "../footer/footer.module";

@NgModule({
    declarations: [admin_blankComponent,admin_basicComponent],
    imports     : [BrowserModule, RouterModule, NavigationModule, TopnavbarModule, FooterModule],
    exports     : [admin_blankComponent,admin_basicComponent]
})

export class AdminLayoutsModule {}
