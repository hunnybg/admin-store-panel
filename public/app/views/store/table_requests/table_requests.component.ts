import { Component, ViewContainerRef, OnInit } from "@angular/core";
import { Response } from '@angular/http';
import { Helper } from "../../store_helper";
declare var jQuery: any;
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-table-requests',
    templateUrl: './table_requests.component.html',
    providers: [Helper]
})

export class TableRequestsComponent implements OnInit {
    public myLoading: boolean = false;
    store_id: string;
    title: any;
    button: any;
    heading_title: any;
    sort_field: string;
    sort_table_request: number;
    search_field: string;
    search_value: string;
    page: number;
    number_of_rec: number = 10;
    table_request_page_type: number = 0;
    table_request_list: any[] = [];
    total_pages: any[] = [];
    total_page: number;
    table_request_detail: any;
    selected_tab: number = 1;
    
    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        var store = JSON.parse(localStorage.getItem('store'));
        if (store !== null) {
            this.store_id = store._id;
        } else {
            this.helper.router.navigate(['/store/login'])
        }
        if (this.helper.data.storage.message !== undefined && this.helper.data.storage.message !== '') {
            this.helper.message()
        }
        
        this.sort_field = "unique_id";
        this.sort_table_request = -1;
        this.search_field = "user_detail.first_name";
        this.search_value = "";
        this.page = 1;

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.filter(1);


        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });

        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });

        jQuery(this.helper.elementRef.nativeElement).find('#number_of_rec').on('change', (evnt, res_data) => {
            this.number_of_rec = res_data.selected;
            this.filter(1)
        });
    }

    ngAfterViewInit() {
        // jQuery("#search_field").chosen({ disable_search: true });
        jQuery(".chosen-select").chosen({ disable_search: true });
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }

    change_page_type(table_request_page_type) {
        this.table_request_page_type = table_request_page_type;
        this.table_request_detail = undefined;
        this.filter(1);
    }


    filter(page) {
        this.page = page;
        this.helper.http.post('/store/get_table_request_list', {
            store_id: this.store_id, number_of_rec: this.number_of_rec,
            sort_field: this.sort_field, sort_table_request: this.sort_table_request, table_request_page_type: this.table_request_page_type,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.table_request_list = [];
                this.total_pages = [];
                this.table_request_detail = undefined;
            }
            else {

                this.table_request_list = res_data.table_requests;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                if (this.table_request_list.length > 0) {
                    this.get_table_request_detail(this.table_request_list[0]._id);
                } else {
                    this.table_request_detail = undefined;
                }
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    get_table_request_detail(id) {
        this.selected_tab = 1;
        let index = this.table_request_list.findIndex((table_request) => table_request._id == id);
        this.table_request_detail = JSON.parse(JSON.stringify(this.table_request_list[index]));
    }
}   