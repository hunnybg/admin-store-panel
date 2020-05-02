import {Component, OnInit} from '@angular/core';

import {Helper} from "../../helper";
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

declare var google: any;
declare var jQuery: any;

@Component({
    selector: 'app-all-city',
    templateUrl: './all-city.component.html',
    providers: [Helper]
})
export class AllCityComponent implements OnInit {

    constructor(private helper: Helper) {}
    map: any = '';
    drawingManager: any;
    city_list: any[] = [];
    filtered_city_list: any = [];
    country_list: any[] = [];
    selected_country: string = "All";
    title: any;
    button: any;
    heading_title: any;
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
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            streetViewControl: false,
            center: {lat: 22, lng: 70}
        });

        navigator.geolocation.getCurrentPosition((position) => {
            this.map.setCenter({lat: position.coords.latitude, lng: position.coords.longitude});
        });

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

        this.helper.http.post('/admin/get_all_city_list', {}).map((res_data: Response) => res_data.json()).subscribe(res_data => {
            this.city_list = res_data.city_list;
            this.city_list.forEach((city) => {
                if (city.is_use_radius) {
                    var color = '#FF0000';
                    if(city.is_business){
                        color = 'blue'
                    }
                    var cityCircle = new google.maps.Circle({
                        strokeColor: color,
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: color,
                        fillOpacity: 0.35,
                        map: this.map,
                        center: {lat: city.city_lat_long[0], lng: city.city_lat_long[1]},
                        radius: city.city_radius * 1000
                    });
                    google.maps.event.addListener(cityCircle, 'click', (event) => {
                        this.helper.router_id.admin.city_id = city._id;
                        this.helper.router.navigate(['admin/city/edit']);
                    });

                } else {
                    var color = '#FF0000';
                    if(city.is_business){
                        color = 'black'
                    }
                    let city_location = city.city_locations;
                    let array = [];
                    city_location.forEach((location) => {
                        array.push({lat: Number(location[1]), lng: Number(location[0])})
                    });
                    let polygon = new google.maps.Polygon({
                        map: this.map,
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
                    google.maps.event.addListener(polygon, 'click', (event) => {
                        this.helper.router_id.admin.city_id = city._id;
                        this.helper.router.navigate(['admin/city/edit']);
                    });
                }

            });
        });
    }


}
