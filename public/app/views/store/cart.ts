import {Injectable} from '@angular/core';
import { UUID } from 'angular2-uuid';

@Injectable()
export class StoreCart {
    user: any = JSON.parse(localStorage.getItem('user'));
    delivery_note: string = '';
    user_profile_image_url: string = '';
    is_schedule_order: Boolean = false;
    schedule_date: any = null;
    server_date: any = null;
    timezone: string = '';
    currency: string = '';
    public destination_address: any;
    public pickup_address: any;

    total_cart_price_without_item: number = 0;
    name: string = '';
    image: string = '';
    store_unique_code: string = '';
    
    public cart_data : any;
    public total_cart_amount: number = 0;
    public total_item_tax: number = 0;
    public order_payment_id: Object = null;

    public cart_unique_token : string = '';
    public constructor() {

        if(this.user && this.user._id){
            this.user_profile_image_url = this.user.image_url;
        }

        this.cart_data = {
            cart_id: null,
            city_id: null,
            destination_addresses: [],
            pickup_addresses: [],
            cart: [],
            selectedStoreId: null,
            max_item_quantity_add_by_user: 0,
            total_item: 0
        }
        this.cart_unique_token = UUID.UUID();

        this.destination_address = {
            "delivery_status":0,
            "address_type":"destination",
            "address":"",
            "city":"",
            "location":[],
            "note":"",
            "user_type":0,
            "user_details":{
                "name":"",
                "country_phone_code":"",
                "phone":"",
                "email":""
            }
        }

        this.pickup_address = {
            "delivery_status":0,
            "address_type":"pickup",
            "address":"",
            "city":"",
            "location":[],
            "note":"",
            "user_type":1,
            "user_details":{
                "name":"",
                "country_phone_code":"",
                "phone":"",
                "email":""
            }
        }

    }

}
