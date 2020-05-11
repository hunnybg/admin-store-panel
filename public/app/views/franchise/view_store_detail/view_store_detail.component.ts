import {Component, OnInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {title, button, heading_title} from '../store_panel_string';
import {Helper} from "../../franchise_helper";
import {Router_id} from "../../routing_hidden_id";

@Component({
    selector: 'app-view_store_detail',
    templateUrl: './view_store_detail.component.html',
    providers: [Helper]
})
export class ViewFranchiseStoreDetailComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    store_id: Object;
    store_detail: any[];
    email: String;
    name: String;
   

    country_name: String;
    city_name: String;
    zipcode: String;
    sort_bio: String;
    address: String;
    country_phone_code: String;
    phone: String;
    image_url: String;

    app_version: String;
    referral_code: String;
    rate: Number;
    comments: String;
    
    

    //fax_number: String;
    price_rating: Number;
    item_tax: Number;
    delivery_name: String;
    website_url: String;
    slogan: String;
    currency: String;
    wallet: Number;
    device_type: String;
    wallet_currency_code: String;
    
    created_at: any;
    updated_at: any;

    constructor(public helper: Helper, public router_id: Router_id) {
    }

    ngOnInit() {

        this.store_id = this.router_id.franchise.detail_store_id;


        this.helper.http.post('/admin/get_store_data', {store_id: this.store_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
            console.log(res_data);

            if (res_data.success == false) {

                this.helper.router.navigate(['franchise/stores']);

            }
            else {
                console.log(res_data.store_detail);

                this.email = res_data.store_detail.email
               
                this.name = res_data.store_detail.name
                this.image_url = res_data.store_detail.image_url
                this.country_name = res_data.store_detail.country_details.country_name
                this.city_name = res_data.store_detail.city_details.city_name
                this.address = res_data.store_detail.address
                this.phone = res_data.store_detail.phone
                this.zipcode = res_data.store_detail.zipcode
                this.sort_bio = res_data.store_detail.sort_bio
                this.country_phone_code = res_data.store_detail.country_phone_code
                this.app_version = res_data.store_detail.app_version
                this.rate = res_data.store_detail.rate
                this.referral_code = res_data.store_detail.referral_code
                this.device_type = res_data.store_detail.device_type
                this.comments = res_data.store_detail.comments
                this.created_at = res_data.store_detail.created_at
                this.updated_at = res_data.store_detail.updated_at



               // this.fax_number = res_data.store_detail.fax_number
                this.price_rating = res_data.store_detail.price_rating
                this.item_tax = res_data.store_detail.item_tax

                this.delivery_name = res_data.store_detail.delivery_details.delivery_name
                this.website_url = res_data.store_detail.website_url
                this.slogan = res_data.store_detail.slogan

                this.currency = res_data.store_detail.currency
                this.wallet = res_data.store_detail.wallet
                this.wallet_currency_code = res_data.store_detail.wallet_currency_code
            }

        });
        this.title = title
        this.button = button
        this.heading_title = heading_title
    }

}
