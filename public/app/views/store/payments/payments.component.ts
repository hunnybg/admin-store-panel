import { Component, OnInit, ViewContainerRef, ViewChild } from "@angular/core";
import { Helper } from "../../store_helper";
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Response } from '@angular/http';

declare var jQuery: any;
declare var c3: any;
declare var swal: any;


export interface BankAccount {
    account_number: String,
    routing_number: String,
    personal_id_number: String,
    state: String,
    city: string,
    postal_code: String,
    document
}

@Component({
    selector: 'app-payments',
    templateUrl: './payments.component.html',
    providers: [Helper]
})

export class PaymentsComponent implements OnInit {
    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    @ViewChild('oldPasswordModal')
    old_password_modal: ModalComponent;

    private new_bank_account: BankAccount;
    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    store_id: string = '';
    server_token: string = '';
    bank_account: any;
    image_uploaded: boolean = false;
    show_image_error: boolean = false;
    document_image;
    bank_detail_list: any[] = [];
    bank_detail_id;
    delete_bank_account: boolean = false;
    pay_to_store: number = 0;
    paid_to_store: number = 0;
    enable_withdraw: boolean = false;
    withdrawing: boolean = false;
    currency;
    add_bank_account: boolean = false;
    public formData = new FormData();
    myLoading: boolean = false;
    store_edit: any;
    formvalues: any;
    tranferred_history: any[] = [];
    DATE_FORMAT: any;
    sort: number;
    page: number;
    total_page: number;
    total_pages: number[];
    ngOnInit() {
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.validation_message = this.helper.validation_message;
        
        this.sort = -1;
        this.page = 1;

        this.new_bank_account = {
            account_number: '',
            routing_number: '',
            personal_id_number: '',
            state: '',
            city: '',
            postal_code: '',
            document: ''
        }

        var store = JSON.parse(localStorage.getItem('store'));
        if (store !== null && store !== undefined) {
            this.store_edit = store;
            this.currency = store.wallet_currency_code;
            this.getbankaccounts(store._id);
            this.get_pay_to_store();
            this.filter(this.page)
        } else {
            this.helper.router.navigate(['store/login']);
        }
    }



    change_image($event) {
        this.image_uploaded = false;
        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];

        if (image_url.type == "image/jpeg" || image_url.type == "image/jpg" || image_url.type == "image/png") {
            this.formData = new FormData();
            var reader = new FileReader();

            reader.onload = (e: any) => {
                if (this.add_bank_account) {
                    this.document_image = e.target.result;
                    this.new_bank_account.document = e.target.result;
                    this.image_uploaded = true;
                }
            }
            reader.readAsDataURL(image_url);
        }
    }

    old_password_update() {
        if (this.add_bank_account) {
            this.add_bank_details(this.store_edit.old_password);
        }
        else if (this.delete_bank_account) {
            this.delete_bank_details(this.store_edit.old_password)
        }
        else if (this.withdrawing) {
            this.withdraw(this.store_edit.old_password);
        }
        this.old_password_modal.close();
    }

    open_password_modal(form) {
        this.show_image_error = false;
        if (!this.image_uploaded) {
            this.show_image_error = true;
            return;
        }
        this.formvalues = form;
        this.formData = new FormData();
        let stringImage = this.document_image.replace("data:image/png;base64,", "")
        let stringImage2 = stringImage.replace("data:image/jpeg;base64,", "")
        this.formData.append('document', stringImage2);
        this.delete_bank_account = false;
        this.add_bank_account = true;
        console.log("open_password_modal")
        this.old_password_modal.open();
    }

    add_bank_details(password) {

        this.myLoading = true;
        let { _id, server_token, name, city_name, address } = this.store_edit;
        let { account_number, routing_number, personal_id_number, state, postal_code } = this.formvalues.value;
        this.formData.append('bank_holder_id', _id);
        this.formData.append('server_token', server_token);
        this.formData.append('bank_account_holder_name', name);
        this.formData.append('password', password);

        this.formData.append('account_number', account_number);
        this.formData.append('routing_number', routing_number);
        this.formData.append('personal_id_number', personal_id_number);
        this.formData.append('state', state);
        this.formData.append('city', city_name);
        this.formData.append('postal_code', postal_code);
        this.formData.append('gender', "male");
        this.formData.append('dob', "01-01-2000");
        this.formData.append('bank_holder_type', "2");
        this.formData.append('business_name', "Vaiter Inc. Private Limited");
        this.formData.append('social_id', "");
        this.formData.append('address', address);

        this.helper.http.post(this.helper.POST_METHOD.ADD_BANK_DETAILS, this.formData).map((res_data: Response) => res_data.json()).subscribe(res_data => {
            console.log(res_data)
            if (res_data.success) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.formvalues.reset();
                this.new_bank_account.document = '';
                this.add_bank_account = false;
                this.bank_detail_list.push(res_data.bank_detail)
            } else {
                if (res_data.stripe_error && res_data.stripe_error !== '') {
                    this.helper.data.storage = {
                        "message": res_data.stripe_error,
                        "class": "alert-danger"
                    }
                } else {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                }

            }
            this.myLoading = false;
            this.helper.message()
        })
    }

    getbankaccounts(id) {
        this.helper.http.post(this.helper.POST_METHOD.GET_BANK_DETAILS, { id: id, type: this.helper.ADMIN_DATA_ID.STORE }).map((res_data: Response) => res_data.json()).subscribe(res_data => {
            console.log(res_data)
            if (res_data.success == false) {
                this.bank_detail_list = [];
            }
            else {
                this.bank_detail_list = res_data.bank_detail;
            }
            this.myLoading = false;
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    deletebankaccount(id) {
        this.bank_detail_id = id;
        this.delete_bank_account = true;
        this.old_password_modal.open();
    }


    withdrawing_amount() {
        this.withdrawing = true;
        this.old_password_modal.open();
    }

    delete_bank_details(password) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(() => {
            this.myLoading = true;
            let json = {
                bank_holder_type: this.helper.ADMIN_DATA_ID.STORE,
                bank_holder_id: this.store_edit._id,
                bank_detail_id: this.bank_detail_id,
                password: password
            }
            this.helper.http.post(this.helper.POST_METHOD.DELETE_BANK_ACCOUNT, json).map((res_data: Response) => res_data.json()).subscribe(res_data => {
                console.log(res_data)
                if (res_data.success) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.bank_detail_list = res_data.bank_detail;
                } else {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                }
                this.myLoading = false;
                this.helper.message();
                this.delete_bank_account = false;
            })
        }).catch(swal.noop)
    }

    withdraw(password) {
        swal({
            title: 'Are you sure you want to Withdraw your earning?',
            text: `Amount : ${this.currency}${this.pay_to_store}. You won't be able to revert this.`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Pull Out!'
        }).then(() => {
            this.myLoading = true;
            let { _id, server_token } = this.store_edit;
            let json = {
                store_id: _id,
                password: password,
                amount: this.pay_to_store,
            }
            this.helper.http.post(this.helper.POST_METHOD.WITHDRAW_EARNING, json).map((res_data: Response) => res_data.json()).subscribe(res_data => {
                console.log(res_data)
                if (res_data.success) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.ngOnInit();
                } else {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                }
                this.helper.message();
                this.myLoading = false;
                this.withdrawing = false;
            })

        }).catch(swal.noop)
    }

    get_pay_to_store() {
        this.helper.http.post(this.helper.POST_METHOD.GET_PAY_TO_STORE, { store_id: this.store_edit._id, server_token: this.store_edit.server_token }).map((response: Response) => response.json()).subscribe(res_data => {
            if (res_data.success) {
                console.log(res_data);
                this.pay_to_store = res_data.pay_to_store;
                this.paid_to_store = res_data.paid_to_store;
            }
        })
    }

    filter(page) {
        this.helper.http.post(this.helper.POST_METHOD.GET_TRANSFERRED_HISTORY, { number_of_rec: 10,page: page , store_id: this.store_edit._id, server_token: this.store_edit.server_token }).map((response: Response) => response.json()).subscribe(res_data => {
            if (res_data.success) {
                console.log(res_data);
                this.tranferred_history = res_data.transfer_history;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            } else {
                this.tranferred_history = [];
                this.total_pages = [];
            }
        })
    }

}