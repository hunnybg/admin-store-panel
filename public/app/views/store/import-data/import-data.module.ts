import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportDataComponent } from './import-data.component';
import { FooterModule } from '../../../common/store/footer/footer.module';
import { TranslateModule } from 'ng2-translate';

@NgModule({
  imports: [
    CommonModule, FooterModule, TranslateModule
  ],
  declarations: [ImportDataComponent]
})
export class ImportDataModule { }
