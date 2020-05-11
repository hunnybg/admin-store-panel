import {Component, OnInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
import { map } from 'rxjs/operators';


@Component({
    selector: 'app-view_invoice',
    templateUrl: './view_invoice.component.html',
    providers: [Helper]
})
export class ViewInvoiceComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    order_id: Object;
    order_detail: any[];
    orders: any[];
    item_name: String;
    destination_address: String;
    source_address: String;
    completed_at: null;
    total: number;
    unique_id: number;
    invoice_number:String;
    currency_sign: String;
    total_order_price: number;
    total_delivery_price: number;
    total_store_tax_price: number;

    constructor(public helper: Helper) {
    }

    ngOnInit() {

        this.order_id = this.helper.router_id.admin.invoice_order_id;
        this.item_name = "";


        this.helper.http.post('/admin/get_order_detail', {order_id: this.order_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
           
            if (res_data.success == false) {

                this.helper.router.navigate(['admin/provider/view_history']);

            }
            else {



                this.destination_address = res_data.orders.destination_address
                this.unique_id = res_data.orders.unique_id
                
                this.invoice_number = res_data.orders.invoice_number

                this.total_order_price = res_data.orders.order_payment_details.total_order_price
                this.total_delivery_price = res_data.orders.order_payment_details.total_delivery_price
                this.total_store_tax_price = res_data.orders.order_payment_details.total_store_tax_price


                this.source_address = res_data.orders.source_address
                this.completed_at = res_data.orders.completed_at
                this.total = res_data.orders.order_payment_details.total
                this.order_detail = res_data.orders.order_details
                this.currency_sign = res_data.orders.currency

                res_data.orders.order_details.forEach((product) => {
                    product.items.forEach((item) => {

                        // this.product_item_total=this.product_item_total + (item.item_price + item.total_specification_price)*item.quantity
                        this.item_name = item.item_name;



                    })
                    // this.product_specification_total_array.push(this.product_item_specification_total_array)
                    // this.product_item_specification_total_array=[];
                    // this.product_item_total_array.push(this.product_item_total)
                    //this.product_item_total=0;
                })



            }

        });
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }

}
