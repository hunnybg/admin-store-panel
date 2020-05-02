import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FranchiseStoreTrackDeliveryManComponent } from './track_delivery_man.component';
import { TranslateModule } from 'ng2-translate';
import { FooterModule } from '../../../common/franchise/footer/footer.module';
import { AgmCoreModule } from "angular2-google-maps/core";

@NgModule({
  imports: [
    AgmCoreModule.forRoot({
        apiKey: "AIzaSyBdp63UjqKdWrgjhYRqombTjTLv-dIczNI"
    }),
    CommonModule,FooterModule,TranslateModule
  ],
  declarations: [FranchiseStoreTrackDeliveryManComponent]
})
export class FranchiseStoreTrackDeliveryManModule { }
