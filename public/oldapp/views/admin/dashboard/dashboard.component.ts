import {Component, OnInit, ViewChild,ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


//import 'E:/NEW_FLOW_EDELIVERY/node_modules/chart.js/src/chart.js';
//const require: WebpackRequire = (window as any).require;

//declare var require: NodeRequire|Require

declare var c3: any;
import {Helper} from "../../helper";
declare var jQuery: any;

export interface List {
    total_users: Number,
    total_providers: Number,
    total_store: Number,
    total_countries: Number,
    total_cities: Number
}

export interface OrderDetail {
    completed_order: Number,
    total_item_sold: Number,
    total_payments: Number,
    promo_payment: Number,
    cash_payment: Number,
    wallet_payment: Number,
    other_payment: Number,
    admin_earning: Number,
    order_payment: Number,
    delivery_payment: Number,
    store_earning: Number,
    provider_earning: Number,
    admin_earn_per: Number,
    store_earn_per: Number,
    provider_earn_per: Number,
    store_payment_pre_earning:Number,
    provider_payment_pre_earning:Number
}

export interface OrderDetail1 {
    total_orders: Number,
    total_deliveries: Number,
    cancelled_order: Number
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    providers: [Helper]
})

export class DashboardComponent implements OnInit {


    public order_detail: OrderDetail;
    public order_detail1: OrderDetail1;
    public list: List;
    country_list: any[] = [];
    selected_country: string = "all";
    myLoading:Boolean = false;
    start_date:any = '';
    end_date:any = '';
    date_error:number = 0;
    validation_message:any;
    heading_title:any;
    title:any;
    button:any;

    //////// for pie chart ////////
    public pieChartLabels: string[] = ['Other Payment', 'Cash Payment', 'Promo', 'Wallet'];
    public pieChartData: number[] = [0, 0, 0, 0];
    public pieChartType: string = 'pie';
    public pieChartLegend: boolean = false;

    public pieChartColors: Array<any> = [
        {
            backgroundColor: ['#de404c', '#e56671', '#d3d3d3', '#bababa'],
        }
    ];
    ///////////////////////////


    /////////// for line chart ///////////
    public lineChartData: Array<any> = [
        {data: [], label: 'Total'},
        {data: [], label: 'Admin Earn'},
        {data: [], label: 'Admin Paid'},
        // {data: [], label: 'Paid Deliveryman'},
        {data: [], label: 'Paid Store'}
    ];
    public lineChartLabels: Array<any> = [];
    public lineChartOptions: any = {
        responsive: true,
        labels: {
            fontSize: '15px'
        }
    };
    public lineChartColors: Array<any> = [
        {
            backgroundColor: 'rgba(241, 190, 186, 0.50)',
            borderColor: 'rgba(77,83,96,1)',
            pointBackgroundColor: '#cc212e',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#cc212e'
        },
        {
            backgroundColor: 'rgba(241, 241, 241, 0.50)',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(77,83,96,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        },
        {
            backgroundColor: 'rgba(241, 241, 241, 0.50)',
            borderColor: 'red',
            pointBackgroundColor: 'rgba(77,83,96,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        },
        {
            backgroundColor: 'rgba(241, 241, 241, 0.50)',
            borderColor: 'blue',
            pointBackgroundColor: 'rgba(77,83,96,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        },
        {
            backgroundColor: 'rgba(241, 241, 241, 0.50)',
            borderColor: 'green',
            pointBackgroundColor: 'rgba(77,83,96,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(77,83,96,1)'
        }
    ];
    public lineChartLegend: boolean = true;
    public lineChartType: string = 'line';

    ////////////////////////

    ////// for bar chart //////////////

    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true
    };
    public barChartLabels: string[] = [];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = true;

    public barChartData: any[] = [
        {data: [], label: 'Total orders'},
        // {data: [], label: 'Total Deliveries'},
        {data: [], label: 'Completed Order'},
        {data: [], label: 'Rejected By Vaiter'},
        {data: [], label: 'Cancelled By User'}
    ];

    public barChartColors: Array<any> = [
        {
            backgroundColor: '#f1beba',
            borderColor: '#f1beba',
        },
        {
            backgroundColor: 'black',
            borderColor: 'black',
        },
        {
            backgroundColor: 'red',
            borderColor: 'red',
        },
        {
            backgroundColor: 'green',
            borderColor: 'green',
        },
        {
            backgroundColor: 'blue',
            borderColor: 'blue',
        }
    ];



    ////////////////////////

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
//        reverse() {
//    import('./string-helpers').then(module => {
//        this.name = module.reverseString(this.name);
//    });
//}
        //require.ensure(['E:/NEW_FLOW_EDELIVERY/node_modules/ng2-toastr/bundles/ng2-toastr.min.css'], require => {
        ////let yourModule = require('E:/NEW_FLOW_EDELIVERY/node_modules/ng2-toastr/bundles/ng2-toastr.min.css');
        //console.log(yourModule);
        //yourModule.someFunction();
     //}); 
        

         //System.import('path/to/your/module').then(refToLoadedModule => {
             
         //}
        
    }

    ngAfterViewInit() {

        jQuery(".chosen-select").chosen();
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }

    ngOnInit() {
        this.helper.message()

        this.validation_message=this.helper.validation_message;
        this.heading_title=this.helper.heading_title;
        this.title=this.helper.title;
        this.button=this.helper.button;

        this.order_detail = {
            completed_order: 0,
            total_item_sold: 0,
            total_payments: 0,
            promo_payment: 0,
            cash_payment: 0,
            wallet_payment: 0,
            other_payment: 0,
            admin_earning: 0,
            order_payment: 0,
            delivery_payment:0,
            store_earning: 0,
            provider_earning: 0,
            admin_earn_per: 0,
            store_earn_per: 0,
            provider_earn_per: 0,
            store_payment_pre_earning:0,
            provider_payment_pre_earning:0
        }
        this.order_detail1 = {
            total_orders: 0,
            total_deliveries: 0,
            cancelled_order: 0
        }

        this.list = {
            total_users: 0,
            total_providers: 0,
            total_store: 0,
            total_countries: 0,
            total_cities: 0
        }

        this.helper.http.get('api/admin/get_country_list').map((response: Response) => response.json()).subscribe(res_data => {
                this.country_list = res_data.countries

            },
            (error: any) => {

            });
        jQuery(this.helper.elementRef.nativeElement).find('#selected_country').on('change', (evnt, res_data) => {

            this.selected_country = res_data.selected;
            this.order_details();

        });

        this.helper.http.post('/admin/dashboard/last_six_month_payment_detail', {}).map((res_data: Response) => res_data.json()).subscribe(res_data => {

            if (res_data.success) {
                this.pieChartData = [res_data.order_detail.total_other_payment.toFixed(2),
                    res_data.order_detail.total_cash_payment.toFixed(2),
                    res_data.order_detail.total_promo_payment.toFixed(2),
                    res_data.order_detail.total_wallet_payment.toFixed(2)
                ]
            }
        });


        this.helper.http.post('/admin/dashboard/last_fifteen_day_order_detail', {}).map((res_data: Response) => res_data.json()).subscribe(res_data => {

            if (res_data.success) {
                let labels: string[] = [];
                res_data.array.forEach((order_data) => {

                    labels.push(order_data._id)
                    this.barChartData[0].data.push(order_data.total_orders)
                    // this.barChartData[1].data.push(order_data.total_deliveries)
                    this.barChartData[1].data.push(order_data.completed_order)
                    this.barChartData[2].data.push(order_data.rejected_by_vaiter)
                    this.barChartData[3].data.push(order_data.cancelled_by_user)

                })
                this.barChartLabels = labels;
            }

        });

        this.helper.http.post('/admin/dashboard/last_six_month_earning_detail', {}).map((res_data: Response) => res_data.json()).subscribe(res_data => {

            if (res_data.success) {
                let labels: string[] = [];
                res_data.array.forEach((order_data) => {

                    labels.push(order_data._id)
                    this.lineChartData[0].data.push(order_data.total.toFixed(2))
                    this.lineChartData[1].data.push(order_data.admin_earning.toFixed(2))
                    this.lineChartData[2].data.push(order_data.admin_paid.toFixed(2))
                    // this.lineChartData[3].data.push(order_data.paid_deliveryman.toFixed(2))
                    this.lineChartData[3].data.push(order_data.paid_store.toFixed(2))

                })
                this.lineChartLabels = labels;
            }

        });

        this.order_details();

        let chart: any;
        chart = c3.generate({
            bindto: '#bar_chart_group',
            data: {
                x: 'x',
                columns: [
                    ['x'],
                    ['Other'],
                    ['Wallet'],
                    ['Promo'],
                    ['Cash']
                ],
                type: 'bar',
                groups: [
                    ['Other', 'Wallet', 'Promo', 'Cash']
                ]
            },
            legend: {
                position: 'right'
            },
            axis: {
                x: {
                    type: 'category' // this needed to load string x value
                }
            },
            grid: {
                y: {
                    lines: [{value: 0}]
                }
            }
        });
        this.helper.http.post('/admin/dashboard/monthly_payment_detail', {}).map((res_data: Response) => res_data.json()).subscribe(res_data => {




            var label = ['x']
            var other = ['Other'];
            var wallet = ['Wallet'];
            var promo = ['Promo'];
            var cash = ['Cash'];

            res_data.array.forEach((payment_data) => {

                label.push(payment_data._id)
                promo.push(payment_data.promo_payment.toFixed(2))
                wallet.push(payment_data.wallet_payment.toFixed(2))
                other.push(payment_data.other_payment.toFixed(2))
                cash.push(payment_data.cash_payment.toFixed(2))



            });
            chart.load({
                columns: [label , other , wallet , promo , cash]
            });

        });

        let country_chart = c3.generate({
            bindto: '#country_chart',
            data: {
                x: 'x',
                columns: [
                    ['x']
                ]
            },
            legend: {
                position: 'right'
            },
            axis: {
                x: {
                    type: 'category' // this needed to load string x value
                }
            }
        });

        this.helper.http.post('/admin/dashboard/country_chart', {}).map((res_data: Response) => res_data.json()).subscribe(res_data => {

            var label = ['x'];
            var array = []

            res_data.array.forEach((month_data , index) => {


                array[index] = [month_data._id]
                month_data.total.forEach( (country_data) => {

                    let a = label.findIndex(x => x==country_data.country_name);
                    if(a==-1)
                    {
                        label.push(country_data.country_name);

                    }
                    var country_index= label.indexOf(country_data.country_name)
                    array[index][country_index] = country_data.total.toFixed(2);

                })
            });
            array.unshift(label);
            array.forEach((data , index)=>{
                if (data.length != 1) {
                } else {
                    array[index].length = label.length
                    array[index].fill(0, 1)
                }
            });

            country_chart.load({
                columns: array
            });
        });


        }

    date_filter(){
        if(this.start_date === ''){
            this.date_error=1;
        } else if(this.end_date === ''){
            this.date_error=2;
        } else{
            this.date_error=0;
            this.order_details();
        }
    }

    order_details() {
        this.myLoading = true;
        this.helper.http.post('/admin/dashboard/order_detail', {country_id: this.selected_country , start_date:this.start_date, end_date:this.end_date}).map((res_data: Response) => res_data.json()).subscribe(res_data => {

            if (res_data.success) {
                this.order_detail = res_data.order_detail;
                this.order_detail1 = res_data.order_detail1;
                this.list = res_data.list;
            }
            else {
                this.order_detail = {
                    completed_order: 0,
                    total_item_sold: 0,
                    total_payments: 0,
                    promo_payment: 0,
                    cash_payment: 0,
                    wallet_payment: 0,
                    other_payment: 0,
                    admin_earning: 0,
                    order_payment: 0,
                    delivery_payment:0,
                    store_earning: 0,
                    provider_earning: 0,
                    admin_earn_per: 0,
                    store_earn_per: 0,
                    provider_earn_per: 0,
                    store_payment_pre_earning:0,
                    provider_payment_pre_earning:0
                }
                this.order_detail1 = {
                    total_orders: 0,
                    total_deliveries: 0,
                    cancelled_order: 0
                }

                this.list = res_data.list;
            }


            ////////// for radar chart 1 //////////


            let chart1 = c3.generate({
                bindto: '#a',
                data: {

                    columns: [
                        ['Admin Earn', this.order_detail.admin_earn_per.toFixed(2)]
                    ],
                    type: 'gauge',
                },
                legend: {
                    show: true
                },
                gauge: {
                    label: {
                        show: false // to turn off the min/max labels.
                    },
                    width: 30 // for adjusting arc thickness
                },
                color: {
                    pattern: ['#1e1e1e'], // the three color levels for the percentage values.
                }
            });
            ////////////////////////

            ////////// for radar chart 2 //////////
            let chart21 = c3.generate({
                bindto: '#b1',
                data: {

                    columns: [
                        ['Store Earning', this.order_detail.store_earn_per.toFixed(2)]
                    ],
                    type: 'gauge',
                },
                legend: {
                    show: true
                },
                gauge: {
                    label: {
                        show: false // to turn off the min/max labels.
                    },
                    width: 30 // for adjusting arc thickness
                },
                color: {
                    pattern: ['#1e1e1e'],
                }
            });

            let chart22 = c3.generate({
                bindto: '#b2',
                data: {

                    columns: [
                        ['pre',this.order_detail.store_payment_pre_earning.toFixed(2) ]
                    ],
                    type: 'gauge',
                },
                legend: {
                    show: true
                },
                gauge: {
                    label: {
                        show: false // to turn off the min/max labels.
                    },
                    width: 10 // for adjusting arc thickness
                },
                color: {
                    pattern: ['#bc1a2b'], // the three color levels for the percentage values.

                },
                size: {
                    height: 100
                }
            });
            //////////////////////////////

            ////////// for radar chart 3 //////////
            let chart31 = c3.generate({
                bindto: '#c1',
                data: {

                    columns: [
                        ['Provider Earning', this.order_detail.provider_earn_per.toFixed(2)]
                    ],
                    type: 'gauge',
                },
                legend: {
                    show: true
                },
                gauge: {
                    label: {
                        show: false // to turn off the min/max labels.
                    },
                    width: 30 // for adjusting arc thickness
                },
                color: {
                    pattern: ['#1e1e1e'], // the three color levels for the percentage values.

                }
            });

            let chart32 = c3.generate({
                bindto: '#c2',
                data: {

                    columns: [
                        ['pre', this.order_detail.provider_payment_pre_earning.toFixed(2)]
                    ],
                    type: 'gauge',
                },
                legend: {
                    show: true
                },
                gauge: {
                    label: {
                        show: false // to turn off the min/max labels.
                    },
                    width: 10 // for adjusting arc thickness
                },
                color: {
                    pattern: ['#bc1a2b']
                },
                size: {
                    height: 100
                }
            });
            //////////////////////

            this.myLoading = false;





        });
    }
}
