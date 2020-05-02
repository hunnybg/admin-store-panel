import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;

@Component({
    selector: 'app-wallet_history',
    templateUrl: './wallet_history.component.html',
    providers: [Helper]
})
export class WalletHistoryComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    DATE_FORMAT: any;
    wallet_list: any[];
    user_type: number;
    wallet_comment_id: number;
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
        this.user_type = 0;
        this.wallet_comment_id = 0;
        this.search_field = "wallet_description";
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
        this.wallet_list = [];

        this.wallet_history(1);

        jQuery(this.helper.elementRef.nativeElement).find('#user_type').on('change', (evnt, res_data) => {

            this.user_type = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#wallet_comment_id').on('change', (evnt, res_data) => {

            this.wallet_comment_id = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    wallet_history(page) {
        this.page = page;
        this.helper.http.post('/admin/get_wallet_detail', {
            start_date: this.start_date, end_date: this.end_date,
            user_type: this.user_type, wallet_comment_id: this.wallet_comment_id,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {

                this.wallet_list = [];
                this.total_pages = [];

            }
            else {

                this.wallet_list = res_data.wallet;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error);
            });
    }
    
    
    wallet_history_export_csv() {
         this.helper.http.post('/admin/get_wallet_detail', {
            start_date: this.start_date, end_date: this.end_date,
             user_type: this.user_type, wallet_comment_id: this.wallet_comment_id,
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {
            var json2csv = require('json2csv');
            res_data.wallet.forEach((wallet_detail, index) => {
                if (wallet_detail.user_type == 7) {
                    wallet_detail.type = this.title.user;
                } else if (wallet_detail.user_type == 8) {
                    wallet_detail.type = this.title.provider;
                }else if (wallet_detail.user_type == 2) {
                    wallet_detail.type = this.title.store;
                }
                
                
                switch (wallet_detail.user_type) {
                    case 7:
                        wallet_detail.email = wallet_detail.user_detail[0].email;
                        break;
                    case 8:
                        wallet_detail.email = wallet_detail.provider_detail[0].email;
                        break;
                    case 2:
                        wallet_detail.email = wallet_detail.store_detail[0].email;
                        break;
                    default:
                        wallet_detail.email = '';
                }
                
                switch (wallet_detail.user_type) {
                    case 7:
                        wallet_detail.wallet_currency_code = wallet_detail.user_detail[0].wallet_currency_code;
                        break;
                    case 8:
                        wallet_detail.wallet_currency_code = wallet_detail.provider_detail[0].wallet_currency_code;
                        break;
                    case 2:
                        wallet_detail.wallet_currency_code = wallet_detail.store_detail[0].wallet_currency_code;
                        break;
                    default:
                        wallet_detail.wallet_currency_code = '';
                }
                
            });

            var fieldNames = [this.title.id,
            this.title.type,
            this.title.email,
            this.title.date,
            this.title.country,
            this.title.currency,
            this.title.wallet_amount,
            this.title.add_cut,
            this.title.wallet,
            this.title.from_where
            ];
            var fields = ['unique_id',
                'type',
                'email',
                'created_at',
                'country_details.country_name',
                'wallet_currency_code',
                'wallet_amount',
                'added_wallet',
                'total_wallet_amount',
                'wallet_description'
            ];

           
            var csv = json2csv({data: res_data.wallet, fields: fields, fieldNames: fieldNames});

            var final_csv: any = csv;
            this.helper.downloadFile(final_csv);
        });
    }
    
    
    
    wallet_history_export_excel() {
         this.helper.http.post('/admin/get_wallet_detail', {
            start_date: this.start_date, end_date: this.end_date,
             user_type: this.user_type, wallet_comment_id: this.wallet_comment_id,
            search_field: this.search_field, search_value: this.search_value
        }).map((res: Response) => res.json()).subscribe(res_data => {
            var json_data = [];
            var json2excel = require('js2excel');
            res_data.wallet.forEach((wallet_detail, index) => {
                if (wallet_detail.user_type == 7) {
                    wallet_detail.type = this.title.user;
                } else if (wallet_detail.user_type == 8) {
                    wallet_detail.type = this.title.provider;
                }else if (wallet_detail.user_type == 2) {
                    wallet_detail.type = this.title.store;
                }
                
                
                switch (wallet_detail.user_type) {
                    case 7:
                        wallet_detail.email = wallet_detail.user_detail[0].email;
                        break;
                    case 8:
                        wallet_detail.email = wallet_detail.provider_detail[0].email;
                        break;
                    case 2:
                        wallet_detail.email = wallet_detail.store_detail[0].email;
                        break;
                    default:
                        wallet_detail.email = '';
                }
                
                switch (wallet_detail.user_type) {
                    case 7:
                        wallet_detail.wallet_currency_code = wallet_detail.user_detail[0].wallet_currency_code;
                        break;
                    case 8:
                        wallet_detail.wallet_currency_code = wallet_detail.provider_detail[0].wallet_currency_code;
                        break;
                    case 2:
                        wallet_detail.wallet_currency_code = wallet_detail.store_detail[0].wallet_currency_code;
                        break;
                    default:
                        wallet_detail.wallet_currency_code = '';
                }
                
                
                 json_data.push({
                    "ID": wallet_detail.unique_id,
                    "Type":wallet_detail.type,
                    "Email":wallet_detail.email,
                    "Country":wallet_detail.country_details.country_name,
                    "Currency":wallet_detail.wallet_currency_code,
                    "Wallet Amount":wallet_detail.wallet_amount,
                    "Add/Cut":wallet_detail.added_wallet,
                    "Wallet":wallet_detail.total_wallet_amount,
                    "From Where":wallet_detail.wallet_description,
                    "Date":wallet_detail.created_at
                 });
                
                
            });
            
            json2excel.json2excel({
                data: json_data,
                name: 'wallet_history_excel',
                formateDate: 'yyyy/mm/dd'
            });
           
           
        });
    }

}
