import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";

declare var jQuery: any;

@Component({
    selector: 'app-order_earning',
    templateUrl: './order_earning.component.html',
    providers: [Helper]
})
export class OrderEarningComponent implements OnInit {
    title: any;
    button: any;
    ORDER_STATE: any;
    DATE_FORMAT: any;
    heading_title: any;
    status: any;
    order_list: any[];
    // sort_field: string;
    // sort_order: number;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    total_page: number;
    total_pages: number[];
    order_total: String;
    admin_currency: String;
    myLoading: boolean = true;
    order_detail: any = {};

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
        // this.sort_field = "unique_id";
        // this.sort_order = -1;
        this.search_field = "user_detail.email";
        this.search_value = "";
        this.start_date = '';
        this.end_date = '';
        this.page = 1
        this.helper.message()
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.ORDER_STATE = this.helper.ORDER_STATE
        this.DATE_FORMAT = this.helper.DATE_FORMAT
        this.status = this.helper.status
        this.title = this.helper.title
        this.order_list = [];
        this.order_total = "";
        this.admin_currency = "";

        this.order_earning(1);

        // jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {
        //
        //     this.sort_field = res_data.selected;
        //
        // });
        // jQuery(this.helper.elementRef.nativeElement).find('#sort_order').on('change', (evnt, res_data) => {
        //
        //     this.sort_order = res_data.selected;
        //
        // });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }
    order_earning(page) {
        this.page = page;
        this.helper.http.post('/admin/get_order_earning', {
            start_date: this.start_date, end_date: this.end_date,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.order_list = [];
                this.total_pages = [];
            }
            else {
                this.order_list = res_data.orders;
                this.order_total = res_data.order_total;
                this.admin_currency = res_data.admin_currency;
                this.total_page = res_data.pages;

                if(this.order_list.length>0){
                    this.order_detail  = this.order_list[0];
                }

                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    viewOrderEarningDetail(id) {
        this.helper.router_id.admin.view_order_earning_id = id;
        this.helper.router.navigate(['admin/order_earning_detail']);

    }

    get_order_detail(index){
        this.order_detail = this.order_list[index];
    }

    order_earning_export_csv() {
        this.helper.http.post('/admin/get_order_earning', {
            start_date: this.start_date,
            end_date: this.end_date,
            search_field: this.search_field,
            search_value: this.search_value

        }).map((res: Response) => res.json()).subscribe(res_data => {

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



                order.user_name = order.user_detail.first_name + ' ' + order.user_detail.last_name;
                order.store_name = order.store_detail.name;
                
                if(order.request_detail != undefined)
                {
                    if(order.provider_detail.length > 0)
                    {
                     order.provider_name = order.provider_detail[0].first_name + ' ' + order.provider_detail[0].last_name;
                   
                    }
                
                }

                order.admin_earning = ((+order.order_payment_detail.total_delivery_price + +order.order_payment_detail.total_order_price).toFixed(2));
            });

            var fieldNames = [this.title.id, this.title.complete_date, this.title.user, this.title.store, this.title.provider,
            this.title.payment_by, this.title.currency,
            this.title.total, this.title.earning, this.title.provider_earning,
            this.title.pay_provider, this.title.provider_income_set_in_wallet,
            this.title.store_earn,
            this.title.pay_store,
            this.title.store_income_set_in_wallet
            ];
            var fields = ['unique_id', 'completed_at', 'user_name', 'store_name', 'provider_name', 'payment_status',
                'currency',
                'order_payment_detail.total',
                'admin_earning',
                'order_payment_detail.total_provider_income',
                'order_payment_detail.pay_to_provider',
                'order_payment_detail.provider_income_set_in_wallet',
                'order_payment_detail.total_store_income',
                'order_payment_detail.pay_to_store',
                'order_payment_detail.store_income_set_in_wallet'
            ];

            var order_total_fieldNames = [this.title.completed, this.title.admin_earn, this.title.admin_earn_in_wallet, this.title.provider_earn,
            this.title.store_earn, this.title.store_income_set_in_wallet,
            this.title.total,
            this.title.cash,
            this.title.other,
            this.title.pay_to_provider,
            this.title.pay_to_store,
            this.title.provider_income_set_in_wallet
            ];
            var order_total_fields = ['total_completed_orders', 'total_admin_earn', 'admin_earn_wallet',
                'provider_earn',
                'store_earn',
                'store_income_set_in_wallet',
                'total',
                'cash_payment',
                'card_payment',
                'pay_to_provider',
                'pay_to_store',
                'provider_income_set_in_wallet'
            ];

            var order_total_csv = json2csv({data: res_data.order_total, fields: order_total_fields, fieldNames: order_total_fieldNames});
            var csv = json2csv({data: res_data.orders, fields: fields, fieldNames: fieldNames});

            var final_csv: any = order_total_csv + "\n" + "\n" + csv

            this.helper.downloadFile(final_csv);
        });
    }




    order_earning_export_excel() {
        this.helper.http.post('/admin/get_order_earning', {
            start_date: this.start_date,
            end_date: this.end_date,
            // sort_field: this.sort_field,
            // sort_order: this.sort_order,
            search_field: this.search_field,
            search_value: this.search_value

        }).map((res: Response) => res.json()).subscribe(res_data => {

            var json_data = [];
            var json2excel = require('js2excel');
            console.log(res_data);
            if (res_data.orders.length !== 0) {
                res_data.orders.forEach((order, index) => {
                    if (order.order_payment_detail.is_paid_from_wallet) {
                        order.payment_status = this.title.wallet;
                    } else {
                        if (order.order_payment_detail.is_payment_mode_cash) {
                            order.payment_status = this.title.cash;
                        } else {
                            order.payment_status = "Stripe";
                        }
                    }



                    order.user_name = order.user_detail.first_name + ' ' + order.user_detail.last_name;
                    order.store_name = '';
                    if(order.store_detail){
                        if(order.store_detail.name){
                            order.store_name = order.store_detail.name;
                        }
                    }

                    if (order.request_detail != undefined) {
                        if (order.provider_detail.length > 0) {
                            order.provider_name = order.provider_detail[0].first_name + ' ' + order.provider_detail[0].last_name;

                        }

                    }

                    order.admin_earning = ((+order.order_payment_detail.total_delivery_price + +order.order_payment_detail.total_order_price).toFixed(2));

                    json_data.push({
                        "ID": order.unique_id,
                        "User": order.user_name,
                        "Store": order.store_name,
                        "Provider": order.provider_name,
                        "Payment By": order.payment_status,
                        "Currency": order.country_detail.currency_sign,
                        "total": order.order_payment_detail.total,
                        "admin_earning": order.admin_earning,
                        "provider_earning": order.order_payment_detail.total_provider_income,
                        "pay_provider": order.order_payment_detail.pay_to_provider,
                        "provider_income_set_in_wallet": order.order_payment_detail.provider_income_set_in_wallet,
                        "store_earn": order.order_payment_detail.total_store_income,
                        "pay_store": order.order_payment_detail.pay_to_store,
                        "store_income_set_in_wallet": order.order_payment_detail.store_income_set_in_wallet
                    });

                });
                json2excel.json2excel({
                    data: json_data,
                    name: 'order_earning_excel',
                    formateDate: 'yyyy/mm/dd'
                });
            }
        });
    }
}
