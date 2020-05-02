import { Component, Input , Output , EventEmitter} from '@angular/core';

import { EditItemComponent } from '../../../views/store/edit_item/edit_item.component';

declare var jQuery:any;

@Component({
    selector: 'store_blank',
    templateUrl: 'store_blank.template.html',
})
export class store_blankComponent {

	

    ngAfterViewInit() {
        jQuery('body').addClass('gray-bg');
    }

    ngOnDestroy() {
        jQuery('body').removeClass('gray-bg');
    }
}