import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;

@Component({
    selector: 'app-view_provider_history',
    templateUrl: './view_provider_history.component.html',
    providers: [Helper]
})
export class ViewProviderHistoryComponent implements OnInit {

    title: any;
    button: any;
    ORDER_STATE: any;
    DATE_FORMAT: any;
    heading_title: any;
    status: any;
    request_list: any[];
    sort_field: string;
    sort_request: number;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    total_page: number;
    total_pages: number[];
    
    provider_id: Object;
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
        this.sort_request = -1;
        this.search_field = "user_detail.first_name";
        this.search_value = "";
        this.start_date = '';
        this.end_date = '';
        this.page = 1;
        
        this.provider_id = this.helper.router_id.admin.history_provider_id;
        this.helper.message()
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.ORDER_STATE = this.helper.ORDER_STATE
        this.DATE_FORMAT = this.helper.DATE_FORMAT
        this.status = this.helper.status
        this.title = this.helper.title
        this.request_list = [];
        this.admin_provider_history(1);

        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;
        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_request').on('change', (evnt, res_data) => {

            this.sort_request = res_data.selected;
        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;
        });
    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }
    
    admin_provider_history(page) {
        this.page = page;
        this.helper.http.post('/admin/view_provider_history', {
            provider_id: this.provider_id, 
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_request: this.sort_request,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {

                this.request_list = [];
                this.total_pages = [];

            }
            else {
                this.request_list = res_data.requests;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    viewRequestOrder_detail(id) {
        this.helper.router_id.admin.request_id = id;
        this.helper.router.navigate(['admin/request_order_detail']);
    }

}
