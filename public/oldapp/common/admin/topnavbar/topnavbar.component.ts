import {Component} from '@angular/core';
import {smoothlyMenu} from '../../../app.helpers';
declare var jQuery: any;
import {TranslateService} from 'ng2-translate';

import {Helper} from "../../../views/helper";
import {Http, Response} from '@angular/http';

import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Component({
    selector: 'topnavbar',
    templateUrl: 'topnavbar.template.html',
    providers: [Helper]
})
export class TopnavbarComponent {
    admin_id: String;
    admin_token: String;

    constructor(public helper: Helper) {
        helper.trans.addLangs(['sp', 'fr', 'hi', 'cn', 'en']);

        var language = JSON.parse(localStorage.getItem('admin_language'));
        if (language == '' || language == undefined) {
            language = 'en'
        }
        helper.trans.setDefaultLang('en');
        helper.trans.use(language);

        const browserLang = helper.trans.getBrowserLang();
    };

    toggleNavigation(): void {

        // if(jQuery(window).width()>768){
                jQuery("body").toggleClass("mini-navbar");
                jQuery(".full_menu").toggleClass("full_menu1");
                // jQuery("nav").toggleClass("navbar");
                // jQuery("nav").toggleClass("navbar1");
                // jQuery("nav span a").toggleClass("minimalize-styl-2");
                // jQuery("nav span a").toggleClass("minimalize-styl-3");
                
        // }
        // else
        // {
        //     jQuery("body").toggleClass("body1");
        //     jQuery("body1").toggleClass("body");
        // }
        smoothlyMenu();

    }
    ngOnInit() {
//        this.admin_id = localStorage.getItem('admin_id');
//        this.admin_token = localStorage.getItem('admin_token');
//
//        this.helper.http.post('/admin/check_auth', {admin_id: this.admin_id, admin_token: this.admin_token}).pipe(map((res_data: Response) => res_data.json())).subscribe(data => {
//            console.log("Response ");
//            console.log(data);
//            if (data.success == true) {
//
//            } else {
//                this.helper.router.navigate(['admin/login']);
//            }
//        })
    }
    logout() {
        localStorage.setItem('admin_id', "");
        localStorage.setItem('admin_token', "");
        this.helper.router.navigate(['/admin/login']);
    }

    back(){
        this.helper.router.navigate([this.helper.router_id.admin.back_url]);
    }


}
