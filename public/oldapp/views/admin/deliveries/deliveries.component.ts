import {Component, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;
import * as moment from 'moment-timezone';
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";

@Component({
    selector: 'app-deliveries',
    templateUrl: './deliveries.component.html',
    providers: [Helper]
})
export class DeliveriesComponent implements OnInit {

    @ViewChild('order_detail_modal')
    order_detail_modal: ModalComponent;

    title:any;
    button:any;
    ORDER_STATE:any;
    heading_title:any;
    status:any;
    store_id:Object;
    server_token:String;
    requests:any[];
    interval:any;
    moment: any;
    search_field:string;
    search_value:string;
    page:number;
    total_page:number;
    total_pages:number[];
    order_payment_id:Object;
    order_detail: any = {};
    payment_status: any = 'all';
    map: any;
    store_marker: any;
    user_marker: any;
    provider_marker: any;
    request_status: string = '';

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
    myLoading:Boolean = true;
    store_message: any = '';
    user_message: any = '';
    provider_message: any = '';

    vehicles: any[] = [];
    vehicle_id: string = '';
    @ViewChild('vehicle_list_modal')
    vehicle_list_modal: ModalComponent;
    order_id: string = '';

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

        this.search_field="user_detail.first_name";
        this.search_value="";
        this.page=1
        this.order_payment_id=null;
        this.moment = moment;

        var directionsDisplay = new google.maps.DirectionsRenderer;
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            streetViewControl: false,
            center: {lat: 0, lng: 0}
        });
        directionsDisplay.setMap(this.map);
        this.store_marker = new google.maps.Marker({
            position: {lat: 0, lng: 0},
            map: this.map,
            icon: 'map_pin_images/Store/store_open.png'
        });

        this.user_marker = new google.maps.Marker({
            position: {lat: 0, lng: 0},
            map: this.map,
            icon: 'map_pin_images/Store/store_open.png'
        });
        this.provider_marker = new google.maps.Marker({
            position: {lat: 0, lng: 0},
            map: this.map,
            icon: 'map_pin_images/Deliveryman/deliveryman_online.png'
        });

        
        
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title
        this.ORDER_STATE=this.helper.ORDER_STATE
        this.status=this.helper.status
        this.requests=[];
        this.filter(1)
        this.interval=setInterval(() => {
            this.orderDetail()
        },this.helper.TIMEOUT.NEW_ORDER_REQUEST);

        jQuery(this.helper.elementRef.nativeElement).find('#request_status').on('change', (evnt,res_data) => {
            this.request_status=res_data.selected;
        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt,res_data) => {
            this.search_field=res_data.selected;
        });
        jQuery(this.helper.elementRef.nativeElement).find('#payment_status').on('change', (evnt,res_data) => {
            this.payment_status=res_data.selected;
        });
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    filter(page)
    {
        this.myLoading = true;
        this.page=page;
        this.helper.http.post('/api/admin/delivery_list_search_sort',{request_status:this.request_status, payment_status: this.payment_status,
            search_field:this.search_field,search_value:this.search_value,page:this.page
        }).map((res:Response) => res.json()).subscribe(res_data=>{

                this.myLoading = false;
                if(res_data.success == false)
                {
                    this.requests=[];
                    this.total_pages=[];
                }
                else
                {
                    this.requests=res_data.requests;
                    if(this.requests.length>0){
                        this.get_request_data(0)
                    }
                    this.total_page=res_data.pages;
                    this.total_pages=Array(res_data.pages).fill((x,i)=>i).map((x,i)=>i+1)
                }
            },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }


    viewRequestOrder_detail(id) {
        this.helper.router_id.admin.request_id = id;
        this.helper.router.navigate(['admin/request_order_detail']);
    }

    orderDetail()
    {
        this.helper.http.post('/api/admin/delivery_list_search_sort',{store_id:this.store_id,  payment_status: this.payment_status,server_token:this.server_token,request_status: this.request_status,
            search_field:this.search_field,search_value:this.search_value,page:this.page }).map((res:Response) => res.json()).subscribe(res_data=>{

            this.myLoading = false;
            if(res_data.success == false)
            {
                this.requests=[];
                this.total_page=res_data.pages;
                this.total_pages=Array(res_data.pages).fill((x,i)=>i).map((x,i)=>i+1)
            }
            else
            {
                this.total_page=res_data.pages;
                this.total_pages=Array(res_data.pages).fill((x,i)=>i).map((x,i)=>i+1)

                this.requests.forEach( (value , index) => {

                    if(value._id == this.order_detail._id){
                        this.order_detail = value;
                    }

                    var new_index = res_data.requests.findIndex(x => x._id==this.requests[index]._id)
                    if(new_index == -1)
                    {
                        this.requests.splice(index , 1)
                    }
                    else{
                        this.requests[index].delivery_status = res_data.requests[new_index].delivery_status;
                        this.requests[index].provider_detail = res_data.requests[new_index].provider_detail;
                        this.requests[index].date_time = res_data.requests[new_index].date_time;
                    }
                });

                res_data.requests.forEach((new_value , index) =>{
                    var aaa = this.requests.findIndex(x => x._id==res_data.requests[index]._id)

                    if(aaa == -1)
                    {
                        this.requests.unshift(new_value)
                    }
                });
            }
        },
        (error: any) => {
            this.helper.http_status(error)
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

    get_request_data(index){
        var bounds = new google.maps.LatLngBounds();
        this.order_detail = this.requests[index];

        if(this.user_message){
            this.user_message.close();
        }
        if(this.store_message){
            this.store_message.close();
        }
        if(this.provider_message){
            this.provider_message.close();
        }

        var store_location = new google.maps.LatLng(this.order_detail.pickup_addresses[0].location[0], this.order_detail.pickup_addresses[0].location[1]);
        this.store_marker.setPosition(store_location);
        bounds.extend(store_location);
        var store_contentString =
            '<p><b>Name</b>: ' + this.order_detail.pickup_addresses[0].user_details.name +
            '<br><b>Email</b>: ' + this.order_detail.pickup_addresses[0].user_details.email +
            '<br><b>Phone</b>: ' + this.order_detail.pickup_addresses[0].user_details.country_phone_code + this.order_detail.pickup_addresses[0].user_details.phone +
            '</p>';
        this.store_message = new google.maps.InfoWindow({
            content: store_contentString,
            maxWidth: 320
        });
        google.maps.event.addListener(this.store_marker, 'click', (e)=> {
            this.store_message.open(this.map, this.store_marker);
            setTimeout(()=> {this.store_message.close();}, 5000);
        });

        var user_location = new google.maps.LatLng(this.order_detail.destination_addresses[0].location[0], this.order_detail.destination_addresses[0].location[1]);
        this.user_marker.setPosition(user_location)
        bounds.extend(user_location);
        var user_contentString =
            '<p><b>Name</b>: ' + this.order_detail.destination_addresses[0].user_details.name +
            '<br><b>Email</b>: ' + this.order_detail.destination_addresses[0].user_details.email +
            '<br><b>Phone</b>: ' + this.order_detail.destination_addresses[0].user_details.country_phone_code + this.order_detail.destination_addresses[0].user_details.phone +
            '<br><b>Address</b>: ' + this.order_detail.destination_addresses[0].address +
            '</p>';

        this.user_message = new google.maps.InfoWindow({
            content: user_contentString,
            maxWidth: 320
        });
        google.maps.event.addListener(this.user_marker, 'click', (e)=> {
            this.user_message.open(this.map, this.user_marker);
            setTimeout(()=> {this.user_message.close();}, 5000);
        });

        if(this.order_detail.provider_detail){
            if(!this.provider_marker){
                this.provider_marker = new google.maps.Marker({
                    position: {lat: 22, lng: 70},
                    map: this.map,
                    icon: 'map_pin_images/Deliveryman/deliveryman_online.png'
                });
            }
            var provider_location = new google.maps.LatLng(this.order_detail.provider_detail.location[0], this.order_detail.provider_detail.location[1]);
            this.provider_marker.setPosition(provider_location);
            bounds.extend(provider_location);
            var provider_contentString =
                '<p><b>Name</b>: ' + this.order_detail.provider_detail.first_name + ' ' + this.order_detail.provider_detail.last_name +
                '<br><b>Email</b>: ' + this.order_detail.provider_detail.email +
                '<br><b>Phone</b>: ' + this.order_detail.provider_detail.country_phone_code + this.order_detail.provider_detail.phone +
                '</p>';
            this.provider_message = new google.maps.InfoWindow({
                content: provider_contentString,
                maxWidth: 320
            });
            google.maps.event.addListener(this.provider_marker, 'click',  (e) =>{
                this.provider_message.open(this.map, this.provider_marker);
                setTimeout(()=> {this.provider_message.close();}, 5000);
            });

        } else {
            if(this.provider_marker){
                this.provider_marker.setMap(null);
                this.provider_marker = null;
            }

        }
        this.map.fitBounds(bounds);
    }

    vieworder_detail(id)
    {
        this.helper.router_id.store.order_id=id;
        this.helper.router.navigate(['store/order/detail']);
    }
    viewcart_detail(id)
    {
        this.helper.router_id.store.order_id=id;
        this.helper.router.navigate(['store/cart/detail']);
    }

    track_deliveryman(id)
    {
        this.helper.router_id.store.order_id=id;
        this.helper.router.navigate(['store/order/track_delivery_man']);
    }
    
    
    //delivery_export_csv
    delivery_export_csv() {
        this.helper.http.post('/api/admin/delivery_list_search_sort',{store_id:this.store_id,  payment_status: this.payment_status,server_token:this.server_token,request_status: this.request_status,
            search_field: this.search_field, search_value: this.search_value}).map((res:Response) => res.json()).subscribe(res_data=>{


            var json2csv = require('json2csv');
            res_data.requests.forEach((request, index) => {
                if (request.order_payment_detail.is_paid_from_wallet) {
                    request.payment_status = this.title.wallet;
                } else {
                    if (request.order_payment_detail.is_payment_mode_cash) {
                        request.payment_status = this.helper.title.cash;
                    } else {
                        request.payment_status = request.payment_gateway_detail[0].name;
                    }
                }

                request.user_name = request.user_detail.first_name + ' ' + request.user_detail.last_name;
                request.store_name = request.store_detail.name;

               
                if (request.provider_detail) {
                    request.provider_name = request.provider_detail.first_name + ' ' + request.provider_detail.last_name;
                } else {
                    request.provider_name = '';
                }

                switch (request.delivery_status) {
                    case this.ORDER_STATE.WAITING_FOR_DELIVERY_MAN:
                        request.status = this.status.waiting_for_delivery_man;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_ACCEPTED:
                        request.status = this.status.delivery_man_accepted;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_COMING:
                        request.status = this.status.delivery_man_coming;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_ARRIVED:
                        request.status = this.status.delivery_man_arrived;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_PICKED_ORDER:
                        request.status = this.status.picked_order;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_STARTED_DELIVERY:
                        request.status = this.status.started_for_delivery;
                        break;
                    case this.ORDER_STATE.DELIVERY_MAN_ARRIVED_AT_DESTINATION:
                        request.status = this.status.arrived_at_destination;
                        break;
                     case this.ORDER_STATE.STORE_CANCELLED_REQUEST:
                        request.status = this.status.store_cancelled_request;
                        break;    
                    case this.ORDER_STATE.NO_DELIVERY_MAN_FOUND:
                        request.status = this.status.no_delivery_man_found;
                        break;     
                    default:
                        request.satus = '';
                }
                request.amount = ((+request.order_payment_detail.total_delivery_price + +request.order_payment_detail.total_order_price).toFixed(2));
            });

            var fieldNames = [this.title.id,
            this.title.user,
            this.title.store,
            this.title.provider,
            this.title.status,
            this.title.amount,
            this.title.payment_by,
            this.title.date,
            this.title.delivery_at
            ];
            var fields = ['unique_id',
                'user_name',
                'store_name',
                'provider_name',
                'status',
                'amount',
                'payment_status',
                'created_at',
                'created_at'
            ];

           
            var csv = json2csv({data: res_data.requests, fields: fields, fieldNames: fieldNames});

            var final_csv: any = csv;
            this.helper.downloadFile(final_csv);
        });
    }
    
    
    
    orderAssignProvider(data) {
        this.order_id = data.order_id;
        this.myLoading = true;
        this.helper.http.post('/api/store/get_vehicle_list', {order_id: this.order_id, city_id: data.city_id, delivery_type: data.delivery_type, store_id: this.store_id, server_token: this.server_token}).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if(res_data.success){
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

    create_request(){
        let index = this.helper.router_id.store.no_deliveryman_orders.findIndex((x)=>x.order_detail._id == this.order_id);
        if(index !== -1){
            this.helper.router_id.store.no_deliveryman_orders.splice(index, 1);
        }
        let json = {store_id: this.store_id, server_token: this.server_token, order_id: this.order_id, vehicle_id: this.vehicle_id}
        this.helper.http.post('/api/store/create_request', json).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if(res_data.success == false)
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
            }
            else
            {
                this.helper.data.storage = {
                    "code": res_data.message,
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message();
                var index = this.requests.findIndex(x => x.order_detail._id==this.order_id)
                if(index !== -1) {
                    this.requests[index].delivery_status = res_data.request.delivery_status
                    this.requests[index].provider_detail = res_data.provider_detail;
                    this.get_request_data(index);
                }
                delete this.requests[index].provider_detail;
                this.get_request_data(index);
            }
            this.vehicle_list_modal.close();
        },
        (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
    }
    
    
    // delivery_export_excel
    delivery_export_excel() {
        this.helper.http.post('/api/admin/deliveries_export_excel', {
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {
            if (res_data.success == true) {
                var json2excel = require('js2excel');
                let data = res_data.requests;
                if (data.length > 0) {
                    try {
                        json2excel.json2excel({
                            data,
                            name: 'deliveries',
                            formateDate: 'yyyy/mm/dd'
                        });
                    } catch (e) {
                        console.error(e);
                        console.error('export error');
                    }
                }
            }
        });
    }
    
    complete_request(data){
        data.type = 1;
        console.log(data)
        this.helper.http.post('/api/provider/complete_request', data).map((res:Response) => res.json()).subscribe(res_data=>{
            console.log(res_data)
            
            if(res_data.success){

                let index = this.requests.findIndex((x)=>x._id == data.request_id);
                this.requests.splice(index, 1);
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message();

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
    

}
