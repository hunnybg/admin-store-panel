import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;

@Component({
  selector: 'app-request_cancel_reason',
  templateUrl: './request_cancel_reason.component.html',
  providers: [Helper]
})
export class RequestCancelReasonComponent implements OnInit {

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
    //start_date: string;
    //end_date: string;
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
        this.sort_request = -1;
        this.search_field = "unique_id";
        this.search_value = "";
        //this.start_date = '';
        //this.end_date = '';
        this.page = 1


        this.helper.message();
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.ORDER_STATE = this.helper.ORDER_STATE
        this.DATE_FORMAT = this.helper.DATE_FORMAT
        this.status = this.helper.status
        this.title = this.helper.title
        this.request_list = [];

        this.admin_request_cancellation_reason(1)

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
    
    admin_request_cancellation_reason(page) {
        this.myLoading=true;
        this.page = page;
        this.helper.http.post('/admin/request_cancellation_reason', {
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

}
