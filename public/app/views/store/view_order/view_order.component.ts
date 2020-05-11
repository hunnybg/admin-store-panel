import { Component, OnInit,ViewContainerRef } from '@angular/core';
import { Http, Response } from '@angular/http';
declare var jQuery:any;
import {Helper} from "../../store_helper";
import * as moment from 'moment-timezone';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-view_order',
    templateUrl: './view_order.component.html',
    providers: [Helper]
})
export class StoreViewOrderComponent implements OnInit {

    store_id:Object;
    server_token:string;
    order_id:Object;
    order_detail:any[] = [];
    currency_sign:any;
    order_total:number;
    product_item_total:number;
    product_item_total_array:number[];
    product_item_specification_total:number;
    product_item_specification_total_array:number[];
    product_specification_total_array:any[];
    total_item:number;

    order_date_time: any[] = [];
    request_date_time: any[] = [];

    public status:any;
    title:any;
    button:any;
    heading_title:any;
    ORDER_STATE:any;
    ORDER_STATUS_ID:any;
    order_status:number;
    order_status_id:number;
    created_at:any = null;
    store_accepted_at:any = null;
    start_preparing_order_at:any = null;
    order_ready_at:any = null;
    store_order_created_at:any = null;
    accepted_at:any = null;
    cancelled_at:any = null;
    start_for_pickup_at:any = null;
    arrived_on_store_at:any = null;
    picked_order_at:any = null;
    start_for_delivery_at:any = null;
    delivered_at:any = null;
    completed_at:any = null;

    invoice_number:string;
    total_order_price:number;
    total_delivery_price:number;
    card_payment:number;
    cash_payment:number;
    is_payment_mode_cash:Boolean = false;
    hide_specification_group: any[] = [];

    user_name:string = '';
    user_email:string = '';
    user_phone: string = '';
    user_profile: string = '';
    destination_addresses:string = '';
    provider_name:string = '';
    provider_email:string = '';
    provider_profile:string = '';
    user_country_code: string = '';
    provider_country_code: string = '';
    provider_phone: string = '';
    myLoading:boolean = true;
    is_user_pick_up_order: Boolean = false;
    specifications: any[] = [];
    item_note: string = '';
    moment: any;
    timezone: string = '';

    constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);
    }

    activeRoute(routename: string): boolean{
        return this.helper.router.url.indexOf(routename) > -1;
    }

    ngOnInit() {
        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {
            this.helper.router.navigate(['store/login']);
        }
        this.order_id = this.helper.router_id.store.order_id;
        this.order_total=0;
        this.total_item=0;
        this.product_item_total=0;
        this.product_item_total_array=[];
        this.product_item_specification_total=0;
        this.product_item_specification_total_array=[];
        this.product_specification_total_array=[];

        this.status=this.helper.status;
        this.title=this.helper.title;
        this.heading_title=this.helper.heading_title;
        this.button=this.helper.button;
        this.ORDER_STATE=this.helper.ORDER_STATE;
        this.ORDER_STATUS_ID=this.helper.ORDER_STATUS_ID;

        this.invoice_number='';
        this.total_order_price=0;
        this.total_delivery_price=0;
        this.card_payment=0;
        this.cash_payment=0;
        this.moment = moment;

        var store = JSON.parse(localStorage.getItem('store'));

        if(store!==null)
        {
            this.store_id= store._id;
            this.server_token= store.server_token;
        }

        if(this.order_id !== '')
        {

            this.helper.http.post(this.helper.POST_METHOD.GET_ORDER_DETAIL,{order_id:this.order_id,store_id:store._id, server_token:store.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {
                this.myLoading=false;
                if(res_data.success == false)
                {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['store/order']);
                }
                else
                {
                    console.log(res_data)
                    this.user_name = res_data.order.user_detail.first_name + ' ' + res_data.order.user_detail.last_name;
                    this.user_email = res_data.order.user_detail.email;
                    this.user_phone = res_data.order.user_detail.phone;
                    this.user_profile = res_data.order.user_detail.image_url;
                    this.user_country_code = res_data.order.user_detail.country_phone_code;

                    this.destination_addresses = res_data.order.cart_detail.destination_addresses;

                    if(res_data.order.provider_detail.length>0)
                    {
                        this.provider_name = res_data.order.provider_detail[0].first_name + ' ' + res_data.order.provider_detail[0].last_name
                        this.provider_email = res_data.order.provider_detail[0].email;
                        this.provider_profile = res_data.order.provider_detail[0].image_url;
                        this.provider_phone = res_data.order.provider_detail[0].phone;
                        this.provider_country_code = res_data.order.provider_detail[0].country_phone_code;
                    }


                    this.invoice_number=res_data.order.order_payment_detail.invoice_number;
                    this.total_order_price = res_data.order.order_payment_detail.total_order_price
                    this.total_delivery_price = res_data.order.order_payment_detail.total_delivery_price
                    this.timezone = res_data.order.timezone !== undefined ? res_data.order.timezone: 'Asia/Kolkata';
                    this.timezone = this.timezone !== '' ? this.timezone: 'Asia/Kolkata';
                    this.order_status=res_data.order.order_status
                    this.order_status_id=res_data.order.order_status_id;

                    this.order_date_time = res_data.order.date_time;
                    if(res_data.order.request_detail){
                        this.request_date_time = res_data.order.request_detail.date_time;
                    }

                    this.created_at=res_data.order.created_at
                    this.store_accepted_at=res_data.order.store_accepted_at
                    this.start_preparing_order_at=res_data.order.start_preparing_order_at
                    this.order_ready_at=res_data.order.order_ready_at
                    this.store_order_created_at=res_data.order.store_order_created_at
                    this.accepted_at=res_data.order.accepted_at
                    this.cancelled_at=res_data.order.cancelled_at
                    this.start_for_pickup_at=res_data.order.start_for_pickup_at
                    this.arrived_on_store_at=res_data.order.arrived_on_store_at
                    this.picked_order_at=res_data.order.picked_order_at
                    this.start_for_delivery_at=res_data.order.start_for_delivery_at
                    this.delivered_at=res_data.order.delivered_at
                    this.completed_at= res_data.order.completed_at != null ? res_data.order.completed_at : res_data.order.created_at

                    this.is_payment_mode_cash = res_data.order.order_payment_detail.is_payment_mode_cash;
                    this.card_payment = res_data.order.order_payment_detail.card_payment
                    this.cash_payment = res_data.order.order_payment_detail.cash_payment
                    this.is_user_pick_up_order = res_data.order.order_payment_detail.is_user_pick_up_order;


                    this.order_detail =res_data.order.cart_detail.order_details
                    this.currency_sign=res_data.order.country_detail.currency_sign

                    this.order_detail.forEach((product, product_index)=>{

                        this.hide_specification_group[product_index]="false"
                        product.items.forEach((item) =>{


                            this.order_total=this.order_total + (item.item_price + item.total_specification_price)*item.quantity
                            this.product_item_total=this.product_item_total + (item.item_price + item.total_specification_price)*item.quantity
                            this.total_item= this.total_item+1;
                            item.specifications.forEach((specification)=>{
                                this.product_item_specification_total= this.product_item_specification_total + specification.specification_price;
                            })
                            this.product_item_specification_total_array.push(this.product_item_specification_total)
                            this.product_item_specification_total=0;
                        })
                        this.product_specification_total_array.push(this.product_item_specification_total_array)
                        this.product_item_specification_total_array=[];
                        this.product_item_total_array.push(this.product_item_total)
                        this.product_item_total=0;
                    })
                    if(this.order_detail.length > 0){
                        this.specifications = this.order_detail[0].items[0].specifications;
                        this.item_note = this.order_detail[0].items[0].note_for_item;
                    }
                }
            },
            (error: any) => {
                this.myLoading=false;
                    this.helper.http_status(error)
            });
        }
        else
        {
            this.helper.router.navigate(['store/order']);
        }
        
    }

    hide_specifications_group(specification_group_index)
    {
        this.hide_specification_group[specification_group_index]='true';
        jQuery('#spec_list'+specification_group_index).hide();
    }

    show_specifications_group(specification_group_index)
    {
        this.hide_specification_group[specification_group_index]='false';
        jQuery('#spec_list'+specification_group_index).show();
    }

    get_specification(product_index, item_index){
        this.specifications = this.order_detail[product_index].items[item_index].specifications;
        this.item_note = this.order_detail[product_index].items[item_index].note_for_item;
    }

    viewInvoice(id)
    {
        this.helper.router_id.store.view_order_earning_id = id;
        this.helper.router.navigate(['store/order_earning_detail']);
    }

}
