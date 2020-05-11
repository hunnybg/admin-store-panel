import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { map } from 'rxjs/operators';
import {Helper} from "../../helper";
declare var jQuery: any;

export interface UpdatePaymentGateway {
    name: String,
    description: String,
    payment_key_id: String,
    payment_key: String,
    payment_key1: String,
    payment_key2: String,
    payment_key3: String,
    is_using_card_details: Boolean,
    is_payment_by_web_url: Boolean,
    is_payment_by_login: Boolean,
    is_payment_visible: Boolean
}

@Component({
    selector: 'app-payment_gateway',
    templateUrl: './payment_gateway.component.html',
    providers: [Helper]

})
export class PaymentGatewayComponent implements OnInit {

    private update_payment_gateway: UpdatePaymentGateway;
    title: any;
    button: any;
    heading_title: any;
    payment_gateway_id: Object;
    payment_gateway_list: any[];
    error: any;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);

    }

    ngAfterViewInit() {


        jQuery("#payment_gateway").chosen();
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");

            jQuery('input').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
        }, 1000);
    }
    ngOnDestroy() {
        this.helper.router_id.admin.payment_gateway_id = "";
    }

    ngOnInit() {
        this.update_payment_gateway = {

            name: "",
            description: "",
            payment_key_id: "",
            payment_key: "",
            payment_key1: "",
            payment_key2: "",
            payment_key3: "",
            is_using_card_details: true,
            is_payment_by_web_url: true,
            is_payment_by_login: true,
            is_payment_visible: true

        }
        this.payment_gateway_id = this.helper.router_id.admin.payment_gateway_id;
        this.helper.http.get('/admin/payment_gateway_list').pipe(map((res: Response) => res.json())).subscribe(res => {
            this.payment_gateway_list = res.payment_gateway;
            console.log(this.payment_gateway_list);

        });
       
        jQuery(this.helper.elementRef.nativeElement).find('#payment_gateway').on('change', (evnt, res_data) => {

            this.update_payment_gateway.name = res_data.selected;
            this.payment_gateway_id = res_data.selected;
           
            this.helper.http.post('/admin/get_payment_gateway_detail', {payment_gateway_id: res_data.selected}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message();
                    
                    console.log(res_data);

                    this.helper.router.navigate(['admin/payment_gateway']);

                }
                else {


                    this.update_payment_gateway.name = res_data.payment_gateway_detail.name;
                    this.update_payment_gateway.description = res_data.payment_gateway_detail.description;
                    this.update_payment_gateway.payment_key_id = res_data.payment_gateway_detail.payment_key_id;

                    this.update_payment_gateway.payment_key = res_data.payment_gateway_detail.payment_key;
                    this.update_payment_gateway.payment_key1 = res_data.payment_gateway_detail.payment_key1;
                    this.update_payment_gateway.payment_key2 = res_data.payment_gateway_detail.payment_key2;

                    this.update_payment_gateway.payment_key3 = res_data.payment_gateway_detail.payment_key3;
                    this.update_payment_gateway.is_using_card_details = res_data.payment_gateway_detail.is_using_card_details;
                    this.update_payment_gateway.is_payment_by_web_url = res_data.payment_gateway_detail.is_payment_by_web_url;

                    this.update_payment_gateway.is_payment_by_login = res_data.payment_gateway_detail.is_payment_by_login;
                    this.update_payment_gateway.is_payment_visible = res_data.payment_gateway_detail.is_payment_visible;

                }
            });

        });


        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }
    
     UpdatePaymentGateway(payment_gateway_data) {
        this.helper.http.post('/admin/update_payment_gateway', payment_gateway_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message();
                this.helper.router.navigate(['admin/payment_gateway']);
            }
            else {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
                this.helper.router.navigate(['admin/payment_gateway']);

            }
        });
    }

}
