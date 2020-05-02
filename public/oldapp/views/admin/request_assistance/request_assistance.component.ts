import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Helper } from "../../helper";
import { Http, Response } from '@angular/http';
declare var jQuery: any;

@Component({
    selector: 'app-admin-request-assistance',
    templateUrl: './request_assistance.component.html',
    providers: [Helper]
})

export class AdminRequestAssistanceComponent implements OnInit{
    public myLoading: boolean = false;
    title: any;
    button: any;
    heading_title: any;

    sort_field: string;
    sort_ra: number;
    search_field: string;
    search_value: string;
    page: number;
    number_of_rec: number = 10;
    ra_page_type: number = 0;
    ra_list: any[] = [];
    total_pages: any[] = [];
    total_page: number;
    ra_detail: any;
    selected_tab: number = 1;
    formData = new FormData();
    store_id: string;

    constructor(public helper: Helper , public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
     }

    ngOnInit() {
        if (this.helper.data.storage.message !== undefined && this.helper.data.storage.message !== '') {
            this.helper.message()
        }
        this.sort_field = "unique_id";
        this.sort_ra = -1;
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
        jQuery(this.helper.elementRef.nativeElement).find('#sort_ra').on('change', (evnt, res_data) => {

            this.sort_ra = res_data.selected;

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
        jQuery("#vehicle").chosen({ disable_search: true });
        jQuery(".chosen-select").chosen({ disable_search: true });
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }

    filter(page) {
        this.page = page;
        this.helper.http.post('/store/get_request_assistance_list', {
            number_of_rec: this.number_of_rec,
            sort_field: this.sort_field, sort_ra: this.sort_ra, ra_page_type: this.ra_page_type,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            console.log(res_data)
            if (res_data.success == false) {
                this.ra_list = [];
                this.total_pages = [];
                this.ra_detail = undefined;
            }
            else {

                this.ra_list = res_data.request_assistances;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                if (this.ra_list.length > 0) {
                    this.get_ra_detail(this.ra_list[0]._id);
                } else {
                    this.ra_detail = undefined;
                }
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    get_ra_detail(id) {
        this.selected_tab = 1;
        let index = this.ra_list.findIndex((ra) => ra._id == id);
        this.ra_detail = JSON.parse(JSON.stringify(this.ra_list[index]));
    }

    change_page_type(ra_page_type) {
        this.ra_page_type = ra_page_type;
        this.ra_detail = undefined;
        this.filter(1);
    }
}

