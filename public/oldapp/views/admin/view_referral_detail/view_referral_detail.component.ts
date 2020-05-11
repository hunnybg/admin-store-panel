import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-view_referral_detail',
    templateUrl: './view_referral_detail.component.html',
    providers: [Helper]
})
export class ViewReferralDetailComponent implements OnInit {

    title: any;
    button: any;

    heading_title: any;
    DATE_FORMAT: any;
    //status: any;
    referral_list: any[];
    //referred_referral_list:any[];
    sort_field: string;
    sort_referral: number;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    total_page: number;
    total_pages: number[];
    hide_referral_detail: any[];
    value: number;
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
        this.sort_field = "user_details.first_name";
        this.sort_referral = -1;
        this.search_field = "user_details.first_name";
        this.search_value = "";
        this.start_date = '';
        this.end_date = '';
        this.page = 1


        this.helper.message();

        this.hide_referral_detail = [];
        this.value = 0;

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.title = this.helper.title;
        this.DATE_FORMAT = this.helper.DATE_FORMAT;

        this.referral_list = [];
        //this.referred_referral_list = [];


        this.referral_list_detail(1)

        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_referral').on('change', (evnt, res_data) => {

            this.sort_referral = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    referral_list_detail(page) {
        this.page = page;
        this.helper.http.post('/admin/get_referral_detail', {
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_referral: this.sort_referral,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {

                this.referral_list = [];
                this.total_pages = [];
            }
            else {

                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)

                this.referral_list = res_data.referral_codes;
                
                this.referral_list.forEach((ref, index) => {
                    this.hide_referral_detail[index] = "true";
                    //jQuery('.referral' + index).hide(1000);
                    console.log(this.hide_referral_detail[index]);
                })

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    hide_referral_details(referral_index) {
        this.hide_referral_detail[referral_index] = 'true'
        console.log("hide :" + this.hide_referral_detail[referral_index]);
        jQuery('.referral' + referral_index).hide(1000);
    }

    show_referral_details(referral_index) {
        this.hide_referral_detail[referral_index] = 'false'
        console.log("show :" + this.hide_referral_detail[referral_index]);
        jQuery('.referral' + referral_index).show(1000);
    }


}
