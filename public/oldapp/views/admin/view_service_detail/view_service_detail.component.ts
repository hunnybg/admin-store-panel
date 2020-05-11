import {Component, OnInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { map } from 'rxjs/operators';
import {Helper} from "../../helper";

@Component({
    selector: 'app-view_service_detail',
    templateUrl: './view_service_detail.component.html',
    providers: [Helper]
})
export class ViewServiceDetailComponent implements OnInit {
    title: any;
    button: any;
    heading_title: any;
    service_id: Object;
    service: any[];


    country_id: Object;
    city_id: Object;
    delivery_type_id: Object;
    name: String;
   // delivery_service_id: Object;
    country_name: String;
    city_name: String;
   // vehicle_name: String;
   // delivery_name: String;
    base_price_distance: Number;
    //vehicle_id: Object;
    base_price: Number;
    price_per_unit_distance: Number;
    price_per_unit_time: Number;
    service_tax: Number;
    min_fare: Number;
    surge_price: Number;
    cancellation_fee: Number;
    admin_profit_mode_on_delivery: Number;
    admin_profit_value_on_delivery: Number;
    created_at: any;
    updated_at: any;
    myLoading: boolean = true;


    constructor(public helper: Helper) {
    }

    ngOnInit() {

        this.service_id = this.helper.router_id.admin.service_id;

        this.helper.http.post('/admin/get_service_detail', {service_id: this.service_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
            this.myLoading = false;

            if (res_data.success == false) {

                this.helper.router.navigate(['admin/service']);

            }
            else {


                this.country_name = res_data.service.country_details.country_name
                this.city_name = res_data.service.city_details.city_name
                this.name = res_data.service.delivery_type_details.name
               // this.vehicle_name = res_data.service.vehicle_details.vehicle_name
               // this.delivery_name = res_data.service.delivery_details.delivery_name
                this.created_at = res_data.service.created_at
                this.updated_at = res_data.service.updated_at
                this.base_price_distance = res_data.service.base_price_distance
                this.base_price = res_data.service.base_price
                this.price_per_unit_distance = res_data.service.price_per_unit_distance
                this.price_per_unit_time = res_data.service.price_per_unit_time
                this.service_tax = res_data.service.service_tax
                this.min_fare = res_data.service.min_fare
                this.cancellation_fee = res_data.service.cancellation_fee
               

            }

        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }
}
