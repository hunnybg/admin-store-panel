import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Helper } from "../../store_helper";
import { Response } from '@angular/http';
import { map } from 'rxjs/operators';

declare var jQuery: any;

@Component({
    selector: 'app-vaiter-earning',
    templateUrl: './vaiter_earning.component.html',
    providers: [Helper]
})

export class VaiterEarningComponent implements OnInit {

    title: any;
    button: any;
    ORDER_STATE: any;
    heading_title: any;
    start_date: any;
    end_date: any;
    week_date: string;
    myLoading: boolean = false;
    store_id: Object;
    server_token: String;
    search_field: string = '';
    vaiter_id: string;
    vaiter_list: any[] = [];
    order_payments: any[] = [];
    tip_total: number = 0;
    total_orders: number = 0;
    select_vaiter: boolean = false;
    
    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {
        jQuery(".chosen-select").chosen({ disable_search: true });
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 2000);
    }

    ngOnInit() {
        let token = this.helper.tokenService.getToken();
        if (!token || !token.token) {
            this.helper.router.navigate(['store/owner_dashboard']);
        }

        if (!JSON.parse(localStorage.getItem('store_document_ulpoaded')) && JSON.parse(localStorage.getItem('admin_store_document_ulpoaded'))) {
            this.helper.router.navigate(['store/upload_document']);
        }

        var store = JSON.parse(localStorage.getItem('store'));
        if (store !== null) {
            this.store_id = store._id
            this.server_token = store.server_token
            this.get_vaiter_list();
        }

        this.title = this.helper.title
        this.button = this.helper.button
        this.heading_title = this.helper.heading_title
        this.ORDER_STATE = this.helper.ORDER_STATE
        this.start_date = { formatted: '' };
        this.end_date = { formatted: '' };

        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {
            this.search_field = res_data.selected;
        });

    }



    get_vaiter_list() {
        this.myLoading = true;
        this.helper.http.post(this.helper.POST_METHOD.GET_ALL_VAITERS, { store_id: this.store_id, server_token: this.server_token }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            console.log(res_data)
            if (res_data.success) {
                this.vaiter_list = res_data.vaiters;
                setTimeout(function () {
                    jQuery(".chosen-select").trigger("chosen:updated");
                }, 1000);
            } else {
                this.vaiter_list = []
            }
        })
    }

    get_vaiter_tip_earning() {
        this.myLoading = true;
        if(this.search_field == ''){
            this.myLoading = false;
            this.select_vaiter = true;
            return;
        }
        this.select_vaiter = false;
        let json = {
            store_id: this.store_id,
            server_token: this.server_token,
            start_date: this.start_date.formatted,
            end_date: this.end_date.formatted,
            vaiter_id: this.search_field,
        }
        this.helper.http.post(this.helper.POST_METHOD.GET_TIP_EARNING, json).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            console.log(res_data)
            if (res_data.success) {
                this.order_payments = res_data.order_payments;
                this.tip_total = res_data.tip_total;
                this.total_orders = res_data.total_orders
            } else {
                this.order_payments = [];
                this.tip_total = 0;
                this.total_orders = 0;
            }
        });
    }
}