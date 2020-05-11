import {Component, OnInit} from '@angular/core';

import {Helper} from "../../helper";
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

declare var google: any;
declare var jQuery: any;

@Component({
    selector: 'app-provider_map',
    templateUrl: './provider_map.component.html',
    providers: [Helper]
})
export class ProviderMapComponent implements OnInit {

    provider_markers: any[] = [];
    provider_list: any[] = [];
    country_list: any[] = [];
    selected_country: string = "All";
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
    }

    ngOnInit() {
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        var directionsDisplay = new google.maps.DirectionsRenderer;

        navigator.geolocation.getCurrentPosition((position) => {
            this.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 7,
                streetViewControl: false,
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



            this.helper.http.get('api/admin/get_country_list').pipe(map((res: Response) => res.json())).subscribe(res_data => {

                if (res_data.success) {
                    this.country_list = res_data.countries;
                    setTimeout(function () {
                        jQuery(".chosen-select").trigger("chosen:updated");
                    }, 1000);
                    this.helper.http.post('/admin/provider_list_for_map', {}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

                        if (res_data.success) {
                            this.provider_list = res_data.providers;
                            this.check_provider_country(this.map)
                        }
                        else {
                            this.provider_list = [];
                        }

                    });
                }
                else {
                    this.country_list = [];
                }

            });



            jQuery(this.helper.elementRef.nativeElement).find('#selected_country').on('change', (evnt, res_data) => {

                this.selected_country = res_data.selected;
                this.check_provider_country(this.map)


            });

            jQuery(this.helper.elementRef.nativeElement).find('#type').on('change', (evnt, res_data) => {

                this.type = res_data.selected;
                this.check_provider_country(this.map)

            });
        });
    }

    check_provider_country(map) {
        this.myLoading = true;
        this.provider_markers.forEach(function (marker) {
            marker.setMap(null);
        });
        this.provider_markers = [];
        this.provider_list.forEach((provider_data, index) => {
            if (this.selected_country == 'All' || this.selected_country == provider_data.country_id) {
                this.check_provider_status(provider_data, map);
            }

            if (index == this.provider_list.length - 1) {
                this.myLoading = false;
            }
        });
    }

    check_provider_status(provider_data, map) {
        var icon_url = '/map_pin_images/Deliveryman/';
        if ((provider_data.is_online) && (this.type == "All" || this.type == "online" || this.type == "onlinewithorder")) {
            if ((provider_data.current_request && provider_data.current_request.length > 0) && (this.type == "All" || this.type == "onlinewithorder")) {
                this.create_marker(provider_data, icon_url + 'deliveryman_online_with_orders.png', map)
            }
            else if ((this.type == "All" || this.type == "online")) {
                this.create_marker(provider_data, icon_url + 'deliveryman_online.png', map)
            }
        }
        else if ((!provider_data.is_online) && (this.type == "All" || this.type == "offline" || this.type == "offlinewithorder")) {
            if ((provider_data.current_request && provider_data.current_request.length > 0) && (this.type == "All" || this.type == "offlinewithorder")) {
                this.create_marker(provider_data, icon_url + 'deliveryman_offline_with_orders.png', map)
            }
            else if ((this.type == "All" || this.type == "offline")) {
                this.create_marker(provider_data, icon_url + 'deliveryman_offline.png', map)
            }
        }
    }

    create_marker(provider_data, icon_url, map) {

        if (provider_data.location != undefined) {
            var marker = new google.maps.Marker({
                position: {lat: provider_data.location[0], lng: provider_data.location[1]},
                map: map,
                icon: icon_url
            });
            this.provider_markers.push(marker);
            var contentString =
                '<p><b>Name</b>: ' + provider_data.first_name + ' ' + provider_data.last_name +
                '<br><b>Email</b>: ' + provider_data.email +
                '<br><b>Rating</b>: ' + provider_data.user_rate +
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
    }
}
