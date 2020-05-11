import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Http, Response} from '@angular/http';
//import {Helper} from "../../../views/helper";
import {Helper} from "../../../views/helper";
import {map} from 'rxjs/operators';
declare var jQuery: any;
//import {title, button, heading_title, menu_title, sub_menu_title} from '../../../admin_panel_string';

@Component({
    selector: 'navigation',
    templateUrl: 'navigation.template.html',
    providers: [Helper]
})

export class NavigationComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    admin_id: String;
    admin_token: String;
    app_name:String;
    menu_title: any;
    sub_menu_title: any;
    showMenu: boolean = false;
    
    showSubMenu:boolean = false;
    
    admin_type : number = null;
    urls_array: any[] = [];
    containsAll: any;
    
    //edit_button: Boolean;

    constructor(private router: Router, private helper: Helper) {}


    ngAfterViewInit() {
        jQuery('#side-menu').metisMenu();
    }
    ngOnInit() {
        
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.sub_menu_title = this.helper.sub_menu_title;
        this.menu_title = this.helper.menu_title;
        
        this.toggle();
        this.admin_id = localStorage.getItem('admin_id');
        this.admin_token = localStorage.getItem('admin_token');
        
        this.helper.http.post('/api/admin/get_setting_detail', {}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.app_name = res_data.setting.app_name;
        });

        this.helper.http.post('/admin/check_auth', {admin_id: this.admin_id, admin_token: this.admin_token}).pipe(map((res_data: Response) => res_data.json())).subscribe(data => {
            console.log("Response ");
            if (data.success == true) {
                if (data.admin.admin_type == 1) {
                    this.showMenu = true;
                }
                this.admin_type = data.admin.admin_type;
                this.urls_array = data.admin.urls;
                 
                 //console.log(this.containsAll(['/admin/delivery', '/admin/vehicle', '/admin/country','/admin/city','/admin/service'], this.urls_array));
                 
                
//                if(data.admin.admin_type == 3 && data.admin.urls.length > 0)
//                {
//                    this.showSubMenu = true;
//                    console.log(this.showSubMenu);
//                }
                if(data.admin.admin_type == 3){
                    this.showSubMenu = true;
                    
                }
                
                
//                if(data.admin.admin_type == 3){
//                    console.log(data.admin.urls.length);
//                    console.log(data.admin.urls);
//                    if (data.admin.urls.length > 0) {
//                        data.admin.urls.forEach(function (url) {
//                            console.log(url);
//                            this.showSubMenu = true;
//                            console.log(this.showSubMenu);
//                        });
//                    }
//                 }
            } else {
                this.helper.router.navigate(['admin/login']);
            }
        })






    }
    toggle() {

        if (jQuery(window).width() <= 768) {
            jQuery("body").toggleClass("mini-navbar");
            jQuery(".full_menu").toggleClass("full_menu1");
        }

    }

    //    showMenu(){
    //        this.is_show = false;
    //    }
    activeRoute(routename: string): boolean {
        return this.router.url.indexOf(routename) > -1;
    }

    logout() {
        localStorage.setItem('admin_id', "");
        localStorage.setItem('admin_token', "");
        this.helper.router.navigate(['/admin/login']);
    }




}