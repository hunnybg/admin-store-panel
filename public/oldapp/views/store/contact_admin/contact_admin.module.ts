import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FooterModule } from "../../../common/admin/footer/footer.module";
import { TranslateModule } from "ng2-translate";
import { MyDatePickerModule } from "mydatepicker";
import { UiSwitchModule } from "angular2-ui-switch";
import { Ng2Bs3ModalModule } from "ng2-bs3-modal/ng2-bs3-modal";
import { DropdownModule } from "ng2-dropdown";
import { TooltipModule } from "ngx-tooltip";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { ContactAdminComponent } from "./contact_admin.component";

@NgModule({
    imports: [
        CommonModule,
        DropdownModule,
        TooltipModule,
        BrowserModule,
        FormsModule,
        MyDatePickerModule,
        RouterModule, FooterModule,
        UiSwitchModule,
        Ng2Bs3ModalModule,
        TranslateModule
    ],
    declarations: [ContactAdminComponent]
})

export class ContactAdminModule { }
