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

    public cart_data : any;
    public total_cart_amount: number = 0;
    public order_payment_id: Object = null;

    public cart_unique_token : string = '';
    public constructor() {

        if(this.user && this.user._id){
            this.user_profile_image_url = this.user.image_url;
        }

        this.cart_data = {
            cart_id: null,
            city_id: null,
            deliveryAddress: '',
            deliveryLatLng: [0,0],
            cart: [],
            selectedStoreId: null,
            max_item_quantity_add_by_user: 0,
            total_item: 0
        }
        this.cart_unique_token = UUID.UUID();

    }

}
