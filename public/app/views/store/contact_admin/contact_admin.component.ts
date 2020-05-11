import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Helper } from "../../store_helper";
import { Response } from '@angular/http';
import { TICKET_STATUS } from "../../../constant";
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-contact-admin',
    templateUrl: './contact_admin.component.html',
    providers: [Helper]
})

export class ContactAdminComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    TICKET_STATUS: any

    store_id: string;
    server_token: string;
    myLoading: boolean = true;
    submit_disabled: boolean = true;
    creating_ticket: boolean = false;

    sort_field: string;
    sort_ticket: number;
    search_field: string;
    search_value: string;
    page: number;
    number_of_rec: number = 10;
    // ticket_page_type: number = 0;
    ticket_list: any[] = [];
    total_pages: any[] = [];
    total_page: number;
    ticket_detail: any;


    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        let token = this.helper.tokenService.getToken();
        if (!token || !token.token) {
            this.helper.router.navigate(['store/login']);
            this.myLoading = false;
        }

        let store = JSON.parse(localStorage.getItem('store'));
        if (store) {
            this.store_id = store._id;
            this.server_token = store.server_token;
        }
        if (!JSON.parse(localStorage.getItem('store_document_ulpoaded')) && JSON.parse(localStorage.getItem('admin_store_document_ulpoaded'))) {
            this.helper.router.navigate(['store/upload_document']);
        }

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.validation_message = this.helper.validation_message;
        this.TICKET_STATUS = TICKET_STATUS;
        this.ticket_detail = {
            ticket_title: '',
            ticket_content: ''
        }
        this.sort_field = "unique_id";
        this.sort_ticket = -1;
        this.search_field = "store_detail.name";
        this.search_value = "";
        this.page = 1;
        this.filter(1)
    }

    filter(page) {
        this.page = page;
        let json = {
            number_of_rec: this.number_of_rec,
            sort_field: this.sort_field,
            sort_ticket: this.sort_ticket,
            search_field: this.search_field,
            search_value: this.search_value,
            page: this.page,
            user_type: this.helper.ADMIN_DATA_ID.STORE,
            user_id: this.store_id
        }
        this.helper.http.post(this.helper.POST_METHOD.GET_TICKET_LISTS, json).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.ticket_list = [];
                this.total_pages = [];
                this.ticket_detail = {
                    ticket_title: '',
                    ticket_content: ''
                }
            }
            else {
                this.ticket_list = res_data.tickets;
                this.get_ticket_detail(this.ticket_list[0]._id)
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        }, (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
    }

    enable_submit_ticket() {
        if (this.ticket_detail.ticket_title.trim() !== '' && this.ticket_detail.ticket_content.trim() !== '') {
            this.submit_disabled = false;
        } else {
            this.submit_disabled = true;
        }
    }

    create_ticket() {

        let json = {
            user_id: this.store_id,
            server_token: this.server_token,
            ticket_title: this.ticket_detail.ticket_title,
            ticket_content: this.ticket_detail.ticket_content,
            user_type: this.helper.ADMIN_DATA_ID.STORE
        }

        this.helper.http.post(this.helper.POST_METHOD.CREATE_TICKET, json).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            console.log(res_data)
            if (!res_data.success) {
                this.myLoading = false;
                this.helper.data.storage = {
                    "class": "alert-danger",
                    "message": this.helper.ERROR_CODE[res_data.error_code]
                }
                this.helper.message();
            }
            else {
                this.helper.data.storage = {
                    "class": "alert-info",
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                }
                this.helper.message();
                this.ticket_detail.ticket_title = '';
                this.ticket_detail.ticket_content = '';
                this.submit_disabled = true;
                this.creating_ticket = false;
                this.filter(1);
            }
        }, (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
    }

    get_ticket_detail(id) {
        this.creating_ticket = false;
        let index = this.ticket_list.findIndex((ticket) => ticket._id == id);
        this.ticket_detail = JSON.parse(JSON.stringify(this.ticket_list[index]));
    }

    creating_ticket_enable(){
        this.ticket_detail = {
            ticket_title: '',
            ticket_content: ''
        }
        this.creating_ticket = true;
    }
}