import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Helper} from "../../helper";
import {Http, Response} from '@angular/http';
declare var google: any;
declare var jQuery: any;

@Component({
    selector: 'app-city',
    templateUrl: './city.component.html',
    providers: [Helper]
})
export class cityComponent implements OnInit {
    
    country_list: any[];
    filtered_country_list: any[] = [];
    title: any;
    button: any;
    heading_title: any;
    public message: string = "";
    public class: string;
    selected_country: string;
    filter_country_name: String = "";
    myLoading: boolean = true;

    is_view_map: boolean = false;
    map: any = '';
    drawingManager: any;
    city_polygon: any[] = [];

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {
        jQuery(".chosen-select").chosen();
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }

    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    ngOnInit() {

        jQuery(document).ready(function () {
            function edit_city(city_id) {
                console.log(city_id)
            }
        })

        this.helper.message();

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.selected_country = this.title.all

        jQuery(this.helper.elementRef.nativeElement).find('#selected_country').on('change', (evnt, res_data) => {

            this.selected_country = res_data.selected;
            let index = this.country_list.findIndex((country)=>country._id == this.selected_country);
            if(index==-1){
                this.filtered_country_list = JSON.parse(JSON.stringify(this.country_list));
            } else {
                this.filtered_country_list = [this.country_list[index]];
            }
            this.draw_polygon(this.filtered_country_list)
        });

        var directionsDisplay = new google.maps.DirectionsRenderer;
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            streetViewControl: false,
            center: {lat: 0, lng: 0}
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

        this.helper.http.post('/admin/city_list_search_sort', {}).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            console.log(res_data)
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }

                this.country_list = [];
                this.filtered_country_list = [];

            }
            else {

                this.country_list = res_data.countries;
                this.filtered_country_list = res_data.countries;
                this.draw_polygon(this.country_list);

            }

        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        })
    }


    filter_country(data) {
        data = data.replace(/^\s+|\s+$/g, '');
        data = data.replace(/ +(?= )/g, '');
        data = new RegExp(data, "gi");

        var country_array = [];
        this.country_list.forEach((country) => {

            var city_array = country.cities.filter((city_data) => {
                var a = city_data.city_name.match(data);
                return a !== null;
            })
            if (city_array.length > 0) {
                country_array.push({
                    _id: country._id, country_name: country.country_name, cities: city_array
                })
            }
        });
        this.filtered_country_list = country_array;
    }

    draw_polygon(country_list){
        var infoWindow = null;
        this.city_polygon.forEach((polygon)=>{
            polygon.setMap(null);
        });
        this.city_polygon = [];
        country_list.forEach((country_data) => {
            country_data.cities.forEach((city)=> {
                if (city.is_use_radius) {
                    var color = '#FF0000';
                    if(city.is_business){
                        color = 'black'
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
                    this.city_polygon.push(cityCircle)
                    google.maps.event.addListener(cityCircle, 'click', (event) => {

                        if (infoWindow) {
                            infoWindow.close();
                        }

                        var contentString =
                            '<p onclick="edit_city(city._id)">' + city.city_name + '</p>';

                        var infoWindow = new google.maps.InfoWindow({
                            content: contentString,
                            maxWidth: 320
                        });
                        infoWindow.setPosition(event.latLng);
                        infoWindow.open(this.map, cityCircle);

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
                    this.city_polygon.push(polygon)
                    google.maps.event.addListener(polygon, 'click', (event) => {

                        if (infoWindow) {
                            infoWindow.close();
                        }

                        var contentString =
                            '<p onclick="edit_city(city._id)">' + city.city_name + '</p>';

                        var infoWindow = new google.maps.InfoWindow({
                            content: contentString,
                            maxWidth: 320
                        });

                        infoWindow.setPosition(event.latLng);
                        infoWindow.open(this.map, cityCircle);


                    });
                }
            });
        });
    }

    edit_city(city_id){
        console.log(city_id)
        this.helper.router_id.admin.city_id = city_id;
        this.helper.router.navigate(['admin/city/edit']);
    }
    is_business_change(id, event) {
        this.helper.http.post('/admin/toggle_change', {city_id: id, is_business: event}).map((res: Response) => res.json()).subscribe(res_data => {

            if (res_data.success == false) {

            }
        });

    }

    is_cash_payment_mode_change(id, event) {
        this.helper.http.post('/admin/toggle_change', {city_id: id, is_cash_payment_mode: event}).map((res: Response) => res.json()).subscribe(res_data => {

            if (res_data.success == false) {

            }
        });

    }

    is_other_payment_mode_change(id, event) {
        this.helper.http.post('/admin/toggle_change', {city_id: id, is_other_payment_mode: event}).map((res: Response) => res.json()).subscribe(res_data => {

            if (res_data.success == false) {

            }
        });

    }
    editCity(id) {
        this.helper.router_id.admin.city_id = id;
        this.helper.router.navigate(['admin/city/edit']);
    }


}
