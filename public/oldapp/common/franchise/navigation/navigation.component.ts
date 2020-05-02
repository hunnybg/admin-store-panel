import { Component, Input} from '@angular/core';
import {Helper} from "../../../views/franchise_helper";
import event = google.maps.event;

declare var jQuery: any;
import { FranchiseProfileComponent } from '../../../views/franchise/profile/profile.component';
@Component({
    selector: 'navigation',
    templateUrl: 'navigation.template.html',
    providers: [Helper]
})

export class NavigationComponent {
    private name : String;
    private image : any;

    menu_title: any;
    constructor(private helper: Helper) {
    }

    ngAfterViewInit() {
        jQuery('#side-menu').metisMenu();
    }


    ngOnInit() {
        let franchise = JSON.parse(localStorage.getItem('franchise'));
        this.menu_title = this.helper.menu_title;
        if(franchise !== null)
        {
            this.name = franchise.name;
            this.image = franchise.image_url;
        }
        this.toggle(event)
    }

    toggle(event){
        this.helper.ngZone.run(() => {
            if (jQuery(window).width() <= 768) {
                jQuery("body").toggleClass("mini-navbar");
                jQuery(".full_menu").toggleClass("full_menu1");
            }

            if (jQuery('#earning_submenu').attr('class') == "nav nav-second-level collapse in") {
                if (event.target !== undefined) {
                    if (event.target.id === "") {
                        jQuery('#click_menu').click();
                    }
                }
            }
        });
    }

    activeRoute(routename: string): boolean{
        return this.helper.router.url.indexOf(routename) > -1;
    }


}