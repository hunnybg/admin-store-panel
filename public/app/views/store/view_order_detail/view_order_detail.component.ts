import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../store_helper";
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-view_order_detail',
    templateUrl: './view_order_detail.component.html',
    providers: [Helper]
})
export class StoreViewOrderDetailComponent implements OnInit {

    order_id:Object;
    order_detail:any[];
    currency_sign:any;
    order_total:number;
    product_item_total:number;
    product_item_total_array:number[];
    product_item_specification_total:number;
    product_item_specification_total_array:number[];
    product_specification_total_array:any[];
    total_item:number;
    constructor(public helper: Helper){


    }

    ngOnInit() {
        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {
            this.helper.router.navigate(['store/login']);
        }
        this.order_id = this.helper.router_id.store.order_id;
        this.order_total=0;
        this.total_item=0;
        this.product_item_total=0;
        this.product_item_total_array=[];
        this.product_item_specification_total=0;
        this.product_item_specification_total_array=[];
        this.product_specification_total_array=[];
        var store = JSON.parse(localStorage.getItem('store'));
        
        if(store!==null)
        {
            this.helper.http.post('/api/store/get_order_data',{order_id:this.order_id,store_id:store._id, server_token:store.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {


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
                    this.order_detail=res_data.order.order_details
                    this.currency_sign=res_data.currency

                    res_data.order.order_details.forEach((product)=>{
                        product.items.forEach((item) =>{
                            this.order_total=this.order_total + (item.item_price + item.total_specification_price)*item.quantity
                            this.product_item_total=this.product_item_total + (item.item_price + item.total_specification_price)*item.quantity
                            this.total_item= this.total_item+1;
                            item.specifications.forEach((specification)=>{
                                this.product_item_specification_total= this.product_item_specification_total + specification.specification_price;
                            })
                            this.product_item_specification_total_array.push(this.product_item_specification_total)
                            this.product_item_specification_total=0;
                        })
                        this.product_specification_total_array.push(this.product_item_specification_total_array)
                        this.product_item_specification_total_array=[];
                        this.product_item_total_array.push(this.product_item_total)
                        this.product_item_total=0;
                    })
                }
            });
        }
    }
}
