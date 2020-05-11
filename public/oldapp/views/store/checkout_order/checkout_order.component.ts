import { Component, NgZone,  OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery:any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Location} from '@angular/common';
import {UUID} from 'angular2-uuid';
import { map } from 'rxjs/operators';

export interface OrderPayment{
    _id: Object
    // base_price_distance: number,
    // base_price: number,
    // distance_price: number,
    // total_time_price: number,
    promo_payment: number,
    total_distance_price: number,
    service_tax : number,
    total_admin_tax_price: number,
    total_cart_price: number,
    // surge_charges: number,
    // total_surge_price: number,
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
    price_per_unit_distance: number,
    total_delivery_price: number,

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
    selector: 'app-checkout-order',
    templateUrl: './checkout_order.component.html',
    providers: [Helper]
})
export class StoreCheckoutOrderComponent implements OnInit {

    @ViewChild('orderAmountInvalid')
    order_amount_invalid: ModalComponent;
    @ViewChild('user_data_modal')
    user_data_modal: ModalComponent;

    mimimum_amount: number = 0;
    title:any;
    button:any;
    heading_title:any;
    validation_message:any;

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
    // promocode: string = '';
    // promo_applied: Boolean = false;

    edit_address: Boolean = true;
    myLoading: Boolean = false;

    public order_payment : OrderPayment;
    public directionsDisplay = new google.maps.DirectionsRenderer;

    is_schedule_order: Boolean = false;
    schedule_date: any = '';
    schedule_time: string = '';
    schedule_time_error: Boolean = false;
    store_open_day: string = '';
    ipickup_delivery: Boolean = false;
    google_distance: any;
    google_time: any;
    bool: Boolean = true;

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
    }

    ngOnInit() {
        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.store_id=store._id
            this.server_token=store.server_token
            this.user_data.country_id = store.country_id
        }

        jQuery(document).ready(function() {
            jQuery(window).keydown(function(event){
                if(event.keyCode == 13) {
                    event.preventDefault();
                    return false;
                }
            });
        });
        this.store_location = store.location;
        this.delivery_currency = this.helper.user_cart.currency;

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
            // base_price_distance : 0,
            // base_price: 0,
            // distance_price: 0,
            // total_time_price:0,
            promo_payment: 0,
            total_distance_price: 0,
            service_tax : 0,
            total_cart_price: 0,
            total_admin_tax_price: 0,
            // surge_charges: 0,
            // total_surge_price: 0,
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
            price_per_unit_distance: 0,
            total_delivery_price: 0,


        };

        if(this.cart_data.cart.length > 0){

            this.helper.http.post(this.helper.POST_METHOD.GET_COUNTRY_PHONE_NUMBER_LENGTH, {country_id: this.user_data.country_id}).pipe(map((response: Response) => response.json())).subscribe(res_data => {

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

        }
        else {
            this.helper.router.navigate(['store/create_order']);
        }
        jQuery('#schedule_time').on('change', (event, res_data) => {
            this.schedule_time = event.target.value;
        });
        this.helper.ngZone.run(() => {
            jQuery('.icheck').on('ifChecked', (event) => {
                this.ipickup_delivery = true;
                this.get_order_invoice(this.google_distance, this.google_time);
            });

            jQuery('.icheck').on('ifUnchecked', (event) => {
                this.ipickup_delivery = false;
                this.get_order_invoice(this.google_distance, this.google_time);
            });
        })
        // this.get_order_invoice(0, 0)
    }

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
            avoidHighways: true,
            avoidTolls: true,
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
        this.myLoading = true;
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
        this.helper.http.post(this.helper.POST_METHOD.STORE_CHANGE_DELIVERY_ADDRESS, json).pipe(map((response: Response) => response.json())).subscribe(res_data => {

            if(res_data.success){
                this.helper.user_cart.destination_address.location = this.delivery_location;
                this.helper.user_cart.destination_address.address = this.delivery_address;
                this.add_to_cart();
            } else {
                this.myLoading = false;
                this.delivery_location = this.helper.user_cart.cart_data.destination_addresses[0].location;
                this.delivery_address = this.helper.user_cart.cart_data.destination_addresses[0].address;
                this.map.setCenter({lat: this.delivery_location[0], lng: this.delivery_location[1]});
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
            }
        });
    }

    add_to_cart(){
        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.helper.user_cart.destination_address.user_details.email = this.user_data.email;
            this.helper.user_cart.destination_address.user_details.country_phone_code = store.country_phone_code;
            this.helper.user_cart.destination_address.user_details.phone = this.user_data.phone;
            this.helper.user_cart.destination_address.user_details.name = this.user_data.first_name + ' ' + this.user_data.last_name;
			if(this.helper.user_cart.cart_data.destination_addresses){
				this.helper.user_cart.cart_data.destination_addresses.push(this.helper.user_cart.destination_address);
			} else {
				this.helper.user_cart.cart_data.destination_addresses = [this.helper.user_cart.destination_address];
			}
			
            this.helper.user_cart.pickup_address.location = store.location;
            this.helper.user_cart.pickup_address.address = store.address;
            this.helper.user_cart.pickup_address.user_details.email = store.email;
            this.helper.user_cart.pickup_address.user_details.country_phone_code = store.country_phone_code;
            this.helper.user_cart.pickup_address.user_details.phone = store.phone;
            this.helper.user_cart.pickup_address.user_details.name = store.name;
			if(this.helper.user_cart.cart_data.pickup_addresses){
				this.helper.user_cart.cart_data.pickup_addresses.push(this.helper.user_cart.pickup_address);
			} else {
				this.helper.user_cart.cart_data.pickup_addresses = [this.helper.user_cart.pickup_address];
			}
        }
        let json = {
            user_id: '',
            server_token: '',
            user_type: this.helper.ADMIN_DATA_ID.STORE,
            store_id: this.helper.user_cart.cart_data.selectedStoreId,
            cart_unique_token: this.helper.user_cart.cart_unique_token,
            order_details: this.helper.user_cart.cart_data.cart,
            destination_addresses: this.helper.user_cart.cart_data.destination_addresses,
            pickup_addresses: this.helper.user_cart.cart_data.pickup_addresses,
            cart_id: '',
            total_item_tax: this.helper.user_cart.total_item_tax,
            total_cart_price: this.helper.user_cart.total_cart_amount
        }
        console.log(json)
        if (this.helper.user_cart.cart_data.cart_id !== '') {
            json.cart_id =  this.helper.user_cart.cart_data.cart_id;
        } else {
            delete json.cart_id;
        }

        this.helper.http.post(this.helper.POST_METHOD.ADD_ITEM_IN_CART, json).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {
                console.log(res_data)
                if(res_data.success){
                    this.user_data.user_id = res_data.user_id;
                    this.helper.user_cart.cart_data.cart_id = res_data.cart_id;
                    this.helper.user_cart.cart_data.city_id = res_data.city_id;
                    this.get_distnce_time();
                } else {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                }
                this.helper.message();
            },
            (error: any) => {
                this.helper.http_status(error)
            });
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
        let totalItemsCount = 0;
        this.google_distance = google_distance;
        this.google_time = google_time;
        this.cart_data.cart.forEach((cart_product) => {

            cart_product.items.forEach((cart_item) =>{
                totalItemsCount += cart_item.quantity;

            });
        });

        let get_order_cart_invoice_json = {
            user_id: this.user_data.user_id,
            server_token: this.server_token,
            cart_unique_token: this.cart_unique_token,
            order_type: this.helper.ADMIN_DATA_ID.STORE,
            total_distance: google_distance,
            total_time: google_time,
            store_id: this.cart_data.selectedStoreId,
            total_cart_price: this.helper.user_cart.total_cart_amount,
            total_item_tax: this.helper.user_cart.total_item_tax,
            total_item_count: totalItemsCount,
            is_user_pick_up_order: this.ipickup_delivery
        }
        console.log(get_order_cart_invoice_json)
        this.helper.http.post(this.helper.POST_METHOD.GET_ORDER_CART_INVOICE, get_order_cart_invoice_json).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {

            this.myLoading = false;
            console.log(res_data)
            if(res_data.success){
                this.order_payment = res_data.order_payment;
                this.helper.user_cart.order_payment_id = res_data.order_payment._id;
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
                if(res_data.error_code == 557){
                    this.mimimum_amount = res_data.min_order_price;
                    this.order_amount_invalid.open();
                }
            }

        },
        (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
    }

    redirect_to_checkout(){
        this.order_amount_invalid.close();
        this.location.back();
    }

    asap(){
        jQuery("#odershow").toggle();
        jQuery('.adddetails').toggle();

        this.is_schedule_order = this.helper.user_cart.is_schedule_order;

        let server_date:any = new Date(this.helper.user_cart.server_date);
        server_date = new Date(server_date).toLocaleString("en-US", {timeZone: this.helper.user_cart.timezone})
        server_date = new Date(server_date);

        let after_date = new Date(server_date);
        after_date.setDate(after_date.getDate()+3);

        // this.helper.scheduleDatePickerOptions.disableUntil.year = server_date.getFullYear();
        // this.helper.scheduleDatePickerOptions.disableUntil.month = server_date.getMonth()+1;
        // this.helper.scheduleDatePickerOptions.disableUntil.day = server_date.getDate()-1;
        //
        // this.helper.scheduleDatePickerOptions.disableSince.year = after_date.getFullYear();
        // this.helper.scheduleDatePickerOptions.disableSince.month = after_date.getMonth()+1;
        // this.helper.scheduleDatePickerOptions.disableSince.day = after_date.getDate();

        let date = this.helper.user_cart.schedule_date;
        if(this.helper.user_cart.schedule_date !== null && this.helper.user_cart.schedule_date !== ''){
            this.schedule_date = { date: { year: date.getFullYear(), month: date.getMonth()+1, day: date.getDate() }  ,
                formatted:date.getMonth()+1 + '-' +  date.getDate() + '-' + date.getFullYear()  };
            this.schedule_time = date.getHours()+':'+date.getMinutes();
            jQuery('#schedule_time').val(this.schedule_time);
        }
    }

    set_order_time(){

        if(this.is_schedule_order){
            if(this.schedule_date !== '' && this.schedule_time !== ''){

                let server_date:any = new Date(this.helper.user_cart.server_date);
                server_date = new Date(server_date).toLocaleString("en-US", {timeZone: this.helper.user_cart.timezone})
                server_date = new Date(server_date);
                let date = this.schedule_date.formatted.split('-')
                let time = this.schedule_time.split(':')

                let selected_date: any = new Date(Date.now());
                selected_date = new Date(selected_date).toLocaleString("en-US", {timeZone: this.helper.user_cart.timezone})
                selected_date = new Date(selected_date);
                selected_date.setDate(date[1])
                selected_date.setMonth(date[0]-1)
                selected_date.setFullYear(date[2])
                selected_date.setHours(time[0], time[1]);

                let day_diff = selected_date.getDay() - server_date.getDay();
                let timeDiff = Math.round(selected_date.getTime() - server_date.getTime());
                if(timeDiff/60000 >= 30){
                    this.schedule_time_error = false;
                    this.helper.user_cart.schedule_date = selected_date;
                    jQuery("#odershow").toggle();
                    jQuery('.adddetails').toggle();
                    this.helper.user_cart.is_schedule_order = this.is_schedule_order;
                    // if(day_diff > 0){
                    //     this.check_open(selected_date, false);
                    // } else {
                    //     this.check_open(selected_date, true);
                    // }
                } else {
                    this.schedule_time_error = true;
                }
            } else {
                this.schedule_time_error = true;
            }

        } else {
            this.helper.user_cart.schedule_date = null;
            jQuery("#odershow").toggle();
            jQuery('.adddetails').toggle();
            this.schedule_time_error = false;
            this.schedule_date = '';
            this.schedule_time = '';
            jQuery('#schedule_time').val('');
            this.helper.user_cart.is_schedule_order = this.is_schedule_order;

            let date:any = this.helper.user_cart.server_date;
            date = new Date(date).toLocaleString("en-US", {timeZone: this.helper.user_cart.timezone})
            date = new Date(date);
            // this.check_open(date, true);
        }
    }


    set_current_location(){
        if(this.edit_address) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
            });
        }
    }

    get_user_data(user_data){
        this.myLoading = true;
        let json = {
            store_id: this.store_id,
            server_token: this.server_token,
            email: user_data.email,
            phone: user_data.phone,
            country_id: this.user_data.country_id,
            first_name: user_data.first_name,
            last_name: user_data.last_name
        }
        this.helper.http.post(this.helper.POST_METHOD.GET_USER, json).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            if(res_data.success){
                this.user_data.user_id = res_data.user._id;
                this.user_data.server_token = res_data.user.server_token;
                this.pay_order_payment();
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
            user_id: this.user_data.user_id,
            order_type: this.helper.ADMIN_DATA_ID.STORE,
            order_payment_id: this.helper.user_cart.order_payment_id,
            is_payment_mode_cash: true
        }
        this.helper.http.post(this.helper.POST_METHOD.PAY_ORDER_PAYMENT, json).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

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
            user_id: this.user_data.user_id,
            server_token: this.user_data.server_token,
            cart_id: this.helper.user_cart.cart_data.cart_id,
            delivery_note: this.helper.user_cart.delivery_note,
            order_type: this.helper.ADMIN_DATA_ID.STORE,
            is_user_pick_up_order: this.ipickup_delivery
        }
        this.helper.http.post(this.helper.POST_METHOD.CREATE_ORDER, json).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            this.myLoading = false;
            if(res_data.success){

                this.helper.user_cart.cart_data = {
                    cart_id: null,
                    city_id: null,
                    pickup_addresses: [],
                    destination_addresses: [],
                    cart: [],
                    selectedStoreId: null,
                    total_item: 0
                }
                this.helper.user_cart.total_cart_amount = 0;
                this.helper.user_cart.order_payment_id = null;
                this.helper.user_cart.cart_data.cart_id = null;
                this.helper.user_cart.cart_unique_token = UUID.UUID();

                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.router.navigate(['store/create_order']);
            } else {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
            }
        });
    }

}
