import { Component, OnInit , ViewContainerRef } from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery:any;
import { map } from 'rxjs/operators';

export interface OrderTotal
{
    total_completed_orders:number,
    store_earn:number,
    total:number,
    total_admin_earn:number,
    pay_to_store:number,
    store_have_service_payment:number,
    total_item_count: number
}

@Component({
  	selector: 'app-earning',
  	templateUrl: './earning.component.html',
    providers: [Helper]
})
export class StoreEarningComponent implements OnInit {

    title: any;
    button: any;
    ORDER_STATE: any;
    heading_title: any;
    status: any;
    store_id: Object;
    server_token: String;
    store_earning_list: any[];

    sort_field: string;
    sort_order: number;
    search_field: string;
    search_value: string;
    start_date: any;
    end_date: any;
    page: number;
    total_page: number;
    total_pages: number[];
    myLoading: boolean = true;

    private order_total: OrderTotal;

    constructor(private helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {

        jQuery(".chosen-select").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);


    }

    ngOnInit() {

        this.sort_field = "unique_id";
        this.sort_order = -1;
        this.search_field = "user_detail.first_name";
        this.search_value = "";
        this.start_date = {formatted: ''};
        this.end_date = {formatted: ''};
        this.page = 1;
        this.order_total = {
            total_completed_orders: 0,
            store_earn: 0,
            total: 0,
            total_admin_earn: 0,
            pay_to_store: 0,
            store_have_service_payment: 0,
            total_item_count: 0
        };

        let token = this.helper.tokenService.getToken();

        if (!token || !token.token) {

            this.helper.router.navigate(['store/owner_dashboard']);
        }
        this.helper.message()
        var store = JSON.parse(localStorage.getItem('store'));
        if (store !== null) {
            this.store_id = store._id
            this.server_token = store.server_token
        }
        if (!JSON.parse(localStorage.getItem('store_document_ulpoaded')) && JSON.parse(localStorage.getItem('admin_store_document_ulpoaded'))) {
            this.helper.router.navigate(['store/upload_document']);
        }
        this.title = this.helper.title
        this.button = this.helper.button
        this.heading_title = this.helper.heading_title
        this.ORDER_STATE = this.helper.ORDER_STATE
        this.status = status
        this.store_earning_list = [];

        this.store_earning(1)

        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {
            this.sort_field = res_data.selected;
        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_order').on('change', (evnt, res_data) => {

            this.sort_order = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
    }

    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    store_earning(page) {
        this.myLoading = true;
        this.page = page;
        this.helper.http.post(this.helper.POST_METHOD.GET_STORE_EARNING, {
            store_id: this.store_id,
            server_token: this.server_token,
            start_date: this.start_date.formatted,
            end_date: this.end_date.formatted,
            sort_field: this.sort_field,
            sort_order: this.sort_order,
            search_field: this.search_field,
            search_value: this.search_value,
            page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == false) {
                    this.store_earning_list = [];
                    this.total_pages = [];
                    this.order_total = {
                        total_completed_orders: 0,
                        store_earn: 0,
                        total: 0,
                        total_admin_earn: 0,
                        pay_to_store: 0,
                        store_have_service_payment: 0,
                        total_item_count: 0
                    };
                    this.total_page = 0;
                }
                else {
                    this.store_earning_list = res_data.orders;
                    this.order_total = res_data.order_total;
                    this.total_page = res_data.pages;
                    this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                }
            },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    viewOrderEarningDetail(id) {
        this.helper.router_id.store.view_order_earning_id = id;
        this.helper.router.navigate(['store/order_earning_detail']);

    }

    export_excel() {
        this.helper.http.post(this.helper.POST_METHOD.GET_STORE_EARNING, {
            store_id: this.store_id,
            server_token: this.server_token,
            start_date: this.start_date.formatted,
            end_date: this.end_date.formatted,
            sort_field: this.sort_field,
            sort_order: this.sort_order,
            search_field: this.search_field,
            search_value: this.search_value
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if(res_data.success){
                var json2csv = require('json2csv');
                res_data.orders.forEach((order, index) => {
                    if (order.order_payment_detail.is_paid_from_wallet) {
                        order.payment_status = this.title.wallet;
                    } else {
                        if (order.order_payment_detail.is_payment_mode_cash) {
                            order.payment_status = this.title.cash;
                        } else {
                            order.payment_status = order.payment_gateway_detail[0].name;
                        }
                    }

                    if (order.order_payment_detail.is_payment_paid) {
                        order.paid_status = this.title.completed;
                    } else {
                        order.paid_status = this.title.remaining;
                    }

                    order.user_name = order.user_detail.first_name + ' ' + order.user_detail.last_name;
                    order.provider_name = order.provider_detail.first_name + ' ' + order.provider_detail.last_name;

                });

                var fieldNames  = [this.title.id, this.title.completed_at, this.title.user,
                    this.title.payment_by, this.title.payment_status, this.title.currency, this.title.no_of_item, this.title.total_cart_price,
                    this.title.total_order_price, this.title.total, this.title.store_have_service_payment, this.title.earning,
                    this.title.store_profit];
                var fields = ['unique_id', 'completed_at', 'user_name', 'payment_status', 'paid_status',
                    'currency', 'order_payment_detail.total_item_count', 'order_payment_detail.total_cart_price', 'order_payment_detail.total_order_price',
                    'order_payment_detail.total', 'order_payment_detail.store_have_service_payment', 'order_payment_detail.pay_to_store', 'order_payment_detail.total_store_income'
                ];

                var order_total_fieldNames  = [this.title.total_order, this.title.no_of_item, this.title.total_order_price, this.title.total_store_income,
                    this.title.store_have_service_payment, this.title.pay_to_store
                ];
                var order_total_fields = ['total_completed_orders', 'total_item_count', 'store_earn', 'total', 'store_have_service_payment',
                    'pay_to_store'];

                var order_total_csv = json2csv({data: res_data.order_total, fields: order_total_fields, fieldNames: order_total_fieldNames});
                var csv = json2csv({data: res_data.orders, fields: fields, fieldNames: fieldNames});

                var final_csv: any = order_total_csv + "\n" + "\n" + csv

                this.helper.downloadFile(final_csv);
            }

        });
    }
}