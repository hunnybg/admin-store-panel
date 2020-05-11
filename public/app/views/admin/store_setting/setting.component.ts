import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Helper } from "../../store_helper";
declare var jQuery: any;
declare var swal: any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { map } from 'rxjs/operators';

export interface StoreSetting {
    store_id: Object,
    server_token: String,
    social_id: any[],
    login_by: String,
    store_time: any[],
    is_business: Boolean,
    is_visible: Boolean,
    item_tax: Number,
    store_open_time: any,
    store_close_time: any,
    old_password: String,
    free_delivery_for_above_order_price: number,
    free_delivery_within_radius: number,
    is_store_pay_delivery_fees: Boolean,
    delivery_time: Number,
    delivery_time_max: Number,
    price_rating: Number,
    admin_profit_mode_on_store: Number,
    admin_profit_value_on_store: Number,
    famous_for: any[],
    is_order_cancellation_charge_apply: Boolean,
    order_cancellation_charge_for_above_order_price: number,
    order_cancellation_charge_type: number,
    order_cancellation_charge_value: number,
    max_item_quantity_add_by_user: number,
    schedule_order_create_after_minute: number,
    is_provide_delivery_anywhere: Boolean,
    delivery_radius: number,
    is_ask_estimated_time_for_ready_order: Boolean,
    is_taking_schedule_order: Boolean,
    inform_schedule_order_before_min: number,
    min_order_price: number,
    is_store_busy: Boolean,
    is_provide_pickup_delivery: Boolean,
    auto_transfer: Boolean,
    features_available: any[],
}

@Component({
    selector: 'app-setting',
    templateUrl: './setting.component.html',
    providers: [Helper]
})
export class AdminSettingComponent implements OnInit {

    private store_setting: StoreSetting;
    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    store_time_add: Boolean;
    store_open_time_error: number;
    store_close_time_error: number;
    @ViewChild('myModal')
    modal: ModalComponent;
    myLoading: boolean = false;
    selected_store_time_array: any[] = [];
    store_time_millisecond_array: any[] = [];
    curren_selected_day: number = 0;
    is_store_open_full_time: Boolean = false;
    is_store_open: Boolean = false;
    type: string = '';
    @ViewChild('oldPasswordModal')
    old_password_modal: ModalComponent;
    famous_for: any[] = [];

    edit: Boolean = false;
    store_features: any[] = [];

    constructor(private helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {
        jQuery('.clock-picker').clockpicker({
            'default': 'now',
            'align': 'right'
        });

        setTimeout(function () {
            jQuery(".chosen-select").chosen({ disable_search: true });
            jQuery(".chosen-select").trigger("chosen:updated");

            jQuery('.icheck').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
        }, 1000);

    }

    ngOnDestroy() {
        this.helper.router_id.admin.back_url_show = false;
    }

    ngOnInit() {
        this.helper.router_id.admin.back_url = 'admin/stores';
        this.helper.router_id.admin.back_url_show = true;
        this.store_setting = {
            store_id: "",
            server_token: "",
            social_id: [],
            login_by: "",
            store_time: [],
            famous_for: [],
            is_business: true,
            is_visible: true,
            item_tax: null,
            old_password: "",
            store_open_time: "",
            store_close_time: "",
            is_store_pay_delivery_fees: false,
            free_delivery_for_above_order_price: null,
            free_delivery_within_radius: null,
            delivery_time: null,
            delivery_time_max: null,
            price_rating: null,
            admin_profit_mode_on_store: null,
            admin_profit_value_on_store: null,
            is_store_busy: false,

            is_order_cancellation_charge_apply: false,
            order_cancellation_charge_for_above_order_price: 0,
            order_cancellation_charge_type: 1,
            order_cancellation_charge_value: 0,
            max_item_quantity_add_by_user: 0,
            schedule_order_create_after_minute: 0,
            is_provide_delivery_anywhere: false,
            delivery_radius: 0,
            is_taking_schedule_order: false,
            is_ask_estimated_time_for_ready_order: false,
            inform_schedule_order_before_min: 0,
            min_order_price: 0,
            is_provide_pickup_delivery: false,
            auto_transfer: false,
            features_available: [],
        }
        this.store_time_add = true;
        this.store_setting.store_id = this.helper.router_id.admin.store_id;

        this.helper.http.post(this.helper.POST_METHOD.GET_STORE_DATA, { store_id: this.store_setting.store_id, type: this.helper.ADMIN_DATA_ID.ADMIN, server_token: this.store_setting.server_token }).pipe(map((response: Response) => response.json())).subscribe(res_data => {

            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            }
            else {
                this.famous_for = res_data.store_detail.delivery_details.famous_products_tags;
                var store = res_data.store_detail;
                this.store_setting.store_id = store._id;
                this.store_setting.server_token = store.server_token;
                this.store_setting.social_id = store.social_ids;
                this.store_setting.login_by = store.login_by;
                this.store_setting.store_time = store.store_time;
                this.store_setting.is_business = store.is_business;
                this.store_setting.is_visible = store.is_visible;
                this.store_setting.is_store_busy = store.is_store_busy;
                this.store_setting.item_tax = store.item_tax;
                this.store_setting.is_store_pay_delivery_fees = store.is_store_pay_delivery_fees;
                this.store_setting.free_delivery_for_above_order_price = store.free_delivery_for_above_order_price;
                this.store_setting.free_delivery_within_radius = store.free_delivery_within_radius;
                this.store_setting.delivery_time = store.delivery_time;
                this.store_setting.delivery_time_max = store.delivery_time_max;
                this.store_setting.price_rating = store.price_rating;
                this.store_setting.admin_profit_mode_on_store = store.admin_profit_mode_on_store;
                this.store_setting.admin_profit_value_on_store = store.admin_profit_value_on_store;
                this.store_setting.famous_for = store.famous_products_tags;
                this.store_setting.is_order_cancellation_charge_apply = store.is_order_cancellation_charge_apply;
                this.store_setting.order_cancellation_charge_for_above_order_price = store.order_cancellation_charge_for_above_order_price;
                this.store_setting.order_cancellation_charge_type = store.order_cancellation_charge_type;
                this.store_setting.order_cancellation_charge_value = store.order_cancellation_charge_value;

                this.store_setting.max_item_quantity_add_by_user = store.max_item_quantity_add_by_user;
                this.store_setting.schedule_order_create_after_minute = store.schedule_order_create_after_minute;
                this.store_setting.is_provide_delivery_anywhere = store.is_provide_delivery_anywhere;
                this.store_setting.delivery_radius = store.delivery_radius;
                this.store_setting.is_taking_schedule_order = store.is_taking_schedule_order;
                this.store_setting.is_ask_estimated_time_for_ready_order = store.is_ask_estimated_time_for_ready_order;
                this.store_setting.inform_schedule_order_before_min = store.inform_schedule_order_before_min;
                this.store_setting.min_order_price = store.min_order_price;
                this.store_setting.is_provide_pickup_delivery = store.is_provide_pickup_delivery;
                this.store_setting.auto_transfer = store.auto_transfer;
                this.store_setting.features_available = store.features_available;
                // this.change_day(0)

                if (this.store_setting.auto_transfer) {
                    setTimeout(() => {
                        jQuery('.clock-picker').clockpicker({
                            'default': 'now',
                            'align': 'right'
                        });
                        // jQuery('#auto_transfer_time').on('change', (event, res_data) => {
                        //     var auto_transfer_time = jQuery("#auto_transfer_time").val()
                        //     this.store_setting.time_of_transfer = auto_transfer_time
                        //     console.log(this.store_setting.time_of_transfer);
                        // });
                    }, 100);
                }
                this.change_day(0)

                this.store_setting.famous_for.forEach(function (famous) {
                    famous = famous.replace(/[\s]/g, '');
                    setTimeout(() => {
                        jQuery('#icheck' + famous).iCheck('check');
                    }, 400);
                });

                this.store_setting.features_available.forEach(function (feature) {
                    setTimeout(() => {
                        jQuery('#icheck' + feature).iCheck('check');
                    }, 500);
                });

                setTimeout(() => {
                    jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifChecked', (event, res_data) => {
                        console.log("ifChecked")
                        var id = event.target.getAttribute('value')
                        if (this.store_setting.features_available.indexOf(id) == -1) {
                            this.store_setting.features_available.push(Number(id));
                        }
                    });

                    jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifUnchecked', (event, res_data) => {
                        console.log("ifUnchecked")
                        var id = event.target.getAttribute('value')
                        var i = this.store_setting.features_available.indexOf(Number(id));
                        if (i != -1) {
                            this.store_setting.features_available.splice(i, 1);
                            if (this.store_setting.features_available.length == 0) {
                                this.helper.data.storage = {
                                    "message": "At least one Feature is Required",
                                    "class": "alert-danger"
                                }
                                this.helper.message();
                            }
                        }
                    });
                }, 1000)

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });


        this.title = this.helper.title
        this.button = this.helper.button
        this.heading_title = this.helper.heading_title
        this.validation_message = this.helper.validation_message;
        this.store_features = this.helper.STORE_FEATURES;

        jQuery(this.helper.elementRef.nativeElement).find('#price_rating').on('change', (evnt, res_data) => {

            this.store_setting.price_rating = res_data.selected;

        });

        jQuery(this.helper.elementRef.nativeElement).find('#order_cancellation_charge_type').on('change', (evnt, res_data) => {

            this.store_setting.order_cancellation_charge_type = res_data.selected;

        });
        setTimeout(() => {
            jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifChecked', (event, res_data) => {
                var id = event.target.getAttribute('value')
                this.store_setting.famous_for.push(id)
            });

            jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifUnchecked', (event, res_data) => {
                var id = event.target.getAttribute('value');
                var i = this.store_setting.famous_for.indexOf(id);
                if (i != -1) {
                    this.store_setting.famous_for.splice(i, 1);
                }
            });
        }, 500)

        jQuery('#open').on('change', (event, res_data) => {

            this.store_open_time_error = 0;
            this.store_close_time_error = 0;
            var open = jQuery("#open").val()
            var close = jQuery("#close").val()
            this.store_setting.store_open_time = open

            var open_date = new Date(Date.now())
            open = open.split(':');
            open_date.setHours(open[0], open[1], 0, 0)
            open = open_date.getTime();

            var close_date = new Date(Date.now())
            close = close.split(':');
            close_date.setHours(close[0], close[1], 0, 0)
            close = close_date.getTime();

            if (open >= close) {
                this.store_open_time_error = 1
            }
            else {
                this.store_open_time_error = 0
            }

            for (var i in this.store_time_millisecond_array) {

                var open_time = this.store_time_millisecond_array[i].store_open_time;
                var close_time = this.store_time_millisecond_array[i].store_close_time;

                if ((open_time <= open) && (open <= close_time)) {
                    this.store_open_time_error = 2
                }
                else if (open <= open_time && close_time <= close) {
                    this.store_open_time_error = 2
                }
            }
        });



        jQuery('#close').on('change', (event, res_data) => {
            this.store_close_time_error = 0;
            this.store_open_time_error = 0;
            var open = jQuery("#open").val()
            var close = jQuery("#close").val()
            this.store_setting.store_close_time = close
            var open_date = new Date(Date.now())
            open = open.split(':');
            open_date.setHours(open[0], open[1], 0, 0)
            open = open_date.getTime();

            var close_date = new Date(Date.now())
            close = close.split(':');
            close_date.setHours(close[0], close[1], 0, 0)
            close = close_date.getTime();


            if (open >= close) {
                this.store_close_time_error = 1

            }
            else {
                this.store_close_time_error = 0;
            }

            for (var i in this.store_time_millisecond_array) {
                let open_time = this.store_time_millisecond_array[i].store_open_time
                let close_time = this.store_time_millisecond_array[i].store_close_time

                if ((open_time <= close) && (close <= close_time)) {
                    this.store_close_time_error = 2

                }
                else if (open <= open_time && close_time <= close) {
                    this.store_close_time_error = 2
                }

            }
        });
        setTimeout(() => {
            let height = jQuery('.total_order_price').height();
            jQuery('.cancellation_setting').height(height);
            let height1 = jQuery('.delivery_setting').height();
            jQuery('.general_setting').height(height1);
        }, 100);
    }

    change_cancellation_apply(event) {
        if (event) {
            setTimeout(function () {
                jQuery("#order_cancellation_charge_type").chosen({ disable_search: true });
                jQuery("#order_cancellation_charge_type").trigger("chosen:updated");
            }, 100);
        }
    }

    change_auto_transfer(event) {
        console.log(event)
        if (event) {
            setTimeout(() => {
                jQuery('.clock-picker').clockpicker({
                    'default': 'now',
                    'align': 'right'
                });
            }, 100);

        } else {
        }
    }

    check_data(i) {
        return i.replace(/[\s]/g, '');
    }

    change_day(selected_day) {
        this.curren_selected_day = selected_day;
        let index = this.store_setting.store_time.findIndex((x) => x.day == selected_day)

        this.is_store_open_full_time = this.store_setting.store_time[index].is_store_open_full_time;
        this.is_store_open = this.store_setting.store_time[index].is_store_open;
        this.selected_store_time_array = this.store_setting.store_time[index].day_time;
        this.store_time_millisecond_array = [];
        this.selected_store_time_array.forEach((time) => {

            var open_date = new Date(Date.now())
            var open_time = time.store_open_time;
            open_time = open_time.split(':')
            open_date.setHours(open_time[0], open_time[1], 0, 0);

            var close_date = new Date(Date.now());
            var close_time = time.store_close_time;
            close_time = close_time.split(':');
            close_date.setHours(close_time[0], close_time[1], 0, 0);

            this.store_time_millisecond_array.push({ store_open_time: open_date.getTime(), store_close_time: close_date.getTime() });
        });
    }

    store_full_time_open(event) {
        let index = this.store_setting.store_time.findIndex((x) => x.day == this.curren_selected_day);
        this.store_setting.store_time[index].is_store_open_full_time = event;
        if (event) {
            this.is_store_open = event;
            this.store_setting.store_time[index].is_store_open = event;
        }
    }

    store_open(event) {
        let index = this.store_setting.store_time.findIndex((x) => x.day == this.curren_selected_day)
        this.store_setting.store_time[index].is_store_open = event;
    }

    open_add_time_modal() {
        this.modal.open();
        this.store_setting.store_open_time = "";
        this.store_setting.store_close_time = "";
        this.store_close_time_error = 0;
        this.store_open_time_error = 0;
    }

    add_store_time() {
        this.store_time_add = false
        this.selected_store_time_array.push({ store_open_time: this.store_setting.store_open_time, store_close_time: this.store_setting.store_close_time });

        var open_date = new Date(Date.now())
        var open_time = this.store_setting.store_open_time;
        open_time = open_time.split(':')
        open_date.setHours(open_time[0], open_time[1], 0, 0)

        var close_date = new Date(Date.now())
        var close_time = this.store_setting.store_close_time;
        close_time = close_time.split(':')
        close_date.setHours(close_time[0], close_time[1], 0, 0)
        this.store_time_millisecond_array.push({ store_open_time: open_date.getTime(), store_close_time: close_date.getTime() });
        this.selected_store_time_array.sort(this.sortStoreTime);
        // this.updateStoreTime();
        this.modal.close();
    }

    sortStoreTime(a, b) {
        if (a.store_open_time < b.store_open_time)
            return -1;
        if (a.store_open_time > b.store_open_time)
            return 1;
        return 0;
    }

    remove_store_time(store_time) {
        if (!this.is_store_open_full_time && this.edit) {

            swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
            }).then(() => {
                var i = this.selected_store_time_array.indexOf(store_time);
                if (i != -1) {
                    this.selected_store_time_array.splice(i, 1);
                    this.store_time_millisecond_array.splice(i, 1);
                    // this.updateStoreTime()
                }
            }).catch(swal.noop);
        }
    }

    updateStoreTime(store_data) {
        // if(this.store_setting.social_id.length == 0){
        //     this.type = "time"
        //     this.old_password_modal.open();
        // } else {
        this.updateStoreTimeService();
        // }
    }

    updateStoreTimeService() {
        this.myLoading = true;
        this.helper.http.post(this.helper.POST_METHOD.UPDATE_STORE_TIME, { store_time: this.store_setting.store_time, type: this.helper.ADMIN_DATA_ID.ADMIN, store_id: this.store_setting.store_id, server_token: this.store_setting.server_token }).pipe(map((response: Response) => response.json())).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }

                this.helper.message()
                var store = JSON.parse(localStorage.getItem('store'));
            }
            else {
                this.edit = false;
                localStorage.setItem('store', JSON.stringify(res_data.store));
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message()
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    old_password_update() {
        if (this.type == 'settingdata') {
            this.UpdateSettingData(this.store_setting)
        } else {
            this.updateStoreTimeService();
        }
        this.old_password_modal.close();
    }

    UpdateSetting(store_data) {
        this.UpdateSettingData(this.store_setting);
    }

    UpdateSettingData(store_data) {
        this.helper.json_log(this.store_setting.old_password)
        this.myLoading = true;
        store_data.famous_products_tags = this.store_setting.famous_for;
        store_data.old_password = this.store_setting.old_password;
        store_data.new_password = "";
        store_data.type = this.helper.ADMIN_DATA_ID.ADMIN;
        this.helper.http.post(this.helper.POST_METHOD.UPDATE, store_data).pipe(map((response: Response) => response.json())).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
                var store = JSON.parse(localStorage.getItem('store'));

                this.store_setting.is_business = store.is_business;
                this.store_setting.is_store_busy = store.is_store_busy;
                this.store_setting.item_tax = store.item_tax;
                this.store_setting.free_delivery_for_above_order_price = store.free_delivery_for_above_order_price;
                this.store_setting.free_delivery_within_radius = store.free_delivery_within_radius;
                this.store_setting.delivery_time = store.delivery_time;
                this.store_setting.delivery_time_max = store.delivery_time_max;
                this.store_setting.price_rating = store.price_rating;
                this.store_setting.old_password = "";

                this.store_setting.is_order_cancellation_charge_apply = store.is_order_cancellation_charge_apply;
                this.store_setting.order_cancellation_charge_for_above_order_price = store.order_cancellation_charge_for_above_order_price;
                this.store_setting.order_cancellation_charge_type = store.order_cancellation_charge_type;
                this.store_setting.order_cancellation_charge_value = store.order_cancellation_charge_value;
                this.store_setting.max_item_quantity_add_by_user = store.max_item_quantity_add_by_user;
                this.store_setting.schedule_order_create_after_minute = store.schedule_order_create_after_minute;
                this.store_setting.is_provide_delivery_anywhere = store.is_provide_delivery_anywhere;
                this.store_setting.delivery_radius = store.delivery_radius;
                this.store_setting.is_taking_schedule_order = store.is_taking_schedule_order;
                this.store_setting.is_ask_estimated_time_for_ready_order = store.is_ask_estimated_time_for_ready_order;
                this.store_setting.inform_schedule_order_before_min = store.inform_schedule_order_before_min;
                this.store_setting.famous_for = store.famous_products_tags;
                this.store_setting.min_order_price = store.min_order_price;
                this.store_setting.is_provide_pickup_delivery = store.is_provide_pickup_delivery;

                this.store_setting.auto_transfer = store.auto_transfer;
                this.store_setting.features_available = store.features_available;


                // this.store_setting.time_of_transfer = store.time_of_transfer;

                setTimeout(function () {
                    jQuery(".chosen-select").trigger("chosen:updated");
                    jQuery('.icheck').iCheck('uncheck');
                }, 400);

                if (this.store_setting.features_available.length > 0) {
                    this.store_setting.features_available.forEach(function (feature) {
                        setTimeout(() => {
                            jQuery('#icheck' + feature).iCheck('check');
                        }, 500);
                    });
                }

                // setTimeout(function() {
                //     jQuery(".chosen-select").trigger("chosen:updated");
                //     jQuery('.icheck').iCheck('uncheck');
                // }, 400);
                // this.store_setting.famous_for.forEach(function (famous) {

                //     setTimeout(() => {
                //         jQuery('#icheck' + famous).iCheck('check');
                //     }, 500);
                // });

            }
            else {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message()
                this.store_setting.old_password = "";
                localStorage.setItem('store', JSON.stringify(res_data.store));
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}