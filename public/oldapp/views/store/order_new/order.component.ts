import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { Response } from '@angular/http';
import { Helper } from "../../store_helper";
declare var jQuery: any;
declare var swal: any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import * as moment from 'moment-timezone';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    providers: [Helper]
})
export class StoreOrderComponents implements OnInit {

    @ViewChild('cancel_order_modal')
    cancel_order_modal: ModalComponent;

    @ViewChild('complete_order_modal')
    complete_order_modal: ModalComponent;

    @ViewChild('estimated_time_modal')
    estimated_time_modal: ModalComponent;

    @ViewChild('order_detail_modal')
    order_detail_modal: ModalComponent;

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
    ORDER_FEATURE_TYPE: any;

    heading_title: any;
    status: any;
    store_id: Object;
    server_token: String;
    order_list: any[];
    interval: any;
    order_detail: any = {};
    selected_order_id: any = '';

    payment_mode: string = '';
    order_type: string = '';
    pickup_type: string = '';
    search_field: string;
    search_value: string;
    page: number;
    total_page: number;
    total_pages: number[];
    moment: any;
    current_order: any = [];
    cancel_reason: string = '';
    currency_sign: string = '';
    myLoading: boolean = true;

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
    store_detail: any = {};

    vehicles: any[] = [];
    vehicle_id: string = '';
    @ViewChild('vehicle_list_modal')
    vehicle_list_modal: ModalComponent;
    delivery_type: number = 1;

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
            this.store_detail = store;
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
        this.filter(1)
        this.interval = setInterval(() => {
            this.orderDetail()
        }, this.helper.TIMEOUT.NEW_ORDER_REQUEST);


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
            store_id: this.store_id, server_token: this.server_token, payment_mode: this.payment_mode, order_type: this.order_type, pickup_type: this.pickup_type,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {

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
                this.is_confirmation_code_required_at_complete_delivery = res_data.is_confirmation_code_required_at_complete_delivery;
                if (this.order_list.length > 0) {
                    this.order_detail = JSON.parse(JSON.stringify(this.order_list[0]));
                }
                this.order_list.forEach((order) => {
                    order.is_show = false;
                })
            }
            // jQuery('#sortable-1').sortable({
            //     connectWith: "#sortable-2",
            //     dropOnEmpty: true,
            //     remove: (event, ui)=> {
            //         let index = ui.item[0].attributes.id.value;
            //         this.orderStatus({
            //             order_id: this.order_list[index]._id,
            //             order_type: this.order_list[index].order_type,
            //             order_status: this.NEW_ORDER_STATE.ORDER_PROCESSING,
            //             request_id: this.order_list[index].request_id
            //         })
            //     }
            // });
            // jQuery('#sortable-2').sortable({
            //     connectWith: "#sortable-3",
            //     dropOnEmpty: true,
            //     cursorAt: { left: 5 } ,
            //     remove: (event, ui)=> {
            //         let index = ui.item[0].attributes.id.value;
            //         this.orderStatus({
            //             order_id: this.order_list[index]._id,
            //             order_type: this.order_list[index].order_type,
            //             order_status: this.NEW_ORDER_STATE.ORDER_MADE,
            //             request_id: this.order_list[index].request_id
            //         })
            //     }
            // });
            // jQuery('#sortable-3').sortable({
            //     connectWith: "#sortable-4",
            //     dropOnEmpty: true,
            //     remove: (event, ui)=> {
            //         let index = ui.item[0].attributes.id.value;
            //         this.orderStatus({
            //             order_id: this.order_list[index]._id,
            //             order_type: this.order_list[index].order_type,
            //             order_status: this.NEW_ORDER_STATE.CANCELLATION_REQUESTED,
            //             request_id: this.order_list[index].request_id
            //         })
            //     }
            // });
            // jQuery('#sortable-4').sortable();
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

    get_order_detail(id) {
        let index = this.order_list.findIndex((x) => x._id == id);
        this.order_detail = JSON.parse(JSON.stringify(this.order_list[index]));

        this.order_total = 0;
        this.product_item_total = 0;
        this.total_item = 0;
        this.product_item_specification_total = 0;
        this.product_item_specification_total_array = [];
        this.product_item_total_array = [];
        this.product_specification_total_array = [];

        this.is_show_specification = false;
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

        // if(this.order_detail.cart_detail.order_details.length>0){
        //     this.specifications = this.order_detail.cart_detail.order_details[0].items[0].specifications;
        //     this.item_note = this.order_detail.cart_detail.order_details[0].items[0].note_for_item;
        // }
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


    orderDetail() {

        this.helper.http.post(this.helper.POST_METHOD.ORDER_LIST_SEARCH_SORT, {
            store_id: this.store_id, server_token: this.server_token, payment_mode: this.payment_mode, order_type: this.order_type, pickup_type: this.pickup_type,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {
                this.order_list = [];

            }
            else {
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                this.currency_sign = res_data.currency_sign;
                this.order_list.forEach((value, index) => {

                    var new_index = res_data.orders.findIndex(x => x._id == this.order_list[index]._id)
                    if (new_index == -1) {
                        this.order_list.splice(index, 1)
                    }
                    else {
                        this.order_list[index].order_status = res_data.orders[new_index].order_status
                        this.order_list[index].date_time = res_data.orders[new_index].date_time;
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
        if (data.order_type == 7 && data.request_id == null && data.order_status === this.ORDER_STATE.STORE_PREPARING_ORDER && store.is_ask_estimated_time_for_ready_order) {
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
                    if (data.order_status == this.ORDER_STATE.STORE_ACCEPTED) {
                        let index = this.helper.router_id.store.new_order_list.findIndex((x) => x._id == data.order_id);
                        if (index !== -1) {
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
                    var order_index = this.order_list.findIndex(x => x._id == data.order_id);
                    this.order_list.splice(order_index, 1);
                }
            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
    }
    orderAssignProvider(order_id, delivery_type) {
        this.order_id = order_id;
        this.delivery_type = delivery_type;
        this.myLoading = true;
        this.helper.http.post(this.helper.POST_METHOD.GET_VEHICLE_LIST, { order_id: order_id, delivery_type: delivery_type, store_id: this.store_id, server_token: this.server_token }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            this.estimated_time_modal.close();
            if (res_data.success) {
                this.vehicles = res_data.vehicles;
                this.vehicle_list_modal.open();
                this.vehicle_id = res_data.vehicles[0]._id;
            } else {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
            }
        });
    }

    create_request() {
        let json;
        var store = JSON.parse(localStorage.getItem('store'));
        if (store.is_ask_estimated_time_for_ready_order) {
            json = { store_id: this.store_id, server_token: this.server_token, order_id: this.order_id, estimated_time_for_ready_order: this.estimated_time, vehicle_id: this.vehicle_id }
        } else {
            json = { store_id: this.store_id, server_token: this.server_token, order_id: this.order_id, vehicle_id: this.vehicle_id }
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
            }
            else {
                var index = this.order_list.findIndex(x => x._id == this.order_id);
                if (index !== -1) {
                    this.order_list.splice(index, 1);
                }
            }
            this.vehicle_list_modal.close();
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    completeDeliveryModal(order_id, confirmation_code_for_complete_delivery, is_user_pick_up_order) {
        this.order_id = order_id;
        this.confirmation_code_for_complete_delivery = confirmation_code_for_complete_delivery;

        if (this.is_confirmation_code_required_at_complete_delivery && is_user_pick_up_order) {
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
                    let order_index = this.order_list.findIndex((x) => x._id == this.order_id);
                    this.order_list.splice(order_index, 1);
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
