import {Injectable} from '@angular/core';

export interface CurrentDeliveryType {
    deliveryname: string,
    image_url: string,
    icon_url: string,
    description: string,
    _id : Object
}

export interface CurrentLocation {
    city1: string,
    city2: string,
    city3: string,
    country: string,
    country_code : string,
    country_code_2: string,
    city_code: string,
    latitude: any,
    longitude: any,
    address: string
}

@Injectable()
export class Router_id {

    public store: any = {
            "store_id": '',
            "product_id": '',
            "specification_product_id": '',
            "item_id": '',
            "order_id": '',
            "view_order_earning_id": '',
            "daily_earning_date": '',
            "store_promo_id": '',
            "new_order_list": [],
            "no_deliveryman_orders": []
        };
    public admin: any = {
            "country_id": '',
            "provider_id": '',
            "user_id": '',
            "store_id": '',
            "city_id": '',
            "document_type": null,
            "page_type": null,
            "order_id": '',
            "vehicle_id": '',
            "delivery_id": '',
            "document_id": '',
            "detail_user_id": '',
            "detail_store_id": '',
            "promo_id": '',
            "promo_uses_id": '',
            "admin_id": '',
            "history_provider_id": '',
            "history_user_id": '',
            "history_store_id": '',
            "invoice_order_id": '',
            "sms_id": '',
            "email_id": '',
            "service_id": '',
            "view_earning_id": '',
            "view_order_earning_id": '',
            "provider_weekly_earning_id": '',
            "store_weekly_earning_id": '',
            "payment_gateway_id":'',
            "review_id":'',
            "view_review_detail_id":'',
            "view_provider_bank_detail_id":'',
            "provider_vehicle_id":'',
            "pro_vehicle_id":'',
            
            "view_promo_start_date":'',
            "view_promo_end_date":'',
            "advertise_id":'',
            "request_id":'',
            "wallet_request_bank_detail_id":'',
            "back_url_show": false

        };
    public user: any;
    public franchise: any;
	public delivery_tag: any[] = [];
    public user_current_delivery_type: CurrentDeliveryType;
    public user_current_store: Object = {};
    public user_current_location : CurrentLocation;
    public store_owner_id : string;
    public store_owner_email : string;
    public from_login : boolean = false;
    public constructor() {
        this.store = {
            "store_id": '',
            "product_id": '',
            "specification_product_id": '',
            "item_id": '',
            "order_id": '',
            "view_order_earning_id": '',
            "daily_earning_date": '',
            "store_promo_id": '',
            "new_order_list": [],
            "no_deliveryman_orders": []
        }
        this.franchise = {
            "franchise_id": '',
            "product_id": '',
            "specification_product_id": '',
            "item_id": '',
            "order_id": '',
            "view_order_earning_id": '',
            "daily_earning_date": '',
            "detail_store_id": '',
            "store_id": '',
            "history_store_id": '',
            "item_store_id": '',
            "store_promo_id": ''
        }
        this.admin = {
            "country_id": '',
            "provider_id": '',
            "user_id": '',
            "store_id": '',
            "city_id": '',
            "document_type": null,
            "page_type": null,
            "order_id": '',
            "vehicle_id": '',
            "delivery_id": '',
            "document_id": '',
            "detail_user_id": '',
            "detail_store_id": '',
            "promo_id": '',
            "promo_uses_id": '',
            "admin_id": '',
            "history_provider_id": '',
            "history_user_id": '',
            "history_store_id": '',
            "invoice_order_id": '',
            "sms_id": '',
            "email_id": '',
            "service_id": '',
            "view_earning_id": '',
            "view_order_earning_id": '',
            "provider_weekly_earning_id": '',
            "store_weekly_earning_id": '',
            "payment_gateway_id":'',
            "review_id":'',
            "view_review_detail_id":'',
            "view_provider_bank_detail_id":'',
            "provider_vehicle_id":'',
            "pro_vehicle_id":'',
            
            "view_promo_start_date":'',
            "view_promo_end_date":'',
            "advertise_id":'',
            "request_id":'',
            "wallet_request_bank_detail_id":'',
            "back_url_show": false

        }

        this.user={
            "delivery_type_id": '',
            "city_id": '',
            "store_id": '',
            "currency": '',
            "delivery_currency": ''
        }

        this.user_current_delivery_type ={
            deliveryname: '',
            image_url: '',
            icon_url: '',
            description: '',
            _id:null
        }

        this.user_current_location = {
            city1: '',
            city2: '',
            city3: '',
            country: '',
            country_code: '',
            country_code_2: '',
            city_code: '',
            latitude: '',
            longitude: '',
            address: ''
        }
    }

}
