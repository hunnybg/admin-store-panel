import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Helper} from "../../helper";
import {Http, Response} from '@angular/http';
import {StoreAddServiceComponent} from "../add_service/add_service.component";
declare var jQuery: any;
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-service',
    templateUrl: './service.component.html',
    providers: [Helper]
})
export class StoreServiceComponent implements OnInit {

    service_list: any[];
    title: any;
    button: any;
    heading_title: any;
    sort_field: string;
    sort_service: number;
    search_field: string;
    search_value: string;
    page: number;
    total_page: number;
    total_pages: number[];
    myLoading: boolean = true;
    store_id: string = '';
    server_token: string = '';

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }
    ngAfterViewInit() {

        jQuery(".chosen-select").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }

    ngOnInit() {
        if(this.helper.data.storage.message !== undefined){
            this.helper.message();
        }
        this.sort_field = "unique_id";
        this.sort_service = -1;
        this.search_field = "country_details.country_name";
        this.search_value = "";
        this.page = 1;
        
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.service_list = [];
        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_service').on('change', (evnt, res_data) => {

            this.sort_service = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });

        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.store_id= store._id;
            this.server_token= store.server_token;
        }
        this.filter(this.page);
    }

    filter(page) {
        this.page = page;
        this.myLoading=true;
        this.helper.http.post('/admin/service_list', {
            type_id: this.store_id,
            sort_field: this.sort_field, sort_service: this.sort_service,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {

                this.service_list = [];
                this.total_pages = [];

            }
            else {

                this.service_list = res_data.service;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    editService(id) {
        this.helper.router_id.admin.service_id = id;
        this.helper.router.navigate(['store/service/edit']);

    }
    viewServiceDetail(id) {
        this.helper.router_id.admin.service_id = id;
        this.helper.router.navigate(['store/service/view_detail']);
    }

    change_default(index, event){
        if(event){
            this.helper.http.post('/admin/select_default_service', {service_id: this.service_list[index]._id, is_default: event, type_id: this.service_list[index].type_id, city_id: this.service_list[index].city_id}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.filter(this.page);
            });
        } else {
            this.service_list[index].is_default = true;
        }
    }
}
