import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;

export interface IosPushNotificationSetting {

    user_certificate_mode: String,
    provider_certificate_mode: String,
    store_certificate_mode: String,
    provider_bundle_id: String,
    user_bundle_id: String,
    store_bundle_id: String,
    key_id: String, 
    team_id: String,
    ios_push_certificate_path: String

}

@Component({
    selector: 'app-ios_push_notification_setting',
    templateUrl: './ios_push_notification_setting.component.html',
    providers: [Helper]
})
export class IosPushNotificationSettingComponent implements OnInit {

    private ios_push_notification_setting: IosPushNotificationSetting;
    title: any;
    button: any;
    type: String;
    heading_title: any;
    edit_button: Boolean;
    myLoading: boolean = true;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {

        jQuery("#user_certificate_mode").chosen({disable_search: true});
        jQuery("#provider_certificate_mode").chosen({disable_search: true});
        jQuery("#store_certificate_mode").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");

            jQuery('input').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
        }, 1000);


    }

    ngOnInit() {
        this.ios_push_notification_setting = {
            user_certificate_mode: "",
            provider_certificate_mode: "",
            store_certificate_mode: "",
            provider_bundle_id: "",
            user_bundle_id: "",
            store_bundle_id: "",
            key_id: "",
            ios_push_certificate_path: "",
            team_id: ""
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

            this.ios_push_notification_setting.user_certificate_mode = res_data.app_keys.user_certificate_mode,
                this.ios_push_notification_setting.provider_certificate_mode = res_data.app_keys.provider_certificate_mode,
                this.ios_push_notification_setting.store_certificate_mode = res_data.app_keys.store_certificate_mode,
                this.ios_push_notification_setting.provider_bundle_id = res_data.app_keys.provider_bundle_id,
                this.ios_push_notification_setting.user_bundle_id = res_data.app_keys.user_bundle_id,
                this.ios_push_notification_setting.store_bundle_id = res_data.app_keys.store_bundle_id,
                this.ios_push_notification_setting.key_id = res_data.app_keys.key_id,
                this.ios_push_notification_setting.team_id = res_data.app_keys.team_id,
                this.ios_push_notification_setting.ios_push_certificate_path = res_data.app_keys.ios_push_certificate_path

        });
        jQuery(this.helper.elementRef.nativeElement).find('#user_certificate_mode').on('change', (evnt, res_data) => {

            this.ios_push_notification_setting.user_certificate_mode = res_data.selected;


        });
        jQuery(this.helper.elementRef.nativeElement).find('#provider_certificate_mode').on('change', (evnt, res_data) => {

            this.ios_push_notification_setting.provider_certificate_mode = res_data.selected;


        });
        jQuery(this.helper.elementRef.nativeElement).find('#store_certificate_mode').on('change', (evnt, res_data) => {

            this.ios_push_notification_setting.store_certificate_mode = res_data.selected;


        });
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }

    public formData = new FormData();
    ios_user_cert_file_image($event) {
        const files = $event.target.files || $event.srcElement.files;
        const ios_user_cert_file = files[0];
        this.formData.append('ios_user_cert_file', ios_user_cert_file);
        console.log(ios_user_cert_file);

    }

    ios_cert_file_image($event) {
        const files = $event.target.files || $event.srcElement.files;
        const push_p8_file = files[0];
        this.formData.append('push_p8_file', push_p8_file);

    }

    ios_user_key_file_image($event) {
        const files = $event.target.files || $event.srcElement.files;
        const ios_user_key_file = files[0];
        this.formData.append('ios_user_key_file', ios_user_key_file);
    }

    ios_provider_cert_file_image($event) {
        const files = $event.target.files || $event.srcElement.files;
        const ios_provider_cert_file = files[0];
        this.formData.append('ios_provider_cert_file', ios_provider_cert_file);

    }

    ios_provider_key_file_image($event) {
        const files = $event.target.files || $event.srcElement.files;
        const ios_provider_key_file = files[0];
        this.formData.append('ios_provider_key_file', ios_provider_key_file);

    }

    ios_store_cert_file_image($event) {
        const files = $event.target.files || $event.srcElement.files;
        const ios_store_cert_file = files[0];
        this.formData.append('ios_store_cert_file', ios_store_cert_file);

    }

    ios_store_key_file_image($event) {
        const files = $event.target.files || $event.srcElement.files;
        const ios_store_key_file = files[0];
        this.formData.append('ios_store_key_file', ios_store_key_file);

    }



    IosPushNotificationSetting(pushnotificationdata) {
        this.formData.append("user_certificate_mode", pushnotificationdata.user_certificate_mode);
        this.formData.append("provider_certificate_mode", pushnotificationdata.provider_certificate_mode);
        this.formData.append("store_certificate_mode", pushnotificationdata.store_certificate_mode);
        this.formData.append("provider_bundle_id", pushnotificationdata.provider_bundle_id);
        this.formData.append("user_bundle_id", pushnotificationdata.user_bundle_id);
        this.formData.append("store_bundle_id", pushnotificationdata.store_bundle_id);
        this.formData.append("key_id", pushnotificationdata.key_id);
        this.formData.append("team_id", pushnotificationdata.team_id);
        this.formData.append("ios_push_certificate_path", pushnotificationdata.ios_push_certificate_path);


        this.helper.http.post('/admin/update_ios_push_notification_setting', this.formData).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            this.helper.data.storage = {
                "message": this.helper.MESSAGE_CODE[res_data.message],
                "class": "alert-info"
            }
            this.formData = new FormData();
            this.helper.message();
            this.helper.router.navigate(['setting/ios_push_notification_setting']);

        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}
