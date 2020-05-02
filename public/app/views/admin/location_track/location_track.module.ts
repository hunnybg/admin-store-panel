import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LocationTrackComponent} from './location_track.component';
import {FormsModule} from '@angular/forms';
import {TranslateModule} from 'ng2-translate';



@NgModule({
    imports: [

        CommonModule,
        FormsModule, TranslateModule
    ],
    declarations: [LocationTrackComponent]
})
export class LocationTrackModule {}
