import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
import { map } from 'rxjs/operators';
declare var jQuery: any;

@Component({
    selector: 'app-view_history',
    templateUrl: './view_history.component.html',
    providers: [Helper]
})
export class ViewHistoryComponent implements OnInit {

    title: any;
    button: any;
    ORDER_STATE: any;
    DATE_FORMAT: any;
    heading_title: any;
    status: any;
    order_list: any[];
    sort_field: string;
    sort_order: number;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    total_page: number;
    total_pages: number[];
    type: Number;
    id: Object;
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
        this.sort_order = -1;
        this.search_field = "user_detail.first_name";
        this.search_value = "";
        this.start_date = '';
        this.end_date = '';
        this.page = 1;


        this.type = this.helper.router_id.admin.page_type;
        console.log(this.type);
//        if (this.type == 1) {
//            this.id = this.helper.router_id.admin.history_provider_id;
//        }
//
//        else 
        if (this.type == 2) {
            this.id = this.helper.router_id.admin.history_user_id;
        }
        else if (this.type == 3) {
            this.id = this.helper.router_id.admin.history_store_id;
        }



        this.helper.message()

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.ORDER_STATE = this.helper.ORDER_STATE
        this.DATE_FORMAT = this.helper.DATE_FORMAT
        this.status = this.helper.status
        this.title = this.helper.title
        this.order_list = [];

        this.admin_history(1)

        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_order').on('change', (evnt, res_data) => {

            this.sort_order = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    admin_history(page) {
        this.page = page;
        this.helper.http.post('/admin/view_history', {
            id: this.id, type: this.type,
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_order: this.sort_order,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.order_list = [];
                this.total_pages = [];
            }
            else {
                this.order_list = res_data.orders;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    order_detail(id) {
        this.helper.router_id.admin.order_id = id;
        this.helper.router.navigate(['admin/order_detail']);
    }

    view_cart(id) {
        this.helper.router_id.admin.order_id = id;
        this.helper.router.navigate(['admin/view_cart']);
    }



}
