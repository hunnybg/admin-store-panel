import {Component, OnInit, ViewContainerRef, ViewChild} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {Helper} from "../../franchise_helper";
import {ADMIN_PROFIT_ON_ORDERS} from "../../../constant";
declare var jQuery: any;
declare var c3: any;
import { map } from 'rxjs/operators';

export interface StoreEdit {

    store_id: Object,

    name: String,
    email: String,
    website_url: String,
    slogan: String,
    country_name: String,
    city_name: String,
    address: String,
    country_phone_code: String,
    phone: Number,
    offer: String,
    //zipcode: String,
    admin_profit_mode_on_store: Number,
    admin_profit_value_on_store: Number,
    store_delivery_name: String,
    famous_for: String,
    image_url: String,
    comments: String,
    store_time: any[],
    store_open_time: any,
    store_close_time: any,



    price_rating: Number,
    user_rate: Number,


    referral_code: String,
    wallet: Number,
    referred_by: Object,
    wallet_currency_code: String,
    app_version: String,
    device_type: String,
    total_referrals: Number,
    referred_store_name: String,


    is_approved: Boolean,
    is_email_verified: Boolean,
    is_phone_number_verified: Boolean,
    
    is_document_uploaded:Boolean,
    is_business: Boolean,
    free_delivery_for_above_order_price: Number,
    delivery_time: Number,
    item_tax: Number,
    is_store_pay_delivery_fees: Boolean
    //is_document_uploaded: Boolean

}

export interface OrderDetail {
    total_orders: Number,
    accepted_orders: Number,
    completed_orders: Number,
    cancelled_orders: Number,
    completed_order_percentage: Number
}

@Component({
    selector: 'app-edit_store',
    templateUrl: './edit_store.component.html',
    providers: [Helper]
})
export class EditFranchiseStoreComponent implements OnInit {

    private store_edit: StoreEdit;
    private order_detail: OrderDetail;
    title: any;
    button: any;
    heading_title: any;
    minimum_phone_number_length: number;
    maximum_phone_number_length: number;
    phone_number_length: number
    //setting_data: any;
    store_detail: any;
    store_id: Object;
    admin_profit_mode_on_store_list: any[];
    edit: Boolean;
    myLoading: boolean = true;
    
    
    selected_store_time_array: any[] = [];
    store_time_millisecond_array : any[] = [];
    curren_selected_day: number = 0;
    is_store_open_full_time: Boolean = false;
    is_store_open: Boolean = false;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);

    }
    ngAfterViewInit() {



        jQuery("#admin_profit_mode").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");


            jQuery('input').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
        }, 1000);
    }

    ngOnInit() {
        this.admin_profit_mode_on_store_list = ADMIN_PROFIT_ON_ORDERS;
        this.store_edit = {
            store_id: "",
            name: "",
            email: "",
            website_url: "",
            slogan: "",
            country_name: "",
            city_name: "",
            address: "",
            country_phone_code: "",
            phone: null,
            
            price_rating: null,
            user_rate: null,
            is_document_uploaded:false,
            device_type: "",
            //zipcode: "",
            offer: "",
            admin_profit_mode_on_store: null,
            admin_profit_value_on_store: null,
            store_delivery_name: "",
            image_url: "",

            famous_for: "",
            comments: "",
            store_open_time: "",
            store_close_time: "",
            store_time: [],



            referral_code: "",
            wallet: null,
            referred_by: "",
            wallet_currency_code: "",
            app_version: "",
            
            total_referrals: null,
            referred_store_name: "",


            is_business: false,
            free_delivery_for_above_order_price: null,
            delivery_time: null,
            item_tax: null,
            is_store_pay_delivery_fees: false,

            is_approved: false,
            is_email_verified: false,
            is_phone_number_verified: false,
            //is_document_uploaded: false
        }
        this.order_detail = {
            total_orders: 0,
            accepted_orders: 0,
            completed_orders: 0,
            cancelled_orders: 0,
            completed_order_percentage: 0
        }
        this.store_id = this.helper.router_id.franchise.store_id;
        var store = JSON.parse(localStorage.getItem('store'));



        jQuery(this.helper.elementRef.nativeElement).find('#admin_profit_mode').on('change', (evnt, res_data) => {

            this.store_edit.admin_profit_mode_on_store = res_data.selected


        });
        this.helper.http.post('/admin/get_store_data', {store_id: this.store_id}).pipe(map((response: Response) => response.json())).subscribe(res_data => {
            
            this.myLoading = false;
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            }
            else {
                this.order_detail = res_data.order_detail;

                let chart31 = c3.generate({
                    bindto: '#c1',
                    data: {

                        columns: [
                            [this.title.completed_order, this.order_detail.completed_order_percentage]
                        ],
                        type: 'gauge',
                    },
                    legend: {
                        show: true
                    },
                    gauge: {
                        label: {
                            show: false // to turn off the min/max labels.
                        },
                        width: 30 // for adjusting arc thickness
                    },
                    color: {
                        pattern: ['#1e1e1e'], // the three color levels for the percentage values.

                    }
                });
                this.store_detail = res_data.store_detail;
                this.store_edit.name = res_data.store_detail.name;
                this.store_edit.email = res_data.store_detail.email;

                this.store_edit.website_url = res_data.store_detail.website_url;
                this.store_edit.slogan = res_data.store_detail.slogan;
                this.store_edit.offer = res_data.store_detail.offer;
                this.store_edit.comments = res_data.store_detail.comments;
                this.store_edit.famous_for = res_data.store_detail.famous_for;

                this.store_edit.store_time = res_data.store_detail.store_time;

                this.store_edit.country_name = res_data.store_detail.country_details.country_name;
                this.store_edit.city_name = res_data.store_detail.city_details.city_name;
                this.store_edit.address = res_data.store_detail.address;
                this.store_edit.country_phone_code = res_data.store_detail.country_phone_code;
                this.store_edit.phone = res_data.store_detail.phone;
                
                this.store_edit.user_rate = res_data.store_detail.user_rate;
                this.store_edit.device_type = res_data.store_detail.device_type;
                this.store_edit.price_rating = res_data.store_detail.price_rating;
                this.store_edit.is_document_uploaded = res_data.store_detail.is_document_uploaded;
                
                


                //this.store_edit.zipcode = res_data.store_detail.zipcode;
                this.store_edit.admin_profit_mode_on_store = res_data.store_detail.admin_profit_mode_on_store;
                this.store_edit.admin_profit_value_on_store = res_data.store_detail.admin_profit_value_on_store;


                this.store_edit.store_delivery_name = res_data.store_detail.delivery_details.delivery_name;


                this.store_edit.image_url = res_data.store_detail.image_url;
                this.minimum_phone_number_length = res_data.store_detail.country_details.minimum_phone_number_length;
                this.maximum_phone_number_length = res_data.store_detail.country_details.maximum_phone_number_length;

                this.phone_number_length = res_data.store_detail.country_details.phone_number_length;

                this.store_edit.referral_code = res_data.store_detail.referral_code;
                this.store_edit.wallet = res_data.store_detail.wallet;
                this.store_edit.referred_by = res_data.store_detail.referred_by;
                this.store_edit.wallet_currency_code = res_data.store_detail.wallet_currency_code;
                this.store_edit.app_version = res_data.store_detail.app_version;
               


                this.store_edit.total_referrals = res_data.store_detail.total_referrals;

                if (res_data.store_detail.referred_store_details.length > 0) {
                    this.store_edit.referred_store_name = res_data.store_detail.referred_store_details[0].name;
                }

                this.store_edit.is_business = res_data.store_detail.is_business;
                this.store_edit.free_delivery_for_above_order_price = res_data.store_detail.free_delivery_for_above_order_price;
                this.store_edit.delivery_time = res_data.store_detail.delivery_time;
                this.store_edit.item_tax = res_data.store_detail.item_tax;
                this.store_edit.is_store_pay_delivery_fees = res_data.store_detail.is_store_pay_delivery_fees;


                this.store_edit.is_approved = res_data.store_detail.is_approved;
                this.store_edit.is_email_verified = res_data.store_detail.is_email_verified;

                this.store_edit.is_phone_number_verified = res_data.store_detail.is_phone_number_verified;

                this.change_day(0);
                
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.edit = false;
        jQuery(window).resize(function () {
            if (jQuery(window).width() < 454) {
                jQuery('.box').removeClass('col-xs-1');
                jQuery('.total').removeClass('col-xs-5');
                jQuery('.box').addClass('col-xs-2');
                jQuery('.total').addClass('col-xs-10');
                jQuery('.box1').css('padding', '')
                jQuery('.total1').css('padding', '')
            } else {
                jQuery('.box').removeClass('col-xs-2');
                jQuery('.total').removeClass('col-xs-10');
                jQuery('.box').addClass('col-xs-1');
                jQuery('.total').addClass('col-xs-5');
                jQuery('.box1').css('padding', 0)
                jQuery('.total1').css('padding', 0)
            }
        });
        setTimeout(function () {
            if (jQuery(window).width() < 454) {
                jQuery('.box').removeClass('col-xs-1');
                jQuery('.total').removeClass('col-xs-5');
                jQuery('.box').addClass('col-xs-2');
                jQuery('.total').addClass('col-xs-10');
                jQuery('.box1').css('padding', '')
                jQuery('.total1').css('padding', '')
            } else {
                jQuery('.box').removeClass('col-xs-2');
                jQuery('.total').removeClass('col-xs-10');
                jQuery('.box').addClass('col-xs-1');
                jQuery('.total').addClass('col-xs-5');
                jQuery('.box1').css('padding', 0)
                jQuery('.total1').css('padding', 0)
            }
        }, 500);
    }
    
    
    
    change_day(selected_day){
        this.curren_selected_day = selected_day;
        let index = this.store_edit.store_time.findIndex((x) => x.day == selected_day)

        this.is_store_open_full_time = this.store_edit.store_time[index].is_store_open_full_time;
        this.is_store_open = this.store_edit.store_time[index].is_store_open;
        this.selected_store_time_array = this.store_edit.store_time[index].day_time;
        this.store_time_millisecond_array = [];
        this.selected_store_time_array.forEach((time) => {

            var open_date = new Date(Date.now())
            var open_time = time.store_open_time;
            open_time = open_time.split(':')
            open_date.setHours(open_time[0] , open_time[1], 0,0);

            var close_date = new Date(Date.now());
            var close_time = time.store_close_time;
            close_time = close_time.split(':');
            close_date.setHours(close_time[0] , close_time[1], 0,0);

            this.store_time_millisecond_array.push({store_open_time:open_date.getTime(),store_close_time:close_date.getTime()});
        });
    }
    
    
    
    

    public formData = new FormData();

    change_image($event) {

        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];

        if (image_url.type == "image/jpeg" || image_url.type == "image/jpg" || image_url.type == "image/png") {
            this.formData = new FormData();
            this.formData.append('image_url', image_url);

            var reader = new FileReader();

            reader.onload = (e: any) => {
                this.store_edit.image_url = e.target.result
            }
            reader.readAsDataURL(image_url);
        }
    }

    

    UpdateStore(store_data) {
        this.myLoading = true;
        this.formData.append('store_id', store_data.store_id);

        this.formData.append('phone', store_data.phone);
        this.formData.append('email', store_data.email);
        this.formData.append('name', store_data.name);
        this.formData.append('address', store_data.address);

        this.formData.append('website_url', store_data.website_url);
        this.formData.append('famous_for', store_data.famous_for);
        this.formData.append('offer', store_data.offer);
        this.formData.append('slogan', store_data.slogan);

        this.formData.append('comments', store_data.comments);
        //this.formData.append('zipcode', store_data.zipcode);

        this.formData.append('is_approved', store_data.is_approved);
        this.formData.append('is_email_verified', store_data.is_email_verified);
        this.formData.append('is_phone_number_verified', store_data.is_phone_number_verified);
        
        this.formData.append('admin_profit_mode_on_store', store_data.admin_profit_mode_on_store);
        this.formData.append('admin_profit_value_on_store', store_data.admin_profit_value_on_store);





        this.helper.http.post('/admin/update_store', this.formData).pipe(map((response: Response) => response.json())).subscribe(res_data => {

            this.myLoading = false;

            jQuery('#remove').click();
            if (res_data.success == false) {

                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
                this.formData = new FormData();
                this.store_edit.name = this.store_detail.name;

                this.store_edit.website_url = this.store_detail.website_url;
                this.store_edit.famous_for = this.store_detail.famous_for;
                this.store_edit.slogan = this.store_detail.slogan;
                this.store_edit.offer = this.store_detail.offer;

                this.store_edit.comments = this.store_detail.comments;

                this.store_edit.address = this.store_detail.address;
                this.store_edit.phone = this.store_detail.phone;
                this.store_edit.email = this.store_detail.email;

                this.store_edit.admin_profit_mode_on_store = this.store_detail.admin_profit_mode_on_store;
                this.store_edit.admin_profit_value_on_store = this.store_detail.admin_profit_value_on_store;


                //this.store_edit.zipcode = this.store_detail.zipcode;



                this.store_edit.is_approved = this.store_detail.is_approved;
                this.store_edit.is_email_verified = this.store_detail.is_email_verified;
                this.store_edit.is_phone_number_verified = this.store_detail.is_phone_number_verified;
               


                this.store_edit.image_url = this.store_detail.image_url;


            }
            else {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                //localStorage.setItem('store', JSON.stringify(res_data.store));
                this.helper.router.navigate(['franchise/stores']);
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}
