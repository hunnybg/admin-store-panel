import {Component, OnInit} from '@angular/core';

import {Helper} from "../../helper";
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

declare var google: any;
declare var jQuery: any;


@Component({
    selector: 'app-location_track',
    templateUrl: './location_track.component.html',
    providers: [Helper]
})
export class LocationTrackComponent implements OnInit {

    provider_markers: any;
    provider_markers_order: any;
    provider_list: any[] = [];
    country_list: any[] = [];
    city_list: any[] = [];
    order_list: any[] = [];
    provider: any;

    public latitude: number;
    public longitude: number;
    public zoom: number;
    public order_id: Object;
    public provider_id: Object;
    country_id: Object;
    city_id: Object;
    id: Object;
    type: number = 1;

    public numDeltas: number;
    public delay: number; //milliseconds
    public i: number;
    old_lat_lng: any[];
    new_lat_lng: any[];
    interval: any;


    provider_name: string = '';
    provider_email: string = '';
    provider_phone: string = '';
    icon: string = '';
    title: any;
    message: any;
    heading_title: any;
    button: any;
    is_show: boolean = false;
    map: any = '';
    constructor(public helper: Helper) {
    }
    ngAfterViewInit() {
        jQuery("#country").chosen();
        jQuery("#city").chosen();
        jQuery("#order").chosen();
        jQuery("#provider").chosen();
        jQuery("#type").chosen();
        jQuery(".chosen-select").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }


    ngOnInit() {
        this.zoom = 4;
        this.numDeltas = 100;
        this.delay = 100;
        this.icon = "map_pin/destination.png";
        this.title = this.helper.title;
        this.message = this.helper.message;
        this.heading_title = this.helper.heading_title;
        this.button = this.helper.button;

        var directionsDisplay = new google.maps.DirectionsRenderer;
        navigator.geolocation.getCurrentPosition((position) => {
            this.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 7,
                streetViewControl: false,
                center: {lat: position.coords.latitude, lng: position.coords.longitude}
            });
            directionsDisplay.setMap(this.map);

            this.helper.http.get('api/admin/get_country_list').map((res: Response) => res.json()).subscribe(res_data => {

                if (res_data.success) {
                    this.country_list = res_data.countries;
                }
                else {
                    this.country_list = [];
                }

            });
            setTimeout(function () {
                jQuery("#country").trigger("chosen:updated");
            }, 1000);


            jQuery(this.helper.elementRef.nativeElement).find('#country').on('change', (evnt, res_data) => {

                this.get_city_list(res_data.selected);

            });

            // this.helper.http.get('admin/order_list_location_track').map((res: Response) => res.json()).subscribe(res_data => {

            //     this.order_list = res_data.orders;

            // });

            jQuery(this.helper.elementRef.nativeElement).find('#city').on('change', (evnt, res_data) => {
                this.get_provider_list(res_data.selected);
                this.get_order_list(res_data.selected);

            });
            jQuery(this.helper.elementRef.nativeElement).find('#type').on('change', (evnt, res_data) => {

                this.type = res_data.selected;
                if(this.provider_markers_order){
                    this.provider_markers_order.setMap(null);
                }
                this.is_show = true;

            });


            setTimeout(() => {
                jQuery("#order").trigger("chosen:updated");
                jQuery(this.helper.elementRef.nativeElement).find('#order').on('change', (evnt, res_data) => {
                    this.id = res_data.selected;
                    this.type = 1;
                    this.helper.http.post('/admin/deliveryman_track', {id: this.id, type: this.type}).map((res: Response) => res.json()).subscribe(res_data => {
                        if(this.provider_markers_order){
                            this.provider_markers_order.setMap(null);
                        }
                        if (res_data.success) {
                            this.provider = res_data.provider;
                            this.latitude = res_data.provider.location[0];
                            this.longitude = res_data.provider.location[1];
                            this.zoom = 12;
                            this.old_lat_lng = [this.latitude, this.longitude];
                            this.provider_name = res_data.provider.first_name + ' ' + res_data.provider.last_name;
                            this.provider_email = res_data.provider.email;
                            this.provider_phone = res_data.provider.phone;
                            this.check_provider_country(this.map);
                            this.provider_location_track();
                        }
                    });
                });
            }, 1000);

            setTimeout(() => {
                jQuery("#provider").trigger("chosen:updated");
                jQuery(this.helper.elementRef.nativeElement).find('#provider').on('change', (evnt, res_data) => {
                    if(this.provider_markers_order){
                        this.provider_markers_order.setMap(null);
                    }
                    this.id = res_data.selected;
                    this.type = 0;
                    this.helper.http.post('/admin/deliveryman_track', {id: this.id, type: this.type}).map((res: Response) => res.json()).subscribe(res_data => {

                        if (res_data.success) {
                            this.provider = res_data.provider;
                            this.latitude = res_data.provider.location[0];
                            this.longitude = res_data.provider.location[1];
                            this.zoom = 12;
                            this.old_lat_lng = [this.latitude, this.longitude];
                            this.provider_name = res_data.provider.first_name + ' ' + res_data.provider.last_name;
                            this.provider_email = res_data.provider.email;
                            this.provider_phone = res_data.provider.phone;
                            this.check_provider_country(this.map);
                            this.provider_location_track();
                        }
                    });

                });
            }, 1000);

        });
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    get_city_list(countryid) {
        this.helper.http.post('/api/admin/get_city_list', {country_id: countryid}).map((res: Response) => res.json()).subscribe(res_data => {

            this.city_list = res_data.cities;
        });
        setTimeout(function () {
            jQuery("#city").trigger("chosen:updated");
        }, 1000);
    }


    get_provider_list(cityid) {
        this.helper.http.post('/admin/get_provider_list_for_city', {city_id: cityid}).map((res: Response) => res.json()).subscribe(res_data => {
            this.provider_list = res_data.providers;
        });
        setTimeout(function () {
            jQuery("#provider").trigger("chosen:updated");
        }, 1000);
    }

    get_order_list(cityid) {
        this.helper.http.post('/admin/order_list_location_track', {city_id: cityid}).map((res: Response) => res.json()).subscribe(res_data => {
            if(res_data.success){
                this.order_list = res_data.orders;
            } else {
                this.order_list = [];
            }
        });
        setTimeout(function () {
            jQuery("#order").trigger("chosen:updated");
        }, 1000);
    }

    check_provider_country(map) {
        this.check_provider_status(this.provider, map);

    }
    check_provider_status(provider, map) {
        var icon_url = '/map_pin_images/Deliveryman/';
        if (this.type == 1) {

            if (provider.is_online) {
                this.create_marker(provider, icon_url + 'deliveryman_online_with_orders.png', map);

            } else {

                this.create_marker(provider, icon_url + 'deliveryman_offline_with_orders.png', map);

            }

        } else if (this.type == 0) {

            
            if (provider.is_online) {
                this.create_marker(provider, icon_url + 'deliveryman_online.png', map);

            }
            else {
                this.create_marker(provider, icon_url + 'deliveryman_offline.png', map);

            }

        }
    }

    create_marker(provider, icon_url, map) {
        
        var marker = new google.maps.Marker({
            position: {lat: provider.location[0], lng: provider.location[1]},
            map: this.map,
            icon: icon_url
        });

        this.provider_markers_order = marker;

        var contentString =
            '<p><b>Name</b>: ' + provider.first_name + ' ' + provider.last_name +
            '<br><b>Email</b>: ' + provider.email +
            '<br><b>Rating</b>: ' + provider.user_rate +
            '</p>';

        var message = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 320
        });
        google.maps.event.addListener(marker, 'click', function (e) {
            message.open(map, marker);
            setTimeout(function () {message.close();}, 5000);
        });
    }

//    create_order_marker(provider, icon_url, map) {
//        this.provider_markers_order = "";
//
//        var marker = new google.maps.Marker({
//            position: {lat: provider.location[0], lng: provider.location[1]},
//            map: map,
//            icon: icon_url
//        });
//        this.provider_markers_order = marker;
//
//        console.log("create_order_marker set this.provider_markers_order" + this.provider_markers_order);
//
//
//        var contentString =
//            '<p><b>Name</b>: ' + provider.first_name + ' ' + provider.last_name +
//            '<br><b>Email</b>: ' + provider.email +
//            '<br><b>Rating</b>: ' + provider.user_rate +
//            '</p>';
//
//        var message = new google.maps.InfoWindow({
//            content: contentString,
//            maxWidth: 320
//        });
//        google.maps.event.addListener(marker, 'click', function (e) {
//
//            message.open(map, marker);
//            setTimeout(function () {message.close();}, 5000);
//        });
//    }


    provider_location_track() {

        var lat;
        var lng;
        // this.interval = setInterval(() => {
            this.helper.http.post('/admin/deliveryman_track', {id: this.id, type: this.type}).map((res: Response) => res.json()).subscribe(res_data => {

                if (res_data.success == false) {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                }
                else {

                    this.i = 0;
                    this.new_lat_lng = res_data.provider.location;
                    this.provider_name = res_data.provider.first_name + ' ' + res_data.provider.last_name;
                    this.provider_email = res_data.provider.email;
                    this.provider_phone = res_data.provider.phone;
                    this.latitude = JSON.parse(JSON.stringify(this.old_lat_lng[0]));
                    this.longitude = JSON.parse(JSON.stringify(this.old_lat_lng[1]));

                    if (this.new_lat_lng[0] == this.old_lat_lng[0] && this.new_lat_lng[1] == this.old_lat_lng[1]) {
                        lat = 0;
                        lng = 0;
                        this.moveMarker(lat, lng);
                    }
                    else {
                        lat = (this.new_lat_lng[0] - this.old_lat_lng[0]) / this.numDeltas;
                        lng = (this.new_lat_lng[1] - this.old_lat_lng[1]) / this.numDeltas;
                        this.moveMarker(lat, lng);
                        this.old_lat_lng = JSON.parse(JSON.stringify(this.new_lat_lng));
                    }
                }
            });
        // }, 10000);
    }

    setCurrentPosition() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                this.zoom = 12;
                this.old_lat_lng = [this.latitude, this.longitude];
            });
        }
    }

    moveMarker(lat, lng) {
        if (this.i !== this.numDeltas) {
            this.i++;
            this.latitude += lat;
            this.longitude += lng;
            var latlng = new google.maps.LatLng(this.latitude, this.longitude);
            this.provider_markers_order.setPosition(latlng);
            this.map.panTo(latlng);
            setTimeout(() => {
                this.moveMarker(lat, lng)
            }, 100);
        } else {
            this.provider_location_track();
        }
    }
}