import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

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
    total_wallet_income_set:number,
    total_deduct_wallet_income: number,
    total_added_wallet_income: number,
    total_paid: number,
    total_remaining_to_paid: number
}

export interface OrderDayTotal
{
    date1:number,
    date2:number,
    date3:number,
    date4:number,
    date5:number,
    date6:number,
    date7:number
}

export interface DateList
{
    date1:Object,
    date2:Object,
    date3:Object,
    date4:Object,
    date5:Object,
    date6:Object,
    date7:Object
}

@Component({
    selector: 'app-store_weekly_earning',
    templateUrl: './store_weekly_earning.component.html',
    providers: [Helper]
})
export class StoreWeeklyEarningComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;
    @ViewChild('order_detail_modal')
    order_detail_modal: ModalComponent;

    title: any;
    button: any;
    heading_title: any;
    store_weekly_earning_list: any[];
    //sort_field: string;
    //sort_store_weekly_earning: number;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    total_page: number;
    total_pages: number[];
    order_total: String;
    admin_currency: String;
    amount: number;
    store_weekly_earning_id: Object;
    date:DateList;
    week_date: string;
    week_array: any[];
    show: Boolean;
    registered_date: string;
    myLoading: boolean = true;

    private order_total1: OrderTotal;
    private store_analytic_daily: StoreAnalyticDaily;
    private order_day_total: OrderDayTotal;

     ///////// bar chart ///////

     public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true,
        maintainAspectRatio: false,
        tooltips: false,
        scaleShowValues: true,
        scaleValuePaddingX: 10,
        scaleValuePaddingY: 10,
    
        legend: {
            labels: {
                boxWidth:0
            }
        },
      
        animation: {
           
           onComplete: function () {
               var chartInstance = this.chart,
               ctx = chartInstance.ctx;
               
               ctx.textAlign = 'center';
               ctx.textBaseline = 'bottom';
               this.data.datasets.forEach(function (dataset, i) {
                   var meta = chartInstance.controller.getDatasetMeta(i);
                   meta.data.forEach(function (bar, index) {
                       var data = dataset.data[index];
                       if (data > 0) {
                        ctx.fillText(data, bar._model.x, bar._model.y + 1);
                        }
                   });
               });
           }
       }
    };

    public barChartLabels: string[] = [];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = true ;

    public barChartData: any[] = [
        {data: [], label: ''}
    ];

    public barChartColors: Array<any> = [
        {
            backgroundColor: "#00bfff",
            borderColor: "#00bfff"
        }
    ];

    /////////////////////

    constructor(private helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }
    ngAfterViewInit() {

        jQuery(".chosen-select").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }



    ngOnInit() {
        //this.sort_field = "unique_id";
        // this.sort_store_weekly_earning = -1;
        this.search_field = "store_detail.name";
        this.search_value = "";
        this.start_date = '';
        this.end_date = '';
        this.week_date = '';
        this.show = false;

        this.page = 1

        this.helper.message();
        this.registered_date = "";
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.store_weekly_earning_list = [];
        this.order_total = null;
        this.admin_currency = "";
        this.week_array = [];
        this.store_weekly_earning_id = "";
        this.store_weekly_earning(1);

        this.order_total1={

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
            total_deduct_wallet_income: 0,
            total_added_wallet_income: 0,
            total_paid: 0,
            total_remaining_to_paid: 0
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

        this.order_day_total={
            date1:0,
            date2:0,
            date3:0,
            date4:0,
            date5:0,
            date6:0,
            date7:0
        }

        this.date={
            date1:null,
            date2:null,
            date3:null,
            date4:null,
            date5:null,
            date6:null,
            date7:null
        }

        this.helper.http.post('/api/admin/get_setting_detail', {}).map((res: Response) => res.json()).subscribe(res_data => {

           if (res_data.success == true) {
                this.registered_date = res_data.setting.created_at;


                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                var registered_date = new Date(this.registered_date)

               var today = new Date();
               var start_date = new Date(today.setDate(today.getDate() - today.getDay()));
               today = new Date(start_date);
               var end_date = new Date(today.setDate(today.getDate() + 6));

               var timeDiff = Math.abs(end_date.getTime() - registered_date.getTime());
               var total_week = Math.ceil((timeDiff / (1000 * 3600 * 24)) / 7);

               // var registered_date = new Date(this.registered_date)
               //
               // var today = new Date(Date.now());
               // var getDay = today.getDay();
               //
               // var lastWeekEndDay = today.getDate() + 6 - today.getDay();
               // var lastWeekEndDate1 = new Date(today.setDate(lastWeekEndDay));
               // var timeDiff = Math.abs(lastWeekEndDate1.getTime() - registered_date.getTime());
               // var total_week = Math.ceil((timeDiff / (1000 * 3600 * 24)) / 7);
               //
               // var end_date = new Date(today.setDate(lastWeekEndDay));
               // today = new Date(end_date);
               // var start_date = new Date(today.setDate(today.getDate() - 6));
               for (var i = 0; i < total_week; i++) {
                   var start_date_view = start_date.getDate() + ' ' + monthNames[start_date.getMonth()] + ' ' + start_date.getFullYear();
                   var end_date_view = end_date.getDate() + ' ' + monthNames[end_date.getMonth()] + ' ' + end_date.getFullYear();

                   this.week_array.push({value: start_date_view + '-' + end_date_view, text: start_date_view + ' - ' + end_date_view})

                   if (i == 0) {
                       this.week_date = start_date_view + '-' + end_date_view;
                       this.start_date = start_date_view;
                       this.end_date = end_date_view;
                   }

                   end_date = new Date(end_date.setDate(end_date.getDate() - 7));
                   start_date = new Date(start_date.setDate(start_date.getDate() - 7));
               }
                this.store_weekly_earning(this.page)

            }

        });


        setTimeout(function () {
            jQuery("#week_date").trigger("chosen:updated");
        }, 1000);

        //        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {
        //
        //            this.sort_field = res_data.selected;
        //
        //        });
        //        jQuery(this.helper.elementRef.nativeElement).find('#sort_store_weekly_earning').on('change', (evnt, res_data) => {
        //
        //            this.sort_store_weekly_earning = res_data.selected;
        //
        //        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#week_date').on('change', (evnt, res_data) => {


            this.week_date = res_data.selected;
            var date = this.week_date.split('-');
            this.start_date = date[0];
            this.end_date = date[1];

        });
    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    store_weekly_earning(page) {
        this.page = page;
        this.helper.http.post('/admin/store_weekly_earning', {
            start_date: this.start_date, end_date: this.end_date,

            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;

            if (res_data.success == false) {

                this.store_weekly_earning_list = [];
                this.total_pages = [];
            }
            else {

                this.show = true;
                this.store_weekly_earning_list = res_data.store_weekly_earnings;
                this.total_page = res_data.pages;
                this.order_total = res_data.order_total;
                console.log(this.order_total)
                this.admin_currency = res_data.admin_currency;

                if(this.store_weekly_earning_list.length>0){
                    this.open_detail_modal(this.store_weekly_earning_list[0]._id);
                }

                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    open_modal(id) {

        this.store_weekly_earning_id = id;
        this.modal.open();
        this.amount = null;
    }
    AdminPayToStore(add_amount) {
        this.helper.http.post('/admin/admin_paid_to_store', add_amount).map((res: Response) => res.json()).subscribe(res_data => {

            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.modal.close();
                var index = this.store_weekly_earning_list.findIndex(x => x._id == add_amount.store_weekly_earning_id);
                this.store_weekly_earning_list[index].total_paid = this.store_weekly_earning_list[index].total_paid + +add_amount.amount;
                this.store_weekly_earning_list[index].total_remaining_to_paid = this.store_weekly_earning_list[index].total_remaining_to_paid - add_amount.amount;
            }

        });
    }

    open_detail_modal(store_id) {
        this.myLoading = true;
        this.helper.http.post('/api/store/weekly_earning', {
            store_id: store_id,
            type: 1,
            start_date: this.start_date,
            end_date: this.end_date,
            search_field: this.search_field,
            search_value: ''
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
           
            if(res_data.success == false)
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
                this.show=false;
                // this.order_day_total={
                //     date1:0,
                //     date2:0,
                //     date3:0,
                //     date4:0,
                //     date5:0,
                //     date6:0,
                //     date7:0
                // }
                this.order_total1={
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
                    total_deduct_wallet_income: 0,
                    total_added_wallet_income: 0,
                    total_paid: 0,
                    total_remaining_to_paid: 0
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
                // this.date={
                //     date1:null,
                //     date2:null,
                //     date3:null,
                //     date4:null,
                //     date5:null,
                //     date6:null,
                //     date7:null
                // }
            }
            else
            {
                // this.order_detail_modal.open();
                this.show=true;

                if (res_data.order_day_total != undefined) {
                    let labels: string[] = [];
                    this.order_day_total = res_data.order_day_total;
                    
                    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                    labels = [
                        new Date(res_data.date.date1).getDate() + ' ' + monthNames[new Date(res_data.date.date1).getMonth()],
                        new Date(res_data.date.date2).getDate() + ' ' + monthNames[new Date(res_data.date.date2).getMonth()],
                        new Date(res_data.date.date3).getDate() + ' ' + monthNames[new Date(res_data.date.date3).getMonth()],
                        new Date(res_data.date.date4).getDate() + ' ' + monthNames[new Date(res_data.date.date4).getMonth()],
                        new Date(res_data.date.date5).getDate() + ' ' + monthNames[new Date(res_data.date.date5).getMonth()],
                        new Date(res_data.date.date6).getDate() + ' ' + monthNames[new Date(res_data.date.date6).getMonth()],
                        new Date(res_data.date.date7).getDate() + ' ' + monthNames[new Date(res_data.date.date7).getMonth()]
                    ] ;
                   
                    this.barChartData[0].data[0] = res_data.order_day_total.date1.toFixed(2);
                    this.barChartData[0].data[1] = res_data.order_day_total.date2.toFixed(2);
                    this.barChartData[0].data[2] = res_data.order_day_total.date3.toFixed(2);
                    this.barChartData[0].data[3] = res_data.order_day_total.date4.toFixed(2);
                    this.barChartData[0].data[4] = res_data.order_day_total.date5.toFixed(2);
                    this.barChartData[0].data[5] = res_data.order_day_total.date6.toFixed(2);
                    this.barChartData[0].data[6] = res_data.order_day_total.date7.toFixed(2);

                    this.barChartLabels = labels;
                }
                //this.order_day_total=res_data.order_day_total;

                // this.order_day_total={
                //     date1: res_data.order_day_total.date1 != undefined ?  res_data.order_day_total.date1 : 0 ,
                //     date2: res_data.order_day_total.date2 != undefined ?  res_data.order_day_total.date2 : 0,
                //     date3: res_data.order_day_total.date3 != undefined ?  res_data.order_day_total.date3 : 0,
                //     date4: res_data.order_day_total.date4 != undefined ?  res_data.order_day_total.date4 : 0,
                //     date5: res_data.order_day_total.date5 != undefined ?  res_data.order_day_total.date5 : 0,
                //     date6: res_data.order_day_total.date6 != undefined ?  res_data.order_day_total.date6 : 0,
                //     date7: res_data.order_day_total.date7 != undefined ?  res_data.order_day_total.date7 : 0
                // }

                this.order_total1={

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
                    total_deduct_wallet_income:res_data.order_total.total_deduct_wallet_income != undefined ? res_data.order_total.total_deduct_wallet_income : 0,
                    total_added_wallet_income:res_data.order_total.total_added_wallet_income != undefined ? res_data.order_total.total_added_wallet_income : 0,
                    total_paid:res_data.order_total.total_paid != undefined ? res_data.order_total.total_paid : 0,
                    total_remaining_to_paid:res_data.order_total.total_remaining_to_paid != undefined ? res_data.order_total.total_remaining_to_paid : 0
                }

                this.store_analytic_daily=res_data.store_analytic_weekly;
                //this.date=res_data.date;
            }
        },
        (error: any) => {
            this.myLoading=false;
            this.helper.http_status(error)
        });
    }

    view_store_weekly_earning_statement(id) {
        this.helper.router_id.admin.store_weekly_earning_id = id;
        this.helper.router.navigate(['admin/store_weekly_earning_statement']);
    }

    store_weekly_earning_export_csv() {
        this.helper.http.post('/admin/store_weekly_earning', {
            start_date: this.start_date, end_date: this.end_date,
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {
            var json2csv = require('json2csv');
            res_data.store_weekly_earnings.forEach((store_weekly_earning, index) => {



                store_weekly_earning.currency = store_weekly_earning.country_detail[0].currency_sign;



                store_weekly_earning.store_name = store_weekly_earning.store_detail.name;


                if (store_weekly_earning.store_analytic_weekly_detail.length > 0) {

                    store_weekly_earning.total_orders = store_weekly_earning.store_analytic_weekly_detail[0].total_orders;


                }

            });

            var fieldNames = [this.title.ID,
            this.title.store,
            this.title.orders,
            this.title.currency,
            this.title.store_earn,
            this.title.store_have_payment,
            this.title.pay_to_store,

            this.title.total_wallet_income_set_in_cash_order,
            this.title.total_wallet_income_set_in_other_order,
            this.title.paid,
            this.title.remaining_to_pay

            ];

            var fields = ['unique_id', 'store_name',
                'total_orders', 'currency', 'total_store_earning',
                'store_have_order_payment',
                'total_pay_to_store', 'total_deduct_wallet_income',
                'total_added_wallet_income',
                'total_paid', 'total_remaining_to_paid'
            ];


            var order_total_fieldNames = [this.title.total_orders,
            this.title.admin_earn,
            this.title.store_earn,
            this.title.pay_to_store,
            this.title.total_wallet_income_set_in_cash_order,
            this.title.total_wallet_income_set_in_other_order

            ];

            var order_total_fields = ['total_orders',
                'total_admin_earn',
                'total_store_earning',
                'total_pay_to_store',
                'total_deduct_wallet_income',
                'total_added_wallet_income'
            ];

            var order_total_csv = json2csv({data: res_data.order_total, fields: order_total_fields, fieldNames: order_total_fieldNames});
            var csv = json2csv({data: res_data.store_weekly_earnings, fields: fields, fieldNames: fieldNames});

            var final_csv: any = order_total_csv + "\n" + "\n" + csv;

            this.helper.downloadFile(final_csv);
        });
    }




    store_weekly_earning_export_excel() {
        this.helper.http.post('/admin/store_weekly_earning', {
            start_date: this.start_date, end_date: this.end_date,
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {
            var json_data = [];
            var json2excel = require('js2excel');
            res_data.store_weekly_earnings.forEach((store_weekly_earning, index) => {

                store_weekly_earning.currency = store_weekly_earning.country_detail[0].currency_sign;



                store_weekly_earning.store_name = store_weekly_earning.store_detail.name;

                if (store_weekly_earning.store_analytic_weekly_detail.length > 0) {

                    store_weekly_earning.total_orders = store_weekly_earning.store_analytic_weekly_detail[0].total_orders;


                }

                json_data.push({
                    "ID": store_weekly_earning.unique_id,
                    "Store": store_weekly_earning.store_name,
                    "Total Orders": store_weekly_earning.total_orders,
                    "Currency": store_weekly_earning.currency,
                    "Store Earn": store_weekly_earning.total_store_earning,
                    "Store Have Payment": store_weekly_earning.store_have_order_payment,
                    "Pay To Store": store_weekly_earning.total_pay_to_store,

                    "Deduct From Wallet": store_weekly_earning.total_deduct_wallet_income,
                    "Added In Wallet": store_weekly_earning.total_added_wallet_income,
                    "Paid": store_weekly_earning.total_paid,
                    "Remaining to Pay": store_weekly_earning.total_remaining_to_paid
                });


            });


            json2excel.json2excel({
                data: json_data,
                name: 'store_weekly_earning_excel',
                formateDate: 'yyyy/mm/dd'
            });



        });
    }





    //    store_weekly_earning_export_excel() {
    //        this.helper.http.get('/admin/export_excel_store_weekly_earning').map((res: Response) => res.json()).subscribe(res => {
    //
    //        window.open(res.path);
    //            
    //        });
    //    }

}
