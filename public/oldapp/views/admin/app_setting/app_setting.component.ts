import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { map } from 'rxjs/operators';

import {Helper} from "../../helper";

export interface AppSetting {

    default_search_radius: Number,
    provider_timeout: Number,
    store_timeout: Number,
    app_name: String,
    scheduled_request_pre_start_minute: Number,
    number_of_try_for_scheduled_request: Number

}

@Component({
    selector: 'app-app_setting',
    templateUrl: './app_setting.component.html'
})
export class AppSettingComponent implements OnInit {

    private app_setting: AppSetting;
    title: any;
    button: any;
    type: String;
    heading_title: any;
    edit_button: Boolean;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        
        this.app_setting = {
            default_search_radius: null,
            provider_timeout: null,
            store_timeout: null,
            app_name: "",
            scheduled_request_pre_start_minute: null,
            number_of_try_for_scheduled_request: null
        }
        
        var admin_id = localStorage.getItem('admin_id');
        if (admin_id != "" || admin_id != undefined) {
            this.helper.http.post('/admin/get_detail', {admin_id: admin_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
                
                if (res_data.success == true) {
                    if (res_data.admin.admin_type == 3) {
                        this.edit_button = false;
                    }
                }
            });
        }
        
        this.helper.http.post('/api/admin/get_setting_detail', {}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            
            this.app_setting.default_search_radius = res_data.setting.default_search_radius,
                this.app_setting.provider_timeout = res_data.setting.provider_timeout,
                this.app_setting.store_timeout = res_data.setting.store_timeout,
                this.app_setting.app_name = res_data.setting.app_name,
                this.app_setting.scheduled_request_pre_start_minute = res_data.setting.scheduled_request_pre_start_minute,
                this.app_setting.number_of_try_for_scheduled_request = res_data.setting.number_of_try_for_scheduled_request

        });

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }

    AppSetting(appsettingdata) {
        this.helper.http.post('/admin/update_app_setting', appsettingdata).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message();
                this.helper.router.navigate(['setting/app_setting']);
            }
            else {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
                this.helper.router.navigate(['setting/app_setting']);
            }

        });
    }

}
