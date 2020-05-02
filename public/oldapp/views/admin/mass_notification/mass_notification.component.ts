import {Component, OnInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;

export interface CreateMassNotification {
    user_type: number,
    device_type: string,
    message: string,
    country: string,
    delivery: string,
    city:string
}

@Component({
    selector: 'app-mass_notification',
    templateUrl: './mass_notification.component.html',
    providers: [Helper]
})
export class MassNotificationComponent implements OnInit {

    constructor(public helper: Helper) {
    }
    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    DATE_FORMAT: any;
    

    mass_notification_list: any[] = [];

    create_mass_notification: CreateMassNotification;
    country_list: any[] = [];
    delivery_list: any[] = [];
    city_list: any[] = [];
    page: number = 1;
    total_pages: number[];
    total_page: number = 1;
    page_number: number = 1;
    show_city:boolean = false;
    show_delivery:boolean = false;
    user_type: any = '';

    ngOnInit() {

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.validation_message = this.helper.validation_message;
        this.DATE_FORMAT = this.helper.DATE_FORMAT;

        jQuery('.chosen-select').chosen();
        setTimeout(() => {
            jQuery('.chosen-select').trigger("chosen:updated");
        }, 1000);
        jQuery(this.helper.elementRef.nativeElement).find('#device_type').on('change', (evnt, res_data) => {
            this.create_mass_notification.device_type = res_data.selected;


        });

        jQuery(this.helper.elementRef.nativeElement).find('#user_type1').on('change', (evnt, res_data) => {
                this.user_type = res_data.selected;
                this.get_mass_notification_list(this.page)
        });
        jQuery(this.helper.elementRef.nativeElement).find('#user_type').on('change', (evnt, res_data) => {
            this.create_mass_notification.user_type = res_data.selected;
            console.log("this.create_mass_notification.user_type" + this.create_mass_notification.user_type);
            if(this.create_mass_notification.user_type == 2){
                this.show_delivery = true;
                console.log("this.show_delivery" + this.show_delivery);
            }
            if(this.create_mass_notification.user_type != 7){
                this.show_city = true;
                console.log("this.show_city" + this.show_city);
            }
            
            this.get_delivery_list();
        });
        this.create_mass_notification = {
            device_type: 'both',
            message: '',
            user_type: 7,
            country: 'all',
            city: 'all',
            delivery: ''
        }
        this.get_mass_notification_list(1);
        this.helper.http.get('/admin/get_server_country_list').map((res: Response) => res.json()).subscribe(res_data => {
            this.country_list = res_data.countries;
            setTimeout(() => {
                jQuery('#country').trigger('chosen:updated');
            }, 1000);
            jQuery(this.helper.elementRef.nativeElement).find('#country').on('change', (evnt, res_data) => {
                this.create_mass_notification.country = res_data.selected;
                this.get_city_list(res_data.selected);
            });
        });


    }

    get_city_list(countryid) {
        this.create_mass_notification.country = countryid;
        this.helper.http.post('/api/admin/get_city_list', {country_id: countryid}).map((res: Response) => res.json()).subscribe(res_data => {

            this.city_list = res_data.cities;
        });
        setTimeout(function () {
            jQuery("#city").trigger("chosen:updated");
        }, 1000);

        jQuery(this.helper.elementRef.nativeElement).find('#city').on('change', (evnt, res_data) => {
            this.create_mass_notification.city = res_data.selected;
        });
    }


    get_mass_notification_list(page) {

        page = Number(page);
        if (page > this.total_page) {
            page = this.total_page;
        }
        if (page == '') {
            page = 1;
        }
        this.page = JSON.parse(JSON.stringify(page));
        this.page_number = JSON.parse(JSON.stringify(page));
        this.helper.http.post('/admin/get_mass_notification_list', {page: page, user_type: this.user_type}).map((res: Response) => res.json()).subscribe(res_data => {
            if (res_data.success) {
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                this.mass_notification_list = res_data.mass_notification_list;
            } else {
                this.total_pages = [];
                this.mass_notification_list = [];
            }
        });
    }

    get_delivery_list() {
        this.helper.http.get('/admin/delivery_list').map((res: Response) => res.json()).subscribe(res => {

            this.delivery_list = res.deliveries;
            setTimeout(() => {
                jQuery('#delivery').trigger('chosen:updated');
            }, 1000);

            jQuery(this.helper.elementRef.nativeElement).find('#delivery').on('change', (evnt, res_data) => {
                this.create_mass_notification.delivery = res_data.selected;
            });
        });
    }


    generate_mass_notification() {
        console.log("generate_mass_notification");
        console.log(this.create_mass_notification);
        this.helper.http.post('/admin/create_mass_notifications', this.create_mass_notification).map((res: Response) => res.json()).subscribe(res_data => {
            console.log(res_data);
            if (res_data.success) {

                if (this.create_mass_notification.country != 'all') {
                    let country_index = this.country_list.findIndex((x) => x._id == this.create_mass_notification.country);
                    res_data.mass_notification_data.country_detail = this.country_list[country_index];
                }

                this.mass_notification_list.push(res_data.mass_notification_data);

                this.create_mass_notification = {
                    device_type: 'both',
                    message: '',
                    user_type: 7,
                    country: 'all',
                    city: 'all',
                    delivery: ''
                }

                setTimeout(() => {
                    jQuery('.chosen-select').trigger("chosen:updated");
                }, 1000);
            } else {

            }

        });
    }

}
