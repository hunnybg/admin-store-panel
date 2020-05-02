import { Component, NgZone,  OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery:any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Location} from '@angular/common';
import {UUID} from 'angular2-uuid';

export interface OrderPayment{
    _id: Object
    base_price_distance: number,
    base_price: number,
    distance_price: number,
    total_time_price: number,
    promo_payment: number,
    total_distance_price: number,
    service_tax : number,
    total_admin_tax_price: number,
    surge_charges: number,
    total_surge_price: number,
    total_service_price: number,
    total_store_tax_price: number,
    total_item_count: number,
    total_item_price: number,
    total_specification_count: number,
    item_tax: number,
    total_specification_price: number,
    total_order_price: number,
    user_pay_payment: number,
    is_distance_unit_mile: Boolean,
    price_per_unit_time: number,
    total_delivery_price: number,
    price_per_unit_distance: number

}

export interface UserDetail{
    user_id: string,
    server_token: string,
    email: string,
    first_name: string,
    last_name: string,
    country_id: Object,
    phone: number
}

@Component({
    selector: 'app-create_order_without_item',
    templateUrl: './create_order_without_item.component.html',
    providers: [Helper]
})
export class StoreCreateOrderWithoutItemOrderComponent implements OnInit {

    @ViewChild('orderAmountInvalid')
    order_amount_invalid: ModalComponent;

    @ViewChild('user_data_modal')
    user_data_modal: ModalComponent;

    vehicle_list: any[] = [];
    selected_vehicle_id: string = '';
    mimimum_amount: number = 0;
    title:any;
    button:any;
    heading_title:any;
    validation_message:any;
    product_total: any = null;
    private cart_unique_token: string = '';
    private user_data: UserDetail = {
        user_id: '',
        server_token: '',
        country_id: null,
        email: '',
        first_name: '',
        last_name: '',
        phone: null
    }
    store_id: Object;
    private server_token: string = '';
    private cart_data : any = {};
    private store_location : any[];
    private delivery_location : any[];
    private delivery_address : string = '';
    map: any;
    public delivery_currency : string = '';
    delivery_note: string = '';

    edit_address: Boolean = true;
    myLoading: Boolean = false;

    public order_payment : OrderPayment;
    public directionsDisplay = new google.maps.DirectionsRenderer;

    store_open_day: string = '';
    google_distance: any;
    google_time: any;
    bool: Boolean = true;
    new_total: number = 0;
    is_store_can_add_provider: boolean = false;
    is_store_can_complete_order: boolean = false;

    minimum_phone_number_length:number = 8;
    maximum_phone_number_length:number = 10;
    constructor(private helper:Helper, private location: Location, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit(){
        jQuery('.clock-picker').clockpicker({
            'default': 'now',
            'align': 'right'
        });
        jQuery('.icheck').iCheck({
            handle: 'checkbox',
            checkboxClass: 'icheckbox_square-green',
        });
        jQuery(".chosen-select").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }

    ngOnInit() {
        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.store_id=store._id
            this.server_token=store.server_token
            this.user_data.country_id = store.country_id
            this.is_store_can_add_provider = store.is_store_can_add_provider;
            this.is_store_can_complete_order = store.is_store_can_complete_order;
        }
        this.store_location = store.location;
        this.delivery_currency = this.helper.user_cart.currency;
        jQuery(document).ready(function() {
            jQuery(window).keydown(function(event){
                if(event.keyCode == 13) {
                    event.preventDefault();
                    return false;
                }
            });
        });

        jQuery(this.helper.elementRef.nativeElement).find('#selected_vehicle_id').on('change', (evnt, res_data) => {

            this.selected_vehicle_id = res_data.selected;
            console.log(this.selected_vehicle_id)
        });

        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title
        this.validation_message=this.helper.validation_message;

        this.delivery_note = this.helper.user_cart.delivery_note;
        this.helper.message();
        this.cart_unique_token = this.helper.user_cart.cart_unique_token;
        this.cart_data = this.helper.user_cart.cart_data;

        // this.user_data_modal.open();

        this.order_payment = {
            _id: null,
            base_price_distance : 0,
            base_price: 0,
            distance_price: 0,
            total_time_price:0,
            promo_payment: 0,
            total_distance_price: 0,
            service_tax : 0,
            total_admin_tax_price: 0,
            surge_charges: 0,
            total_surge_price: 0,
            total_service_price: 0,
            total_store_tax_price: 0,
            total_item_count: 0,
            total_item_price: 0,
            total_specification_count: 0,
            item_tax: 0,
            total_specification_price: 0,
            total_order_price: 0,
            user_pay_payment: 0,
            is_distance_unit_mile: false,
            price_per_unit_time: 0,
            total_delivery_price: 0,
            price_per_unit_distance: 0
        };


        this.helper.http.post(this.helper.POST_METHOD.GET_COUNTRY_PHONE_NUMBER_LENGTH, {country_id: this.user_data.country_id}).map((response: Response) => response.json()).subscribe(res_data => {

            if(res_data.success){
                this.minimum_phone_number_length = res_data.minimum_phone_number_length;
                this.maximum_phone_number_length = res_data.maximum_phone_number_length;
            }
        });

        this.delivery_location = this.store_location;
        this.delivery_address = store.address;

        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: {lat: this.delivery_location[0], lng: this.delivery_location[1]}
        });

        this.directionsDisplay.setMap(this.map);
        var map_pin = document.getElementById('map_pin');
        this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(map_pin);
        var location_image = document.getElementById('location_image');
        this.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(location_image);

        google.maps.event.addListener(this.map, 'idle',() => {
            this.geocoder()
        });
        let input = <HTMLInputElement>document.getElementById('input');
        var searchBox = new google.maps.places.Autocomplete(input);
        searchBox.bindTo('bounds', this.map);

        searchBox.addListener('place_changed', () => {
            this.bool = false;
            if(this.edit_address) {
                var place = searchBox.getPlace();
                if (!place.geometry) {
                    return;
                }
                if (place.geometry.viewport) {
                    this.map.fitBounds(place.geometry.viewport);
                } else {
                    this.map.setCenter(place.geometry.location);

                }
            }
        });

        this.get_vehicle_list();
    }

    get_vehicle_list(){
        this.helper.http.post('/api/store/get_vehicles_list', {store_id: this.store_id,
            server_token: this.server_token}).map((response: Response) => response.json()).subscribe(res_data => {
            console.log(res_data)
            if(this.is_store_can_complete_order || this.is_store_can_add_provider){
                this.vehicle_list = res_data.vehicles;
            } else {
                this.vehicle_list = res_data.admin_vehicles;
            }
            setTimeout(()=> {
                jQuery(".chosen-select").trigger("chosen:updated");
                jQuery(this.helper.elementRef.nativeElement).find('#selected_vehicle_id').on('change', (evnt, res_data) => {

                    this.selected_vehicle_id = res_data.selected;

                });
            }, 1000);
        });
    }

    // add_product_total(){
    //     if(this.product_total != '' && this.product_total != null){
    //         this.new_total = Number(this.order_payment.total) + Number(this.product_total)
    //     } else {
    //         this.new_total = Number(this.order_payment.total);
    //     }
    // }

    get_distnce_time(){
        let google_distance = 0;
        let google_time = 0;
        let origin = {lat: parseFloat(this.store_location[0]), lng: parseFloat(this.store_location[1])};
        let destination = {lat: parseFloat(this.delivery_location[0]), lng: parseFloat(this.delivery_location[1])};

        let service = new google.maps.DistanceMatrixService;
        service.getDistanceMatrix({
            origins: [origin],
            destinations: [destination],
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
            travelMode: google.maps.TravelMode.DRIVING,
        }, (response, status) => {
            if(status == google.maps.DistanceMatrixStatus.OK){

                google_distance = response.rows[0].elements[0].distance.value;
                google_time = response.rows[0].elements[0].duration.value;
                this.get_order_invoice(google_distance, google_time)
            } else {
                this.get_order_invoice(google_distance, google_time)
            }
        });
    }

    edit_address_field(){
        this.edit_address = true;
        this.map.setOptions({draggable: true, fullscreenControl:true, zoomControl: true, scrollwheel: true, disableDoubleClickZoom: true});
    }

    update_address() {
        if(this.selected_vehicle_id){
            this.edit_address = false;
            this.map.setOptions({
                draggable: false,
                fullscreenControl: false,
                zoomControl: false,
                scrollwheel: false,
                disableDoubleClickZoom: false
            });

            let json = {
                latitude: this.delivery_location[0],
                longitude: this.delivery_location[1],
                destination_address: this.delivery_address,
                store_id: this.store_id,
                server_token: this.server_token
            }

            this.helper.http.post(this.helper.POST_METHOD.STORE_CHANGE_DELIVERY_ADDRESS, json).map((response: Response) => response.json()).subscribe(res_data => {

                if(res_data.success){
                    this.helper.user_cart.cart_data.deliveryLatLng = this.delivery_location;
                    this.helper.user_cart.cart_data.deliveryAddress = this.delivery_address;
                    this.add_to_cart(this.user_data);
                } else {

                    this.delivery_address = this.helper.user_cart.cart_data.deliveryAddress;
                    if( this.helper.user_cart.cart_data.deliveryLatLng[0] != 0){
                        this.delivery_location = this.helper.user_cart.cart_data.deliveryLatLng;
                        this.map.setCenter({lat: this.delivery_location[0], lng: this.delivery_location[1]});
                    } else {
                        this.delivery_location = this.store_location
                        this.map.setCenter({lat: this.delivery_location[0], lng: this.delivery_location[1]});
                    }

                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message()
                }
            });
        }
    }

    geocoder(){

        this.delivery_location = [this.map.getCenter().lat(), this.map.getCenter().lng()];
        var initialLocation = new google.maps.LatLng(this.map.getCenter().lat(), this.map.getCenter().lng());
        var geocoder = new google.maps.Geocoder();

        let request = {latLng: initialLocation};
        if(this.bool){
            geocoder.geocode(request, (results, status) => {
                if (status == google.maps.GeocoderStatus.OK) {
                    this.helper.ngZone.run(() => {
                        this.delivery_address = results[0].formatted_address;
                    });
                }
            });
        } else {
            this.bool =true;
        }

    }

    get_order_invoice(google_distance, google_time){
        this.myLoading = true;
        this.google_distance = google_distance;
        this.google_time = google_time;

        let get_order_cart_invoice_json = {
            order_type: this.helper.ADMIN_DATA_ID.STORE,
            cart_unique_token: this.cart_unique_token,
            user_id: '',
            store_id: this.store_id,
            server_token: this.server_token,
            total_distance: google_distance,
            total_time: google_time,
            total_cart_price: this.product_total,
            total_item_count: 1,
            vehicle_id: this.selected_vehicle_id
        }

        this.helper.http.post(this.helper.POST_METHOD.GET_ORDER_CART_INVOICE, get_order_cart_invoice_json).map((res_data: Response) => res_data.json()) .subscribe(res_data => {

            this.myLoading = false;
            if(res_data.success){
                this.order_payment = res_data.order_payment;
                this.helper.user_cart.order_payment_id = res_data.order_payment._id;
                this.mimimum_amount = 0;
                this.user_data_modal.close();
                if(this.helper.user_cart.is_schedule_order){
                    // this.check_valid_time()
                } else {
                    let date:any = res_data.server_time;
                    date = new Date(date).toLocaleString("en-US", {timeZone: res_data.timezone})
                    date = new Date(date);
                    // this.check_open(date, true);
                }

            } else {

                this.mimimum_amount = res_data.min_order_price;
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();

            }

        },
        (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
    }

    set_current_location(){
        if(this.edit_address) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
            });
        }
    }

    add_to_cart(user_data){
        this.myLoading = true;
        this.helper.user_cart.destination_address.address = this.delivery_address;
        this.helper.user_cart.destination_address.location = this.delivery_location;
        this.helper.user_cart.destination_address.user_details.name = user_data.first_name + ' ' + user_data.last_name;
        this.helper.user_cart.destination_address.user_details.email = user_data.email;
        this.helper.user_cart.destination_address.user_details.phone = user_data.phone;
        this.helper.user_cart.destination_address.user_details.country_phone_code = user_data.country_phone_code;

        var store = JSON.parse(localStorage.getItem('store'));
        this.helper.user_cart.pickup_address.address = store.address;
        this.helper.user_cart.pickup_address.location = store.location;
        this.helper.user_cart.pickup_address.user_details.name = store.name;
        this.helper.user_cart.pickup_address.user_details.email = store.email;
        this.helper.user_cart.pickup_address.user_details.phone = store.phone;
        this.helper.user_cart.pickup_address.user_details.country_phone_code = store.country_phone_code;

        this.helper.user_cart.cart_data.destination_addresses[0] = this.helper.user_cart.destination_address;
        this.helper.user_cart.cart_data.pickup_addresses[0] = this.helper.user_cart.pickup_address;

        let json = {
            user_id: '',
            server_token: '',
            cart_unique_token: this.cart_unique_token,
            store_id: this.store_id,
            destination_addresses: this.helper.user_cart.cart_data.destination_addresses,
            pickup_addresses: this.helper.user_cart.cart_data.pickup_addresses,
            order_details: [],
            user_type: 2,
            total_item_tax: this.helper.user_cart.total_item_tax,
            total_cart_price: this.product_total
        }
        this.helper.http.post(this.helper.POST_METHOD.ADD_ITEM_IN_CART, json).map((res_data: Response) => res_data.json()).subscribe(res_data => {
                console.log(res_data)
            if(res_data.success){
                this.user_data.user_id = res_data.user_id;
                this.helper.user_cart.cart_data.cart_id = res_data.cart_id;
                this.get_distnce_time();
            } else {
                this.myLoading = false;
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
            }
        },
        (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
    }

    pay_order_payment(){

        this.myLoading = true;

        let json = {
            order_type: this.helper.ADMIN_DATA_ID.STORE,
            user_id: this.user_data.user_id,
            order_payment_id: this.helper.user_cart.order_payment_id,
            is_payment_mode_cash: true
        }
        this.helper.http.post(this.helper.POST_METHOD.PAY_ORDER_PAYMENT, json).map((res_data: Response) => res_data.json()).subscribe(res_data => {

                if(res_data.success){
                    this.create_order_service();
                } else {
                    this.myLoading = false;
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message();
                }
            },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    create_order_service() {
        let json = {
            store_id: this.store_id,
            server_token: this.server_token,
            cart_id: this.helper.user_cart.cart_data.cart_id,
            note_for_deliveryman: this.helper.user_cart.delivery_note,
            order_type: this.helper.ADMIN_DATA_ID.STORE,
            vehicle_id: this.selected_vehicle_id
        }

        this.helper.http.post(this.helper.POST_METHOD.STORE_CREATE_ORDER, json).map((res_data: Response) => res_data.json()).subscribe(res_data => {

            this.myLoading = false;
            if(res_data.success){
                this.helper.user_cart.order_payment_id = null;
                this.helper.user_cart.cart_data.cart_id = null;
                this.helper.user_cart.cart_unique_token = UUID.UUID();
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
            } else {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
            }
            this.helper.router.navigate(['store/deliveries']);
        });
    }

}
