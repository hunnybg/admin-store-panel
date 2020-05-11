import {Component, OnInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;

export interface AddCountry {
    country_name: String,
    country_code: String,
    country_timezone: any[],
    currency_name: String,
    currency_code: String,
    country_code_2: String,
    currency_sign: String,
    country_phone_code: String,
    currency_rate:Number,

    referral_bonus_to_user: Number,
    referral_bonus_to_user_friend: Number,
    no_of_user_use_referral: Number,

    referral_bonus_to_store: Number,
    referral_bonus_to_store_friend: Number,
    no_of_store_use_referral: Number,

    referral_bonus_to_provider: Number,
    referral_bonus_to_provider_friend: Number,
    no_of_provider_use_referral: Number,

    is_referral_user: Boolean,
    is_referral_store: Boolean,
    is_referral_provider: Boolean,

    is_business: Boolean,
    is_distance_unit_mile: Boolean,
    minimum_phone_number_length: Number,
    maximum_phone_number_length: Number,
    is_ads_visible:Boolean
    is_auto_transfer_for_store: Boolean,
    auto_transfer_day_for_store: Number,
    is_auto_transfer_for_deliveryman: Boolean,
    auto_transfer_day_for_deliveryman: Number
    tip_payment_percentage : Number,


}

@Component({
    selector: 'add_country',
    templateUrl: './add_country.component.html',
    providers: [Helper]
})
export class AddCountryComponent implements OnInit {

    private add_country: AddCountry;

    title: any;
    button: any;
    type: String;
    heading_title: any;
    tooltip_title: any;
    validation_message: any;
    country_list: any[];
    country_id: Object;
    error: any;
    timezone: any[];
    country_exist: String;
    myLoading: boolean = false;
    admin_currency_code = String;
    constructor(private helper: Helper) {

    }



    ngAfterViewInit() {

        jQuery(".chosen-select").chosen();

        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);




    }
    ngOnDestroy() {
        this.helper.router_id.admin.country_id = "";
    }
    ngOnInit() {
        this.add_country = {
            country_name: "",
            country_code: "",
            country_timezone: [],
            currency_name: "",
            currency_code: "",
            country_code_2: "",
            currency_sign: "",
            country_phone_code: "",
            currency_rate:null,

            minimum_phone_number_length: null,
            maximum_phone_number_length: null,
            referral_bonus_to_user: null,
            referral_bonus_to_user_friend: null,
            no_of_user_use_referral: null,

            referral_bonus_to_store: null,
            referral_bonus_to_store_friend: null,
            no_of_store_use_referral: null,

            referral_bonus_to_provider: null,
            referral_bonus_to_provider_friend: null,
            no_of_provider_use_referral: null,

            is_business: true,
            is_distance_unit_mile: false,
            is_referral_user: true,
            is_referral_store: true,
            is_referral_provider: true,
            is_ads_visible:true,
            auto_transfer_day_for_deliveryman: 7,
            tip_payment_percentage: 75,
            auto_transfer_day_for_store: 7,
            is_auto_transfer_for_deliveryman: false,
            is_auto_transfer_for_store: false

        }
        setTimeout(() => {
            let height = jQuery('.referral_setting').height();
            jQuery('.country_setting').height(height);
        },1000);
        this.country_id = this.helper.router_id.admin.country_id;
        jQuery(this.helper.elementRef.nativeElement).find('#country').on('change', (evnt, res_data) => {

            this.get_country_data(res_data.selected)
        });
        this.helper.http.post('/api/admin/get_setting_detail', {}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
           this.admin_currency_code = res_data.setting.admin_currency_code;
        });
        if (this.country_id == '') {
            this.type = "add";
            this.helper.http.get('/admin/get_country_list').pipe(map((res: Response) => res.json())).subscribe(res => this.country_list = res, error => this.error = error);

            this.country_exist = ""
        }
        else {
            jQuery('#add').hide();
            this.type = "edit";
            this.helper.http.post('/admin/get_country_detail', {country_id: this.country_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {

                    this.helper.router.navigate(['admin/country']);

                }
                else {
                    this.add_country.country_name = res_data.country.country_name;
                    this.add_country.country_code = res_data.country.country_code;
                    this.add_country.country_timezone = res_data.country.country_timezone;
                    this.add_country.currency_name = res_data.country.currency_name;
                    this.add_country.currency_rate = res_data.country.currency_rate;
                    
                     
                    this.add_country.country_code_2 = res_data.country.country_code_2;

                    this.add_country.currency_code = res_data.country.currency_code;
                    this.add_country.currency_sign = res_data.country.currency_sign;
                    this.add_country.country_phone_code = res_data.country.country_phone_code;
                    this.add_country.referral_bonus_to_user = res_data.country.referral_bonus_to_user;

                    this.add_country.is_auto_transfer_for_store = res_data.country.is_auto_transfer_for_store;
                    this.add_country.auto_transfer_day_for_store = res_data.country.auto_transfer_day_for_store;
                    this.add_country.is_auto_transfer_for_deliveryman = res_data.country.is_auto_transfer_for_deliveryman;
                    this.add_country.auto_transfer_day_for_deliveryman = res_data.country.auto_transfer_day_for_deliveryman;
                    this.add_country.tip_payment_percentage = res_data.country.tip_payment_percentage;


                    this.add_country.referral_bonus_to_user_friend = res_data.country.referral_bonus_to_user_friend;
                    this.add_country.no_of_user_use_referral = res_data.country.no_of_user_use_referral;
                    this.add_country.referral_bonus_to_store = res_data.country.referral_bonus_to_store;
                    this.add_country.referral_bonus_to_store_friend = res_data.country.referral_bonus_to_store_friend;

                    this.add_country.no_of_store_use_referral = res_data.country.no_of_store_use_referral;
                    this.add_country.referral_bonus_to_provider = res_data.country.referral_bonus_to_provider;
                    this.add_country.referral_bonus_to_provider_friend = res_data.country.referral_bonus_to_provider_friend;
                    this.add_country.no_of_provider_use_referral = res_data.country.no_of_provider_use_referral;

                    this.add_country.is_ads_visible = res_data.country.is_ads_visible;
                    this.add_country.is_business = res_data.country.is_business;
                    this.add_country.is_distance_unit_mile = res_data.country.is_distance_unit_mile;
                    this.add_country.is_referral_user = res_data.country.is_referral_user;
                    this.add_country.is_referral_store = res_data.country.is_referral_store;
                    this.add_country.is_referral_provider = res_data.country.is_referral_provider;
                    this.add_country.minimum_phone_number_length = res_data.country.minimum_phone_number_length;
                    this.add_country.maximum_phone_number_length = res_data.country.maximum_phone_number_length;

                }
            });

        }
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.tooltip_title = this.helper.tooltip_title;
        this.validation_message = this.helper.validation_message;
    }

    get_country_data(countryname) {

        this.helper.http.post('/admin/get_country_data', {countryname: countryname}).pipe(map((res: Response) => res.json())).subscribe(data => {

            if (data.success == true) {
                this.timezone = []
                this.country_exist = ""
                jQuery('#submit').attr('disabled', false);
                for (var i in data.country_timezone) {

                    this.timezone.push(data.country_timezone[i].name);
                }

                this.add_country.country_name = countryname
                this.add_country.country_timezone = this.timezone
                this.add_country.currency_code = data.lookup.currencies[0]
                this.add_country.currency_sign = data.currency_symbol
                this.add_country.country_phone_code = data.lookup.countryCallingCodes[0]
                this.add_country.country_code = data.lookup.alpha2
                this.add_country.country_code_2 = data.lookup.alpha3
    

            }
            else {
                this.country_exist = "Country Already Exist"
                this.timezone = []
                this.add_country.country_name = ""
                this.add_country.country_timezone = []
                this.add_country.currency_code = ""
                this.add_country.currency_sign = ""
                this.add_country.country_phone_code = ""
                this.add_country.country_code = ""
                this.add_country.country_code_2 = ""
                jQuery('#submit').attr('disabled', true);
            }

        });
    }

    addCountry(countrydata) {
        if (this.type == 'add') {
            this.myLoading = true;
            this.helper.http.post('/admin/add_country_data', countrydata).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == true) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.router.navigate(['admin/country']);
                }
            },(error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
        else {

            this.updateCountry(countrydata)
        }
    }

    updateCountry(country_data) {
        this.myLoading = true;
        this.helper.http.post('/admin/update_country', country_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.router.navigate(['admin/country']);

            }
            else {
                this.helper.router.navigate(['admin/country']);

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }
}
