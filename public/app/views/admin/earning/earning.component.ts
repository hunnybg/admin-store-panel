import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;

@Component({
    selector: 'app-earning',
    templateUrl: './earning.component.html',
    providers: [Helper]
})
export class EarningComponent implements OnInit {

    title: any;
    button: any;
    ORDER_STATE: any;
    DATE_FORMAT: any;
    heading_title: any;
    status: any;
    order_list: any[];
    sort_field: string;
    sort_order: number;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    total_page: number;
    total_pages: number[];
    total_item: number;
    order_total: String;
    order_count: number;
    order_id: Object;
    page_tab: number;

    user_paid: number;
    user_cash: number;
    user_card: number;
    user_wallet: number;
    user_refferal: number;
    promo_payment: number;

    myLoading: boolean = true;


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
        this.start_date = '';
        this.end_date = '';
        this.page = 1


        this.helper.message()

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.ORDER_STATE = this.helper.ORDER_STATE;
        this.DATE_FORMAT = this.helper.DATE_FORMAT;
        this.status = this.helper.status;
        this.title = this.helper.title;
        this.order_list = [];
        this.page_tab = 1;

        this.total_item = 0;
        this.order_total = "";
        this.order_count = 0;
        this.order_id = "";

        this.user_paid = 0;
        this.user_cash = 0;
        this.user_card = 0;
        this.user_wallet = 0;
        this.user_refferal = 0;
        this.promo_payment = 0;

        this.admin_earning(1)

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

    admin_earning(page) {
        this.page = page;
        this.helper.http.post('/admin/get_earning', {
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_order: this.sort_order,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {

                this.order_list = [];
                this.total_pages = [];

            }
            else {

                this.order_list = res_data.orders;
                this.total_page = res_data.pages;
                this.order_total = res_data.order_total;
                this.order_count = res_data.order_count;


                this.user_paid = res_data.order_total.user_paid;
                this.user_cash = res_data.order_total.user_cash;
                this.user_card = res_data.order_total.user_card;
                this.user_wallet = res_data.order_total.user_wallet;
                this.user_refferal = res_data.order_total.user_refferal;
                this.promo_payment = res_data.order_total.promo_payment;
                res_data.orders.forEach((order) => {
                    order.order_details.forEach((product) => {
                        product.items.forEach((item) => {
                            this.total_item = product.items.length;
                        })

                    })
                })

                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    viewEarningDetail(id) {
        this.helper.router_id.admin.view_earning_id = id;
        this.helper.router.navigate(['admin/earning_detail']);
    }




    earning_export_csv() {
        this.helper.http.post('/admin/get_earning', {
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_order: this.sort_order,
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {
            var json2csv = require('json2csv');

            this.order_count = res_data.order_count;
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

                order.store_name = order.store_detail.name;
                order.currency = order.country_detail.currency_sign;
                order.user_name = order.user_detail.first_name + ' ' + order.user_detail.last_name;
                if (order.request_detail != undefined) {
                    if (order.provider_detail.length > 0) {
                        order.provider_name = order.provider_detail[0].first_name + ' ' + order.provider_detail[0].last_name;
                    }
                }

                switch (order.order_status) {
                    case this.ORDER_STATE.STORE_REJECTED:
                        order.status = this.status.rejected;
                        break;
                    case this.ORDER_STATE.STORE_CANCELLED:
                        order.status = this.status.cancelled;
                        break;
                    case this.ORDER_STATE.NO_DELIVERY_MAN_FOUND:
                        order.status = this.status.no_delivery_man_found;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_REJECTED:
                        order.status = this.status.delivery_man_rejected;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_CANCELLED:
                        order.status = this.status.delivery_man_cancelled;
                        break;
                    case this.ORDER_STATE.CANCELED_BY_USER:
                        order.status = this.status.user_cancelled;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_COMPLETE_DELIVERY:
                        order.status = this.status.order_delivered;
                        break;
                    case this.ORDER_STATE.ORDER_COMPLETED:
                        order.status = this.status.completed;
                        break;
                    default:
                        order.satus = '';
                }
            });


            var fieldNames = [
                this.title.id,
                this.title.complete_date,
                this.title.status,
                this.title.user,
                this.title.store,
                this.title.provider,
                this.title.payment_by,
                this.title.currency,

                this.title.earning_no_of_items,
                this.title.order_price,
                this.title.delivery_price,
                this.title.earning_promo,
                this.title.earning_total,
                this.title.earning_wallet,
                this.title.earning_provider_fees,

                this.title.provider_paid_order,
                this.title.earning_provider_have_cash,
                this.title.earning_pay_provider,
                this.title.provider_income_set_in_wallet,

                this.title.earning_store_fees,
                this.title.earning_store_paid_delivery_fees,
                this.title.earning_store_have_payment,
                this.title.earning_pay_store,
                this.title.store_income_set_in_wallet,
                this.title.earning_refund_amount
            ];



            var fields = ['unique_id',
                'completed_at',
                'status',
                'user_name',
                'store_name',
                'provider_name',
                'payment_status',
                'currency',
                'order_payment_detail.total_item_count',
                'order_payment_detail.total_order_price',
                'order_payment_detail.total_delivery_price',
                'order_payment_detail.promo_payment',
                'order_payment_detail.total',
                'order_payment_detail.wallet_payment',
                'order_payment_detail.total_provider_income',
                'order_payment_detail.provider_paid_order_payment',
                'order_payment_detail.provider_have_cash_payment',

                'order_payment_detail.pay_to_provider',
                'order_payment_detail.provider_income_set_in_wallet',
                'order_payment_detail.total_store_income',
                'order_payment_detail.store_have_service_payment',

                'order_payment_detail.total_store_have_payment',
                'order_payment_detail.pay_to_store',
                'order_payment_detail.store_income_set_in_wallet',
                'order_payment_detail.refund_amount'
            ];



            var order_total_fieldNames = [this.title.earning_paid,
            this.title.earning_promo,
            this.title.earning_cash,
            this.title.earning_card,
            this.title.earning_wallet,
            this.title.earning_get_refferal,

            this.title.total_item,
            this.title.earning_orders,
            this.title.earning_completed,
            this.title.earning_cancelled,
            this.title.rejected,
            this.title.earning_refund_amount,
            this.title.earning_cancellation_fees,
            this.title.earning_total,
            this.title.order_price,
            this.title.earning_delivery_price,
            this.title.earning_admin_earn,
            this.title.order_deliveryman_earn,
            this.title.store_earn,
            this.title.earning_promo,
            this.title.earning_cash,
            this.title.earning_other_payment,
            this.title.earning_wallet,
            this.title.pay_to_provider,
            this.title.pay_to_store,


            this.title.deliveries_payment,
            this.title.earning_admin_earn,
            this.title.profit,
            this.title.provider_paid_order,
            this.title.earning_cash,
            this.title.pay,

            this.title.order_payment,
            this.title.admin_earn,
            this.title.profit,
            this.title.store_have_payment,
            this.title.store_have_service_payment,
            this.title.pay

            ];
            var order_total_fields = ['user_paid',
                'promo_payment',
                'user_cash',
                'user_card',
                'user_wallet',
                'user_refferal',

                'total_item_count',
                'order_count',
                'total_completed_orders',
                'total_cancelled_orders',
                'total_rejected_orders',
                'refund_amount',
                'order_cancellation_charge',
                'total',
                'total_order_price',
                'total_delivery_price',
                'admin_earn',
                'deliveryman_earn',
                'store_earn',
                'promo_payment',
                'cash_payment',
                'other_payment',
                'wallet',

                'pay_to_provider',
                'pay_to_store',
                'total_delivery_price',
                'provider_admin_earn',
                'provider_profit',
                'provider_paid_order_payment',
                'provider_cash',
                'provider_paid',

                'total_order_price',
                'store_admin_earn',
                'store_profit',
                'store_have_payment',
                'store_have_service_payment',
                'store_paid'
            ];





            var order_total_csv = json2csv({data: res_data.order_total, fields: order_total_fields, fieldNames: order_total_fieldNames});
            var csv = json2csv({data: res_data.orders, fields: fields, fieldNames: fieldNames});

            var final_csv: any = order_total_csv + "\n" + "\n" + csv

            this.helper.downloadFile(final_csv);

        });
    }





    earning_export_excel() {
        this.helper.http.post('/admin/get_earning', {
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_order: this.sort_order,
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {

           
            var json_data = [];
            var json2excel = require('js2excel');
            this.order_count = res_data.order_count;
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

                order.store_name = order.store_detail.name;
                order.currency = order.country_detail.currency_sign;
                order.user_name = order.user_detail.first_name + ' ' + order.user_detail.last_name;
                if (order.request_detail != undefined) {
                    if (order.provider_detail.length > 0) {
                        order.provider_name = order.provider_detail[0].first_name + ' ' + order.provider_detail[0].last_name;
                    }
                }

                switch (order.order_status) {
                    case this.ORDER_STATE.STORE_REJECTED:
                        order.status = this.status.rejected;
                        break;
                    case this.ORDER_STATE.STORE_CANCELLED:
                        order.status = this.status.cancelled;
                        break;
                    case this.ORDER_STATE.NO_DELIVERY_MAN_FOUND:
                        order.status = this.status.no_delivery_man_found;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_REJECTED:
                        order.status = this.status.delivery_man_rejected;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_CANCELLED:
                        order.status = this.status.delivery_man_cancelled;
                        break;
                    case this.ORDER_STATE.CANCELED_BY_USER:
                        order.status = this.status.user_cancelled;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_COMPLETE_DELIVERY:
                        order.status = this.status.order_delivered;
                        break;
                    case this.ORDER_STATE.ORDER_COMPLETED:
                        order.status = this.status.completed;
                        break;
                    default:
                        order.status = '';
                }


                json_data.push({
                    "ID": order.unique_id,
                    "User": order.user_name,
                    "Store": order.store_name,
                    "Provider": order.provider_name,
                    "Payment By": order.payment_status,
                    "Currency": order.currency,
                    "Status": order.status,
                    "No Of Items": order.order_payment_detail.total_item_count,
                    "total_order_price": order.order_payment_detail.total_order_price,
                    "total_delivery_price": order.order_payment_detail.total_delivery_price,
                    "promo": order.order_payment_detail.promo_payment,
                    "total": order.order_payment_detail.total,
                    "wallet": order.order_payment_detail.wallet_payment,
                    "provider_fees": order.order_payment_detail.total_provider_income,

                    "provider_paid_order": order.order_payment_detail.provider_paid_order_payment,
                    "provider_have_cash": order.order_payment_detail.provider_have_cash_payment,
                    "pay_provider": order.order_payment_detail.pay_to_provider,
                    "provider_income_set_in_wallet": order.order_payment_detail.provider_income_set_in_wallet,

                    "store_fees": order.order_payment_detail.total_store_income,
                    "store_paid_delivery_fees": order.order_payment_detail.store_have_service_payment,
                    "store_have_payment": order.order_payment_detail.total_store_have_payment,
                    "pay_store": order.order_payment_detail.pay_to_store,
                    "store_income_set_in_wallet": order.order_payment_detail.store_income_set_in_wallet,
                    "refund_amount": order.order_payment_detail.refund_amount,
                    "Date": order.completed_at
                });


            });

            json2excel.json2excel({
                data: json_data,
                name: 'earning_excel',
                formateDate: 'yyyy/mm/dd'
            });


        });
    }



}
