import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-wallet_request',
    templateUrl: './wallet_request.component.html',
    providers: [Helper]
})
export class WalletRequestComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;

    title: any;
    button: any;
    ORDER_STATE: any;
    DATE_FORMAT: any;
    WALLET_REQUEST_STATUS: any;
    heading_title: any;
    status: any;
    wallet_request_status: any;
    wallet_request_list: any[];
    sort_field: string;
    sort_wallet_request: number;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    total_page: number;
    total_pages: number[];
    myLoading: boolean = true;
    interval: any;

    wallet_request_id: Object;

    approved_requested_wallet_amount: number;
    transaction_details: string;

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
        this.sort_field = "unique_id";
        this.sort_wallet_request = -1;
        this.search_field = "provider_detail.first_name";
        this.search_value = "";
        this.start_date = '';
        this.end_date = '';
        this.page = 1;
        this.helper.message();
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.ORDER_STATE = this.helper.ORDER_STATE
        this.WALLET_REQUEST_STATUS = this.helper.WALLET_REQUEST_STATUS
        this.DATE_FORMAT = this.helper.DATE_FORMAT
        this.status = this.helper.status
        this.wallet_request_status = this.helper.wallet_request_status
        this.title = this.helper.title
        this.wallet_request_list = [];
        this.wallet_request_id = "";

        this.walletRequestDetail()

        this.interval = setInterval(() => {
            this.walletRequestDetail()
        }, this.helper.TIMEOUT.NEW_ORDER_REQUEST);

        this.wallet_request(1);

        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_wallet_request').on('change', (evnt, res_data) => {

            this.sort_wallet_request = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
    }




    wallet_request(page) {
        this.myLoading = true;
        this.page = page;
        this.helper.http.post('/admin/get_wallet_request_list_search_sort', {
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_wallet_request: this.sort_wallet_request,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.wallet_request_list = [];
                this.total_pages = [];
            }
            else {
                this.wallet_request_list = res_data.wallet_request;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }


    ngOnDestroy() {
        clearInterval(this.interval);
    }


    walletRequestDetail() {
        this.helper.http.post('/admin/get_wallet_request_list_search_sort', {
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_wallet_request: this.sort_wallet_request,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {
                this.wallet_request_list = [];
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
            else {
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)

                this.wallet_request_list.forEach((value, index) => {
                    var new_index = res_data.wallet_request.findIndex(x => x._id == this.wallet_request_list[index]._id)
                    if (new_index == -1) {
                        this.wallet_request_list.splice(index, 1)
                    }
                    else {
                        this.wallet_request_list[index].wallet_status = res_data.wallet_request[new_index].wallet_status;

                    }
                });

                res_data.wallet_request.forEach((new_value, index) => {
                    var aaa = this.wallet_request_list.findIndex(x => x._id == res_data.wallet_request[index]._id)

                    if (aaa == -1) {
                        this.wallet_request_list.push(new_value)
                    }

                });
            }
        },
            (error: any) => {
                this.helper.http_status(error)
            });
    }


    viewBankDetail(id) {
        this.helper.router_id.admin.wallet_request_bank_detail_id = id;
        this.helper.router.navigate(['/admin/view_bank_detail']);
    }



    open_modal(id) {
        this.wallet_request_id = id;
        this.modal.open();
        var index = this.wallet_request_list.findIndex(x => x._id == id);
        this.approved_requested_wallet_amount = this.wallet_request_list[index].requested_wallet_amount;

    }

    TransferWalletRequestAmount(add_wallet_request_data) {
        this.helper.http.post('/admin/transfer_wallet_request_amount', add_wallet_request_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.modal.close();
                console.log(res_data.success);
                var index = this.wallet_request_list.findIndex(x => x._id == add_wallet_request_data.wallet_request_id);
                this.wallet_request_list[index].wallet_status = res_data.wallet_request.wallet_status;

            }

        });
    }

    CompleteWalletRequest(data) {
        this.myLoading = true;
        this.helper.http.post('/admin/complete_wallet_request_amount', {id: data.wallet_request_id, wallet_status: data.wallet_status}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
            }
            else {
                console.log(res_data.success);
                var index = this.wallet_request_list.findIndex(x => x._id == data.wallet_request_id);
                this.wallet_request_list[index].wallet_status = res_data.wallet_request.wallet_status;

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });

    }


    AcceptWalletRequest(data) {
        this.myLoading = true;
        this.helper.http.post('/admin/approve_wallet_request_amount', {id: data.wallet_request_id, wallet_status: data.wallet_status}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {

                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
            }
            else {
                console.log(res_data.success);
                var index = this.wallet_request_list.findIndex(x => x._id == data.wallet_request_id);
                this.wallet_request_list[index].wallet_status = res_data.wallet_request.wallet_status;

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });

    }


    CancleWalletRequest(data) {
        this.myLoading = true;
        this.helper.http.post('/admin/cancel_wallet_request', {id: data.wallet_request_id, wallet_status: data.wallet_status, type: 1}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            console.log(data);
            console.log(res_data.success);
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
            }
            else {
                this.helper.data.storage = {
                    "code": res_data.message,
                    "message": this.helper.ERROR_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message()
                var index = this.wallet_request_list.findIndex(x => x._id == data.wallet_request_id);
                this.wallet_request_list[index].wallet_status = res_data.wallet_request.wallet_status;

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }



}
