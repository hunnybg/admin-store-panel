import { Component, OnInit, ElementRef, NgZone, ViewChild  } from '@angular/core';
import { MapsAPILoader } from 'angular2-google-maps/core';
import {Helper} from "../../store_helper";
import {Response } from '@angular/http';

@Component({
    selector: 'app-track_delivery_man',
    styles: [`
      .sebm-google-map-container {
        height: 600px;
        width:100%;
      }
    `],
    templateUrl: './track_delivery_man.component.html',
    providers: [Helper]
})
export class StoreTrackDeliveryManComponent implements OnInit {


    public latitude: number;
    public longitude: number;
    public zoom: number;
    public store_id: Object;
    public request_id: Object;
    public server_token: string;
    public numDeltas : number;
    public delay : number; //milliseconds
    public i : number;
    old_lat_lng: any[];
    new_lat_lng: any[];
    interval:any;
    provider_name : string = '';
    provider_email : string = '';
    provider_phone : string = '';
    icon: string = '';
    title:any;
    message:any;
    heading_title:any;
    button:any;
    myLoading:boolean = true;

    constructor(private mapsAPILoader: MapsAPILoader, private helper:Helper)
    {

    }

    ngOnInit() {
        let token = this.helper.tokenService.getToken();
        if(!token || !token.token) {
            this.helper.router.navigate(['store/login']);
        }
        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.store_id=store._id
            this.server_token=store.server_token
        }
        this.request_id = this.helper.router_id.store.order_id
        this.zoom = 4;
        this.numDeltas=100;
        this.delay=100;
        this.icon="map_pin/destination.png";

        this.title=this.helper.title;
        this.message=this.helper.message;
        this.heading_title=this.helper.heading_title
        this.button=this.helper.button

        if(this.request_id !== "")
        {
          this.helper.http.post(this.helper.POST_METHOD.PROVIDER_LOCATION_TRACK,{request_id:this.request_id,store_id:this.store_id, server_token:this.server_token}).map((res_data: Response) => res_data.json()) .subscribe(res_data => {
            this.myLoading=false;
            if(res_data.success == false)
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.router.navigate(['store/deliveries']);
            }
            else
            {
              this.latitude = res_data.provider.location[0];
              this.longitude = res_data.provider.location[1];
              this.zoom = 12;
              this.old_lat_lng=[this.latitude,this.longitude ];
              this.provider_name=res_data.provider.first_name + ' ' +res_data.provider.last_name;
              this.provider_email=res_data.provider.email;
              this.provider_phone=res_data.provider.phone;
              this.mapsAPILoader.load().then(() => {  });

              this.provider_location()
            }
          },
          (error: any) => {
            this.myLoading=false;
                  this.helper.http_status(error)
          });

        }
        else{
          
            this.helper.router.navigate(['store/deliveries']);
        }

    }
    ngOnDestroy() {
        clearInterval(this.interval);
    }

    provider_location()
        {
          var lat;
          var lng;
          this.interval=setInterval(() => {


              this.helper.http.post(this.helper.POST_METHOD.PROVIDER_LOCATION_TRACK,{request_id:this.request_id,store_id:this.store_id, server_token:this.server_token}).map((res_data: Response) => res_data.json()) .subscribe(res_data => {

                if(res_data.success == false)
                {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['store/order']);
                }
                else
                {
                      this.i=0;
                      this.new_lat_lng=res_data.provider.location;
                      this.provider_name=res_data.provider.first_name + ' ' +res_data.provider.last_name;
                      this.provider_email=res_data.provider.email;
                      this.provider_phone=res_data.provider.phone;

                      if(this.new_lat_lng[0] == this.old_lat_lng[0] && this.new_lat_lng[1] == this.old_lat_lng[1])
                      {
                          lat=0;
                          lng=0;
                          this.moveMarker(lat, lng);
                      }
                      else
                      {
                        lat = (this.new_lat_lng[0] - this.old_lat_lng[0])/ this.numDeltas;
                        lng = (this.new_lat_lng[1] - this.old_lat_lng[1])/ this.numDeltas;
                      
                        this.moveMarker(lat, lng);
                      }
                }
              },
              (error: any) => {
                      this.helper.http_status(error)
              });
          },10000);
      }
    setCurrentPosition() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
                this.zoom = 12;
                this.old_lat_lng=[this.latitude,this.longitude];
            });
        }
    }
    moveMarker(lat, lng){

        if(this.i!==this.numDeltas){
            this.i++;

            this.latitude += lat;
            this.longitude += lng;

            setTimeout(()=> {
                this.moveMarker(lat,lng)
            }, 100);
        }
        else{
          this.old_lat_lng = this.new_lat_lng;
        }
    }


}
