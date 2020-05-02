import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';

import {Helper} from "../../helper";

declare var jQuery: any;
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

export interface ProviderAnalyticWeekly {
    received: number,
    accepted: number,
    rejected: number,
    not_answered: number,
    cancelled: number,
    completed: number,
    acception_ratio: number,
    rejection_ratio: number,
    cancellation_ratio: number,
    completed_ratio: number,
    total_online_time: number,
    total_active_job_time: number,
    total_items: number
}

export interface OrderTotal {
    total_service_price: number,
    total_admin_tax_price: number,
    total_delivery_price: number,
    total_admin_profit_on_delivery: number,
    total_provider_profit: number,
    wallet: number,
    total_earning: number,
    provider_paid_order_payment: number,
    provider_have_cash_payment: number,
    pay_to_provider: number,
    total_paid: number,
    total_remaining_to_paid: number,
    total_wallet_income_set: number,
    total_deduct_wallet_income: number,
    total_added_wallet_income: number,
    total_provider_have_cash_payment_on_hand: number
}

export interface OrderDayTotal {
    date1: number,
    date2: number,
    date3: number,
    date4: number,
    date5: number,
    date6: number,
    date7: number
}

export interface DateList {
    date1: Object,
    date2: Object,
    date3: Object,
    date4: Object,
    date5: Object,
    date6: Object,
    date7: Object
}

@Component({
    selector: 'app_provider_weekly_earning',
    templateUrl: './provider_weekly_earning.component.html',
    providers: [Helper]
})
export class ProviderWeeklyEarningComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;
    @ViewChild('order_detail_modal')
    order_detail_modal: ModalComponent;

    title: any;
    button: any;
    heading_title: any;
    provider_weekly_earning_list: any[];
    setting_detail: any;
    //sort_field: string;
    // sort_weekly_earning: number;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    total_page: number;
    total_pages: number[];
    order_total: any;
    admin_currency: String;

    amount: number;
    provider_weekly_earning_id: Object;

    week_date: string;
    week_array: any[];
    show: Boolean;
    registered_date: string;
    myLoading: boolean = true;

    private order_total1: OrderTotal;
    private provider_analytic_weekly: ProviderAnalyticWeekly;
    private order_day_total: OrderDayTotal;
    date: DateList;
    currency: string = '';

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
                            ctx.fillText(data, bar._model.x, bar._model.y - (-1));
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

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }
    ngAfterViewInit() {

        jQuery(".chosen-select").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }

    ngOnInit() {

        this.search_field = "provider_detail.first_name";
        this.search_value = "";
        this.start_date = '';
        this.end_date = '';
        this.week_date = '';
        this.show = false;
        this.page = 1

        this.helper.message()

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.provider_weekly_earning_list = [];
        this.order_total = {};
        this.admin_currency = "";

        this.week_array = [];
        this.provider_weekly_earning_id = "";
        this.provider_weekly_earning(1);

        this.order_total1 = {
            total_service_price: 0,
            total_admin_tax_price: 0,
            total_delivery_price: 0,
            total_admin_profit_on_delivery: 0,
            total_provider_profit: 0,
            wallet: 0,
            total_earning: 0,
            provider_paid_order_payment: 0,
            provider_have_cash_payment: 0,
            pay_to_provider: 0,

            total_paid: 0,
            total_remaining_to_paid: 0,
            total_wallet_income_set: 0,

            total_deduct_wallet_income: 0,
            total_added_wallet_income: 0,
            total_provider_have_cash_payment_on_hand: 0
        }
        this.provider_analytic_weekly = {
            received: 0,
            accepted: 0,
            rejected: 0,
            not_answered: 0,
            cancelled: 0,
            completed: 0,
            acception_ratio: 0,
            rejection_ratio: 0,
            cancellation_ratio: 0,
            completed_ratio: 0,
            total_online_time: 0,
            total_active_job_time: 0,
            total_items: 0
        }

        this.order_day_total = {
            date1: 0,
            date2: 0,
            date3: 0,
            date4: 0,
            date5: 0,
            date6: 0,
            date7: 0
        }

        this.date = {
            date1: null,
            date2: null,
            date3: null,
            date4: null,
            date5: null,
            date6: null,
            date7: null
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
                this.provider_weekly_earning(this.page)

            }

        });




        setTimeout(function () {
            jQuery("#week_date").trigger("chosen:updated");
        }, 1000);


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

    provider_weekly_earning(page) {
        this.page = page;
        this.helper.http.post('/admin/provider_weekly_earning', {

            start_date: this.start_date, end_date: this.end_date,
            //sort_field: this.sort_field, sort_weekly_earning: this.sort_weekly_earning,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {

                this.myLoading = false;
                if (res_data.success == false) {
                    this.provider_weekly_earning_list = [];
                    this.total_pages = [];
                }
                else {

                    this.provider_weekly_earning_list = res_data.provider_weekly_earnings;
                    this.total_page = res_data.pages;
                    this.order_total = res_data.order_total;
                    this.admin_currency = res_data.admin_currency;
                    if(this.provider_weekly_earning_list.length>0){
                        this.open_detail_modal(this.provider_weekly_earning_list[0]._id)
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

        this.provider_weekly_earning_id = id;
        this.modal.open();
        this.amount = null;
    }
    AdminPayToProvider(add_amount) {
        this.helper.http.post('/admin/admin_paid_to_provider', add_amount).map((res: Response) => res.json()).subscribe(res_data => {

            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.modal.close();
                var index = this.provider_weekly_earning_list.findIndex(x => x._id == add_amount.provider_weekly_earning_id);
                this.provider_weekly_earning_list[index].total_paid = this.provider_weekly_earning_list[index].total_paid + +add_amount.amount;
                this.provider_weekly_earning_list[index].total_remaining_to_paid = this.provider_weekly_earning_list[index].total_remaining_to_paid - add_amount.amount;
            }

        });
    }

    view_provider_weekly_earning_statement(id) {
        this.helper.router_id.admin.provider_weekly_earning_id = id;
        this.helper.router.navigate(['admin/provider_weekly_earning_statement']);
    }


    provider_weekly_earning_export_csv() {
        this.helper.http.post('/admin/provider_weekly_earning', {
            start_date: this.start_date, end_date: this.end_date,
            //sort_field: this.sort_field, sort_weekly_earning: this.sort_weekly_earning,
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {

            var json2csv = require('json2csv');
            res_data.provider_weekly_earnings.forEach((provider_weekly_earning, index) => {



                provider_weekly_earning.currency = provider_weekly_earning.country_detail[0].currency_sign;



                provider_weekly_earning.provider_name = provider_weekly_earning.provider_detail.first_name + ' ' + provider_weekly_earning.provider_detail.last_name;


                if (provider_weekly_earning.provider_analytic_weekly_detail.length > 0) {
                    provider_weekly_earning.acception_ratio = provider_weekly_earning.provider_analytic_weekly_detail[0].acception_ratio;
                    provider_weekly_earning.completed_ratio = provider_weekly_earning.provider_analytic_weekly_detail[0].completed_ratio;
                }

            });

            var fieldNames = [this.title.ID,
                this.title.provider,
                this.title.acception_ratio,
                this.title.completed_ratio,
                this.title.provider_earn,
                this.title.have_case,
                this.title.pay_provider,

                this.title.total_wallet_income_set_in_cash_order,
                this.title.total_wallet_income_set_in_other_order,
                this.title.paid,
                this.title.remaining_to_pay,
                this.title.currency
            ];

            var fields = ['unique_id',
                'provider_name',
                'acception_ratio', 'completed_ratio',
                'total_provider_earning',
                'total_provider_have_cash_payment',
                'total_pay_to_provider', 'total_deduct_wallet_income',
                'total_added_wallet_income',
                'total_paid', 'total_remaining_to_paid', 'currency'
            ];


            var order_total_fieldNames = [this.title.total_orders,
                this.title.admin_earn,
                this.title.provider_earn,
                this.title.pay_to_provider,
                this.title.total_wallet_income_set_in_cash_order,
                this.title.total_wallet_income_set_in_other_order

            ];

            var order_total_fields = ['total_orders',
                'total_admin_earn',
                'total_provider_earning',
                'total_pay_to_provider',
                'total_deduct_wallet_income',
                'total_added_wallet_income'
            ];

            var order_total_csv = json2csv({data: res_data.order_total, fields: order_total_fields, fieldNames: order_total_fieldNames});
            var csv = json2csv({data: res_data.provider_weekly_earnings, fields: fields, fieldNames: fieldNames});

            var final_csv: any = order_total_csv + "\n" + "\n" + csv

            this.helper.downloadFile(final_csv);
        });
    }


    provider_weekly_earning_export_excel() {
        this.helper.http.post('/admin/provider_weekly_earning', {
            start_date: this.start_date, end_date: this.end_date,
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {

            var json_data = [];
            var json2excel = require('js2excel');
            res_data.provider_weekly_earnings.forEach((provider_weekly_earning, index) => {



                provider_weekly_earning.currency = provider_weekly_earning.country_detail[0].currency_sign;



                provider_weekly_earning.provider_name = provider_weekly_earning.provider_detail.first_name + ' ' + provider_weekly_earning.provider_detail.last_name;


                if (provider_weekly_earning.provider_analytic_weekly_detail.length > 0) {
                    provider_weekly_earning.acception_ratio = provider_weekly_earning.provider_analytic_weekly_detail[0].acception_ratio;
                    provider_weekly_earning.completed_ratio = provider_weekly_earning.provider_analytic_weekly_detail[0].completed_ratio;
                }


                json_data.push({
                    "ID": provider_weekly_earning.unique_id,
                    "Provider": provider_weekly_earning.provider_name,
                    "Acception Ratio": provider_weekly_earning.acception_ratio,
                    "Completed Ratio": provider_weekly_earning.completed_ratio,
                    "Provider Earn": provider_weekly_earning.total_provider_earning,
                    "Provider Have Case": provider_weekly_earning.total_provider_have_cash_payment,
                    "Pay Provider": provider_weekly_earning.total_pay_to_provider,

                    "Deduct From Wallet": provider_weekly_earning.total_deduct_wallet_income,
                    "Added In Wallet": provider_weekly_earning.total_added_wallet_income,
                    "Paid": provider_weekly_earning.total_paid,
                    "Remaining To Pay": provider_weekly_earning.total_remaining_to_paid,
                    "Currency": provider_weekly_earning.currency

                });

            });

            json2excel.json2excel({
                data: json_data,
                name: 'provider_weekly_earning_excel',
                formateDate: 'yyyy/mm/dd'
            });


        });
    }


    open_detail_modal(provider_id){
        this.myLoading = true;
        this.helper.http.post('/api/provider/weekly_earning', {
            provider_id: provider_id,
            type: 1,
            start_date: this.start_date,
            end_date: this.end_date,
            search_field: this.search_field,
            search_value: ''
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;

            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }

                // this.order_day_total = {
                //     date1: 0,
                //     date2: 0,
                //     date3: 0,
                //     date4: 0,
                //     date5: 0,
                //     date6: 0,
                //     date7: 0
                // }
                this.order_total1 = {
                    total_service_price: 0,
                    total_admin_tax_price: 0,
                    total_delivery_price: 0,
                    total_admin_profit_on_delivery: 0,
                    total_provider_profit: 0,
                    wallet: 0,
                    total_earning: 0,
                    provider_paid_order_payment: 0,
                    provider_have_cash_payment: 0,
                    pay_to_provider: 0,
                    total_paid: 0,
                    total_remaining_to_paid: 0,
                    total_wallet_income_set: 0,
                    total_deduct_wallet_income: 0,
                    total_added_wallet_income: 0,
                    total_provider_have_cash_payment_on_hand: 0
                }

                this.provider_analytic_weekly = {
                    received: 0,
                    accepted: 0,
                    rejected: 0,
                    not_answered: 0,
                    cancelled: 0,
                    completed: 0,
                    acception_ratio: 0,
                    rejection_ratio: 0,
                    cancellation_ratio: 0,
                    completed_ratio: 0,
                    total_online_time: 0,
                    total_active_job_time: 0,
                    total_items: 0
                }
                // this.date = {
                //     date1: null,
                //     date2: null,
                //     date3: null,
                //     date4: null,
                //     date5: null,
                //     date6: null,
                //     date7: null
                // }
            }
            else {
                this.show = true;
                if (res_data.order_total != undefined) {
                    this.order_total1 = res_data.order_total;
                }
                else {
                    this.order_total1 = {
                        total_service_price: 0,
                        total_admin_tax_price: 0,
                        total_delivery_price: 0,
                        total_admin_profit_on_delivery: 0,
                        total_provider_profit: 0,
                        wallet: 0,
                        total_earning: 0,
                        provider_paid_order_payment: 0,
                        provider_have_cash_payment: 0,
                        pay_to_provider: 0,
                        total_paid: 0,
                        total_remaining_to_paid: 0,
                        total_wallet_income_set: 0,
                        total_deduct_wallet_income: 0,
                        total_added_wallet_income: 0,
                        total_provider_have_cash_payment_on_hand: 0
                    }
                }

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
                else {
                    // this.order_day_total = {
                    //     date1: 0,
                    //     date2: 0,
                    //     date3: 0,
                    //     date4: 0,
                    //     date5: 0,
                    //     date6: 0,
                    //     date7: 0
                    // }
                }

                this.provider_analytic_weekly = res_data.provider_analytic_weekly;
                //this.date = res_data.date;
                this.currency = res_data.currency;
                // this.order_detail_modal.open();
            }
        });
    }
}
