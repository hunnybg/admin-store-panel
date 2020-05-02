import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSettingComponent } from './setting.component';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { TranslateModule } from 'ng2-translate';
import { CustomFormsModule } from 'ng2-validation'
import { FooterModule } from '../../../common/admin/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,FormsModule, CustomFormsModule ,FooterModule, UiSwitchModule, Ng2Bs3ModalModule , TranslateModule
  ],
  declarations: [AdminSettingComponent]
})
export class AdminstoreSettingModule { }
