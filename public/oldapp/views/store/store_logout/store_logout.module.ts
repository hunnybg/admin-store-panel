import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreLogoutComponent } from './store_logout.component';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/store/footer/footer.module';
@NgModule({
  imports: [
    CommonModule,FooterModule,TranslateModule
  ],
  declarations: [StoreLogoutComponent]
})
export class StoreLogoutModule { }
