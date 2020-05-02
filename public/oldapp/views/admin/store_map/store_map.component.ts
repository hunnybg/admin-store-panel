import {Component, OnInit} from '@angular/core';

import {Helper} from "../../helper";
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

declare var google: any;
declare var jQuery: any;

@Component({
    selector: 'app-store_map',
    templateUrl: './store_map.component.html',
    providers: [Helper]
})
export class StoreMapComponent implements OnInit {

    store_markers: any[] = [];
    store_list: any[] = [];
    filtered_store_list: any = [];
    country_list: any[] = [];
    delivery_list: any[] = [];
    selected_country: string = "All";
    selected_delivery: string = "All";
    type: string = "All";
    map: any = '';
    title: any;
    button: any;
    heading_title: any;
    myLoading: boolean = true;

    constructor(public helper: Helper) {

    }
    ngAfterViewInit() {
        jQuery(".chosen-select").chosen({disable_search: true});

        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);


    }

    ngOnInit() {
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;

        var directionsDisplay = new google.maps.DirectionsRenderer;
        navigator.geolocation.getCurrentPosition((position) => {
            this.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 7,
                center: {lat: position.coords.latitude, lng: position.coords.longitude}
            });
            directionsDisplay.setMap(this.map);

            var input = document.getElementById('search');
            var searchBox = new google.maps.places.SearchBox(input);
            this.map.addListener('bounds_changed', () => {
                searchBox.setBounds(this.map.getBounds());
            });
            searchBox.addListener('places_changed', () => {
                var places = searchBox.getPlaces();
                var bounds = new google.maps.LatLngBounds();
                places.forEach(function (place) {
                    if (place.geometry.viewport) {
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });
                this.map.fitBounds(bounds);
            });



            this.helper.http.get('api/admin/get_country_list').map((res: Response) => res.json()).subscribe(res_data => {

                if (res_data.success) {
                    this.country_list = res_data.countries;
                }
                else {
                    this.country_list = [];
                }

            });
            setTimeout(function () {
                jQuery("#selected_country").trigger("chosen:updated");
            }, 1000);

            this.helper.http.get('admin/delivery_list').map((res: Response) => res.json()).subscribe(res_data => {

                if (res_data.success) {
                    this.delivery_list = res_data.deliveries;
                }
                else {
                    this.delivery_list = [];
                }

            });
            setTimeout(function () {
                jQuery("#selected_delivery").trigger("chosen:updated");
            }, 1000);


            this.helper.http.post('/admin/store_list_for_map', {}).map((res: Response) => res.json()).subscribe(res_data => {


                if (res_data.success) {
                    this.store_list = res_data.stores;
                    this.check_open(res_data.server_time);
                }
                else {
                    this.store_list = [];
                }

            });

            jQuery(this.helper.elementRef.nativeElement).find('#selected_country').on('change', (evnt, res_data) => {

                this.selected_country = res_data.selected;
                this.check_country()


            });
            
            jQuery(this.helper.elementRef.nativeElement).find('#selected_delivery').on('change', (evnt, res_data) => {

                this.selected_delivery = res_data.selected;
                this.check_delivery()


            });

            jQuery(this.helper.elementRef.nativeElement).find('#type').on('change', (evnt, res_data) => {

                this.type = res_data.selected;
                this.check_country();
                this.check_delivery();

            });
        });
    }

    check_country() {
        this.filtered_store_list = this.store_list.filter((store_data) => {
            return (this.selected_country == 'All' || this.selected_country == store_data.country_id );
        });
        this.check_provider_status()
    }
    
    check_delivery() {
        this.filtered_store_list = this.store_list.filter((store_data) => {
            return (this.selected_delivery == 'All' || this.selected_delivery == store_data.store_delivery_id);
            
        });
        this.check_provider_status()
    }

    check_open(server_date) {
        this.store_list.forEach((store) => {
            let date: any = server_date;
            date = new Date(date).toLocaleString("en-US", {timeZone: store.city_detail.timezone})
            date = new Date(date);
            let weekday = date.getDay();
            let current_time = date.getTime();
            store.close = true;
            let week_index = store.store_time.findIndex((x) => x.day == weekday)
            if(week_index !== -1) {
                let day_time = store.store_time[week_index].day_time;
                if (store.store_time[week_index].is_store_open_full_time) {
                    store.close = false;
                }
                else {
                    if (store.store_time[week_index].is_store_open) {
                        if (day_time.length == 0) {
                            store.close = true;
                        } else {
                            day_time.forEach((store_time, index) => {
                                let open_time = store_time.store_open_time;
                                open_time = open_time.split(':')
                                let open_date_time = date.setHours(open_time[0], open_time[1], 0, 0)
                                open_date_time = new Date(open_date_time);
                                open_date_time = open_date_time.getTime();

                                let close_time = store_time.store_close_time;
                                close_time = close_time.split(':')
                                let close_date_time = date.setHours(close_time[0], close_time[1], 0, 0)
                                close_date_time = new Date(close_date_time);
                                close_date_time = close_date_time.getTime();

                                if (current_time > open_date_time && current_time < close_date_time) {
                                    store.close = false;
                                }

                            });
                        }
                    } else {
                        store.close = true;
                    }
                }
            }
        });
        this.filtered_store_list = JSON.parse(JSON.stringify(this.store_list));
        this.create_marker(this.filtered_store_list)
    }

    check_provider_status() {
        if (this.type == "open") {
            let store_list = this.filtered_store_list.filter((store) => {
                return store.close == false;
            });
            this.create_marker(store_list);
        }
        else if (this.type == "close") {
            let store_list = this.filtered_store_list.filter((store) => {
                return store.close == true;
            });
            this.create_marker(store_list);
        }
        else if (this.type == "businessoff") {
            let store_list = this.filtered_store_list.filter((store) => {
                return store.is_business == false;
            });
            this.create_marker(store_list);
        }
        else {
            this.create_marker(this.filtered_store_list);
        }
    }

    create_marker(store_list) {
        this.store_markers.forEach(function (marker) {
            marker.setMap(null);
        });
        this.store_markers = [];
        store_list.forEach((store_data, index) => {
            let icon_url = '/map_pin_images/Store/';
            if (!store_data.is_business) {
                icon_url = icon_url + 'store_business_off.png';
            }
            else if (store_data.close) {
                icon_url = icon_url + 'store_close.png';
            } else if (!store_data.close) {
                icon_url = icon_url + 'store_open.png';
            }

            let marker = new google.maps.Marker({
                position: {lat: store_data.location[0], lng: store_data.location[1]},
                map: this.map,
                icon: icon_url
            });
            this.store_markers.push(marker);
            var contentString =
                '<p><b>Name</b>: ' + store_data.name +
                '<br><b>Rating</b>: ' + store_data.user_rate +
                '</p>';

            var message = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 320
            });

            google.maps.event.addListener(marker, 'click', function (e) {

                message.open(this.map, marker);
                setTimeout(function () {message.close();}, 5000);
            });

            if (index == store_list.length - 1) {
                this.myLoading = false;
            }
        });
    }
}
