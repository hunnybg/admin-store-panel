import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Response } from '@angular/http';
import { Helper } from "../../store_helper";
declare var jQuery: any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import * as moment from 'moment-timezone';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    providers: [Helper]
})
export class StoreHistoryComponent implements OnInit {

    @ViewChild('modal')
    modal: ModalComponent;
    @ViewChild('order_detail_modal')
    order_detail_modal: ModalComponent;

    title: any;
    button: any;
    ORDER_STATE: any;
    NEW_ORDER_STATE: any;
    ORDER_FEATURE_TYPE: any;

    heading_title: any;
    status: any;
    store_id: Object;
    server_token: String;
    order_list: any[];

    pickup_type: any = 'both'
    order_type: any = 'both';
    payment_status: any = 'all';
    created_by: any = 'both';
    order_status_id: string;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    total_page: number;
    total_pages: number[];
    moment: any;
    timezone: string = '';
    order_id: Object = '';
    rating: number = 1;
    review: string = '';
    type: number;
    selected_order_index: number = 0;
    order_detail: any = {};

    total_item: number = 0;
    order_total: number = 0;
    product_item_total: number = 0;
    product_item_total_array: number[] = [];
    product_item_specification_total: number = 0;
    product_item_specification_total_array: number[] = [];
    product_specification_total_array: any[] = [];
    hide_specification_group: any[] = [];
    specifications: any[] = [];
    item_note: string = '';
    is_show_specification: boolean = false;
    currency_sign: any = '';

    myLoading: boolean = true;
    constructor(private helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {
        jQuery(".chosen-select").chosen({ disable_search: true });

        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);


    }


    ngOnInit() {
        this.order_status_id = "";
        this.search_field = "user_detail.first_name";
        this.search_value = "";
        this.start_date = '';
        this.end_date = '';
        this.page = 1;
        this.moment = moment;

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
        this.NEW_ORDER_STATE = this.helper.NEW_ORDER_STATE;
        this.ORDER_FEATURE_TYPE = this.helper.ORDER_FEATURE_TYPE;

        this.status = this.helper.status
        this.order_list = [];

        this.store_history(1)

        jQuery(this.helper.elementRef.nativeElement).find('#order_status_id').on('change', (evnt, res_data) => {

            this.order_status_id = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });

        jQuery(this.helper.elementRef.nativeElement).find('#pickup_type').on('change', (evnt, res_data) => {

            this.pickup_type = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#created_by').on('change', (evnt, res_data) => {

            this.created_by = res_data.selected;

        });

        jQuery(this.helper.elementRef.nativeElement).find('#order_type').on('change', (evnt, res_data) => {

            this.order_type = res_data.selected;

        });

        jQuery(this.helper.elementRef.nativeElement).find('#payment_status').on('change', (evnt, res_data) => {

            this.payment_status = res_data.selected;

        });
    }

    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    open_detail_modal(index) {
        this.order_detail = this.order_list[index];
        this.is_show_specification = false;

        this.order_total = 0;
        this.product_item_total = 0;
        this.total_item = 0;
        this.product_item_specification_total = 0;
        this.product_item_specification_total_array = [];
        this.product_item_total_array = [];
        this.product_specification_total_array = [];

        this.order_detail.cart_detail.order_details.forEach((product, product_index) => {
            this.hide_specification_group[product_index] = "false"
            product.items.forEach((item) => {
                this.order_total = this.order_total + (item.item_price + item.total_specification_price) * item.quantity
                this.product_item_total = this.product_item_total + (item.item_price + item.total_specification_price) * item.quantity
                this.total_item++;
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
        this.order_detail_modal.open();
    }
    hide_specifications_group(specification_group_index) {
        this.hide_specification_group[specification_group_index] = 'true';
        jQuery('#spec_list' + specification_group_index).hide();
    }

    show_specifications_group(specification_group_index) {
        this.hide_specification_group[specification_group_index] = 'false';
        jQuery('#spec_list' + specification_group_index).show();
    }

    get_specification(product_index, item_index) {
        this.is_show_specification = true;
        this.specifications = this.order_detail.cart_detail.order_details[product_index].items[item_index].specifications;
        this.item_note = this.order_detail.cart_detail.order_details[product_index].items[item_index].note_for_item;
    }

    // order_detail(id)
    // {
    //   this.helper.router_id.store.order_id=id;
    //   this.helper.router.navigate(['store/order/detail']);
    // }
    //
    //
    // view_invoice(id) {
    //     this.helper.router_id.store.view_order_earning_id = id;
    //     this.helper.router.navigate(['store/order_earning_detail']);
    //
    // }
    // viewcart_detail(id)
    // {
    //     this.helper.router_id.store.order_id=id;
    //     this.helper.router.navigate(['store/cart/detail']);
    // }
    store_history(page) {
        this.myLoading = true;
        this.selected_order_index = 0;
        this.page = page;
        this.helper.http.post(this.helper.POST_METHOD.HISTORY, {
            store_id: this.store_id, server_token: this.server_token, start_date: this.start_date, end_date: this.end_date,
            payment_status: this.payment_status, created_by: this.created_by, pickup_type: this.pickup_type, order_type: this.order_type,
            order_status_id: this.order_status_id, search_field: this.search_field, search_value: this.search_value, page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {
                this.order_list = [];
                this.total_pages = [];
            }
            else {
                this.currency_sign = res_data.currency_sign;
                this.order_list = res_data.orders;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                if (this.order_list.length > 0) {
                    this.order_detail = this.order_list[0];
                }
                console.log(this.order_detail)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    //    ShowUserDetail_Model(user_id) {
    //        
    //        
    //    }

    get_order_detail(index) {
        this.order_detail = this.order_list[index];
    }

    give_rate_modal(orderid, index, type) {
        this.rating = 1;
        this.review = '';
        this.type = type;
        this.order_id = orderid;
        this.modal.open()
        this.selected_order_index = index;
    }

    give_rate() {
        this.myLoading = true;
        this.modal.close()
        let method = '';
        var json = {};
        if (this.type == 1) {
            method = this.helper.POST_METHOD.STORE_RATING_TO_USER;
            json = {
                store_id: this.store_id,
                server_token: this.server_token,
                store_rating_to_user: this.rating,
                store_review_to_user: this.review,
                order_id: this.order_id
            }
        } else {
            method = this.helper.POST_METHOD.STORE_RATING_TO_PROVIDER;
            json = {
                store_id: this.store_id,
                server_token: this.server_token,
                store_rating_to_provider: this.rating,
                store_review_to_provider: this.review,
                order_id: this.order_id
            }
        }
        this.helper.http.post(method, json).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success) {
                var index = this.order_list.findIndex(x => x._id == this.order_id)
                if (this.type == 1) {
                    this.order_list[index].is_store_rated_to_user = true;
                    if (this.order_list[index].review_detail.length == 0) {
                        this.order_list[index].review_detail[0] = { "store_rating_to_user": this.rating };
                    } else {
                        this.order_list[index].review_detail[0].store_rating_to_user = this.rating;
                    }

                } else {
                    this.order_list[index].is_store_rated_to_provider = true;
                    if (this.order_list[index].review_detail.length == 0) {
                        this.order_list[index].review_detail[0] = { "store_rating_to_provider": this.rating };
                    } else {
                        this.order_list[index].review_detail[0].store_rating_to_provider = this.rating;
                    }
                }
            } else {

            }

            this.rating = 1;
            this.review = '';
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }



    export_excel() {
        this.helper.http.post('/api/store/export_excel_history', {
            store_id: this.store_id, server_token: this.server_token, start_date: this.start_date, end_date: this.end_date,
            order_status_id: this.order_status_id, payment_status: this.payment_status, created_by: this.created_by, pickup_type: this.pickup_type, order_type: this.order_type,
            search_field: this.search_field, search_value: this.search_value
        }).pipe(map((res: Response) => res.json())).subscribe(res => {

            var json2csv = require('json2csv');

            var fieldNames = ['Unique ID', 'User', 'Provider', 'User Rating', 'Provider Rating', 'Date', 'Payment By',
                'Total', 'Status'
            ];
            var fields = ['unique_id', 'user_name', 'provider_name', 'review_detail[0].store_rating_to_user', 'review_detail[0].store_rating_to_provider',
                'completed_at', 'payment_status', 'order_payment_detail.total', 'status'
            ];
            if (res.success) {
                res.orders.forEach((order, index) => {
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
                    if (order.provider_detail.length > 0) {
                        order.provider_name = order.provider_detail[0].first_name + ' ' + order.provider_detail[0].last_name;
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
                var csv = json2csv({ data: res.orders, fields: fields, fieldNames: fieldNames });
                this.helper.downloadFile(csv);
            }
        });
    }


}
