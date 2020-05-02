import {Component, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;
import * as moment from 'moment-timezone';
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    providers: [Helper]
})
export class OrderComponent implements OnInit {

    @ViewChild('order_detail_modal')
    order_detail_modal: ModalComponent;
    title: any;
    button: any;
    ORDER_STATE: any;
    NEW_ORDER_STATE: any;
    ORDER_FEATURE_TYPE: any;
    DATE_FORMAT: any;
    heading_title: any;
    status: any;
    order_list: any[];
    interval: any;
    search_field: string;
    search_value: string;
    page: number;
    total_page: number;
    total_pages: number[];
    myLoading: boolean = true;
    moment: any;
    timezone: string;
    order_detail: any = {};
    order_status: any = 'all';
    pickup_type: any = 'both';
    created_by: any = 'both';
    payment_status: any = 'all';
    order_type: any = 'both';
    total_item:number = 0;
    order_total:number = 0;
    product_item_total:number = 0;
    product_item_total_array:number[] = [];
    product_item_specification_total:number = 0;
    product_item_specification_total_array:number[] = [];
    product_specification_total_array:any[] = [];
    hide_specification_group: any[] = [];
    specifications: any[] = [];
    item_note: string = '';
    is_show_specification: boolean = false;

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
        this.search_field = "user_detail.first_name";
        this.search_value = "";
        //        this.start_date = '';
        //        this.end_date = '';
        this.page = 1
        this.moment = moment;
        this.timezone = "";

        this.helper.message();
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.ORDER_STATE = this.helper.ORDER_STATE
        this.NEW_ORDER_STATE = this.helper.NEW_ORDER_STATE;
        this.ORDER_FEATURE_TYPE = this.helper.ORDER_FEATURE_TYPE;
        this.DATE_FORMAT = this.helper.DATE_FORMAT
        this.status = this.helper.status
        this.title = this.helper.title
        this.order_list = [];

        this.orderDetail()
        this.interval = setInterval(() => {
            this.orderDetail()
        }, this.helper.TIMEOUT.NEW_ORDER_REQUEST);

        this.admin_history(1)

        jQuery(this.helper.elementRef.nativeElement).find('#order_status').on('change', (evnt, res_data) => {

            this.order_status = res_data.selected;

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

    view_cart(id) {
        this.helper.router_id.admin.order_id = id;
        this.helper.router.navigate(['admin/view_cart']);
    }

    admin_history(page) {
        this.myLoading = true;
        this.page = page;
        this.helper.http.post('/admin/orders_list', {
            order_status: this.order_status, payment_status: this.payment_status, pickup_type: this.pickup_type, created_by: this.created_by,
            order_type: this.order_type, search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {

                this.order_list = [];
                this.total_pages = [];

            }
            else {
                this.timezone = res_data.timezone;
                this.order_list = res_data.orders;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                if(this.order_list.length>0){
                    this.order_detail = this.order_list[0];
                }
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    orderDetail() {
        this.helper.http.post('/admin/orders_list', {order_status: this.order_status, payment_status: this.payment_status, pickup_type: this.pickup_type,
            created_by: this.created_by, order_type: this.order_type, search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {
                this.order_list = [];
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
            else {
                this.timezone = res_data.timezone;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)

                this.order_list.forEach((value, index) => {

                    var new_index = res_data.orders.findIndex(x => x._id == this.order_list[index]._id)
                    if (new_index == -1) {
                        this.order_list.splice(index, 1)
                    }
                    else {
                        this.order_list[index].order_status = res_data.orders[new_index].order_status;
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
                this.helper.http_status(error)
            });
    }
    
    // order_export_csv
    order_export_csv() {
        this.helper.http.post('/admin/orders_list', {
            order_status: this.order_status, payment_status: this.payment_status,  pickup_type: this.pickup_type, created_by: this.created_by,
            order_type: this.order_type, search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {

            var json2csv = require('json2csv');
            res_data.orders.forEach((order, index) => {
                if (order.order_payment_detail.is_paid_from_wallet) {
                    order.payment_status = this.title.wallet;
                } else {
                    if (order.order_payment_detail.is_payment_mode_cash) {
                        order.payment_status = this.title.cash;
                    } else {
                        if (order.order_payment_detail.length > 0) {
                        order.payment_status = order.payment_gateway_detail[0].name;
                        }
                    }
                }

                order.user_name = order.user_detail.first_name + ' ' + order.user_detail.last_name;
                order.store_name = order.store_detail.name;
               
                order.city_name = order.city_detail.city_name;
                

                switch (order.order_status) {
                    case this.NEW_ORDER_STATE.NEW_ORDER:
                        order.status = this.helper.status.new_order;
                        break;
                    case this.NEW_ORDER_STATE.ORDER_PROCESSING:
                        order.status = this.helper.status.order_processing;
                        break;
                    case this.NEW_ORDER_STATE.ORDER_MADE:
                        order.status = this.helper.status.ready;
                        break;
                    case this.NEW_ORDER_STATE.CANCELLATION_REQUESTED:
                        order.status = this.helper.status.cancel_requested;
                        break;
                    default:
                        order.satus = '';
                }

                switch (order.order_feature_type) {
                    case this.ORDER_FEATURE_TYPE.DINE_IN:
                        order.order_feature_type = this.helper.status.dine_in;
                        break;
                    case this.ORDER_FEATURE_TYPE.TAKE_OUT:
                        order.order_feature_type = this.helper.status.take_out;
                        break;
                    case this.ORDER_FEATURE_TYPE.DRIVE_THRU:
                        order.order_feature_type = this.helper.status.take_thru;
                        break;
                    case this.ORDER_FEATURE_TYPE.BAR:
                        order.order_feature_type = this.helper.status.bar;
                        break;
                    default:
                        order.order_feature_type = this.helper.status.dine_in;
                }
                order.amount = ((+order.order_payment_detail.total_delivery_price + +order.order_payment_detail.total_order_price).toFixed(2));
            });

            var fieldNames = [this.title.id,
            this.title.date,
            this.title.user,
            this.title.store,
            this.title.city,
            this.title.order_type,
            this.title.status,
            this.title.amount,
            // this.title.delivery_at
            ];
            var fields = ['unique_id',
                'created_at',
                'user_name',
                'store_name',
                'city_name',
                'order_feature_type',
                'status',
                'amount',
                // 'store_order_created_at'
            ];
           
            var csv = json2csv({data: res_data.orders, fields: fields, fieldNames: fieldNames});

            var final_csv: any = csv;
            this.helper.downloadFile(final_csv);
        });
    }
    
    orders_export_excel() {
        this.helper.http.post('/admin/orders_list', {
            order_status: this.order_status, payment_status: this.payment_status,  pickup_type: this.pickup_type, created_by: this.created_by,
            order_type: this.order_type, search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {

            var json_data = [];
            var json2excel = require('js2excel');
            res_data.orders.forEach((order, index) => {
                if (order.order_payment_detail.is_paid_from_wallet) {
                    order.payment_status = this.title.wallet;
                } else {
                    if (order.order_payment_detail.is_payment_mode_cash) {
                        order.payment_status = this.title.cash;
                    } else {
                        if (order.order_payment_detail.length > 0) {
                        order.payment_status = order.payment_gateway_detail[0].name;
                        }
                    }
                }

                order.user_name = order.user_detail.first_name + ' ' + order.user_detail.last_name;
                order.store_name = order.store_detail.name;
                order.city_name = order.city_detail.city_name;
                

                switch (order.order_status) {
                    case this.ORDER_STATE.WAITING_FOR_ACCEPT_STORE:
                        order.status = this.status.waiting_for_accept;
                        break;
                    case this.ORDER_STATE.STORE_ACCEPTED:
                        order.status = this.status.accepted;
                        break;
                    case this.ORDER_STATE.STORE_PREPARING_ORDER:
                        order.status = this.status.start_preparing_order;
                        break;
                    case this.ORDER_STATE.OREDER_READY:
                        order.status = this.status.order_ready;
                        break;
                    default:
                        order.satus = '';
                }
                order.amount = ((+order.order_payment_detail.total_delivery_price + +order.order_payment_detail.total_order_price).toFixed(2));
            
                json_data.push({
                    "ID": order.unique_id,
                    "User":order.user_name,
                    "Store":order.store_name,
                    "City":order.city_name,
                    "Status":order.status,
                    "Amount":order.amount,
                    "Payment By":order.payment_status,
                    "Date":order.created_at
                });
            });
           
            json2excel.json2excel({
                data: json_data,
                name: 'order_excel',
                formateDate: 'yyyy/mm/dd'
            });
            
        });
    }

    open_detail_modal(){
        this.is_show_specification = false;
        this.order_total = 0;
        this.product_item_total = 0;
        this.total_item = 0;
        this.product_item_specification_total = 0;
        this.product_item_specification_total_array = [];
        this.product_item_total_array = [];
        this.product_specification_total_array = [];
        this.order_detail.cart_detail.order_details.forEach((product, product_index)=>{
            this.hide_specification_group[product_index]="false"
            product.items.forEach((item) =>{
                this.order_total=this.order_total + (item.item_price + item.total_specification_price)*item.quantity
                this.product_item_total=this.product_item_total + (item.item_price + item.total_specification_price)*item.quantity
                this.total_item++;
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
        });
        this.order_detail_modal.open();
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
        this.is_show_specification= true;
        this.specifications = this.order_detail.cart_detail.order_details[product_index].items[item_index].specifications;
        this.item_note = this.order_detail.cart_detail.order_details[product_index].items[item_index].note_for_item;
    }

    get_order_detail(index){
        this.order_detail = this.order_list[index];
    }


}
