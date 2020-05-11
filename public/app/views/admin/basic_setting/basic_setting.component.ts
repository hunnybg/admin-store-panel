import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;

export interface AdminSetting {
    admin_name: String,
    admin_email: String,
    admin_phone_number: String,
    admin_contact_email: String,
    admin_contact_phone_number: String,
    admin_country: String,
    admin_currency_code: String,
    admin_currency: String,
    //admin_time_zone: String,
    admin_panel_timezone: String,
    lang: string,
    default_search_radius: Number,
    provider_timeout: Number,
    app_name: String
}

@Component({
    selector: 'app-basic_setting',
    templateUrl: './basic_setting.component.html'
})
export class BasicSettingComponent implements OnInit {

    private admin_setting: AdminSetting;
    title: any;
    button: any;
    type: String;
    country_list: any[];
    timezone_list: any[];
    heading_title: any;
    //admin_time_zone_array: any[];
    error: any;
    edit_button: Boolean;
    admin_country: String = '';
    edit: Boolean;
    test1: number = 500;
    test2: number = 0;

    myLoading: boolean = true;


    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }


    ngAfterViewInit() {
        jQuery("#country").chosen();
        //jQuery("#admin_time_zone").chosen();
        jQuery("#admin_panel_timezone").chosen();
        jQuery("#lang").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }


    ngOnInit() {
        this.admin_setting = {
            admin_name: "",
            admin_email: "",
            admin_phone_number: "",
            admin_contact_email: "",
            admin_contact_phone_number: "",
            admin_country: "",
            admin_currency_code: "",
            admin_currency: "",
            //admin_time_zone: "",
            admin_panel_timezone: "",
            lang: "",
            default_search_radius: null,
            provider_timeout: null,
            app_name: ""
        }


        var language = JSON.parse(localStorage.getItem('admin_language'));
        if (language == '' || language == undefined) {
            language = 'en'
        }
        var admin_id = localStorage.getItem('admin_id');
        if (admin_id != "" || admin_id != undefined) {
            this.helper.http.post('/admin/get_detail', {admin_id: admin_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
                console.log(res_data.success);
                console.log(res_data.admin.admin_type);
                if (res_data.success == true) {
                    if (res_data.admin.admin_type == 3) {
                        this.edit_button = false;
                    }
                }
            });
        }


        console.log(language);

        this.helper.http.get('/admin/get_country_list').pipe(map((res: Response) => res.json())).subscribe(res => this.country_list = res, error => this.error = error);
        this.helper.http.get('/admin/get_timezone_list').pipe(map((res: Response) => res.json())).subscribe(res => this.timezone_list = res, error => this.error = error);

        jQuery(this.helper.elementRef.nativeElement).find('#admin_panel_timezone').on('change', (evnt, res_data) => {
            this.admin_setting.admin_panel_timezone = res_data.selected;
        });



        this.helper.http.post('/api/admin/get_setting_detail', {}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            this.admin_setting.admin_name = res_data.setting.admin_name,
                this.admin_setting.admin_email = res_data.setting.admin_email,
                this.admin_setting.admin_phone_number = res_data.setting.admin_phone_number,
                this.admin_setting.admin_contact_email = res_data.setting.admin_contact_email,
                this.admin_setting.admin_contact_phone_number = res_data.setting.admin_contact_phone_number,
                this.admin_setting.admin_country = res_data.setting.admin_country,
                this.admin_setting.admin_currency_code = res_data.setting.admin_currency_code,
                this.admin_setting.admin_currency = res_data.setting.admin_currency,
                //this.admin_setting.admin_time_zone = res_data.setting.admin_time_zone,
                this.admin_setting.admin_panel_timezone = res_data.setting.admin_panel_timezone,
                this.admin_setting.lang = language,
                this.admin_setting.default_search_radius = res_data.setting.default_search_radius,
                this.admin_setting.provider_timeout = res_data.setting.provider_timeout,
                this.admin_setting.app_name = res_data.setting.app_name

            console.log(this.admin_setting.admin_country);
            this.admin_country = res_data.setting.admin_country;
            console.log(res_data.setting.admin_country);
            console.log(this.admin_setting.admin_panel_timezone);
            setTimeout(() => {
                jQuery("#admin_panel_timezone").trigger("chosen:updated");
            }, 100);




            if (res_data.setting.admin_country == "") {
                this.edit = true;
                console.log("res_data.setting.admin_country");
                console.log(res_data.setting.admin_country);

            } else if (res_data.setting.admin_country !== "") {
                this.edit = false;
            }

        });

        jQuery(this.helper.elementRef.nativeElement).find('#country').on('change', (evnt, res_data) => {

            this.get_country_detail(res_data.selected);
            console.log(res_data.selected);

        });

        //        jQuery(this.helper.elementRef.nativeElement).find('#admin_time_zone').on('change', (evnt, res_data) => {
        //
        //            this.admin_setting.admin_time_zone = res_data.selected;
        //
        //            console.log(this.admin_setting.admin_time_zone);
        //            console.log("res_data.selected");
        //            console.log(res_data.selected);
        //
        //        });
        jQuery(this.helper.elementRef.nativeElement).find('#lang').on('change', (evnt, res_data) => {


            this.helper.trans.use(res_data.selected);
            localStorage.setItem('admin_language', JSON.stringify(res_data.selected));


        });



        //        this.helper.http.get('/admin/get_country_list').pipe(map((res: Response) => res.json())).subscribe(res => this.country_list = res, error => this.error = error);
        //        this.helper.http.get('/admin/get_timezone_list').pipe(map((res: Response) => res.json())).subscribe(res => this.timezone_list = res, error => this.error = error);
        //
        //        jQuery(this.helper.elementRef.nativeElement).find('#admin_panel_timezone').on('change', (evnt, res_data) => {
        //            this.admin_setting.admin_panel_timezone = res_data.selected;
        //        });


        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;

    }
    get_country_detail(countryname) {

        this.test2 = this.test1 - 100;
        console.log(this.test1);
        console.log(this.test2);




        this.helper.http.post('/admin/country_detail_for_admin', {countryname: countryname}).pipe(map((res: Response) => res.json())).subscribe(data => {

            if (data.success == true) {

                //                this.admin_time_zone_array = []
                //                for (var i in data.country_timezone) {
                //                    this.admin_time_zone_array.push(data.country_timezone[i].name);
                //                }
                //                console.log(this.admin_time_zone_array);
                this.admin_setting.admin_country = countryname;

                this.admin_setting.admin_currency_code = data.lookup.currencies[0]
                this.admin_setting.admin_currency = data.currency_symbol

            }

        });
        setTimeout(function () {
            jQuery("#country").trigger("chosen:updated");
        }, 1000);

    }

    AdminSetting(adminsettingdata) {
        console.log(adminsettingdata);
        this.helper.http.post('/admin/update_admin_setting', adminsettingdata).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            this.helper.data.storage = {
                "message": this.helper.MESSAGE_CODE[res_data.message],
                "class": "alert-info"
            }
            console.log(res_data);
            this.helper.message();
            this.admin_country = res_data.setting.admin_country;
            this.admin_setting.admin_country = res_data.setting.admin_country;
            this.helper.router.navigate(['setting/basic_setting']);

        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}
