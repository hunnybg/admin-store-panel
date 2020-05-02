import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProviderVehicleComponent } from './provider_vehicle.component';
import {DropdownModule} from "ng2-dropdown";
import { FormsModule } from '@angular/forms';
import {RouterModule} from "@angular/router";
import { UiSwitchModule } from 'angular2-ui-switch';
import { MyDatePickerModule } from 'mydatepicker';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/admin/footer/footer.module';

@NgModule({
  imports: [
    CommonModule,DropdownModule,UiSwitchModule,FormsModule,FooterModule,RouterModule,MyDatePickerModule,TranslateModule
  ],
  declarations: [ProviderVehicleComponent]
})
export class ProviderVehicleModule { }
