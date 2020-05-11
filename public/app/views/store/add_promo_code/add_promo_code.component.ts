import {Component, OnInit} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../store_helper";
import { map } from 'rxjs/operators';
declare var jQuery: any;



export interface AddPromocode {

    store_id: Object,
    server_token: string,

    is_promo_have_date: Boolean,
    promo_start_date: any,
    promo_expire_date: any,
    promo_start_time: any,
    promo_end_time: any,
    promo_recursion_type: Number,
    months: any[],
    weeks: any[],
    days: any[],

    is_active: Boolean,

    promo_details: String,
    promo_code_name: String,
    promo_code_value: Number,
    promo_code_type: Number,
    promo_for: Number,
    promo_apply_on: Object[],

    is_promo_have_minimum_amount_limit: Boolean,
    promo_code_apply_on_minimum_amount: Number,
    is_promo_have_max_discount_limit: Boolean,
    promo_code_max_discount_amount: Number,
    is_promo_have_item_count_limit: Boolean,
    promo_code_apply_on_minimum_item_count: Number,

    is_promo_required_uses: Boolean,
    promo_code_uses: Number,

    is_promo_apply_on_completed_order: Boolean,
    promo_apply_after_completed_order: Number
}


@Component({
    selector: 'app-add_promo_code',
    templateUrl: './add_promo_code.component.html',
    providers: [Helper]
})
export class StoreAddPromoCodeComponent implements OnInit {
    private add_promo_code: AddPromocode;
    title: any;
    button: any;
    heading_title: any;
    lable_title: any;
    validation_message: any;
    promo_start_date: any;
    promo_expire_date: any;
    type: String;
    promo_id: Object;
    promo_exist: any;
    product_list: any[] = [];
    item_list: any[] = [];
    error: any;
    myLoading: boolean = true;
    constructor(private helper: Helper) {

    }

    ngAfterViewInit() {

        jQuery("#promo_code_type").chosen({disable_search: true});
        jQuery("#promo_for").chosen({disable_search: true});
        jQuery("#promo_recursion_type").chosen({disable_search: true});

    }
    ngOnDestroy() {
        this.helper.router_id.store.store_promo_id = "";
    }

    ngOnInit() {

        this.add_promo_code = {
            store_id: null,
            server_token: '',
            promo_start_date: null,
            promo_expire_date: null,
            promo_end_time: '',
            promo_start_time: '',
            promo_details: "",
            promo_code_name: "",
            promo_code_value: null,
            promo_code_type: 1,
            promo_code_uses: null,
            promo_apply_on: [],
            promo_for: 2,
            promo_code_apply_on_minimum_amount: null,
            promo_code_max_discount_amount: null,
            is_active: true,
            is_promo_have_date: true,
            is_promo_required_uses: true,
            is_promo_have_minimum_amount_limit: true,
            is_promo_have_max_discount_limit: true,
            promo_apply_after_completed_order: null,
            is_promo_apply_on_completed_order: false,
            is_promo_have_item_count_limit: false,
            promo_code_apply_on_minimum_item_count: null,
            promo_recursion_type: 0,
            days: [],
            months: [],
            weeks: []
        }
        this.promo_id = this.helper.router_id.store.store_promo_id;
        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {
            this.helper.router.navigate(['store/login']);
        }

        jQuery(this.helper.elementRef.nativeElement).find('#promo_code_type').on('change', (evnt, res_data) => {

            this.add_promo_code.promo_code_type = res_data.selected;


        });
        setTimeout( () => {
            jQuery("#promo_code_type").trigger("chosen:updated");
            jQuery("#promo_for").trigger("chosen:updated");
            jQuery("#months").trigger("chosen:updated");
            jQuery("#weeks").trigger("chosen:updated");
            jQuery("#days").trigger("chosen:updated");
            jQuery("#promo_recursion_type").trigger("chosen:updated");
        },100);
        jQuery(this.helper.elementRef.nativeElement).find('#promo_recursion_type').on('change', (evnt, res_data) => {

            this.add_promo_code.promo_recursion_type = res_data.selected;
            jQuery("#promo_code_type").chosen();

            setTimeout( () => {
                jQuery('#months').chosen();
                jQuery('#weeks').chosen();
                jQuery('#days').chosen();
            },100);
            jQuery('.clock-picker').clockpicker({
                'default': 'now',
                'align': 'right'
            });
            jQuery('#promo_start_time').on('change', (event) => {
                this.add_promo_code.promo_start_time = event.target.value;
            });
            jQuery('#promo_end_time').on('change', (event) => {
                this.add_promo_code.promo_end_time = event.target.value;
            });

        });



        jQuery(this.helper.elementRef.nativeElement).find('#promo_for').on('change', (evnt, res_data) => {

            this.add_promo_code.promo_for = res_data.selected;
            this.add_promo_code.promo_apply_on = [];

            if(res_data.selected == this.helper.PROMO_FOR_ID.STORE){
                this.add_promo_code.promo_apply_on = [this.add_promo_code.store_id];
            } else if(res_data.selected == this.helper.PROMO_FOR_ID.PRODUCT){
                setTimeout( () => {
                    jQuery('.icheckproduct').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_square-green',
                    });
                    jQuery(this.helper.elementRef.nativeElement).find('.icheckproduct').on('ifChecked', (event, res_data) => {
                        let id = event.target.getAttribute('value');
                        this.add_promo_code.promo_apply_on.push(id);
                    });
                    jQuery(this.helper.elementRef.nativeElement).find('.icheckproduct').on('ifUnchecked', (event, res_data) => {
                        let id = event.target.getAttribute('value');
                        let index = this.add_promo_code.promo_apply_on.indexOf(id);
                        if(index !== -1){
                            this.add_promo_code.promo_apply_on.splice(index, 1)
                        }
                    });
                }, 100);
            } else if(res_data.selected == this.helper.PROMO_FOR_ID.ITEM) {
                setTimeout( () => {
                    jQuery('.icheckitem').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_square-green',
                    });
                    jQuery(this.helper.elementRef.nativeElement).find('.icheckitem').on('ifChecked', (event, res_data) => {
                        let id = event.target.getAttribute('value');
                        this.add_promo_code.promo_apply_on.push(id);
                    });
                    jQuery(this.helper.elementRef.nativeElement).find('.icheckitem').on('ifUnchecked', (event, res_data) => {
                        let id = event.target.getAttribute('value');
                        let index = this.add_promo_code.promo_apply_on.indexOf(id);
                        if(index !== -1){
                            this.add_promo_code.promo_apply_on.splice(index, 1)
                        }
                    });
                }, 100);
            }

        });

        let store = JSON.parse(localStorage.getItem('store'));
        if(store!==null) {
            this.add_promo_code.store_id = store._id
            this.add_promo_code.server_token = store.server_token
            this.get_item_list();
            this.get_product_list();
        }


        if (this.promo_id == '') {
            jQuery('.edit').hide();
            jQuery('#promo_recursion_type_edit').hide();
            this.add_promo_code.promo_apply_on = [this.add_promo_code.store_id];
        }
        else {
            this.helper.http.post('/admin/get_promo_detail', {promo_id: this.promo_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {
                    this.helper.router.navigate(['admin/promotions']);
                }
                else {
                    // jQuery('#promo_for_chosen').hide();

                    // this.add_promo_code.promo_code_name = res_data.promo_code.promo_code_name;
                    // this.add_promo_code.promo_details = res_data.promo_code.promo_details;
                    // this.add_promo_code.is_active = res_data.promo_code.is_active;
                    // this.add_promo_code.is_promo_have_date = res_data.promo_code.is_promo_have_date;
                    // this.add_promo_code.is_promo_have_minimum_amount_limit = res_data.promo_code.is_promo_have_minimum_amount_limit;
                    // this.add_promo_code.is_promo_have_max_discount_limit = res_data.promo_code.is_promo_have_max_discount_limit;
                    // this.add_promo_code.promo_code_type = res_data.promo_code.promo_code_type;
                    // this.add_promo_code.promo_code_value = res_data.promo_code.promo_code_value;
                    // this.add_promo_code.promo_code_uses = res_data.promo_code.promo_code_uses;
                    // this.add_promo_code.promo_code_apply_on_minimum_amount = res_data.promo_code.promo_code_apply_on_minimum_amount;
                    // this.add_promo_code.promo_code_max_discount_amount = res_data.promo_code.promo_code_max_discount_amount;
                    // this.add_promo_code.promo_apply_on = res_data.promo_code.promo_apply_on;
                    // this.add_promo_code.is_promo_required_uses = res_data.promo_code.is_promo_required_uses;
                    // this.add_promo_code.promo_for = res_data.promo_code.promo_for;
                    this.add_promo_code = res_data.promo_code;
                    let store = JSON.parse(localStorage.getItem('store'));
                    if(store!==null) {
                        this.add_promo_code.store_id = store._id
                        this.add_promo_code.server_token = store.server_token
                    }

                    if(!this.add_promo_code.is_promo_have_date){
                        jQuery(".btnpicker").prop('disabled', true);
                    }

                    setTimeout( () => {
                        jQuery("#promo_code_type").trigger("chosen:updated");
                        jQuery("#promo_for").trigger("chosen:updated");
                    },100);

                    if (res_data.promo_code.promo_start_date != null) {
                        var date = new Date(res_data.promo_code.promo_start_date);
                        this.add_promo_code.promo_start_date = {date: {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()}, formatted: date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()};

                    }
                    if (res_data.promo_code.promo_expire_date != null) {
                        var date = new Date(res_data.promo_code.promo_expire_date);
                        this.add_promo_code.promo_expire_date = {date: {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()}, formatted: date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()};

                    }
                    res_data.promo_code.promo_apply_on.forEach ((promo_apply_on_data) => {

                        if(res_data.promo_code.promo_for == this.helper.PROMO_FOR_ID.PRODUCT){
                            setTimeout(() => {
                                jQuery('.icheckproduct').iCheck({
                                    handle: 'checkbox',
                                    checkboxClass: 'icheckbox_square-green',
                                });
                                jQuery('#icheckproduct' + promo_apply_on_data).iCheck('check');

                                jQuery(this.helper.elementRef.nativeElement).find('.icheckproduct').on('ifChecked', (event, res_data) => {
                                    let id = event.target.getAttribute('value');
                                    this.add_promo_code.promo_apply_on.push(id);
                                });
                                jQuery(this.helper.elementRef.nativeElement).find('.icheckproduct').on('ifUnchecked', (event, res_data) => {
                                    let id = event.target.getAttribute('value');
                                    let index = this.add_promo_code.promo_apply_on.indexOf(id);
                                    if(index !== -1){
                                        this.add_promo_code.promo_apply_on.splice(index, 1)
                                    }
                                });
                            }, 100);
                        } else if(res_data.promo_code.promo_for == this.helper.PROMO_FOR_ID.ITEM){
                            setTimeout(() => {
                                jQuery('.icheckitem').iCheck({
                                    handle: 'checkbox',
                                    checkboxClass: 'icheckbox_square-green',
                                });
                                jQuery('#icheckitem' + promo_apply_on_data).iCheck('check');

                                jQuery(this.helper.elementRef.nativeElement).find('.icheckitem').on('ifChecked', (event, res_data) => {
                                    let id = event.target.getAttribute('value');
                                    this.add_promo_code.promo_apply_on.push(id);
                                });
                                jQuery(this.helper.elementRef.nativeElement).find('.icheckitem').on('ifUnchecked', (event, res_data) => {
                                    let id = event.target.getAttribute('value');
                                    let index = this.add_promo_code.promo_apply_on.indexOf(id);
                                    if(index !== -1){
                                        this.add_promo_code.promo_apply_on.splice(index, 1)
                                    }
                                });
                            }, 100);
                        }

                    });

                    setTimeout( () => {
                        jQuery('#months').chosen();
                        jQuery('#weeks').chosen();
                        jQuery('#days').chosen();
                        jQuery("#promo_recursion_type").trigger("chosen:updated");
                    },100);
                    jQuery('.clock-picker').clockpicker({
                        'default': 'now',
                        'align': 'right'
                    });
                    jQuery('#promo_start_time').on('change', (event) => {
                        this.add_promo_code.promo_start_time = event.target.value;
                    });
                    jQuery('#promo_end_time').on('change', (event) => {
                        this.add_promo_code.promo_end_time = event.target.value;
                    });

                }
            });

        }
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.lable_title = this.helper.lable_title;
        this.validation_message = this.helper.validation_message;
    }

    change_switch(){
        setTimeout( () => {
            jQuery('#months').chosen();
            jQuery('#weeks').chosen();
            jQuery('#days').chosen();
            jQuery("#promo_recursion_type").trigger("chosen:updated");
        },100);
        jQuery('.clock-picker').clockpicker({
            'default': 'now',
            'align': 'right'
        });
    }

    change_expory_date(event){
        if(event){
            jQuery(".btnpicker").prop('disabled', false);

        } else {
            jQuery(".btnpicker").prop('disabled', true);
        }
    }

    get_item_list(){
        this.helper.http.post(this.helper.POST_METHOD.GET_STORE_PRODUCT_ITEM_LIST, {
            store_id: this.add_promo_code.store_id,
            server_token: this.add_promo_code.server_token
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.item_list = res_data.products;
        });
    }

    get_product_list() {
        this.helper.http.post(this.helper.POST_METHOD.GET_PRODUCT_LIST, {
            store_id: this.add_promo_code.store_id,
            server_token: this.add_promo_code.server_token
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.product_list = res_data.products;
        });
    }

    AddPromocode(promo_code_data) {

        this.add_promo_code.days = [];
        this.add_promo_code.months = [];
        this.add_promo_code.weeks = [];

        if(this.add_promo_code.is_promo_have_date && this.add_promo_code.promo_recursion_type >=2){
            var days = jQuery('#days').val();
            days.forEach((day) => {
                day = day.split(': ')
                var result = day[1].substring(1, day[1].length-1);
                this.add_promo_code.days.push(result);
            });
        }

        if(this.add_promo_code.is_promo_have_date && this.add_promo_code.promo_recursion_type >=4) {
            var months = jQuery('#months').val();
            months.forEach((month) => {
                month = month.split(': ')
                var result = month[1].substring(1, month[1].length-1);
                this.add_promo_code.months.push(result);
            });
        }

        if(this.add_promo_code.is_promo_have_date && this.add_promo_code.promo_recursion_type >=3) {
            var weeks = jQuery('#weeks').val();
            weeks.forEach((week) => {
                week = week.split(': ')
                var result = week[1].substring(1, week[1].length-1);
                this.add_promo_code.weeks.push(result);
            });
        }

        if (this.promo_id == '') {
            this.myLoading = true;
            if (promo_code_data.promo_expire_date != null) {
                this.add_promo_code.promo_expire_date = promo_code_data.promo_expire_date.formatted;
            }
            if (promo_code_data.promo_start_date != null) {
                this.add_promo_code.promo_start_date = promo_code_data.promo_start_date.formatted;
            }
            this.helper.http.post('/api/store/add_promo', this.add_promo_code).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                    this.myLoading = false;
                    if (res_data.success == true) {
                        this.helper.data.storage = {
                            "message": this.helper.MESSAGE_CODE[res_data.message],
                            "class": "alert-info"
                        }
                    }
                    else {
                        this.helper.data.storage = {
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                    }
                    this.helper.router.navigate(['store/promocode']);

                },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        } else {

            this.updatePromo(promo_code_data)
        }

    }
    updatePromo(promo_code_data) {
        this.myLoading = true;
        if (promo_code_data.promo_expire_date != null) {
            promo_code_data.promo_expire_date = promo_code_data.promo_expire_date.formatted;
        }
        if (promo_code_data.promo_start_date != null) {
            promo_code_data.promo_start_date = promo_code_data.promo_start_date.formatted;
        }
        promo_code_data.days =  this.add_promo_code.days;
        promo_code_data.months =  this.add_promo_code.months;
        promo_code_data.weeks =  this.add_promo_code.weeks;

        this.helper.http.post('/api/store/update_promo_code', promo_code_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;

                if (res_data.success) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                }
                else {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }

                }
                this.helper.router.navigate(['store/promocode']);
            },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }



    check_promo_code(promo_code) {
        this.helper.http.post('/api/store/check_promo_code', {store_id: this.add_promo_code.store_id, server_token: this.add_promo_code.server_token , promo_code_name: promo_code.trim()}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == false) {
                jQuery('#submit').attr('disabled', true);
                this.promo_exist = "Promo Code Already Exist"
            }
            else {
                jQuery('#submit').attr('disabled', false);
                this.promo_exist = ""
            }
        });
    }

}
