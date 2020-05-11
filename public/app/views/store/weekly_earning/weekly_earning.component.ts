import { Component, OnInit , ViewContainerRef } from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery:any;
import { map } from 'rxjs/operators';

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
    total_wallet_income_set_in_cash_order: number,
    total_wallet_income_set_in_other_order: number,
    total_paid: number,
    total_remaining_to_paid: number
}

export interface StoreAnalyticDaily1
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

export interface OrderTotal1
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
  selector: 'app-weekly_earning',
  templateUrl: './weekly_earning.component.html',
    providers: [Helper]
})
export class StorWeeklyEarningComponent implements OnInit {

	private order_total: OrderTotal;
	private store_analytic_daily: StoreAnalyticDaily;
	private order_day_total: OrderDayTotal;

    private order_total1: OrderTotal1;
    private store_analytic_daily1: StoreAnalyticDaily1;

	title:any;
    button:any;
    ORDER_STATE:any;
    heading_title:any;
	store_id:Object;
    server_token:String;
    date:DateList;
    search_field:string;
    search_value:string;
    start_date:string;
    end_date:string;
    week_date:string;
    week_array:any[];
    show:Boolean;
    registered_date:string;
    daily_start_date: any;

    myLoading:boolean = true;
    order_payments:any[] = [];

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

  	constructor(private helper:Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {

        jQuery(".chosen-select").chosen();
        // setTimeout(function() {
        //     jQuery(".chosen-select").trigger("chosen:updated");
        // }, 1000);
    }

	ngOnInit() {
		this.search_field="user_detail.first_name";
        this.search_value="";
        this.start_date='';
        this.end_date='';
        this.week_date='';
        this.show=false;       

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
            total_wallet_income_set_in_other_order: 0,
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
            total_wallet_income_set_in_cash_order: 0,
            total_wallet_income_set_in_other_order: 0
        }

        this.store_analytic_daily1={
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

        this.date={
        	date1:null,
        	date2:null,
        	date3:null,
        	date4:null,
        	date5:null,
        	date6:null,
        	date7:null
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
            this.registered_date=store.created_at
        }
        if(!JSON.parse(localStorage.getItem('store_document_ulpoaded')) && JSON.parse(localStorage.getItem('admin_store_document_ulpoaded')))
        {
            this.helper.router.navigate(['store/upload_document']);
        }
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title
        this.ORDER_STATE=this.helper.ORDER_STATE
        this.week_array=[];

        

        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  		var registered_date = new Date(this.registered_date)
  		var today = new Date(Date.now());
  		var getDay = today.getDay();
        getDay = 7 - getDay;
  		var lastWeekEndDay = today.getDate() + getDay - 1;
  		var lastWeekEndDate1 = new Date(today.setDate(lastWeekEndDay));
		var timeDiff = Math.abs(lastWeekEndDate1.getTime() - registered_date.getTime());
		var total_week = Math.ceil((timeDiff / (1000 * 3600 * 24))/7); 

        for(var i = 0; i < total_week; i++){
		    var today = new Date(Date.now());
		    var getDay = today.getDay();
            getDay = 7 - getDay;
		    var lastWeekEndDay = today.getDate() + getDay - 1 - (i * 7);
		    var lastWeekEndDate = new Date(today.setDate(lastWeekEndDay)).setHours(23, 59, 59, 999);
		    var lastWeekEndDates: any = new Date(lastWeekEndDate);
		    var lastWeekStartDate: any = new Date(lastWeekEndDates.getTime() - 6 * 24 * 60 * 60 * 1000);
		    var lastWeekStartDates = lastWeekStartDate.setHours(0, 0, 0, 0);
		    lastWeekStartDate = new Date(lastWeekStartDates);


		    var month = monthNames[lastWeekStartDate.getMonth()];
		    var date: Date = lastWeekStartDate.getDate();
		    var year = lastWeekStartDate.getFullYear();
		    var start_date = lastWeekStartDate.getMonth()+1 + '-' + date + '-' + year; 
		    var lastWeekstartday = date + ' ' + month + ' ' + year;


		        month =  monthNames[lastWeekEndDates.getMonth()];
		        date = lastWeekEndDates.getDate();
		        year = lastWeekEndDates.getFullYear();
		    var lastWeekenddate = date + ' ' + month + ' ' + year;
		    var end_date = lastWeekEndDates.getMonth()+1 + '-' + date + '-' + year;
		    

		    this.week_array.push({value: start_date+' '+end_date , text: lastWeekstartday + ' - ' + lastWeekenddate})
		    if(i==0)
		    {
		    	this.week_date = start_date+' '+end_date;	
		    	this.start_date=start_date;
        		this.end_date=end_date;
		    }	
		}

		this.store_weekly_earning()

        setTimeout(function() {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
       
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt,res_data) => {

            this.search_field=res_data.selected;

        });

        jQuery(this.helper.elementRef.nativeElement).find('#week_date').on('change', (evnt,res_data) => {

            
        	this.week_date = res_data.selected;
        	var date = this.week_date.split(' ');
        	this.start_date=date[0];
        	this.end_date=date[1];	
        });
	}

	store_weekly_earning(){
		this.myLoading=true;
		this.helper.http.post(this.helper.POST_METHOD.WEEKLY_EARNING,{store_id:this.store_id, server_token:this.server_token, start_date:this.start_date, end_date:this.end_date ,
                                                        search_field:this.search_field,search_value:this.search_value}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
            this.myLoading=false;    
            this.daily_start_date = JSON.parse(JSON.stringify(this.start_date)); 
            this.store_daily_earning()                                       	
            if(res_data.success == false)
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
                	this.show=false;
                    this.order_day_total={
			        	date1:0,
			        	date2:0,
			        	date3:0,
			        	date4:0,
			        	date5:0,
			        	date6:0,
			        	date7:0
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
                        total_wallet_income_set_in_other_order: 0,
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
	                this.date={
			        	date1:null,
			        	date2:null,
			        	date3:null,
			        	date4:null,
			        	date5:null,
			        	date6:null,
			        	date7:null
			        }
            }
            else
            {
            	this.show=true;
                let labels: string[] = [];
				this.order_day_total=res_data.order_day_total;

                this.order_day_total={
                    date1: res_data.order_day_total.date1 != undefined ?  res_data.order_day_total.date1 : 0 ,
                    date2: res_data.order_day_total.date2 != undefined ?  res_data.order_day_total.date2 : 0,
                    date3: res_data.order_day_total.date3 != undefined ?  res_data.order_day_total.date3 : 0,
                    date4: res_data.order_day_total.date4 != undefined ?  res_data.order_day_total.date4 : 0,
                    date5: res_data.order_day_total.date5 != undefined ?  res_data.order_day_total.date5 : 0,
                    date6: res_data.order_day_total.date6 != undefined ?  res_data.order_day_total.date6 : 0,
                    date7: res_data.order_day_total.date7 != undefined ?  res_data.order_day_total.date7 : 0
                }

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
                    ];
                   
                    this.barChartData[0].data[0] = res_data.order_day_total.date1 != undefined ?  res_data.order_day_total.date1.toFixed(2) : 0;
                    this.barChartData[0].data[1] = res_data.order_day_total.date2 != undefined ?  res_data.order_day_total.date2.toFixed(2) : 0;
                    this.barChartData[0].data[2] = res_data.order_day_total.date3 != undefined ?  res_data.order_day_total.date3.toFixed(2) : 0;
                    this.barChartData[0].data[3] = res_data.order_day_total.date4 != undefined ?  res_data.order_day_total.date4.toFixed(2) : 0;
                    this.barChartData[0].data[4] = res_data.order_day_total.date5 != undefined ?  res_data.order_day_total.date5.toFixed(2) : 0;
                    this.barChartData[0].data[5] = res_data.order_day_total.date6 != undefined ?  res_data.order_day_total.date6.toFixed(2) : 0;
                    this.barChartData[0].data[6] = res_data.order_day_total.date7 != undefined ?  res_data.order_day_total.date7.toFixed(2) : 0;



                    this.barChartLabels = labels;

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
                    total_paid:res_data.order_total.total_paid != undefined ? res_data.order_total.total_paid : 0,
                    total_remaining_to_paid:res_data.order_total.total_remaining_to_paid != undefined ? res_data.order_total.total_remaining_to_paid : 0
				}
                
                this.store_analytic_daily=res_data.store_analytic_weekly;
                this.date=res_data.date;
                this.daily_start_date = this.date.date1; 
            }
            console.log(this.store_analytic_daily)
        },
        (error: any) => {
        	this.myLoading=false;
                this.helper.http_status(error)
        });
	}


    store_daily_earning()
    {
        this.myLoading=true;
        this.helper.http.post(this.helper.POST_METHOD.DAILY_EARNING,{store_id:this.store_id, server_token:this.server_token, start_date:this.daily_start_date,
            search_field:this.search_field,search_value:this.search_value}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

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
                        total_wallet_income_set_in_cash_order: 0,
                        total_wallet_income_set_in_other_order: 0
                    }
                    this.store_analytic_daily1={
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

                    this.store_analytic_daily1=res_data.store_analytic_daily;
                }
                console.log(this.store_analytic_daily1)
            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });
    }

	daily_earning(date)
	{
		this.daily_start_date = date;
        this.store_daily_earning();
	}

    export_excel() {
        this.helper.http.post(this.helper.POST_METHOD.WEEKLY_EARNING,{store_id:this.store_id, server_token:this.server_token, start_date:this.start_date, end_date:this.end_date ,
            search_field:this.search_field,search_value:this.search_value}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

            var json2csv = require('json2csv');

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

            var day_wise_fieldNames  = ['Date', 'Total Earning'];
            var day_wise_fields1 = ['date.date1', 'order_day_total.date1'];
            var day_wise_fields2 = ['date.date2', 'order_day_total.date2'];
            var day_wise_fields3 = ['date.date3', 'order_day_total.date3'];
            var day_wise_fields4 = ['date.date4', 'order_day_total.date4'];
            var day_wise_fields5 = ['date.date5', 'order_day_total.date5'];
            var day_wise_fields6 = ['date.date6', 'order_day_total.date6'];
            var day_wise_fields7 = ['date.date7', 'order_day_total.date7'];

            var store_analytic_daily_csv = json2csv({data: res_data.store_analytic_daily, fields: store_analytic_daily_fields,fieldNames: store_analytic_daily_fieldNames});
            var order_total_csv = json2csv({data: res_data.order_total, fields: order_total_fields,fieldNames: order_total_fieldNames});
            var date_csv1 = json2csv({data:res_data, fields: day_wise_fields1,fieldNames: day_wise_fieldNames});
            var date_csv2 = json2csv({data:res_data, fields: day_wise_fields2, hasCSVColumnTitle : false});
            var date_csv3 = json2csv({data:res_data, fields: day_wise_fields3, hasCSVColumnTitle : false});
            var date_csv4 = json2csv({data:res_data, fields: day_wise_fields4, hasCSVColumnTitle : false});
            var date_csv5 = json2csv({data:res_data, fields: day_wise_fields5, hasCSVColumnTitle : false});
            var date_csv6 = json2csv({data:res_data, fields: day_wise_fields6, hasCSVColumnTitle : false});
            var date_csv7 = json2csv({data:res_data, fields: day_wise_fields7, hasCSVColumnTitle : false});

            var final_csv: any = store_analytic_daily_csv + "\n" + "\n" + order_total_csv + "\n"  + "\n" + date_csv1 + "\n"  + date_csv2
                + "\n" + date_csv3 + "\n" + date_csv4 + "\n" + date_csv5 + "\n"  + date_csv6 + "\n" + date_csv7

            this.helper.downloadFile(final_csv);
        });
    }
}
