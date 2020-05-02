import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";

export interface UpdateAppKeySetting {

    android_user_app_gcm_key: String,
    android_provider_app_gcm_key: String,
    android_store_app_gcm_key: String,
    android_user_app_google_key: String,
    android_provider_app_google_key: String,
    android_store_app_google_key: String,
    ios_user_app_google_key: String,
    ios_provider_app_google_key: String,
    ios_store_app_google_key: String,
    admin_panel_google_key: String,
    store_panel_google_key: String,
    branch_io_key: String

}

@Component({
    selector: 'app-google_key_setting',
    templateUrl: './google_key_setting.component.html'
})
export class GoogleKeySettingComponent implements OnInit {

    private update_app_key_setting: UpdateAppKeySetting;
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
        this.helper.message()
        this.update_app_key_setting = {
            android_user_app_gcm_key: "",
            android_provider_app_gcm_key: "",
            android_store_app_gcm_key: "",
            android_user_app_google_key: "",
            android_provider_app_google_key: "",
            android_store_app_google_key: "",
            ios_user_app_google_key: "",
            ios_provider_app_google_key: "",
            ios_store_app_google_key: "",
            admin_panel_google_key: "",
            store_panel_google_key: "",
            branch_io_key:"",
        }

        var admin_id = localStorage.getItem('admin_id');
        if (admin_id != "" || admin_id != undefined) {
            this.helper.http.post('/admin/get_detail', {admin_id: admin_id}).map((res_data: Response) => res_data.json()).subscribe(res_data => {
                console.log(res_data.success);
                console.log(res_data.admin.admin_type);
                if (res_data.success == true) {
                    if (res_data.admin.admin_type == 3) {
                        this.edit_button = false;
                    }
                }
            });
        }
        this.helper.http.post('/api/admin/get_app_keys', {}).map((res: Response) => res.json()).subscribe(res_data => {
            console.log(res_data);
             this.myLoading = false;
            this.update_app_key_setting.android_user_app_gcm_key = res_data.app_keys.android_user_app_gcm_key,
                this.update_app_key_setting.android_provider_app_gcm_key = res_data.app_keys.android_provider_app_gcm_key,
                this.update_app_key_setting.android_store_app_gcm_key = res_data.app_keys.android_store_app_gcm_key,
                this.update_app_key_setting.android_user_app_google_key = res_data.app_keys.android_user_app_google_key,
                this.update_app_key_setting.android_provider_app_google_key = res_data.app_keys.android_provider_app_google_key,
                this.update_app_key_setting.android_store_app_google_key = res_data.app_keys.android_store_app_google_key,
                this.update_app_key_setting.ios_user_app_google_key = res_data.app_keys.ios_user_app_google_key,

                this.update_app_key_setting.ios_provider_app_google_key = res_data.app_keys.ios_provider_app_google_key,
                this.update_app_key_setting.ios_store_app_google_key = res_data.app_keys.ios_store_app_google_key,
                this.update_app_key_setting.admin_panel_google_key = res_data.app_keys.admin_panel_google_key,
                this.update_app_key_setting.store_panel_google_key = res_data.app_keys.store_panel_google_key
                this.update_app_key_setting.branch_io_key = res_data.app_keys.branch_io_key
               
                 
        });
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }
    UpdateAppKeySetting(appkeydata) {
        this.helper.http.post('/admin/update_google_key_setting', appkeydata).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            this.helper.data.storage = {
                "message": this.helper.MESSAGE_CODE[res_data.message],
                "class": "alert-info"
            }
            console.log(res_data);
            this.helper.message();
            this.helper.router.navigate(['setting/google_key_setting']);
           

        },
        (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}
