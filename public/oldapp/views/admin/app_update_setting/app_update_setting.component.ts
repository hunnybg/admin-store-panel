import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {Helper} from "../../helper";

export interface UpdateVersionSetting {

    android_user_app_version_code: String,
    is_android_user_app_open_update_dialog: Boolean,
    is_android_user_app_force_update: Boolean,
    android_provider_app_version_code: String,
    is_android_provider_app_open_update_dialog: Boolean,
    is_android_provider_app_force_update: Boolean,
    android_store_app_version_code: String,
    is_android_store_app_open_update_dialog: Boolean,
    is_android_store_app_force_update: Boolean,
    ios_user_app_version_code: String,
    is_ios_user_app_open_update_dialog: Boolean,
    is_ios_user_app_force_update: Boolean,
    ios_provider_app_version_code: String,
    is_ios_provider_app_open_update_dialog: Boolean,
    is_ios_provider_app_force_update: Boolean,
    ios_store_app_version_code: String,
    is_ios_store_app_open_update_dialog: Boolean,
    is_ios_store_app_force_update: Boolean



}

@Component({
    selector: 'app-app_update_setting',
    templateUrl: './app_update_setting.component.html',
    providers: [Helper]
})
export class AppUpdateSettingComponent implements OnInit {

    private update_version_setting: UpdateVersionSetting;
    title: any;
    button: any;
    type: String;
    heading_title: any;
    edit_button: Boolean;
    myLoading: boolean = true;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.update_version_setting = {

            android_user_app_version_code: "",
            is_android_user_app_open_update_dialog: false,
            is_android_user_app_force_update: false,
            android_provider_app_version_code: "",
            is_android_provider_app_open_update_dialog: false,
            is_android_provider_app_force_update: false,
            android_store_app_version_code: "",
            is_android_store_app_open_update_dialog: false,
            is_android_store_app_force_update: false,
            ios_user_app_version_code: "",
            is_ios_user_app_open_update_dialog: false,
            is_ios_user_app_force_update: false,
            ios_provider_app_version_code: "",
            is_ios_provider_app_open_update_dialog: false,
            is_ios_provider_app_force_update: false,
            ios_store_app_version_code: "",
            is_ios_store_app_open_update_dialog: false,
            is_ios_store_app_force_update: false


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
        this.helper.http.post('/api/admin/get_app_keys', {}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            this.update_version_setting.android_user_app_version_code = res_data.app_keys.android_user_app_version_code,

                this.update_version_setting.is_android_user_app_open_update_dialog = res_data.app_keys.is_android_user_app_open_update_dialog,
                this.update_version_setting.is_android_user_app_force_update = res_data.app_keys.is_android_user_app_force_update,

                this.update_version_setting.android_provider_app_version_code = res_data.app_keys.android_provider_app_version_code,
                this.update_version_setting.is_android_provider_app_open_update_dialog = res_data.app_keys.is_android_provider_app_open_update_dialog,
                this.update_version_setting.is_android_provider_app_force_update = res_data.app_keys.is_android_provider_app_force_update,
                this.update_version_setting.android_store_app_version_code = res_data.app_keys.android_store_app_version_code,

                this.update_version_setting.is_android_store_app_open_update_dialog = res_data.app_keys.is_android_store_app_open_update_dialog,
                this.update_version_setting.is_android_store_app_force_update = res_data.app_keys.is_android_store_app_force_update,
                this.update_version_setting.ios_user_app_version_code = res_data.app_keys.ios_user_app_version_code,
                this.update_version_setting.is_ios_user_app_open_update_dialog = res_data.app_keys.is_ios_user_app_open_update_dialog,

                this.update_version_setting.is_ios_user_app_force_update = res_data.app_keys.is_ios_user_app_force_update,
                this.update_version_setting.ios_provider_app_version_code = res_data.app_keys.ios_provider_app_version_code,
                this.update_version_setting.is_ios_provider_app_open_update_dialog = res_data.app_keys.is_ios_provider_app_open_update_dialog,
                this.update_version_setting.is_ios_provider_app_force_update = res_data.app_keys.is_ios_provider_app_force_update,
                this.update_version_setting.ios_store_app_version_code = res_data.app_keys.ios_store_app_version_code,
                this.update_version_setting.is_ios_store_app_open_update_dialog = res_data.app_keys.is_ios_store_app_open_update_dialog,
                this.update_version_setting.is_ios_store_app_force_update = res_data.app_keys.is_ios_store_app_force_update
        });
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }

    UpdateVersionSetting(appversionsettingdata) {
        this.helper.http.post('/admin/update_app_version_setting', appversionsettingdata).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            this.helper.data.storage = {
                "message": this.helper.MESSAGE_CODE[res_data.message],
                "class": "alert-info"
            }
            console.log(res_data);
            this.helper.message();

            this.helper.router.navigate(['setting/app_update_setting']);

        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}
