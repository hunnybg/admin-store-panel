import {Component, OnInit, ViewContainerRef, ViewChild} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery: any;
declare var swal: any;
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import * as moment from 'moment-timezone';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    providers: [Helper]
})
export class StoreOrderComponent implements OnInit {

    @ViewChild('cancel_order_modal')
    cancel_order_modal: ModalComponent;

    @ViewChild('complete_order_modal')
    complete_order_modal: ModalComponent;

    @ViewChild('estimated_time_modal')
    estimated_time_modal: ModalComponent;

    estimated_time: number = null;

    order_id: Object = null;
    confirmation_code_for_complete_delivery: number = null;
    confirmation_code: number = null;
    conf_code_error_message: Boolean = false;
    is_confirmation_code_required_at_complete_delivery: Boolean = false;

    title: any;
    button: any;
    ORDER_STATE: any;
    NEW_ORDER_STATE: any;
    heading_title: any;
    status: any;
    store_id: Object;
    server_token: String;
    order_list: any[];
    interval: any;

    sort_field: string;
    sort_order: number;
    search_field: string;
    search_value: string;
    page: number;
    total_page: number;
    total_pages: number[];
    moment: any;
    current_order: any = [];
    cancel_reason: string = '';

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
        this.status = this.helper.status
        this.order_list = [];
        this.filter(1)
        this.interval = setInterval(() => {
            this.orderDetail()
        }, this.helper.TIMEOUT.NEW_ORDER_REQUEST);


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
    ngOnDestroy() {
        clearInterval(this.interval);
    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    edit_order(order_id) {
        this.helper.router_id.store.order_id = order_id;
        this.helper.router.navigate(['store/edit/order']);
    }

    filter(page) {
        this.myLoading = true;
        this.page = page;
        this.helper.http.post(this.helper.POST_METHOD.ORDER_LIST_SEARCH_SORT, {
            store_id: this.store_id, server_token: this.server_token, sort_field: this.sort_field, sort_order: this.sort_order,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {

            console.log(res_data)
            this.myLoading = false;
            if (res_data.success == false) {
                this.order_list = [];
                this.total_pages = [];
            }
            else {
                this.order_list = res_data.orders;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                this.is_confirmation_code_required_at_complete_delivery = res_data.is_confirmation_code_required_at_complete_delivery;
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    vieworder_detail(id) {
        this.helper.router_id.store.order_id = id;
        this.helper.router.navigate(['store/order/detail']);
    }

    viewcart_detail(id) {
        this.helper.router_id.store.order_id = id;
        this.helper.router.navigate(['store/cart/detail']);
    }

    orderDetail() {

        this.helper.http.post(this.helper.POST_METHOD.ORDER_LIST_SEARCH_SORT, {
            store_id: this.store_id, server_token: this.server_token, sort_field: this.sort_field, sort_order: this.sort_order,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {
                this.order_list = [];

            }
            else {
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)

                this.order_list.forEach((value, index) => {

                    var new_index = res_data.orders.findIndex(x => x._id == this.order_list[index]._id)
                    if (new_index == -1) {
                        this.order_list.splice(index, 1)
                    }
                    else {
                        this.order_list[index].order_status = res_data.orders[new_index].order_status
                    }

                });


                res_data.orders.forEach((new_value, index) => {
                    var aaa = this.order_list.findIndex(x => x._id == res_data.orders[index]._id)

                    if (aaa == -1) {
                        this.order_list.unshift(new_value)
                    }
                });
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    orderStatus(data) {

        var store = JSON.parse(localStorage.getItem('store'));
        if (data.order_type == 7 && data.order_status === this.ORDER_STATE.STORE_PREPARING_ORDER && store.is_ask_estimated_time_for_ready_order) {

            this.order_id = data.order_id;
            this.estimated_time_modal.open();
        } else {
            this.myLoading = true;
            this.helper.http.post(this.helper.POST_METHOD.SET_ORDER_STATUS, {
                store_id: this.store_id,
                server_token: this.server_token,
                order_id: data.order_id,
                order_status: data.order_status
            }).map((res: Response) => res.json()).subscribe(res_data => {

                this.myLoading = false;
                if (res_data.success == false) {

                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message()
                }
                else {
                    var index = this.order_list.findIndex(x => x._id == data.order_id);
                    this.order_list[index].order_status = data.order_status;
                    if(data.order_status == this.ORDER_STATE.STORE_ACCEPTED){
                        let index = this.helper.router_id.store.new_order_list.findIndex((x)=>x._id == data.order_id);
                        if(index !== -1){
                            this.helper.router_id.store.new_order_list.splice(index, 1);
                        }
                    }
                }
            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
    }
    rejectOrCancleOrder(data) {
        this.current_order = data;
        this.helper.ngZone.run(() => {
            jQuery('.iradio').iCheck({
                handle: 'radio',
                radioClass: 'iradio_square-green'
            });
            jQuery('#default_reason').iCheck('check');
            this.cancel_reason = jQuery('#default_reason').val();
            jQuery('.iradio').on('ifChecked', (event) => {

                if (event.target.value == 1) {
                    jQuery('#text_box').show();
                    this.cancel_reason = '';
                } else {
                    jQuery('#text_box').hide();
                    this.cancel_reason = event.target.value;
                }
            });
        });
        this.cancel_order_modal.open();

    }
    cancelservice() {
        if (this.cancel_reason !== '') {
            this.cancel_order_modal.close();
            let data = this.current_order;
            this.myLoading = true;
            this.helper.http.post(this.helper.POST_METHOD.STORE_CANCEL_OR_REJECT_ORDER, {
                store_id: this.store_id,
                cancel_reason: this.cancel_reason,
                server_token: this.server_token,
                order_id: data.order_id,
                order_status: data.order_status
            }).map((res: Response) => res.json()).subscribe(res_data => {

                this.myLoading = false;
                if (res_data.success == false) {

                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message()
                }
                else {

                    var index = this.order_list.findIndex(x => x._id == data.order_id);
                    this.order_list[index].order_status = data.order_status;

                }
            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
    }
    orderAssignProvider(order_id) {
        this.myLoading = true;
        let json;
        var store = JSON.parse(localStorage.getItem('store'));
        if (store.is_ask_estimated_time_for_ready_order) {
            json = {store_id: this.store_id, server_token: this.server_token, order_id: order_id, estimated_time_for_ready_order: this.estimated_time}
        } else {
            json = {store_id: this.store_id, server_token: this.server_token, order_id: order_id}
        }
        this.helper.http.post(this.helper.POST_METHOD.CREATE_REQUEST, json).map((res: Response) => res.json()).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {

                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
                this.estimated_time_modal.close();
            }
            else {
                this.helper.router.navigate(['store/deliveries']);
                var index = this.order_list.findIndex(x => x._id == order_id);
                if(index!==-1){
                    this.order_list.splice(index, 1)
                }
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    completeDeliveryModal(order_id, confirmation_code_for_complete_delivery) {
        this.order_id = order_id;
        this.confirmation_code_for_complete_delivery = confirmation_code_for_complete_delivery;

        if (this.is_confirmation_code_required_at_complete_delivery) {
            this.complete_order_modal.open();
        } else {
            this.myLoading = true;
            this.helper.http.post(this.helper.POST_METHOD.STORE_COMPLETE_ORDER, {
                store_id: this.store_id,
                server_token: this.server_token,
                order_id: this.order_id
            }).map((res: Response) => res.json()).subscribe(res_data => {

                this.myLoading = false;
                if (res_data.success == false) {

                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message()
                }
                else {
                    this.helper.router.navigate(['store/history']);
                }
            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
    }

    completeDelivery() {

        if (this.confirmation_code == this.confirmation_code_for_complete_delivery) {
            this.complete_order_modal.close();
            this.conf_code_error_message = false;
            this.myLoading = true;
            this.helper.http.post(this.helper.POST_METHOD.STORE_COMPLETE_ORDER, {
                store_id: this.store_id,
                server_token: this.server_token,
                order_id: this.order_id
            }).map((res: Response) => res.json()).subscribe(res_data => {

                this.myLoading = false;
                if (res_data.success == false) {

                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message()
                }
                else {
                    this.helper.router.navigate(['store/history']);
                }
            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        } else {
            this.conf_code_error_message = true;
        }
    }
}
