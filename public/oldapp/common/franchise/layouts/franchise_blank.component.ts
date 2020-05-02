import { Component, Input , Output , EventEmitter} from '@angular/core';

declare var jQuery:any;

@Component({
    selector: 'franchise_blank',
    templateUrl: 'franchise_blank.template.html',
})
export class franchise_blankComponent {

	

    ngAfterViewInit() {
        jQuery('body').addClass('gray-bg');
    }

    ngOnDestroy() {
        jQuery('body').removeClass('gray-bg');
    }
}