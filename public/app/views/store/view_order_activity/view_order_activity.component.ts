import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../store_helper";

@Component({
    selector: 'app-view_order_activity',
    templateUrl: './view_order_activity.component.html',
    providers: [Helper]
})
export class StoreViewOrderActivityComponent implements OnInit {

    order_id:Object;
    currency_sign:any;
    public status:any;
    title:any;
    heading_title:any;
    ORDER_STATE:any;
    ORDER_STATUS_ID:any;
    order_status:number;
    order_status_id:number;
    created_at:any;
    store_accepted_at:any;
    start_preparing_order_at:any;
    order_ready_at:any;
    store_order_created_at:any;
    accepted_at:any;
    cancelled_at:any;
    start_for_pickup_at:any;
    arrived_on_store_at:any;
    picked_order_at:any;
    start_for_delivery_at:any;
    delivered_at:any;
    completed_at:any;

    constructor(public helper: Helper){
    }

    ngOnInit() {
        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {
            this.helper.router.navigate(['store/login']);
        }
        this.order_id = this.helper.router_id.store.order_id;
        this.status=status;
        this.title=this.helper.title;
        this.heading_title=this.helper.heading_title;
        this.ORDER_STATE=this.helper.ORDER_STATE;
        this.ORDER_STATUS_ID=this.helper.ORDER_STATUS_ID;
        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.helper.http.post('/api/store/get_order_data',{order_id:this.order_id,store_id:store._id, server_token:store.server_token}).map((res_data: Response) => res_data.json()) .subscribe(res_data => {

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
                    this.order_status=res_data.order.order_status
                    this.order_status_id=res_data.order.order_status_id

                    this.created_at=res_data.order.created_at
                    this.store_accepted_at=res_data.order.store_accepted_at
                    this.start_preparing_order_at=res_data.order.start_preparing_order_at
                    this.order_ready_at=res_data.order.order_ready_at
                    this.store_order_created_at=res_data.order.store_order_created_at
                    this.accepted_at=res_data.order.accepted_at
                    this.cancelled_at=res_data.order.cancelled_at
                    this.start_for_pickup_at=res_data.order.start_for_pickup_at
                    this.arrived_on_store_at=res_data.order.arrived_on_store_at
                    this.picked_order_at=res_data.order.picked_order_at
                    this.start_for_delivery_at=res_data.order.start_for_delivery_at
                    this.delivered_at=res_data.order.delivered_at
                    this.completed_at=res_data.order.completed_at
                }
            });
        }
    }

}
