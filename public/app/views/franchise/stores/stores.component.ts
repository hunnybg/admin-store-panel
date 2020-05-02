import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Helper} from "../../franchise_helper";
import {Http, Response} from '@angular/http';
declare var jQuery: any;
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
@Component({
    selector: 'app-stores',
    templateUrl: './stores.component.html',
    providers: [Helper]
})
export class FranchiseStoresComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;
    @ViewChild('mysmsModal')
    sms_modal: ModalComponent;
    @ViewChild('mynotificationModal')
    notification_modal: ModalComponent;

    store_list: any;
    title: any;
    button: any;
    heading_title: any;

    sort_field: string;
    sort_store: number;
    search_field: string;
    search_value: string;
    page: number;

    total_page: number;
    total_pages: number[];

    store_page_type: number;
    store_id: Object;
    type: number;
    wallet: number;
    content: string;
    public message: string = "";
    public class: string;
    myLoading: boolean = true;

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
        this.sort_store = -1;
        this.search_field = "name";
        this.search_value = "";
        this.page = 1;
        console.log(this.helper.route.snapshot.url[1]);
        if (this.helper.route.snapshot.url[1].path == 'stores') {
            this.store_page_type = 1;
        }
        else if (this.helper.route.snapshot.url[1].path == 'declined_store') {
            this.store_page_type = 2;
        }
        else if (this.helper.route.snapshot.url[1].path == 'business_off_store') {
            this.store_page_type = 3;
        }
        this.store_id = "";
        this.filter(this.page);

        this.type = 2;
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.store_list = [];
        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_store').on('change', (evnt, res_data) => {

            this.sort_store = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
    }
    filter(page) {
        this.page = page;
        var franchise = JSON.parse(localStorage.getItem('franchise'));
        console.log(franchise);
        this.helper.http.post('/admin/store_list_search_sort_franchises', {
            store_ids:franchise.store_ids,sort_field: this.sort_field, sort_store: this.sort_store, store_page_type: this.store_page_type,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            console.log(res_data);
            this.myLoading = false;
            if (res_data.success == false) {

                this.store_list = [];
                this.total_pages = [];
            }
            else {

                this.store_list = res_data.stores;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)


            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }
    open_modal(type, id) {

        this.store_id = id;
        this.type = type;
        this.modal.open();
        this.wallet = null;
    }
    
    open_sms_modal(type, id) {

        this.store_id = id;
        this.type = type;
        this.sms_modal.open();
        this.content = "";
    }
    SendSms(sms_data) {
        this.helper.http.post('/admin/send_sms', sms_data).map((res: Response) => res.json()).subscribe(res_data => {
            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.sms_modal.close();
                this.helper.message();
            }
            else {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
            }

        });
    }

    open_notification_modal(type, id) {

        this.store_id = id;
        this.type = type;
        this.notification_modal.open();
        this.content = "";
    }
    SendNotification(notification_data) {
        this.helper.http.post('/admin/send_notification', notification_data).map((res: Response) => res.json()).subscribe(res_data => {
            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.notification_modal.close();
                this.helper.message();
            }
            else {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
            }
        });
    }

    approved_decline(store_page_type, store_id) {

        this.helper.http.post('/api/franchise/approve_decline_business_store', {
            store_id: store_id,
            store_page_type: store_page_type
        }).map((res: Response) => res.json()).subscribe(res_data => {

            if (res_data.success == false) {

                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }

            }
            else {


                if (store_page_type == 1) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }


                    this.helper.router.navigate(['franchise/declined_store']);
                }
                else if (store_page_type == 2) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }


                    this.helper.router.navigate(['franchise/stores']);
                }
                else if (store_page_type == 3) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }


                    this.helper.router.navigate(['franchise/declined_store']);
                }

            }
        });
    }

    addStore(id) {
        this.helper.router_id.franchise.store_id = id;
        this.helper.router.navigate(['franchise/add_store']);
    }
    editStore(id) {
        this.helper.router_id.franchise.store_id = id;
        this.helper.router.navigate(['franchise/store/edit']);

    }
    viewStoreDetail(id) {
        this.helper.router_id.franchise.detail_store_id = id;
        this.helper.router.navigate(['franchise/store/view_detail']);

    }
    viewHistory(id, type) {
        this.helper.router_id.franchise.history_store_id = id;
        this.helper.router_id.franchise.page_type = type;
        this.helper.router.navigate(['franchise/store/view_history']);

    }
    viewItems(id) {
        this.helper.router_id.franchise.item_store_id = id;
        this.helper.router.navigate(['franchise/store_item']);

    }

    viewDocument(id, type) {
        this.helper.router_id.franchise.store_id = id;
        this.helper.router_id.franchise.document_type = type;
        this.helper.router.navigate(['franchise/store/view_document']);

    }


}
