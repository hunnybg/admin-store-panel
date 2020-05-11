import {Component, OnInit, ViewChild} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;
declare var swal: any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { map } from 'rxjs/operators';

export interface AddZone {

    city_id: Object,
    from_zone_id: Object,
    to_zone_id: Object,
    price: number,
    delivery_type_id: Object,
    vehicle_id: Object,
    type_id: Object,
    admin_type: number
}

export interface AddService {

    country_id: Object,
    city_id: Object,
    vehicle_id: Object,
    delivery_service_id: Object,
    base_price_distance: Number,
    delivery_type_id: Object,

    country_name: String,
    city_name: String,
    name: String,
    vehicle_name: String,
    delivery_name: String,
    currency_sign: String,
    is_distance_unit_mile: Boolean,
    base_price: Number,
    price_per_unit_distance: Number,
    price_per_unit_time: Number,
    service_tax: Number,
    admin_profit_mode_on_delivery: number,
    admin_profit_value_on_delivery: number,
    is_use_distance_calculation: boolean,
    min_fare: Number,
    cancellation_fee: Number,
    admin_type: number,
    surge_hours: any[],
    is_surge_hours: Boolean,
    is_business: Boolean,
    surge_multiplier: Number,
    surge_start_hour: Number,
    surge_end_hour: Number,
    delivery_price_setting: any[]

}

@Component({
    selector: 'app-add_service',
    templateUrl: './add_service.component.html',
    providers: [Helper]
})
export class StoreAddServiceComponent implements OnInit {

    private add_service: AddService;
    title: any;
    button: any;
    type: String;
    heading_title: any;
    validation_message: any;
    tooltip_title: any;

    country_list: any[];
    city_list: any[];
    vehicle_list: any[];
    delivery_type_list: any[] = [];
    delivery_list: any[];
    currency_sign: String;
    is_distance_unit_mile: Boolean;
    service_id: Object;
    error: any;
    service_exist: any;

    add_surge_hours: any;
    surge_start_error: any;
    surge_end_error: any;
    myLoading: boolean = true;
    add_zone: AddZone;

    zone_price: any[] = [];

    from_zone_list: any[] = [];
    to_zone_list: any[] = [];
    @ViewChild('add_delivery_fee_modal')
    add_delivery_fee_modal: ModalComponent;
    admin_profit_mode_on_delivery_list: any[];
    from_distance: number = null;
    to_distance: number = null;
    delivery_fee: number = null;
    selected_index: number = null;

    store_id: string = '';
    server_token: string = '';
    distance_calculation_error: number = 0;

    constructor(private helper: Helper) {

    }

    ngAfterViewInit() {

        jQuery(".chosen-select").chosen();

        jQuery("#country").chosen();
        jQuery("#city").chosen();
        jQuery("#delivery_type_id").chosen({disable_search: true});

        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);

        jQuery('.clock-picker').clockpicker({
            'default': 'now'
        });
    }
    ngOnDestroy() {
        this.helper.router_id.admin.service_id = "";
    }

    ngOnInit() {

        this.add_zone = {
            price: null,
            city_id: null,
            to_zone_id: null,
            from_zone_id: null,
            delivery_type_id: null,
            vehicle_id: null,
            type_id: null,
            admin_type: this.helper.ADMIN_DATA_ID.STORE
        }

        this.admin_profit_mode_on_delivery_list = this.helper.ADMIN_PROFIT_ON_DELIVERYS

        this.add_service = {
            country_id: "",
            city_id: null,
            vehicle_id: null,
            delivery_service_id: null,
            delivery_type_id: null,
            country_name: "",
            city_name: "",
            name: "",
            vehicle_name: "",
            delivery_name: "",
            currency_sign: "",
            is_distance_unit_mile: false,
            base_price_distance: null,
            base_price: null,
            price_per_unit_distance: null,
            price_per_unit_time: null,
            service_tax: null,
            min_fare: null,
            // surge_price: null,
            cancellation_fee: null,
            admin_profit_mode_on_delivery: null,
            admin_profit_value_on_delivery: null,
            surge_hours: [],
            is_surge_hours: false,
            is_business: true,
            is_use_distance_calculation: false,
            surge_multiplier: null,
            surge_start_hour: null,
            surge_end_hour: null,
            delivery_price_setting: [],
            admin_type: this.helper.ADMIN_DATA_ID.STORE

        }
        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.store_id= store._id;
            this.server_token= store.server_token;
            this.add_service.country_id = store.country_id;
            this.add_service.city_id = store.city_id;
            this.get_zone_list(this.add_service.city_id);
            this.get_vehicle_list(this.add_service.city_id);
        }
        this.service_id = this.helper.router_id.admin.service_id;


        this.helper.http.get('admin/get_delivery_type').pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.delivery_type_list = res_data.delivery_type;
            if(this.delivery_type_list.length==1){
                this.add_service.delivery_type_id = this.delivery_type_list[0]._id
            }
        })
        this.vehicle_list = []
        this.delivery_list = []
        this.currency_sign = ""
        this.is_distance_unit_mile = false

        this.add_surge_hours = true


        jQuery(this.helper.elementRef.nativeElement).find('#delivery_service').on('change', (evnt, res_data) => {
            this.add_service.delivery_service_id = res_data.selected;
        });


        jQuery(this.helper.elementRef.nativeElement).find('#vehicle').on('change', (evnt, res_data) => {
            this.add_service.vehicle_id = res_data.selected;
        });

        jQuery(this.helper.elementRef.nativeElement).find('#delivery_type_id').on('change', (evnt, res_data) => {
            this.add_service.delivery_type_id = res_data.selected
        });

        jQuery(this.helper.elementRef.nativeElement).find('#admin_profit_mode').on('change', (evnt, res_data) => {
            this.add_service.admin_profit_mode_on_delivery = res_data.selected
        });

        jQuery(this.helper.elementRef.nativeElement).find('#start').on('change', (evnt, res_data) => {
            this.surge_start_error = ""
            var start = jQuery("#start").val()
            this.add_service.surge_start_hour = start
            start = start.split(':');
            for (var i in this.add_service.surge_hours) {

                var surge_start = this.add_service.surge_hours[i].surge_start_hour.split(':')
                var surge_end = this.add_service.surge_hours[i].surge_end_hour.split(':')

                if (surge_start[0] > surge_end[0]) {
                    if ((start[0] > 0) && (surge_end[0] > start[0])) {
                        this.surge_start_error = "Alredy"

                    }
                    else if (surge_start[0] == start[0]) {
                        if (surge_start[1] <= start[1]) {
                            this.surge_start_error = "Alredy"
                        }
                    }
                    else if (surge_end[0] == start[0]) {
                        if (start[1] <= surge_end[1]) {
                            this.surge_start_error = "Alredy"
                        }
                    }

                }
                else {
                    if ((surge_start[0] < start[0]) && (start[0] < surge_end[0])) {
                        this.surge_start_error = "Alredy"

                    }
                    else if (surge_start[0] == start[0]) {
                        if (surge_start[1] <= start[1]) {
                            this.surge_start_error = "Alredy"
                        }
                    }
                    else if (surge_end[0] == start[0]) {
                        if (start[1] <= surge_end[1]) {
                            this.surge_start_error = "Alredy"
                        }
                    }

                }


            }

        });
        jQuery(this.helper.elementRef.nativeElement).find('#end').on('change', (evnt, res_data) => {
            this.surge_end_error = ""

            var end = jQuery("#end").val()
            var start = jQuery("#start").val()
            this.add_service.surge_end_hour = end
            end = end.split(':');
            start = start.split(':');
            for (var i in this.add_service.surge_hours) {
                var surge_start = this.add_service.surge_hours[i].surge_start_hour.split(':')
                var surge_end = this.add_service.surge_hours[i].surge_end_hour.split(':')


                if ((surge_start[0] < end[0]) && (end[0] < surge_end[0])) {
                    this.surge_end_error = "Alredy"

                }
                else if (surge_start[0] == end[0]) {
                    if (surge_start[1] <= end[1]) {
                        this.surge_end_error = "Alredy"
                    }
                }
                else if (surge_end[0] == end[0]) {
                    if (end[1] <= surge_end[1]) {
                        this.surge_end_error = "Alredy"
                    }
                }

            }


        });

        if (this.service_id == '') {
            this.type = "add";
            this.service_exist = ""
        }
        else {
            jQuery('.add').hide();
            this.type = "edit";
            this.helper.http.post('/admin/get_service_detail', {service_id: this.service_id, type_id: this.store_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {
                    this.helper.router.navigate(['store/service']);
                }
                else {

                    this.add_service.country_id = res_data.service.country_id;
                    this.add_service.city_id = res_data.service.city_id;

                    this.add_zone.city_id = res_data.service.city_id;
                    this.add_zone.vehicle_id = res_data.service.vehicle_id;
                    this.add_zone.delivery_type_id = res_data.service.delivery_type_id;

                    this.zone_price = res_data.zone_price;

                    this.from_zone_list = res_data.city_zone;
                    this.to_zone_list = res_data.city_zone;

                    setTimeout(function () {
                        jQuery("#from_zone_id").trigger("chosen:updated");
                        jQuery("#to_zone_id").trigger("chosen:updated");
                    }, 1000);
                    // this.add_service.vehicle_id = res_data.service.vehicle_id;
                    // this.add_service.delivery_service_id = res_data.service.delivery_service_id;
                    //this.add_service.delivery_type_id = res_data.service.delivery_type_id;

                    this.add_service.country_name = res_data.service.country_details.country_name;
                    this.add_service.city_name = res_data.service.city_details.city_name;
                    this.add_service.vehicle_name = res_data.service.vehicle_detail.vehicle_name;
                    //this.add_service.name = res_data.service.delivery_type_details.name;

                    // this.add_service.vehicle_name = res_data.service.vehicle_details.vehicle_name;
                    // this.add_service.delivery_name = res_data.service.delivery_details.delivery_name;
                    this.add_service.base_price_distance = res_data.service.base_price_distance;
                    this.add_service.base_price = res_data.service.base_price;
                    this.add_service.price_per_unit_distance = res_data.service.price_per_unit_distance;
                    if(res_data.service.delivery_price_setting){
                        this.add_service.delivery_price_setting = res_data.service.delivery_price_setting;
                    }
                    this.add_service.price_per_unit_time = res_data.service.price_per_unit_time;
                    this.add_service.service_tax = res_data.service.service_tax;
                    this.add_service.admin_profit_value_on_delivery = res_data.service.admin_profit_value_on_delivery;
                    this.add_service.admin_profit_mode_on_delivery = res_data.service.admin_profit_mode_on_delivery;
                    this.add_service.min_fare = res_data.service.min_fare;

                    this.currency_sign = res_data.service.country_details.currency_sign;
                    this.is_distance_unit_mile = res_data.service.country_details.is_distance_unit_mile;



                    //this.add_service.surge_price = res_data.service.surge_price;
                    this.add_service.cancellation_fee = res_data.service.cancellation_fee;
                    // this.add_service.admin_profit_mode_on_delivery = res_data.service.admin_profit_mode_on_delivery;
                    // this.add_service.admin_profit_value_on_delivery = res_data.service.admin_profit_value_on_delivery;

                    this.add_service.surge_hours = res_data.service.surge_hours;
                    this.add_service.is_surge_hours = res_data.service.is_surge_hours;
                    this.add_service.is_business = res_data.service.is_business;
                    this.add_service.is_use_distance_calculation = res_data.service.is_use_distance_calculation;
                    this.add_service.surge_multiplier = res_data.service.surge_multiplier;
                    this.add_service.surge_start_hour = res_data.service.surge_start_hour;
                    this.add_service.surge_end_hour = res_data.service.surge_end_hour;



                }
            });

        }

        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.store_id= store._id;
            this.server_token= store.server_token;
        }

        jQuery(this.helper.elementRef.nativeElement).find('#from_zone_id').on('change', (evnt, res_data) => {
            this.add_zone.from_zone_id = res_data.selected;
        });
        jQuery(this.helper.elementRef.nativeElement).find('#to_zone_id').on('change', (evnt, res_data) => {
            this.add_zone.to_zone_id = res_data.selected;
        });

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.tooltip_title = this.helper.tooltip_title;

        this.validation_message = this.helper.validation_message;
    }

    open_add_delivery_modal(){
        this.distance_calculation_error = 0;
        this.selected_index = null;
        this.add_delivery_fee_modal.open();
        this.from_distance = null;
        this.delivery_fee = null;
        this.to_distance = null;
    }

    open_edit_delivery_modal(index){
        this.distance_calculation_error = 0;
        this.selected_index = index;
        this.from_distance = JSON.parse(JSON.stringify(this.add_service.delivery_price_setting[index].from_distance));
        this.to_distance = JSON.parse(JSON.stringify(this.add_service.delivery_price_setting[index].to_distance));
        this.delivery_fee = JSON.parse(JSON.stringify(this.add_service.delivery_price_setting[index].delivery_fee));
        this.add_delivery_fee_modal.open();
    }

    add_delivery_price_data(){
        if(this.selected_index !== null){
            this.update_delivery_price_data();
        } else {
            if(Number(this.from_distance) < Number(this.to_distance)){
                this.distance_calculation_error = 0;
                this.add_service.delivery_price_setting.push({
                    from_distance: Number(this.from_distance),
                    to_distance: Number(this.to_distance),
                    delivery_fee: Number(this.delivery_fee)
                });
                this.to_distance = null;
                this.from_distance = null;
                this.from_distance = null;
                this.delivery_fee = null;
                this.selected_index = null;
                this.add_delivery_fee_modal.close();
            } else {
                this.distance_calculation_error = 1;
            }
        }
    }

    delete_delivery_price_data(index){
        this.add_service.delivery_price_setting.splice(index, 1);
    }

    update_delivery_price_data(){
        if(Number(this.from_distance) > Number(this.to_distance)){
            this.distance_calculation_error = 0;
            this.add_service.delivery_price_setting[this.selected_index].from_distance = JSON.parse(JSON.stringify(Number(this.from_distance)));
            this.add_service.delivery_price_setting[this.selected_index].to_distance = JSON.parse(JSON.stringify(Number(this.to_distance)));
            this.add_service.delivery_price_setting[this.selected_index].delivery_fee = JSON.parse(JSON.stringify(Number(this.delivery_fee)));
            this.from_distance = null;
            this.to_distance = null;
            this.delivery_fee = null;
            this.selected_index = null;
            this.add_delivery_fee_modal.close();
        } else {
            this.distance_calculation_error = 1;
        }
    }

    get_zone_list(city_id) {
        this.helper.http.post('/admin/get_zone_detail', {city_id: city_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            if (res_data.success) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.from_zone_list = res_data.city_zone;
                this.to_zone_list = res_data.city_zone;

                setTimeout(function () {
                    jQuery("#from_zone_id").trigger("chosen:updated");
                    jQuery("#to_zone_id").trigger("chosen:updated");
                }, 1000);

            } else {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            }
        });

    }


    add_surge_hours_array() {
        this.add_surge_hours = false
        this.add_service.surge_hours.push({surge_multiplier: Number(this.add_service.surge_multiplier), surge_start_hour: this.add_service.surge_start_hour, surge_end_hour: this.add_service.surge_end_hour});
        this.add_service.surge_multiplier = null
        this.add_service.surge_start_hour = null
        this.add_service.surge_end_hour = null
    }
    add_zone_price() {
        this.add_zone.city_id = this.add_service.city_id;
        this.add_zone.type_id = this.store_id;

        this.helper.http.post('/admin/add_zone_price', this.add_zone).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            if (res_data.success) {

                var from_index = this.from_zone_list.findIndex((x) => x._id == this.add_zone.from_zone_id);
                var to_index = this.to_zone_list.findIndex((x) => x._id == this.add_zone.to_zone_id);

                var json = res_data.zone_value;
                json.from_zone_detail = {
                    title: this.from_zone_list[from_index].title
                }
                json.to_zone_detail = {
                    title: this.to_zone_list[to_index].title
                }
                this.zone_price.push(json);
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message();
            } else {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
            }
        });
    }
    update_zone_price(data) {
        var json = {
            _id: data._id,
            price: Number(data.price)
        }
        this.helper.http.post('/admin/update_zone_price', json).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            if (res_data.success) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
            } else {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            }
        });
    }



    remove_surge_data(surge_data) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(() => {
            var i = this.add_service.surge_hours.indexOf(surge_data);
            if (i != -1) {
                this.add_service.surge_hours.splice(i, 1);
            }
            swal(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            );
        }).catch(swal.noop)
    }
    
  


    get_city_lists(countryid) {
        this.add_service.country_id = countryid
        this.helper.http.post('/api/admin/get_city_lists', {country_id: countryid}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            console.log(res_data)
            if(res_data.success) {
                this.city_list = res_data.cities;
                this.currency_sign = res_data.currency_sign
                this.is_distance_unit_mile = res_data.is_distance_unit_mile
                // if (this.city_list.length > 0) {
                //     this.add_service.city_id = this.city_list[0]._id;
                // }
            } else {
                this.city_list = res_data.cities;
                this.add_service.city_id = '';
                this.currency_sign = ''
                this.is_distance_unit_mile = false;
            }
            setTimeout(function () {
                jQuery("#city").trigger("chosen:updated");
            }, 1000);

        });


    }


    get_vehicle_list(cityid) {
        this.add_service.city_id = cityid
        this.helper.http.post('/api/admin/get_vehicle_list', {city_id: cityid, type_id: this.store_id}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            var vehicles_list = res_data.vehicles;
            var services_list = res_data.services;
            var vehicle_array = [];
            var service_array = [];
            var unique_array = [];
            for (var index in vehicles_list) {
                vehicle_array.push({_id: vehicles_list[index]._id, name: vehicles_list[index].vehicle_name});
            }
            for (var index in services_list) {
                service_array.push({_id: services_list[index].vehicle_detail._id, name: services_list[index].vehicle_detail.vehicle_name});
            }
            unique_array = vehicle_array.filter(function (current) {
                return service_array.filter(function (current_b) {
                    return current_b['_id'] == current['_id']
                }).length == 0
            });
            this.vehicle_list = unique_array
            console.log(this.vehicle_list)
            setTimeout(function () {
                jQuery("#vehicle").trigger("chosen:updated");
            }, 1000);
        });


    }



    get_delivery_list(cityid) {
        this.add_service.city_id = cityid
        this.helper.http.post('/api/admin/get_delivery_list_for_city', {city_id: cityid}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.delivery_list = res_data.deliveries
        });
        setTimeout(function () {
            jQuery("#delivery_service").trigger("chosen:updated");
        }, 1000);
    }

    addService(servicedata) {
        servicedata.delivery_price_setting = this.add_service.delivery_price_setting;
        servicedata.type_id = this.store_id;
        servicedata.country_id = this.add_service.country_id;
        servicedata.city_id = this.add_service.city_id;
        servicedata.admin_type = this.add_service.admin_type;
        console.log(servicedata)
        if (this.type == 'add') {
            this.myLoading = true;
            this.helper.http.post('/admin/add_service_data', servicedata).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                console.log(res_data)
                if (res_data.success == true) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.router.navigate(['store/service']);
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

            this.updateService(servicedata)
        }
    }

    updateService(service_data) {
        this.myLoading = true;
        delete service_data.vehicle_id;
        delete service_data.country_id;
        delete service_data.city_id;
        delete service_data.type_id;
        service_data.admin_type = this.add_service.admin_type;
        this.helper.http.post('/admin/update_service', service_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == true) {

                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.router.navigate(['store/service']);


            }
            else {

                this.helper.router.navigate(['store/service']);

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}
