import {Component, OnInit} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var google;
declare var jQuery: any;

export interface AddService {
    country_id: Object,
    city_id: Object,
    vehicle_id: Object,
    delivery_service_id: Object,
    base_price_distance: Number,
    delivery_type_id: Object,
    name: String,
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
    surge_hours: any[],
    is_surge_hours: Boolean,
    is_business: Boolean,
    surge_multiplier: Number,
    surge_start_hour: Number,
    surge_end_hour: Number,
    delivery_price_setting: any[]
}

export interface AddCity {
    country_id: Object,
    city_code: String,
    city_name: String,
    city_nick_name: String,
    country_name: String,
    name: String,
    is_cash_payment_mode: Boolean,
    is_other_payment_mode: Boolean,
    admin_profit_mode_on_delivery: Number,
    admin_profit_value_on_delivery: Number,
    is_promo_apply: Boolean,
    is_business: Boolean,
    payment_gateway: Object[],

    is_use_radius: Boolean,
    zone_business: Boolean,

    city_radius: number,
    city_lat: Number,
    city_lng: Number,
    deliveries_in_city: Object[],
    timezone: String,
    city_locations: any[],

    is_check_provider_wallet_amount_for_received_cash_request: Boolean,
    provider_min_wallet_amount_for_received_cash_request: Number,

    is_provider_earning_add_in_wallet_on_cash_payment: Boolean,
    is_store_earning_add_in_wallet_on_cash_payment: Boolean,
    is_provider_earning_add_in_wallet_on_other_payment: Boolean,
    is_store_earning_add_in_wallet_on_other_payment: Boolean,
    is_ads_visible: Boolean

}

@Component({
    selector: 'app-add_city',
    templateUrl: './add_city.component.html',
    providers: [Helper]
})
export class AddCityComponent implements OnInit {

    private add_city: AddCity;
    private add_service: AddService;
    title: any;
    button: any;
    type: String;
    heading_title: any;
    validation_message: any;
    ADMIN_PROFIT_ON_DELIVERYS: any;
    country_list: any[];
    timezone_list: any[];
    city_id: Object;
    city_list: any[];
    error: any;
    deliveries_in_city_list: any[];
    payment_gateway_list: any[];
    city_exist: any;
    submit_button: string;
    timer: any;
    myLoading: boolean = false;
    admin_profit_mode_on_delivery_list: any[];
    city_zone: any[] = [];
    map: any = '';
    city_radius_map: any = '';
   
    selected_tab: string = 'city';
    service_list: any[];

    selectedShape: any;
    selectedColor: any;
    colors: any[] = ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'];
    colorButtons: any = {};
    drawingManager: any;
    city_radius_drawingManager: any;
    cityCircle: any;

    vehicle_list: any[];
    delivery_type_list: any[] = [];


    constructor(private helper: Helper) {

    }

    ngAfterViewInit() {
        jQuery("#country").chosen();
        jQuery("#admin_profit_mode").chosen({disable_search: true});
        jQuery("#timezone").chosen();
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
            jQuery('input').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
        }, 1000);
    }
    ngOnDestroy() {
        this.helper.router_id.admin.city_id = "";
    }

    ngOnInit() {
        this.admin_profit_mode_on_delivery_list = this.helper.ADMIN_PROFIT_ON_DELIVERYS;

        this.helper.http.get('admin/get_delivery_type').pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.delivery_type_list = res_data.delivery_type;
            if(this.delivery_type_list.length==1){
                this.add_service.delivery_type_id = this.delivery_type_list[0]._id
            }
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

        this.add_city = {
            country_id: "",
            city_code: "",
            city_name: "",
            city_nick_name: "",
            country_name: "",
            name: "",
            is_cash_payment_mode: true,
            is_other_payment_mode: true,
            is_promo_apply: false,
            admin_profit_mode_on_delivery: 1,
            admin_profit_value_on_delivery: null,
            city_locations: [],
            is_business: true,
            payment_gateway: [],
            city_radius: null,
            is_use_radius: true,
            zone_business: false,
            city_lat: null,
            city_lng: null,
            deliveries_in_city: [],
            timezone: "",
            is_check_provider_wallet_amount_for_received_cash_request: false,
            provider_min_wallet_amount_for_received_cash_request: null,
            is_provider_earning_add_in_wallet_on_cash_payment: false,
            is_store_earning_add_in_wallet_on_cash_payment: false,
            is_provider_earning_add_in_wallet_on_other_payment: false,
            is_store_earning_add_in_wallet_on_other_payment: false,
            is_ads_visible: false
        }
        this.add_service = {
            country_id: "",
            city_id: "",
            vehicle_id: "",
            delivery_service_id: "",
            delivery_type_id: "",
            name: "",
            delivery_name: "",
            currency_sign: "",
            is_distance_unit_mile: false,
            base_price_distance: null,
            base_price: null,
            price_per_unit_distance: null,
            price_per_unit_time: null,
            service_tax: null,
            min_fare: null,
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
            delivery_price_setting: []
        }

        this.city_id = this.helper.router_id.admin.city_id;
        this.helper.http.get('/admin/get_server_country_list').pipe(map((res: Response) => res.json())).subscribe(res => {
            this.country_list = res.countries,
                this.deliveries_in_city_list = res.delivery,
                this.payment_gateway_list = res.payment_gateway
        });

        this.timezone_list = [];


        jQuery(this.helper.elementRef.nativeElement).find('#country').on('change', (evnt, res_data) => {

            this.get_country_timezone(res_data.selected);


        });
        jQuery(this.helper.elementRef.nativeElement).find('#timezone').on('change', (evnt, res_data) => {

            this.add_city.timezone = res_data.selected

        });

        jQuery(this.helper.elementRef.nativeElement).find('#admin_profit_mode').on('change', (evnt, res_data) => {

            this.add_city.admin_profit_mode_on_delivery = res_data.selected


        });

        setTimeout(() => {

            jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifChecked', (event, res_data) => {

                var id = event.target.getAttribute('value')
                this.add_city.deliveries_in_city.push(id)

            });

            jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifUnchecked', (event, res_data) => {

                var id = event.target.getAttribute('value')
                var i = this.add_city.deliveries_in_city.indexOf(id);
                if (i != -1) {
                    this.add_city.deliveries_in_city.splice(i, 1);
                }
            });

            jQuery(this.helper.elementRef.nativeElement).find('.icheck_payment_gateway').on('ifChecked', (event, res_data) => {

                var id = event.target.getAttribute('value')
                this.add_city.payment_gateway.push(id)

            });

            jQuery(this.helper.elementRef.nativeElement).find('.icheck_payment_gateway').on('ifUnchecked', (event, res_data) => {

                var id = event.target.getAttribute('value')
                var i = this.add_city.payment_gateway.indexOf(id);
                if (i != -1) {
                    this.add_city.payment_gateway.splice(i, 1);
                }
            });
        }, 1000);

        var directionsDisplay = new google.maps.DirectionsRenderer;
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            streetViewControl: false,
            center: {lat: 22, lng: 70}
        });

        this.drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON]
            },
            polygonOptions: {
                fillColor: '#ffff00',
                fillOpacity: 0.3,
                strokeWeight: 2,
                clickable: true,
                editable: true,
                zIndex: 1
            }
        });
        this.drawingManager.setMap(this.map);

        this.city_radius_map = new google.maps.Map(document.getElementById('city_radius_map'), {
            zoom: 10,
            streetViewControl: false,
            center: {lat: 22, lng: 70}
        });
        this.city_radius_drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON]
            },
            polygonOptions: {
                fillColor: 'black',
                fillOpacity: 0.3,
                strokeWeight: 2,
                clickable: true,
                editable: true,
                zIndex: 1
            }
        });
        this.city_radius_drawingManager.setMap(this.city_radius_map);

        var infoWindow = null;

        google.maps.event.addListener(this.city_radius_drawingManager, 'overlaycomplete', (polygon) => {

            var shape = polygon.overlay;
            this.city_radius_drawingManager.setDrawingMode(null);
            this.city_radius_drawingManager.setOptions({
                drawingControl: false,
            });
            let location_array = []
            shape.getPath().getArray().forEach((location) => {
                location_array.push([location.lng(), location.lat()])
            });

            this.add_city.city_locations = location_array;
            google.maps.event.addListener(shape.getPath(), 'set_at', (event) => {
                let location_array = []
                shape.getPath().getArray().forEach((location) => {
                    location_array.push([location.lng(), location.lat()])
                });
                this.add_city.city_locations = location_array;
            });
            google.maps.event.addListener(shape.getPath(), 'insert_at', (event) => {
                let location_array = []
                shape.getPath().getArray().forEach((location) => {
                    location_array.push([location.lng(), location.lat()])
                });
                this.add_city.city_locations = location_array;
            });
            google.maps.event.addListener(shape.getPath(), 'remove_at', (event) => {
                let location_array = []
                shape.getPath().getArray().forEach((location) => {
                    location_array.push([location.lng(), location.lat()])
                });
                this.add_city.city_locations = location_array;
            });
        });

        google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (polygon) => {

            var shape = polygon.overlay;
            shape.type = polygon.type;
            shape.index = this.city_zone.length;
            shape.title = 'Polygon ' + (this.city_zone.length + 1);
            this.drawingManager.setDrawingMode(null);
            let location_array = []
            shape.getPath().getArray().forEach((location) => {
                location_array.push([location.lng(), location.lat()])
            });

            let json = {
                kmlzone: location_array,
                index: this.city_zone.length,
                color: shape.get('fillColor'),
                title: shape.title
            }
            this.city_zone.push(json);
            this.setSelection(shape);

            var locations = shape.getPath().getArray()

            var html = '<div><input type="text" id="title" name="title"/></div><br>' +
                '<div><input type="color" id="color" name="color"/></div><br>' +
                '<div><button id="submit_title" type="button" style="text-align: center;">Submit</button></div>';

            if (infoWindow) {
                infoWindow.close();
            }

            infoWindow = new google.maps.InfoWindow();
            infoWindow.setContent(html);
            infoWindow.setPosition(locations[0]);
            infoWindow.open(this.map, shape);
            setTimeout(()=>{
                jQuery('#submit_title').on('click', (event, res_data) => {
                    if (this.selectedShape) {
                        if (jQuery('#title').val() != '') {
                            this.selectedShape.set('title', jQuery('#title').val());
                            this.city_zone[this.selectedShape.index].title = jQuery('#title').val();
                            shape.title = jQuery('#title').val();
                        }
                        if (jQuery('#color').val() != '') {
                            this.makeColorButton(jQuery('#color').val());
                            this.selectedShape.set('color', jQuery('#color').val());
                            this.city_zone[this.selectedShape.index].color = jQuery('#color').val();
                            shape.color = jQuery('#color').val();
                        }
                        infoWindow.close();
                    }
                });
            },1000);

            google.maps.event.addListener(shape, 'click', (e) => {

                if (infoWindow) {
                    infoWindow.close();
                }

                this.setSelection(shape);
                var locations = shape.getPath().getArray()
                var html = '<div><input type="text" id="edit_title" name="title"/></div><br>' +
                    '<div><input type="color" id="edit_color" name="color"/></div><br>' +
                    '<div><button id="update_title" type="button" style="text-align: center;">Update</button></div>'

                infoWindow = new google.maps.InfoWindow();
                infoWindow.setContent(html);
                infoWindow.setPosition(locations[0]);
                infoWindow.open(this.map, shape);
                jQuery('#edit_title').val(shape.title);
                jQuery('#edit_color').val(shape.color);
                setTimeout(()=>{
                    jQuery('#update_title').on('click', (event, res_data) => {
                        if (this.selectedShape) {
                            if (jQuery('#edit_color').val() != '') {
                                this.makeColorButton(jQuery('#edit_color').val())
                                this.selectedShape.set('color', jQuery('#edit_color').val());
                                this.city_zone[this.selectedShape.index].color = jQuery('#edit_color').val();
                                shape.color = jQuery('#edit_color').val();
                            }
                            if (jQuery('#edit_title').val() != '') {
                                this.selectedShape.set('title', jQuery('#edit_title').val());
                                this.city_zone[this.selectedShape.index].title = jQuery('#edit_title').val();
                                shape.title = jQuery('#edit_title').val();
                            }
                            infoWindow.close();
                        }
                    });
                },1000);
            });

            google.maps.event.addListener(shape.getPath(), 'set_at', (event) => {
                let location_array = []
                shape.getPath().getArray().forEach((location) => {
                    location_array.push([location.lng(), location.lat()])
                });
                this.city_zone[this.selectedShape.index].kmlzone = location_array;
            });
            google.maps.event.addListener(shape.getPath(), 'insert_at', (event) => {
                let location_array = []
                shape.getPath().getArray().forEach((location) => {
                    location_array.push([location.lng(), location.lat()])
                });

                this.city_zone[this.selectedShape.index].kmlzone = location_array;
            });
            google.maps.event.addListener(shape.getPath(), 'remove_at', (event) => {
                let location_array = []
                shape.getPath().getArray().forEach((location) => {
                    location_array.push([location.lng(), location.lat()])
                });

                this.city_zone[this.selectedShape.index].kmlzone = location_array;
            });
        });

        directionsDisplay.setMap(this.map);
        directionsDisplay.setMap(this.city_radius_map);
        this.buildColorPalette();
        this.helper.http.get('/admin/city_list').pipe(map((res: Response) => res.json())).subscribe(res => {
            this.city_list = res;
            res.cities.forEach((city)=>{
                if(city._id !== this.city_id) {
                    if (city.is_use_radius) {
                        var color = '#FF0000';
                        if (city.is_business) {
                            color = 'black'
                        }
                        var cityCircle = new google.maps.Circle({
                            strokeColor: color,
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: color,
                            fillOpacity: 0.35,
                            map: this.city_radius_map,
                            center: {lat: city.city_lat_long[0], lng: city.city_lat_long[1]},
                            radius: city.city_radius * 1000
                        });

                    } else {
                        var color = '#FF0000';
                        if (city.is_business) {
                            color = 'black'
                        }
                        let city_location = city.city_locations;
                        let array = [];
                        city_location.forEach((location) => {
                            array.push({lat: Number(location[1]), lng: Number(location[0])})
                        });
                        let polygon = new google.maps.Polygon({
                            map: this.city_radius_map,
                            paths: array,
                            strokeColor: color,
                            strokeOpacity: 1,
                            strokeWeight: 1.2,
                            fillColor: color,
                            fillOpacity: 0.3,
                            draggable: false,
                            geodesic: true,
                            editable: false
                        });
                    }
                }
            })
        });

        if (this.city_id == '') {
            this.type = "add";

            this.city_exist = ""
        }
        else {
            jQuery('.add').hide();
            this.type = "edit";
            this.helper.http.post('/admin/get_city_detail', {city_id: this.city_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {

                    this.helper.router.navigate(['admin/city']);

                }
                else {
                    // this.get_service_list(this.city_id)
                    // this.get_vehicle_list(this.city_id);

                    this.drawingManager.setDrawingMode(null);
                    this.map.setCenter({lat: res_data.city.city_lat_long[0], lng: res_data.city.city_lat_long[1]});
                    this.city_radius_map.setCenter({lat: res_data.city.city_lat_long[0], lng: res_data.city.city_lat_long[1]});
                    this.city_zone = res_data.city_zone;
                    this.add_city.city_name = res_data.city.city_name;
                    this.add_city.city_nick_name = res_data.city.city_nick_name;

                    this.add_city.city_code = res_data.city.city_code;
                    this.add_city.city_radius = res_data.city.city_radius;
                    this.add_city.zone_business = res_data.city.zone_business;
                    this.add_city.is_use_radius = res_data.city.is_use_radius;

                    this.add_city.timezone = res_data.city.timezone;
                    this.add_city.country_name = res_data.city.country_details.country_name;

                    this.add_city.country_id = res_data.city.country_id;
                    this.get_country_timezone(this.add_city.country_id);
                    this.add_city.city_lat = res_data.city.city_lat_long[0];
                    this.add_city.city_lng = res_data.city.city_lat_long[1];

                    this.add_city.admin_profit_mode_on_delivery = res_data.city.admin_profit_mode_on_delivery;
                    this.add_city.admin_profit_value_on_delivery = res_data.city.admin_profit_value_on_delivery;


                    this.add_city.is_ads_visible = res_data.city.is_ads_visible;
                    this.add_city.is_promo_apply = res_data.city.is_promo_apply;
                    this.add_city.is_cash_payment_mode = res_data.city.is_cash_payment_mode;
                    this.add_city.is_business = res_data.city.is_business;
                    this.add_city.is_other_payment_mode = res_data.city.is_other_payment_mode;


                    this.add_city.is_check_provider_wallet_amount_for_received_cash_request = res_data.city.is_check_provider_wallet_amount_for_received_cash_request;
                    this.add_city.provider_min_wallet_amount_for_received_cash_request = res_data.city.provider_min_wallet_amount_for_received_cash_request;
                    this.add_city.is_provider_earning_add_in_wallet_on_cash_payment = res_data.city.is_provider_earning_add_in_wallet_on_cash_payment;
                    this.add_city.is_store_earning_add_in_wallet_on_cash_payment = res_data.city.is_store_earning_add_in_wallet_on_cash_payment;
                    this.add_city.is_provider_earning_add_in_wallet_on_other_payment = res_data.city.is_provider_earning_add_in_wallet_on_other_payment;
                    this.add_city.is_store_earning_add_in_wallet_on_other_payment = res_data.city.is_store_earning_add_in_wallet_on_other_payment;


                    res_data.city.payment_gateway.forEach(function (payment_gateway_data) {

                        setTimeout(() => {
                            jQuery('#icheck' + payment_gateway_data).iCheck('check');
                        }, 1000);
                    })


                    res_data.city.deliveries_in_city.forEach(function (deliveries_in_city_data) {

                        setTimeout(() => {
                            jQuery('#icheck' + deliveries_in_city_data).iCheck('check');
                        }, 1000);
                    })

                    if (res_data.city.city_locations && !this.add_city.is_use_radius) {
                        if (res_data.city.city_locations.length > 0) {
                            this.city_radius_drawingManager.setDrawingMode(null);
                            this.city_radius_drawingManager.setOptions({
                                drawingControl: false,
                            });
                        }

                        this.add_city.city_locations = res_data.city.city_locations;

                        let array = [];
                        this.add_city.city_locations.forEach((location) => {
                            array.push({lat: Number(location[1]), lng: Number(location[0])})
                        });

                        let polygon = new google.maps.Polygon({
                            map: this.city_radius_map,
                            paths: array,
                            strokeColor: 'blue',
                            strokeOpacity: 1,
                            strokeWeight: 1.2,
                            fillColor: 'blue',
                            fillOpacity: 0.3,
                            draggable: false,
                            geodesic: true,
                            editable: true
                        });

                        google.maps.event.addListener(polygon.getPath(), 'set_at', (event) => {
                            let location_array = []
                            polygon.getPath().getArray().forEach((location) => {
                                location_array.push([location.lng(), location.lat()])
                            });
                            this.add_city.city_locations = location_array;
                        });
                        google.maps.event.addListener(polygon.getPath(), 'insert_at', (event) => {
                            let location_array = []
                            polygon.getPath().getArray().forEach((location) => {
                                location_array.push([location.lng(), location.lat()])
                            });
                            this.add_city.city_locations = location_array;
                        });
                        google.maps.event.addListener(polygon.getPath(), 'remove_at', (event) => {
                            let location_array = []
                            polygon.getPath().getArray().forEach((location) => {
                                location_array.push([location.lng(), location.lat()])
                            });
                            this.add_city.city_locations = location_array;
                        });
                    }

                    if(this.add_city.is_use_radius){
                        this.cityCircle = new google.maps.Circle({
                            strokeColor: 'blue',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: 'blue',
                            fillOpacity: 0.35,
                            map: this.city_radius_map,
                            center: {lat: res_data.city.city_lat_long[0], lng: res_data.city.city_lat_long[1]},
                            radius: res_data.city.city_radius * 1000
                        });
                    }

                    this.city_zone.forEach((city_zone_detail, index) => {
                        let zone = [];
                        city_zone_detail.kmlzone.forEach((kml) => {
                            zone.push({lat: Number(kml[1]), lng: Number(kml[0])})
                        });

                        let polygon2 = new google.maps.Polygon({
                            map: this.map,
                            paths: zone,
                            strokeColor: city_zone_detail.color,
                            strokeOpacity: 1,
                            strokeWeight: 1.2,
                            fillColor: city_zone_detail.color,
                            fillOpacity: 0.3,
                            draggable: false,
                            geodesic: true
                        });

                        var shape: any = polygon2
                        shape.index = index;
                        
                        google.maps.event.addListener(polygon2.getPath(), 'set_at', (event) => {
                            let location_array = []
                            polygon2.getPath().getArray().forEach((location) => {
                                location_array.push([location.lng(), location.lat()])
                            });

                            this.city_zone[this.selectedShape.index].kmlzone = location_array;
                        });
                        google.maps.event.addListener(polygon2.getPath(), 'insert_at', (event) => {
                            let location_array = []
                            polygon2.getPath().getArray().forEach((location) => {
                                location_array.push([location.lng(), location.lat()])
                            });

                            this.city_zone[this.selectedShape.index].kmlzone = location_array;
                        });
                        google.maps.event.addListener(polygon2.getPath(), 'remove_at', (event) => {
                            let location_array = []
                            polygon2.getPath().getArray().forEach((location) => {
                                location_array.push([location.lng(), location.lat()])
                            });

                            this.city_zone[this.selectedShape.index].kmlzone = location_array;
                        });


                        google.maps.event.addListener(polygon2, 'click', (event) => {
                            if (infoWindow) {
                                infoWindow.close();
                            }

                            infoWindow = new google.maps.InfoWindow({
                                content: city_zone_detail.title,
                                maxWidth: 320
                            });

                            infoWindow.setPosition(event.latLng);
                            infoWindow.open(this.map, polygon2);
                            this.setSelection(shape);
                        });
                    });
                }
            });

        }

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.validation_message = this.helper.validation_message;

    }

    setSelection(shape) {
        this.clearSelection();
        shape.setEditable(true);
        this.selectColor(shape.get('fillColor') || shape.get('strokeColor'));
        this.selectedShape = shape;
    }

    clearSelection() {
        if (this.selectedShape) {
            this.selectedShape.setEditable(false);
            this.selectedShape = null;
        }
    }

    selectColor(color) {
        this.selectedColor = color;
        var polygonOptions = this.drawingManager.get('polygonOptions');
        polygonOptions.fillColor = color;
        polygonOptions.strokeColor = color;
        this.drawingManager.set('polygonOptions', polygonOptions);
    }
    setSelectedShapeColor(color) {
        if (this.selectedShape) {
            if (this.selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
                this.selectedShape.set('strokeColor', color);
                this.selectedShape.set('fillColor', color);
                this.city_zone[this.selectedShape.index].color = color;
            } else {
                this.selectedShape.set('strokeColor', color);
                this.selectedShape.set('fillColor', color);
                this.city_zone[this.selectedShape.index].color = color;
            }
        }
    }
    buildColorPalette() {
        this.selectColor(this.colors[0]);
    }

    makeColorButton(color) {
        this.selectColor(color);
        this.setSelectedShapeColor(color);
    }

    public formData = new FormData();
    image_update($event) {
        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];
        this.formData.append('zone_file', image_url)
    }

    get_country_timezone(countryid) {

        this.add_city.country_id = countryid
        this.check_city(this.add_city.city_name, this.add_city.city_code)
        this.helper.http.post('/admin/get_country_timezone', {countryid: countryid}).pipe(map((res: Response) => res.json())).subscribe(data => {

            this.timezone_list = data.country_timezone
            this.add_city.timezone = this.timezone_list[0];
            

            ///////// for city auto complete ///////////////////
            var autocompleteElm = <HTMLInputElement> document.getElementById('city_name');
            let autocomplete = new google.maps.places.Autocomplete((autocompleteElm), {types: ['(cities)'], componentRestrictions: {country: data.country_code}});
            autocomplete.addListener('place_changed', () => {
                var place = autocomplete.getPlace();
                var lat = place.geometry.location.lat();
                var lng = place.geometry.location.lng();
                this.map.setCenter({lat: place.geometry.location.lat(), lng: place.geometry.location.lng()});
                this.city_radius_map.setCenter({lat: place.geometry.location.lat(), lng: place.geometry.location.lng()});
                var city_code;
                for (var i = 0; i < place.address_components.length; i++) {

                    if (place.address_components[i].types[0] == "administrative_area_level_1") {

                        city_code = place.address_components[i];
                        city_code = city_code.short_name;
                    }
                }

                this.add_city.city_code = city_code
                this.add_city.city_nick_name = place.formatted_address
                this.add_city.city_name = place.name
                this.add_city.city_lat = lat
                this.add_city.city_lng = lng
                this.check_city(place.name, city_code)
            });




        });
        setTimeout(function () {
            jQuery("#timezone").trigger("chosen:updated");
        }, 1000);


    }

    addCity(citydata) {
        if (this.type == 'add') {
            this.myLoading = true;
            citydata.city_zone = this.city_zone;

            if (this.add_city.is_use_radius == true) {
                citydata.city_radius = this.add_city.city_radius;
            }

            if (this.add_city.is_use_radius == false) {
                citydata.city_locations = this.add_city.city_locations;
            }







            this.helper.http.post('/admin/add_city_data', citydata).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == true) {

                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.router.navigate(['admin/city']);

                } else {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message()
                }
            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
        else {
            this.updateCity(citydata)
        }
    }


    updateCity(city_data) {
        this.myLoading = true;
        city_data.city_zone = this.city_zone;
        city_data.city_locations = this.add_city.city_locations;
        this.helper.http.post('/admin/update_city', city_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == true) {
                //     this.formData.append('city_id',city_data.city_id);
                //     this.helper.http.post('/admin/update_city_zone', this.formData).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                //
                // if (res_data.success == true) {

                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.router.navigate(['admin/city']);
                //     }
                // });

            }
            else {
                this.helper.router.navigate(['admin/city']);

            }
        }, (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
    }

    check_city(city, city_code) {
        this.helper.http.post('/admin/check_city', {country_id: this.add_city.country_id, city_name: city.trim(), city_code: city_code.trim()}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == false) {
                jQuery('#submit').attr('disabled', true);
                this.city_exist = "City Already Exist."
            }
            else {
                jQuery('#submit').attr('disabled', false);
                this.city_exist = ""
                this.draw_radius();
            }
        });

    }

    change_city_radius(){
        setTimeout(()=>{
            this.draw_radius();
        },500);
    }

    draw_radius(){
        if(this.add_city.city_lat && this.add_city.city_lng && this.add_city.is_use_radius && this.add_city.city_radius>0){
            if(this.cityCircle){
                this.cityCircle.setMap(null);
            }
            this.cityCircle = new google.maps.Circle({
                strokeColor: 'blue',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: 'blue',
                fillOpacity: 0.35,
                map: this.city_radius_map,
                center: {lat: this.add_city.city_lat, lng: this.add_city.city_lng},
                radius: (this.add_city.city_radius * 1000)
            });
        } else {
            if(this.cityCircle){
                this.cityCircle.setMap(null);
            }
        }
    }

    get_service_list(city_id) {
        this.myLoading=true;
        this.helper.http.post('/admin/service_list', {city_id: city_id
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == false) {
                    this.service_list = [];
                }
                else {
                    this.service_list = res_data.service;
                    if(this.service_list.length>0){

                    }
                }
            },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    get_vehicle_list(cityid) {
        this.add_service.city_id = cityid
        this.helper.http.post('/api/admin/get_vehicle_list', {city_id: cityid}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

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
            setTimeout(function () {
                jQuery("#vehicle").trigger("chosen:updated");
            }, 1000);
        });


    }


}
