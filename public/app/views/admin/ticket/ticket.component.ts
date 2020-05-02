import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Helper } from "../../helper";
import { Http, Response } from '@angular/http';

declare var jQuery: any;


@Component({
    selector: 'app-ticket',
    templateUrl: './ticket.component.html',
    providers: [Helper]
})

export class TicketComponent implements OnInit {

    public myLoading: boolean = false;
    title: any;
    button: any;
    heading_title: any;
    ADMIN_DATA_ID: any;

    sort_field: string;
    sort_ticket: number;
    search_field: string;
    search_value: string;
    page: number;
    number_of_rec: number = 10;
    ticket_page_type: number = 0;
    ticket_list: any[] = [];
    total_pages: any[] = [];
    total_page: number;
    ticket_detail: any;
    selected_tab: number = 1;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        if (this.helper.data.storage.message !== undefined && this.helper.data.storage.message !== '') {
            this.helper.message()
        }
        this.sort_field = "unique_id";
        this.sort_ticket = -1;
        this.search_field = "user_detail.first_name";
        this.search_value = "";
        this.page = 1;

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.ADMIN_DATA_ID = this.helper.ADMIN_DATA_ID
        this.filter(1);


        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_ticket').on('change', (evnt, res_data) => {

            this.sort_ticket = res_data.selected;

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
        jQuery(".chosen-select").chosen({ disable_search: true });
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }


    filter(page) {
        this.page = page;
        this.helper.http.post('/admin/get_ticket_list', {
            number_of_rec: this.number_of_rec,
            sort_field: this.sort_field, sort_ticket: this.sort_ticket, ticket_page_type: this.ticket_page_type,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.ticket_list = [];
                this.total_pages = [];
                this.ticket_detail = undefined;
            }
            else {

                this.ticket_list = res_data.tickets;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                if (this.ticket_list.length > 0) {
                    this.get_ticket_detail(this.ticket_list[0]._id);
                } else {
                    this.ticket_detail = undefined;
                }
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    get_ticket_detail(id) {
        let index = this.ticket_list.findIndex((ticket) => ticket._id == id);
        this.ticket_detail = JSON.parse(JSON.stringify(this.ticket_list[index]));
    }

    change_page_type(ticket_page_type) {
        this.ticket_page_type = ticket_page_type;
        this.ticket_detail = undefined;
        this.filter(1);
    }

    resolve_ticket(id) {
        this.helper.http.post('/admin/resolve_ticket', { id: id }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if(res_data.success){
                let index = this.ticket_list.findIndex((ticket) => ticket._id == id);
                this.ticket_list.splice(index, 1);
                if(this.ticket_list.length !== 0){
                    this.get_ticket_detail(this.ticket_list[0]._id);
                }else{
                    this.ticket_detail = undefined;
                }
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
            }
            else {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            }
            this.helper.message()
        }, (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
    }
}