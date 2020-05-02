import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;

@Component({
    selector: 'app-transaction_history',
    templateUrl: './transaction_history.component.html',
    providers: [Helper]
})
export class TransactionHistoryComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    DATE_FORMAT: any;
    transaction_history_list: any[];
    sort_field: string;
    sort_transaction_history: number;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    total_page: number;
    total_pages: number[];
    myLoading: boolean = true;

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
        this.sort_field = "unique_id";
        this.sort_transaction_history = -1;
        this.search_field = "provider_detail.email";
        this.search_value = "";
        this.start_date = '';
        this.end_date = '';
        this.page = 1;


        this.helper.message()

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.title = this.helper.title
        this.DATE_FORMAT = this.helper.DATE_FORMAT
        this.transaction_history_list = [];

        this.transaction_history(1);

        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_transaction_history').on('change', (evnt, res_data) => {

            this.sort_transaction_history = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    transaction_history(page) {
        this.page = page;
        this.helper.http.post('/admin/get_transaction_history', {
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_transaction_history: this.sort_transaction_history,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.transaction_history_list = [];
                this.total_pages = [];
            }
            else {
                this.transaction_history_list = res_data.transfer_history;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error);
            });
    }

    transaction_history_export_csv() {
        this.helper.http.post('/admin/get_transaction_history', {
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_transaction_history: this.sort_transaction_history,
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {
            var json2csv = require('json2csv');
            res_data.transfer_history.forEach((transfer_history_detail, index) => {
                if (transfer_history_detail.user_type == 8) {
                    transfer_history_detail.type = this.title.provider;
                } else if (transfer_history_detail.user_type == 2) {
                    transfer_history_detail.type = this.title.store;
                }
                if (transfer_history_detail.transfer_status == 1) {
                    transfer_history_detail.transfer_status = this.title.transfer;
                } else if (transfer_history_detail.transfer_status == 0) {
                    transfer_history_detail.transfer_status = this.title.not_transfer;
                }
                
                if (transfer_history_detail.transfered_by == 1) {
                    transfer_history_detail.transfered_by = this.title.transfered_by_admin;
                } 


                switch (transfer_history_detail.user_type) {
                    case 8:
                        transfer_history_detail.email = transfer_history_detail.provider_detail[0].email;
                        break;
                    case 2:
                        transfer_history_detail.email = transfer_history_detail.store_detail[0].email;
                        break;
                    default:
                        transfer_history_detail.email = '';
                }

                switch (transfer_history_detail.user_type) {
                    case 8:
                        transfer_history_detail.wallet_currency_code = transfer_history_detail.provider_detail[0].wallet_currency_code;
                        break;
                    case 2:
                        transfer_history_detail.wallet_currency_code = transfer_history_detail.store_detail[0].wallet_currency_code;
                        break;
                    default:
                        transfer_history_detail.wallet_currency_code = '';
                }

            });

            var fieldNames = [this.title.ID,
            this.title.type,
            this.title.email,
            this.title.date,
            this.title.country,
            this.title.currency,
            this.title.amount,
            this.title.transfer_status,
            this.title.transfered_by
            ];
            var fields = ['unique_id',
                'type',
                'email',
                'created_at',
                'country_details.country_name',
                'wallet_currency_code',
                'amount',
                'transfer_status',
                'transfered_by'
                
            ];
            var csv = json2csv({data: res_data.transfer_history, fields: fields, fieldNames: fieldNames});

            var final_csv: any = csv;
            this.helper.downloadFile(final_csv);
        });
    }
    
    
    
    
     transaction_history_export_excel() {
         this.helper.http.post('/admin/get_transaction_history', {
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_transaction_history: this.sort_transaction_history,
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {
            var json_data = [];
            var json2excel = require('js2excel');
            res_data.transfer_history.forEach((transfer_history_detail, index) => {
                if (transfer_history_detail.user_type == 8) {
                    transfer_history_detail.type = this.title.provider;
                } else if (transfer_history_detail.user_type == 2) {
                    transfer_history_detail.type = this.title.store;
                }
                if (transfer_history_detail.transfer_status == 1) {
                    transfer_history_detail.transfer_status = this.title.transfer;
                } else if (transfer_history_detail.transfer_status == 0) {
                    transfer_history_detail.transfer_status = this.title.not_transfer;
                }
                
                if (transfer_history_detail.transfered_by == 1) {
                    transfer_history_detail.transfered_by = this.title.transfered_by_admin;
                } 


                switch (transfer_history_detail.user_type) {
                    case 8:
                        transfer_history_detail.email = transfer_history_detail.provider_detail[0].email;
                        break;
                    case 2:
                        transfer_history_detail.email = transfer_history_detail.store_detail[0].email;
                        break;
                    default:
                        transfer_history_detail.email = '';
                }

                switch (transfer_history_detail.user_type) {
                    case 8:
                        transfer_history_detail.wallet_currency_code = transfer_history_detail.provider_detail[0].wallet_currency_code;
                        break;
                    case 2:
                        transfer_history_detail.wallet_currency_code = transfer_history_detail.store_detail[0].wallet_currency_code;
                        break;
                    default:
                        transfer_history_detail.wallet_currency_code = '';
                }
                
                
                 json_data.push({
                    "ID": transfer_history_detail.unique_id,
                    "Type":transfer_history_detail.type,
                    "Email":transfer_history_detail.email,
                    "Country":transfer_history_detail.country_details.country_name,
                    "Currency":transfer_history_detail.wallet_currency_code,
                    "Amount":transfer_history_detail.amount,
                    "Transfer Status":transfer_history_detail.transfer_status,
                    "Transfered By":transfer_history_detail.transfered_by,
                    "Date":transfer_history_detail.created_at
                 });
                
                
            });
            
            json2excel.json2excel({
                data: json_data,
                name: 'transfer_history_excel',
                formateDate: 'yyyy/mm/dd'
            });
           
           
        });
    }
    
    
    

}
