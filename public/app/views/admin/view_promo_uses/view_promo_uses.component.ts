import {Component, OnInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";


@Component({
    selector: 'app-view_promo_uses',
    templateUrl: './view_promo_uses.component.html',
    providers: [Helper]
})
export class ViewPromoUsesComponent implements OnInit {
    title: any;
    button: any;
    heading_title: any;
    promo_id: Object;
    country_name: String;
    city_name: String;
    promo_code_name: String;
    unique_id: Number;
    promo_code_type: Number;
    promo_code_value: Number;
    user_id: Number;
    email: String;
    order_id: Number;
    is_payment_mode_cash: Boolean;
    promo_payment: Number;
    total_order_price: Number;
    total_delivery_price: Number;
    total: Number;
    promo_uses_list: any[];

    myLoading: boolean = true;



    constructor(public helper: Helper) {
    }

    ngOnInit() {

        this.promo_id = this.helper.router_id.admin.promo_uses_id;
        this.myLoading = true;
        if(this.promo_id != ''){
            this.helper.http.post('/admin/get_promo_uses_detail', {promo_id: this.promo_id}).map((res_data: Response) => res_data.json()).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == false) {
                    this.promo_uses_list = [];
                    this.country_name = res_data.country_details.country_name;
                    this.city_name = res_data.city_name;
                    this.promo_code_name = res_data.promo_code.promo_code_name;
                    this.unique_id = res_data.promo_code.unique_id;
                    this.promo_code_type = res_data.promo_code.promo_code_type;
                    this.promo_code_value = res_data.promo_code.promo_code_value;

                }
                else {

                    this.promo_uses_list = res_data.order_payment;
                    this.country_name = res_data.country_details.country_name;
                    this.city_name = res_data.city_name;
                    this.promo_code_name = res_data.promo_code.promo_code_name;
                    this.unique_id = res_data.promo_code.unique_id;
                    this.promo_code_type = res_data.promo_code.promo_code_type;
                    this.promo_code_value = res_data.promo_code.promo_code_value;
                }

            },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
        } else {
            this.helper.router.navigate(['admin/promotions']);
        }

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.title = this.helper.title;

    }

}
