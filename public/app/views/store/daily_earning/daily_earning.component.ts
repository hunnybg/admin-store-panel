import { Component, OnInit , ViewContainerRef } from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery:any;

export interface StoreAnalyticDaily
{
    accepted:number,
    acception_ratio:number,
    cancellation_ratio:number,
    cancelled:number,
    completed:number,
    completed_ratio:number,
    received:number,
    rejected:number,
    rejection_ratio:number,
    total_items:number

}

export interface OrderTotal
{
    pay_to_store:number,
    store_have_order_payment:number,
    store_have_service_payment:number,
    total_admin_profit_on_store:number,
    total_earning:number,
    total_item_price:number,
    total_order_price:number,
    total_store_income:number,
    total_store_tax_price:number,
    total_wallet_income_set: number,
    total_wallet_income_set_in_cash_order: number,
    total_wallet_income_set_in_other_order: number
}

@Component({
    selector: 'app-daily_earning',
    templateUrl: './daily_earning.component.html',
    providers: [Helper]
})
export class StoreDailyEarningComponent implements OnInit {

    private order_total: OrderTotal;
    private store_analytic_daily: StoreAnalyticDaily;

    title:any;
    button:any;
    ORDER_STATE:any;
    heading_title:any;
    store_id:Object;
    server_token:String;
    order_payments:any[];
    search_field:string;
    search_value:string;
    start_date:Object;
    show:Boolean;

    myLoading:Boolean = true;

    constructor(private helper:Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {

        jQuery(".chosen-select").chosen();
        setTimeout(function() {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }

    ngOnDestroy()
    {
        this.helper.router_id.store.daily_earning_date="";
    }

    ngOnInit() {
        this.search_field="user_detail.first_name";
        this.search_value="";
        this.show=true;

        var daily_date=this.helper.router_id.store.daily_earning_date;

        if(daily_date=="")
        {
            var date = new Date(Date.now());
            this.start_date = { date: { year: date.getFullYear(), month: date.getMonth()+1, day: date.getDate() }  ,
                formatted:date.getMonth()+1 + '-' +  date.getDate() + '-' + date.getFullYear()  };
        }
        else{
            var date = new Date(daily_date)
            this.start_date = { date: { year: date.getFullYear(), month: date.getMonth()+1, day: date.getDate()  },
                formatted:date.getMonth()+1 + '-' +  date.getDate() + '-' + date.getFullYear()};
        }

        this.order_total={

            pay_to_store:0,
            store_have_order_payment:0,
            store_have_service_payment:0,
            total_admin_profit_on_store:0,
            total_earning:0,
            total_item_price:0,
            total_order_price:0,
            total_store_income:0,
            total_store_tax_price:0,
            total_wallet_income_set: 0,
            total_wallet_income_set_in_cash_order: 0,
            total_wallet_income_set_in_other_order: 0
        }

        this.store_analytic_daily={
            accepted:0,
            acception_ratio:0,
            cancellation_ratio:0,
            cancelled:0,
            completed:0,
            completed_ratio:0,
            received:0,
            rejected:0,
            rejection_ratio:0,
            total_items:0
        }

        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {

            this.helper.router.navigate(['store/owner_dashboard']);
        }
        this.helper.message()
        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.store_id=store._id
            this.server_token=store.server_token
        }

        if(!JSON.parse(localStorage.getItem('store_document_ulpoaded')) && JSON.parse(localStorage.getItem('admin_store_document_ulpoaded')))
        {
            this.helper.router.navigate(['store/upload_document']);
        }
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title
        this.ORDER_STATE=this.helper.ORDER_STATE
        this.order_payments=[];

        this.store_daily_earning()


        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt,res_data) => {

            this.search_field=res_data.selected;

        });
    }
    store_daily_earning()
    {
        this.myLoading=true;
        this.helper.http.post(this.helper.POST_METHOD.DAILY_EARNING,{store_id:this.store_id, server_token:this.server_token, start_date:this.start_date,
            search_field:this.search_field,search_value:this.search_value}).map((res:Response) => res.json()).subscribe(res_data=>{

                this.myLoading=false;
                if(res_data.success == false)
                {
                    this.show=false;

                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message()
                    this.order_payments=[];
                    this.order_total={
                        pay_to_store:0,
                        store_have_order_payment:0,
                        store_have_service_payment:0,
                        total_admin_profit_on_store:0,
                        total_earning:0,
                        total_item_price:0,
                        total_order_price:0,
                        total_store_income:0,
                        total_store_tax_price:0,
                        total_wallet_income_set: 0,
                        total_wallet_income_set_in_cash_order: 0,
                        total_wallet_income_set_in_other_order: 0
                    }
                    this.store_analytic_daily={
                        accepted:0,
                        acception_ratio:0,
                        cancellation_ratio:0,
                        cancelled:0,
                        completed:0,
                        completed_ratio:0,
                        received:0,
                        rejected:0,
                        rejection_ratio:0,
                        total_items:0
                    }
                }
                else
                {
                    this.show=true;
                    this.order_payments=res_data.order_payments;
                    this.order_total={

                        pay_to_store:res_data.order_total.pay_to_store != undefined ? res_data.order_total.pay_to_store : 0 ,
                        store_have_order_payment:res_data.order_total.store_have_order_payment != undefined ? res_data.order_total.store_have_order_payment : 0,
                        store_have_service_payment:res_data.order_total.store_have_service_payment != undefined ? res_data.order_total.store_have_service_payment : 0,
                        total_admin_profit_on_store:res_data.order_total.total_admin_profit_on_store != undefined ? res_data.order_total.total_admin_profit_on_store : 0,
                        total_earning:res_data.order_total.total_earning != undefined ? res_data.order_total.total_earning : 0,
                        total_item_price:res_data.order_total.total_item_price != undefined ? res_data.order_total.total_item_price : 0,
                        total_order_price:res_data.order_total.total_order_price != undefined ? res_data.order_total.total_order_price : 0,
                        total_store_income:res_data.order_total.total_store_income != undefined ? res_data.order_total.total_store_income : 0,
                        total_store_tax_price:res_data.order_total.total_store_tax_price != undefined ? res_data.order_total.total_store_tax_price : 0,
                        total_wallet_income_set:res_data.order_total.total_wallet_income_set != undefined ? res_data.order_total.total_wallet_income_set : 0,
                        total_wallet_income_set_in_cash_order:res_data.order_total.total_wallet_income_set_in_cash_order != undefined ? res_data.order_total.total_wallet_income_set_in_cash_order : 0,
                        total_wallet_income_set_in_other_order:res_data.order_total.total_wallet_income_set_in_other_order != undefined ? res_data.order_total.total_wallet_income_set_in_other_order : 0,
                    }
                    // if(res_data.order_total.pay_to_store !== undefined)
                    // {
                    //     this.order_total=res_data.order_total;
                    // }
                    // else
                    // {
                    //     this.order_total={
                    //         pay_to_store:0,
                    //         store_have_order_payment:0,
                    //         store_have_service_payment:0,
                    //         total_admin_profit_on_store:0,
                    //         total_earning:0,
                    //         total_item_price:0,
                    //         total_order_price:0,
                    //         total_store_income:0,
                    //         total_store_tax_price:0,
                    //         total_wallet_income_set: 0,
                    //         total_wallet_income_set_in_cash_order: 0,
                    //         total_wallet_income_set_in_other_order: 0
                    //     }
                    // }

                    this.store_analytic_daily=res_data.store_analytic_daily;
                }
            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });
    }

    export_excel() {
        this.helper.http.post(this.helper.POST_METHOD.DAILY_EARNING,{store_id:this.store_id, server_token:this.server_token, start_date:this.start_date,
            search_field:this.search_field,search_value:this.search_value}).map((res:Response) => res.json()).subscribe(res_data=>{
            var json2csv = require('json2csv');

            var fieldNames  = ['Order ID','Payment By','Total','Service Fees','Order Fees','Store Profit',
                'Paid Service Fee', 'Received Order Payment', 'Earning'
            ];
            var fields = ['order_unique_id', 'payment_status', 'total', 'total_service_price', 'total_order_price',
                'total_store_income', 'store_have_service_payment', 'store_have_order_payment', 'pay_to_store'
            ];

            var store_analytic_daily_fieldNames  = [this.heading_title.total_order, this.heading_title.accepted_order, this.heading_title.rejected_order, this.heading_title.completed_order,
                this.heading_title.total_item_sold, this.heading_title.accepted_ratio, this.heading_title.rejected_ratio, this.heading_title.completed_ratio,
            ];
            var store_analytic_daily_fields = ['received', 'accepted', 'rejected', 'completed', 'total_items',
                'acception_ratio', 'rejection_ratio', 'completed_ratio'];

            var order_total_fieldNames  = [this.title.item_price, this.title.tax_price, this.title.total_order_price, this.title.admin_profit,
                this.title.store_profit, this.title.received_order_amount, this.title.paid_service_fee, this.title.deduct_from_wallet, this.title.added_in_wallet,
                this.title.total_earnings, this.title.paid_in_wallet, this.title.pay_to_store];
            var order_total_fields = ['total_item_price', 'total_store_tax_price', 'total_order_price', 'total_admin_profit_on_store', 'total_store_income',
                'store_have_order_payment', 'store_have_service_payment', 'total_wallet_income_set_in_cash_order', 'total_wallet_income_set_in_other_order',
                'total_earning', 'total_wallet_income_set', 'pay_to_store'];

            res_data.order_payments.forEach((order, index) => {
                if(order.is_paid_from_wallet){
                    order.payment_status = this.title.wallet;
                } else {
                    if(order.is_payment_mode_cash){
                        order.payment_status = this.title.cash;
                    } else {
                        order.payment_status = order.payment_gateway_detail[0].name;
                    }
                }
            });

            var csv = json2csv({data: res_data.order_payments, fields: fields, fieldNames:fieldNames});
            var store_analytic_daily_csv = json2csv({data: res_data.store_analytic_daily, fields: store_analytic_daily_fields,fieldNames: store_analytic_daily_fieldNames});
            var order_total_csv = json2csv({data: res_data.order_total, fields: order_total_fields,fieldNames: order_total_fieldNames});

            var final_csv: any = store_analytic_daily_csv + "\n" + "\n" + order_total_csv +  "\n" + "\n" + csv

            this.helper.downloadFile(final_csv);

        });
    }

}
