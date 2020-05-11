import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
import { map } from 'rxjs/operators';

export interface AppSwitchSetting {

    is_sms_notification: Boolean,
    is_mail_notification: Boolean,
    is_push_notification: Boolean,


    is_referral_to_user: Boolean,
    is_referral_to_provider: Boolean,
    is_referral_to_store: Boolean,



    is_show_optional_field_in_user_register: Boolean,
    is_show_optional_field_in_provider_register: Boolean,
    is_show_optional_field_in_store_register: Boolean,

    is_upload_user_documents: Boolean,
    is_upload_provider_documents: Boolean,
    is_upload_store_documents: Boolean,
    is_user_mail_verification: Boolean,
    is_user_sms_verification: Boolean,
    is_provider_mail_verification: Boolean,
    is_provider_sms_verification: Boolean,
    is_store_mail_verification: Boolean,
    is_store_sms_verification: Boolean,
    is_user_profile_picture_required: Boolean,
    is_provider_profile_picture_required: Boolean,
    is_store_profile_picture_required: Boolean,
    is_user_login_by_email: Boolean,
    is_user_login_by_phone: Boolean,
    is_provider_login_by_email: Boolean,
    is_provider_login_by_phone: Boolean,
    is_store_login_by_email: Boolean,
    is_store_login_by_phone: Boolean,

    is_user_login_by_social: Boolean,
    is_provider_login_by_social: Boolean,
    is_store_login_by_social: Boolean,

    is_provider_earning_add_in_wallet_on_cash_payment: Boolean,
    is_store_earning_add_in_wallet_on_cash_payment: Boolean,
    is_provider_earning_add_in_wallet_on_other_payment: Boolean,
    is_store_earning_add_in_wallet_on_other_payment: Boolean,

    is_confirmation_code_required_at_pickup_delivery: Boolean,
    is_confirmation_code_required_at_complete_delivery: Boolean,

    is_email_id_field_required_in_user_register: Boolean,
    is_phone_field_required_in_user_register: Boolean,
    is_email_id_field_required_in_provider_register: Boolean,
    is_phone_field_required_in_provider_register: Boolean,
    is_email_id_field_required_in_store_register: Boolean,
    is_phone_field_required_in_store_register: Boolean






}
@Component({
    selector: 'app-other_setting',
    templateUrl: './other_setting.component.html'
})
export class OtherSettingComponent implements OnInit {

    private app_switch_setting: AppSwitchSetting;
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
        this.app_switch_setting = {

            is_sms_notification: false,
            is_mail_notification: false,
            is_push_notification: false,

            is_referral_to_user: false,
            is_referral_to_provider: false,
            is_referral_to_store: false,

            is_upload_user_documents: false,
            is_upload_provider_documents: false,
            is_upload_store_documents: false,
            is_user_mail_verification: false,
            is_user_sms_verification: false,
            is_provider_mail_verification: false,
            is_provider_sms_verification: false,
            is_store_mail_verification: false,
            is_store_sms_verification: false,
            is_user_profile_picture_required: false,
            is_provider_profile_picture_required: false,
            is_store_profile_picture_required: false,
            is_user_login_by_email: true,
            is_user_login_by_phone: true,
            is_provider_login_by_email: false,
            is_provider_login_by_phone: false,
            is_store_login_by_email: false,
            is_store_login_by_phone: false,
            is_user_login_by_social: false,
            is_provider_login_by_social: false,
            is_store_login_by_social: false,

            is_show_optional_field_in_user_register: false,
            is_show_optional_field_in_provider_register: false,
            is_show_optional_field_in_store_register: false,

            is_provider_earning_add_in_wallet_on_cash_payment: false,
            is_store_earning_add_in_wallet_on_cash_payment: false,
            is_provider_earning_add_in_wallet_on_other_payment: false,
            is_store_earning_add_in_wallet_on_other_payment: false,

            is_confirmation_code_required_at_pickup_delivery: false,
            is_confirmation_code_required_at_complete_delivery: false,

            is_email_id_field_required_in_user_register: true,
            is_phone_field_required_in_user_register: true,
            is_email_id_field_required_in_provider_register: true,
            is_phone_field_required_in_provider_register: true,
            is_email_id_field_required_in_store_register: true,
            is_phone_field_required_in_store_register: true

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
            
            this.myLoading = false;

            this.app_switch_setting.is_sms_notification = res_data.setting.is_sms_notification,
                this.app_switch_setting.is_mail_notification = res_data.setting.is_mail_notification,
                this.app_switch_setting.is_push_notification = res_data.setting.is_push_notification,

                this.app_switch_setting.is_confirmation_code_required_at_pickup_delivery = res_data.setting.is_confirmation_code_required_at_pickup_delivery,
                this.app_switch_setting.is_confirmation_code_required_at_complete_delivery = res_data.setting.is_confirmation_code_required_at_complete_delivery,

                this.app_switch_setting.is_email_id_field_required_in_user_register = res_data.setting.is_email_id_field_required_in_user_register,

                this.app_switch_setting.is_phone_field_required_in_user_register = res_data.setting.is_phone_field_required_in_user_register,

                this.app_switch_setting.is_email_id_field_required_in_provider_register = res_data.setting.is_email_id_field_required_in_provider_register,

                this.app_switch_setting.is_phone_field_required_in_provider_register = res_data.setting.is_phone_field_required_in_provider_register,

                this.app_switch_setting.is_email_id_field_required_in_store_register = res_data.setting.is_email_id_field_required_in_store_register,
                this.app_switch_setting.is_phone_field_required_in_store_register = res_data.setting.is_phone_field_required_in_store_register,








                this.app_switch_setting.is_referral_to_user = res_data.setting.is_referral_to_user,
                this.app_switch_setting.is_referral_to_provider = res_data.setting.is_referral_to_provider,
                this.app_switch_setting.is_referral_to_store = res_data.setting.is_referral_to_store,



                this.app_switch_setting.is_upload_user_documents = res_data.setting.is_upload_user_documents,
                this.app_switch_setting.is_upload_provider_documents = res_data.setting.is_upload_provider_documents,
                this.app_switch_setting.is_upload_store_documents = res_data.setting.is_upload_store_documents,


                this.app_switch_setting.is_show_optional_field_in_user_register = res_data.setting.is_show_optional_field_in_user_register,
                this.app_switch_setting.is_show_optional_field_in_provider_register = res_data.setting.is_show_optional_field_in_provider_register,
                this.app_switch_setting.is_show_optional_field_in_store_register = res_data.setting.is_show_optional_field_in_store_register,




                this.app_switch_setting.is_user_mail_verification = res_data.setting.is_user_mail_verification,
                this.app_switch_setting.is_user_sms_verification = res_data.setting.is_user_sms_verification,
                this.app_switch_setting.is_provider_mail_verification = res_data.setting.is_provider_mail_verification,
                this.app_switch_setting.is_provider_sms_verification = res_data.setting.is_provider_sms_verification,
                this.app_switch_setting.is_store_mail_verification = res_data.setting.is_store_mail_verification,
                this.app_switch_setting.is_store_sms_verification = res_data.setting.is_store_sms_verification,

                this.app_switch_setting.is_user_profile_picture_required = res_data.setting.is_user_profile_picture_required,
                this.app_switch_setting.is_provider_profile_picture_required = res_data.setting.is_provider_profile_picture_required,
                this.app_switch_setting.is_store_profile_picture_required = res_data.setting.is_store_profile_picture_required,

                this.app_switch_setting.is_user_login_by_email = res_data.setting.is_user_login_by_email,
                this.app_switch_setting.is_user_login_by_phone = res_data.setting.is_user_login_by_phone,
                this.app_switch_setting.is_user_login_by_social = res_data.setting.is_user_login_by_social,

                this.app_switch_setting.is_provider_login_by_email = res_data.setting.is_provider_login_by_email,
                this.app_switch_setting.is_provider_login_by_phone = res_data.setting.is_provider_login_by_phone,
                this.app_switch_setting.is_provider_login_by_social = res_data.setting.is_provider_login_by_social,

                this.app_switch_setting.is_store_login_by_email = res_data.setting.is_store_login_by_email,
                this.app_switch_setting.is_store_login_by_phone = res_data.setting.is_store_login_by_phone,
                this.app_switch_setting.is_store_login_by_social = res_data.setting.is_store_login_by_social,

                this.app_switch_setting.is_provider_earning_add_in_wallet_on_cash_payment = res_data.setting.is_provider_earning_add_in_wallet_on_cash_payment,
                this.app_switch_setting.is_store_earning_add_in_wallet_on_cash_payment = res_data.setting.is_store_earning_add_in_wallet_on_cash_payment,
                this.app_switch_setting.is_provider_earning_add_in_wallet_on_other_payment = res_data.setting.is_provider_earning_add_in_wallet_on_other_payment,
                this.app_switch_setting.is_store_earning_add_in_wallet_on_other_payment = res_data.setting.is_store_earning_add_in_wallet_on_other_payment



        });
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }


    onChange(value, type) {
        if (!value) {
            if (type == "email" && !this.app_switch_setting.is_user_login_by_phone) {
                this.app_switch_setting.is_user_login_by_phone = true;
            } else if (type == "phone" && !this.app_switch_setting.is_user_login_by_email) {
                this.app_switch_setting.is_user_login_by_email = true;
            }
        }
    }






    providerOnChange(value, type) {
        if (!value) {
            if (type == "email" && !this.app_switch_setting.is_provider_login_by_phone) {
                this.app_switch_setting.is_provider_login_by_phone = true;
            } else if (type == "phone" && !this.app_switch_setting.is_provider_login_by_email) {
                this.app_switch_setting.is_provider_login_by_email = true;
            }
        }
    }

    storeOnChange(value, type) {
        if (!value) {
            if (type == "email" && !this.app_switch_setting.is_store_login_by_phone) {
                this.app_switch_setting.is_store_login_by_phone = true;
            } else if (type == "phone" && !this.app_switch_setting.is_store_login_by_email) {
                this.app_switch_setting.is_store_login_by_email = true;
            }
        }
    }

    /////

    onChangeEmail(value, type) {
        console.log("onChangeEmail");
        if (value == true && type == 7) {
            this.app_switch_setting.is_email_id_field_required_in_user_register = true;
        } else if (value == true && type == 8) {
            this.app_switch_setting.is_email_id_field_required_in_provider_register = true;
        } else if (value == true && type == 2) {
            this.app_switch_setting.is_email_id_field_required_in_store_register = true;
        }
    }

    onChangePhone(value, type) {
        console.log("onChangePhone");
        
        if (value == true && type == 7) {
            this.app_switch_setting.is_phone_field_required_in_user_register = true;
        } else if (value == true && type == 8) {
            this.app_switch_setting.is_phone_field_required_in_provider_register = true;
        } else if (value == true && type == 2) {
            this.app_switch_setting.is_phone_field_required_in_store_register = true;
        }
    }

    ////




    AppSwitchSetting(appswitchsettingdata) {
        //        if (this.app_switch_setting.is_user_mail_verification == true) {
        //            this.app_switch_setting.is_email_id_field_required_in_user_register = true;
        //        }
        //        if (this.app_switch_setting.is_provider_mail_verification == true) {
        //            this.app_switch_setting.is_email_id_field_required_in_provider_register = true;
        //        }
        //        if (this.app_switch_setting.is_store_mail_verification == true) {
        //            this.app_switch_setting.is_email_id_field_required_in_store_register = true;
        //        }
        //
        //        if (this.app_switch_setting.is_user_sms_verification == true) {
        //            this.app_switch_setting.is_phone_field_required_in_user_register = true;
        //        }
        //        if (this.app_switch_setting.is_provider_sms_verification == true) {
        //            this.app_switch_setting.is_phone_field_required_in_provider_register = true;
        //        }
        //        if (this.app_switch_setting.is_store_sms_verification == true) {
        //            this.app_switch_setting.is_phone_field_required_in_store_register = true;
        //        }



        this.helper.http.post('/admin/update_switch_setting', appswitchsettingdata).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
            }
            this.helper.message();
            this.helper.router.navigate(['setting/other_setting']);

        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}
