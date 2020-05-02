import {Component, OnInit} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;

export interface AddPromocode {
    country_id: Object,
    city_id: Object,

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
    is_approved: Boolean,

    promo_details: String,
    promo_code_name: String,
    promo_code_value: Number,
    promo_code_type: Number,
    promo_for: Number,
    promo_apply_on: Object[],

    admin_loyalty_type: Number,
    admin_loyalty: Number,

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

    country_name: String,
    city_name: String
}


@Component({
    selector: 'app-add_promo_code',
    templateUrl: './add_promo_code.component.html',
    providers: [Helper]
})
export class AddPromoCodeComponent implements OnInit {
    private add_promo_code: AddPromocode;
    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    country_list: any[];
    city_list: any[];
    delivery_list: any[];
    store_list: any[];
    country_name: String;
    city_name: String;
    promo_start_date: any;
    promo_expire_date: any;
    type: String;
    promo_id: Object;
    promo_exist: any;
    promo_code_list: any[];
    error: any;
    myLoading: boolean = true;
    admin_promo_for: any[];
    admin_promo_for_delivery_service: any[];
    product_list: any[];
    item_list: any[];
    constructor(private helper: Helper) {

    }

    ngAfterViewInit() {

        jQuery("#country").chosen();
        jQuery("#city").chosen();
        jQuery("#promo_code_type").chosen({disable_search: true});
        jQuery("#promo_for").chosen({disable_search: true});
        jQuery("#promo_code_type").chosen({disable_search: true});
        jQuery("#admin_loyalty_type").chosen({disable_search: true});
        jQuery("#promo_recursion_type").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");

            jQuery('input').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
        }, 1000);
    }
    ngOnDestroy() {
        this.helper.router_id.admin.promo_id = "";
    }

    ngOnInit() {
        this.admin_promo_for = this.helper.ADMIN_PROMO_FOR_DELIVERY_SERVICE;

        this.add_promo_code = {
            country_id: "",
            city_id: "",
            promo_start_date: null,
            promo_expire_date: null,
            promo_details: "",
            promo_code_name: "",
            promo_code_value: null,
            promo_code_type: 2,
            promo_code_uses: null,

            promo_apply_on: [],
            promo_for: 20,
            admin_loyalty_type: 2,
            promo_code_apply_on_minimum_amount: null,
            promo_code_max_discount_amount: null,
            admin_loyalty: null,
            is_active: true,
            is_approved: true,
            is_promo_required_uses: true,
            is_promo_have_minimum_amount_limit: true,
            is_promo_have_max_discount_limit: true,
            country_name: "",
            city_name: "",
            is_promo_have_item_count_limit: false,
            promo_code_apply_on_minimum_item_count: null,
            promo_recursion_type: 0,
            days: [],
            months: [],
            weeks: [],
            promo_end_time: '',
            promo_start_time: '',
            is_promo_have_date: false,
            promo_apply_after_completed_order: null,
            is_promo_apply_on_completed_order: false
        }
        this.promo_id = this.helper.router_id.admin.promo_id
        this.helper.http.get('api/admin/get_country_list').map((response: Response) => response.json()).subscribe(res_data => {
            this.country_list = res_data.countries;

        });
        this.helper.http.get('api/admin/get_delivery_list').map((response: Response) => response.json()).subscribe(res_data => {
            this.delivery_list = res_data.deliveries;

            setTimeout(() => {
                jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifChecked', (event, res_data) => {

                    var id = event.target.getAttribute('value')
                    this.add_promo_code.promo_apply_on.push(id)

                });

                jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifUnchecked', (event, res_data) => {

                    var id = event.target.getAttribute('value')
                    var i = this.add_promo_code.promo_apply_on.indexOf(id);
                    if (i != -1) {
                        this.add_promo_code.promo_apply_on.splice(i, 1);
                    }
                });

            }, 1000);
        });

        jQuery(this.helper.elementRef.nativeElement).find('#country').on('change', (evnt, res_data) => {

            this.get_city_list(res_data.selected);
            this.get_store_list(res_data.selected);


        });

        jQuery(this.helper.elementRef.nativeElement).find('#city').on('change', (evnt, res_data) => {

            this.add_promo_code.city_id = res_data.selected;
            this.get_store_list(res_data.selected);
            this.get_product_list(res_data.selected);

        });


        // jQuery(this.helper.elementRef.nativeElement).find('#is_promo_for_delivery_service').on('change', (evnt, res_data) => {
        //
        //     this.add_promo_code.is_promo_for_delivery_service = res_data.selected;
        //
        // });
        jQuery(this.helper.elementRef.nativeElement).find('#promo_code_type').on('change', (evnt, res_data) => {

            this.add_promo_code.promo_code_type = res_data.selected;

        });
        setTimeout(() => {
            jQuery("#months").trigger("chosen:updated");
            jQuery("#weeks").trigger("chosen:updated");
            jQuery("#days").trigger("chosen:updated");
            jQuery("#promo_recursion_type").trigger("chosen:updated");
            jQuery("#promo_for").trigger("chosen:updated");
        }, 100);

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
            if (res_data.selected == this.helper.ADMIN_PROMO_FOR_ID.DELIVERIES) {
                this.helper.http.get('api/admin/get_delivery_list').map((response: Response) => response.json()).subscribe(res_data => {
                    this.delivery_list = res_data.deliveries;

                    setTimeout(() => {
                        jQuery('.icheck').iCheck({
                            handle: 'checkbox',
                            checkboxClass: 'icheckbox_square-green',
                        });
                        jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifChecked', (event, res_data) => {

                            var id = event.target.getAttribute('value')
                            this.add_promo_code.promo_apply_on.push(id)
                        });

                        jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifUnchecked', (event, res_data) => {

                            var id = event.target.getAttribute('value')
                            var i = this.add_promo_code.promo_apply_on.indexOf(id);
                            if (i != -1) {
                                this.add_promo_code.promo_apply_on.splice(i, 1);
                            }
                        });

                    }, 1000);
                });
            }
            else if (res_data.selected == this.helper.ADMIN_PROMO_FOR_ID.STORE) {
                this.get_store_list(this.add_promo_code.city_id);

            } else if (res_data.selected == this.helper.ADMIN_PROMO_FOR_ID.PRODUCT) {
                this.get_product_list(this.add_promo_code.city_id);
                setTimeout(() => {
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
                        if (index !== -1) {
                            this.add_promo_code.promo_apply_on.splice(index, 1)
                        }
                    });
                }, 1000);
            } else if (res_data.selected == this.helper.ADMIN_PROMO_FOR_ID.ITEM) {
                this.get_item_list(this.add_promo_code.city_id);
                setTimeout(() => {
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
                        if (index !== -1) {
                            this.add_promo_code.promo_apply_on.splice(index, 1)
                        }
                    });
                }, 1000);
            }




        });

        jQuery(this.helper.elementRef.nativeElement).find('#admin_loyalty_type').on('change', (evnt, res_data) => {

            this.add_promo_code.admin_loyalty_type = res_data.selected;


        });

        this.city_list = []

        if (this.promo_id == '') {
            jQuery('.edit').hide();
            this.type = "add";
            this.promo_exist = ""
        }
        else {
            jQuery('.add').hide();
            this.type = "edit";
            // jQuery('#promo_for').hide();


            this.helper.http.post('/admin/get_promo_detail', {promo_id: this.promo_id}).map((res_data: Response) => res_data.json()).subscribe(res_data => {

                if (res_data.success == false) {
                    this.helper.router.navigate(['admin/promotions']);
                }
                else {
                    jQuery('#promo_for_chosen').hide();
                    this.add_promo_code = res_data.promo_code
                    this.add_promo_code.country_name = res_data.promo_code.country_details.country_name;


                    if (res_data.promo_code.city_details.length > 0) {
                        this.add_promo_code.city_name = res_data.promo_code.city_details[0].city_name;
                    } else {
                        this.add_promo_code.city_name = "All";

                    }

                    if (res_data.promo_code.promo_start_date != null) {
                        var date = new Date(res_data.promo_code.promo_start_date);
                        this.add_promo_code.promo_start_date = {date: {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()}, formatted: date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()};

                    }
                    if (res_data.promo_code.promo_expire_date != null) {
                        var date = new Date(res_data.promo_code.promo_expire_date);
                        this.add_promo_code.promo_expire_date = {date: {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()}, formatted: date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()};

                    }


                    setTimeout(() => {
                        jQuery("#promo_for").trigger("chosen:updated");
                    }, 100);

                   if(!this.add_promo_code.is_promo_have_date){
                        jQuery(".btnpicker").prop('disabled', true);
                    }


                    if (res_data.promo_code.is_promo_for_delivery_service) {
                        this.add_promo_code.promo_for = res_data.promo_code.promo_for;
                        this.admin_promo_for = this.helper.ADMIN_PROMO_FOR_DELIVERY_SERVICE;
                    } else {
                        this.add_promo_code.promo_for = res_data.promo_code.promo_for;
                        this.admin_promo_for = this.helper.ADMIN_PROMO_FOR;
                    }

                    this.get_store_list(this.add_promo_code.city_id);
                    this.get_product_list(this.add_promo_code.city_id);
                    this.get_item_list(this.add_promo_code.city_id);

                    res_data.promo_code.promo_apply_on.forEach(function (promo_apply_on_data) {

                        setTimeout(() => {
                            jQuery('#icheck' + promo_apply_on_data).iCheck('check');
                        }, 1000);
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
        this.title = this.helper.title;
        this.validation_message = this.helper.validation_message;
    }

    change_expiry_date(event) {

        if(event){
            jQuery(".btnpicker").prop('disabled', false);

        } else {
            jQuery(".btnpicker").prop('disabled', true);
        }
    }

    get_product_list(city_id) {
        this.helper.http.post('/admin/product_for_city_store', {
            city_id: this.add_promo_code.city_id
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.product_list = res_data.city;
            console.log(this.product_list)

        });
        setTimeout(() => {
            jQuery('.icheckproduct').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
            jQuery(this.helper.elementRef.nativeElement).find('.icheckproduct').on('ifChecked', (event, res_data) => {

                var id = event.target.getAttribute('value')
                this.add_promo_code.promo_apply_on.push(id)
            });

            jQuery(this.helper.elementRef.nativeElement).find('.icheckproduct').on('ifUnchecked', (event, res_data) => {

                var id = event.target.getAttribute('value')
                var i = this.add_promo_code.promo_apply_on.indexOf(id);
                if (i != -1) {
                    this.add_promo_code.promo_apply_on.splice(i, 1);
                }
            });
        }, 1000);
    }

    // onChange(value) {
    //
    //     if (value == true) {
    //         this.admin_promo_for = this.helper.ADMIN_PROMO_FOR_DELIVERY_SERVICE;
    //     } else {
    //         this.admin_promo_for = this.helper.ADMIN_PROMO_FOR;
    //     }
    //     setTimeout(() => {
    //         jQuery("#promo_for").trigger("chosen:updated");
    //     }, 100);
    // }


    get_item_list(city_id) {
        this.helper.http.post('/admin/item_for_city_store', {
            city_id: this.add_promo_code.city_id
        }).map((res: Response) => res.json()).subscribe(res_data => {
            console.log(res_data)
            console.log(this.item_list)
            this.item_list = res_data.city;


        });
        setTimeout(() => {
            jQuery('.icheckitem').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
            jQuery(this.helper.elementRef.nativeElement).find('.icheckitem').on('ifChecked', (event, res_data) => {

                var id = event.target.getAttribute('value')
                this.add_promo_code.promo_apply_on.push(id)



            });

            jQuery(this.helper.elementRef.nativeElement).find('.icheckitem').on('ifUnchecked', (event, res_data) => {

                var id = event.target.getAttribute('value')
                var i = this.add_promo_code.promo_apply_on.indexOf(id);
                if (i != -1) {
                    this.add_promo_code.promo_apply_on.splice(i, 1);
                }
            });
        }, 1000);
    }



    get_city_list(countryid) {
        this.add_promo_code.country_id = countryid;
        this.helper.http.post('/api/admin/get_city_list', {country_id: countryid}).map((res: Response) => res.json()).subscribe(res_data => {

            this.city_list = res_data.cities
        });
        setTimeout(function () {
            jQuery("#city").trigger("chosen:updated");
        }, 1000);
    }


    get_store_list(city_id) {

        this.add_promo_code.city_id = city_id;
        this.helper.http.post('admin/get_store_list_for_city', {city_id: city_id}).map((res: Response) => res.json()).subscribe(res_data => {

            this.store_list = res_data.stores
        });

        setTimeout(() => {
            jQuery('.icheck_store').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
            jQuery(this.helper.elementRef.nativeElement).find('.icheck_store').on('ifChecked', (event, res_data) => {
                var id = event.target.getAttribute('value')
                this.add_promo_code.promo_apply_on.push(id)
            });

            jQuery(this.helper.elementRef.nativeElement).find('.icheck_store').on('ifUnchecked', (event, res_data) => {

                var id = event.target.getAttribute('value')
                var i = this.add_promo_code.promo_apply_on.indexOf(id);
                if (i != -1) {
                    this.add_promo_code.promo_apply_on.splice(i, 1);
                }
            });
        }, 1000);
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

        if (this.type == 'add') {
            this.myLoading = true;
            promo_code_data.promo_apply_on = this.add_promo_code.promo_apply_on;

            this.helper.http.post('/admin/add_promo_code_data', promo_code_data).map((res: Response) => res.json()).subscribe(res_data => {
                this.myLoading = false;

                if (res_data.success == true) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.router.navigate(['admin/promotions']);
                }
                else {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                }

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
        promo_code_data.promo_apply_on = this.add_promo_code.promo_apply_on;
        promo_code_data.days =  this.add_promo_code.days;
        promo_code_data.months =  this.add_promo_code.months;
        promo_code_data.weeks =  this.add_promo_code.weeks;

        this.helper.http.post('/admin/update_promo_code', promo_code_data).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.router.navigate(['admin/promotions']);
            }
            else {

                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }



    check_promo_code(promo_code) {

        this.helper.http.post('/admin/check_promo_code', {country_id: this.add_promo_code.country_id, city_id: this.add_promo_code.city_id, promo_code_name: promo_code.trim()}).map((res: Response) => res.json()).subscribe(res_data => {

            if (res_data.success == false) {
                jQuery('#submit').attr('disabled', true);
                this.promo_exist = "Promo Code Already Exist"
            }
            else {
                jQuery('#submit').attr('disabled', false);
                this.promo_exist = "";
            }
        });

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

}
