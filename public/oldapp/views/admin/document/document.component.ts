import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Helper} from "../../helper";
import {Http, Response} from '@angular/http';
import { map } from 'rxjs/operators';

declare var jQuery: any;
@Component({
    selector: 'app-document',
    templateUrl: './document.component.html',
    providers: [Helper]
})
export class DocumentComponent implements OnInit {

    document_list: any[];
    title: any;
    button: any;
    heading_title: any;
    sort_field: string;
    sort_document: number;
    search_field: string;
    search_value: string;
    page: number;
    total_page: number;
    total_pages: number[];
    public message: string = "";
    public class: string;
    myLoading: boolean = true;
    ADMIN_DATA_ID: any;
    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }
    ngAfterViewInit() {

        jQuery(".chosen-select").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }

    ngOnInit() {
        this.helper.message()
        this.sort_field = "unique_id";
        this.sort_document = -1;
        this.search_field = "document_name";
        this.search_value = "";
        this.page = 1;

        this.filter(this.page);
        
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.title = this.helper.title;
        this.ADMIN_DATA_ID = this.helper.ADMIN_DATA_ID;
        
        
        
        this.document_list = [];
        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_document').on('change', (evnt, res_data) => {

            this.sort_document = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
    }

    filter(page) {
        this.page = page;
        this.helper.http.post('/admin/document_list', {
            sort_field: this.sort_field, sort_document: this.sort_document,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {

                this.document_list = [];
                this.total_pages = [];

            }
            else {

                this.document_list = res_data.documents;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }
    editDocument(id) {
        this.helper.router_id.admin.document_id = id;
        this.helper.router.navigate(['admin/document/edit']);

    }


    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

}
