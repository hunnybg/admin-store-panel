import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Http, Response} from '@angular/http';
declare var jQuery: any;
import {Helper} from "../../helper";

@Component({
    selector: 'app-admin_view_cart',
    templateUrl: './admin_view_cart.component.html',
    providers: [Helper]
})
export class AdminViewCartComponent implements OnInit {

    order_id: Object;
    order_detail: any[];
    currency_sign: any;
    order_total: number;
    product_item_total: number;
    product_item_total_array: number[];
    product_item_specification_total: number;
    product_item_specification_total_array: number[];
    product_specification_total_array: any[];
    total_item: number;

    public status: any;
    title: any;
    button: any;
    heading_title: any;
    ORDER_STATE: any;
    ORDER_STATUS_ID: any;
    DATE_FORMAT: any;
    order_status: number;
    order_status_id: number;
    created_at: any;
    store_accepted_at: any;
    start_preparing_order_at: any;
    order_ready_at: any;
    store_order_created_at: any;
    accepted_at: any;
    cancelled_at: any;
    start_for_pickup_at: any;
    arrived_on_store_at: any;
    picked_order_at: any;
    start_for_delivery_at: any;
    delivered_at: any;
    completed_at: any;

    invoice_number: string;
    total_order_price: number;
    total_delivery_price: number;
    card_payment: number;
    cash_payment: number;
    is_payment_mode_cash: Boolean = false;


    user_name: string = '';
    user_email: string = '';
    provider_name: string = '';
    provider_email: string = '';
    provider_vehicle: string = '';
    myLoading: boolean = true;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    ngOnInit() {

        this.order_id = this.helper.router_id.admin.order_id;
        this.order_total = 0;
        this.total_item = 0;
        this.product_item_total = 0;
        this.product_item_total_array = [];
        this.product_item_specification_total = 0;
        this.product_item_specification_total_array = [];
        this.product_specification_total_array = [];

        this.status = this.helper.status;
        this.title = this.helper.title;
        this.heading_title = this.helper.heading_title;
        this.button = this.helper.button;
        this.ORDER_STATE = this.helper.ORDER_STATE;
        this.ORDER_STATUS_ID = this.helper.ORDER_STATUS_ID;
        this.DATE_FORMAT = this.helper.DATE_FORMAT

        this.invoice_number = '';
        this.total_order_price = 0;
        this.total_delivery_price = 0;
        this.card_payment = 0;
        this.cash_payment = 0;

        if (this.order_id !== '') {

            this.helper.http.post('/api/admin/get_order_data', {order_id: this.order_id}).map((res_data: Response) => res_data.json()).subscribe(res_data => {

                this.myLoading = false;
                if (res_data.success == false) {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['admin/history']);
                }
                else {

                    this.user_name = res_data.order.user_detail.first_name + ' ' + res_data.order.user_detail.last_name;
                    this.user_email = res_data.order.user_detail.email;

                    if (res_data.order.provider_detail !== undefined) {
                        this.provider_name = res_data.order.provider_detail.first_name + ' ' + res_data.order.provider_detail.last_name
                        this.provider_email = res_data.order.provider_detail.email;
                    }


                    this.invoice_number = res_data.order.invoice_number;
                    this.total_order_price = res_data.order.order_payment_detail.total_order_price
                    this.total_delivery_price = res_data.order.order_payment_detail.total_delivery_price

                    this.order_status = res_data.order.order_status
                    this.order_status_id = res_data.order.order_status_id

                    this.created_at = res_data.order.created_at
                    this.store_accepted_at = res_data.order.store_accepted_at
                    this.start_preparing_order_at = res_data.order.start_preparing_order_at
                    this.order_ready_at = res_data.order.order_ready_at
                    this.store_order_created_at = res_data.order.store_order_created_at
                    this.accepted_at = res_data.order.accepted_at
                    this.cancelled_at = res_data.order.cancelled_at
                    this.start_for_pickup_at = res_data.order.start_for_pickup_at
                    this.arrived_on_store_at = res_data.order.arrived_on_store_at
                    this.picked_order_at = res_data.order.picked_order_at
                    this.start_for_delivery_at = res_data.order.start_for_delivery_at
                    this.delivered_at = res_data.order.delivered_at
                    this.completed_at = res_data.order.completed_at
                    
                    this.order_id = res_data.order._id

                    this.is_payment_mode_cash = res_data.order.order_payment_detail.is_payment_mode_cash;
                    this.card_payment = res_data.order.order_payment_detail.card_payment
                    this.cash_payment = res_data.order.order_payment_detail.cash_payment


                    this.order_detail = res_data.order.order_details
                    this.currency_sign = res_data.order.currency

                    res_data.order.order_details.forEach((product) => {
                        product.items.forEach((item) => {
                            this.order_total = this.order_total + (item.item_price + item.total_specification_price) * item.quantity
                            this.product_item_total = this.product_item_total + (item.item_price + item.total_specification_price) * item.quantity
                            this.total_item = this.total_item + 1;
                            item.specifications.forEach((specification) => {
                                this.product_item_specification_total = this.product_item_specification_total + specification.specification_price;
                            })
                            this.product_item_specification_total_array.push(this.product_item_specification_total)
                            this.product_item_specification_total = 0;
                        })
                        this.product_specification_total_array.push(this.product_item_specification_total_array)
                        this.product_item_specification_total_array = [];
                        this.product_item_total_array.push(this.product_item_total)
                        this.product_item_total = 0;
                    })
                }
            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
        else {
            this.helper.router.navigate(['admin/history']);
        }



    }
    viewOrderEarningDetail(id) {
        this.helper.router_id.admin.view_order_earning_id = id;
        this.helper.router.navigate(['admin/order_earning_detail']);
    }

}
