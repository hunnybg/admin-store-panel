import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditFranchiseProductComponent } from './edit_product.component';
import {BrowserModule} from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'angular2-ui-switch';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';
import {ImageCropperModule} from 'ng2-img-cropper';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

@NgModule({
  imports: [
    CommonModule,BrowserModule,ImageCropperModule, Ng2Bs3ModalModule, FormsModule,FooterModule, UiSwitchModule,TranslateModule
  ],
  declarations: [EditFranchiseProductComponent]
})
export class EditFranchiseProductModule { }
