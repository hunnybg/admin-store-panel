import { Component, OnInit, ViewContainerRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Helper } from "../../store_helper";
import { map } from 'rxjs/operators';
// import { Document } from "../upload_document/upload_document.component";
declare var jQuery: any;
declare var c3: any;
declare var swal: any;

export interface StoreEdit {
    store_id: string,
    server_token: string,
    name: string,
    email: String,
    old_password: string,
    new_password: String,
    login_by: string,
    social_id: any[],
    confirm_password: String,
    website_url: String,
    slogan: String,
    country_name: String,
    country_code: String,
    city_name: string,
    address: string,
    country_phone_code: String,
    phone: Number,
    store_delivery_name: String,
    latitude: Number,
    longitude: Number,
    image_url: String,
    referral_code: String,
    referral_credit: String,
    total_referred: Number,
    beacon_id: String
}

export interface OrderDetail {
    total_orders: Number,
    accepted_orders: Number,
    completed_orders: Number,
    cancelled_orders: Number,
    completed_order_percentage: Number
}
export interface Document {
    unique_code: string,
    expired_date: any,
    image_url: ''
}

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
    selector: 'profile',
    templateUrl: './profile.component.html',
    providers: [Helper]
})
export class ProfileComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;

    @ViewChild('oldPasswordModal')
    old_password_modal: ModalComponent;

    private store_edit: StoreEdit;
    private order_detail: OrderDetail;
    private new_bank_account: BankAccount;
    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    minimum_phone_number_length: number = 8;
    maximum_phone_number_length: number = 10;
    setting_data: any;
    store_detail: any;
    otp_for_email: number;
    otp_for_sms: number;
    store_data: any;
    opt_error_message: number;
    edit: Boolean;
    add_bank_account: boolean = false;
    formvalues;
    edit_document: any[] = [];
    document_list: any[] = [];
    old_image_url: string = '';
    private documentlist: Document;
    error_message: number = 0;
    myLoading: boolean = true;
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

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);

    }
    ngOnInit() {
        let token = this.helper.tokenService.getToken();
        if (!token || !token.token) {
            this.helper.router.navigate(['store/login']);
        }
        setTimeout(() => {
            let height = jQuery('.profile').height();
            jQuery('.document').height(height);
        }, 100);
        this.title = this.helper.title
        this.button = this.helper.button
        this.heading_title = this.helper.heading_title
        this.validation_message = this.helper.validation_message
        this.edit = false;

        this.store_edit = {
            store_id: "",
            server_token: "",
            name: "",
            email: "",
            old_password: "",
            new_password: "",
            confirm_password: "",
            login_by: "",
            social_id: [],
            website_url: "",
            slogan: "",
            country_name: "",
            country_code: "",
            city_name: "",
            address: "",
            country_phone_code: "",
            phone: null,
            store_delivery_name: "",
            latitude: null,
            longitude: null,
            image_url: "",
            referral_code: "",
            referral_credit: "",
            total_referred: 0,
            beacon_id: ''
        }
        this.order_detail = {
            total_orders: 0,
            accepted_orders: 0,
            completed_orders: 0,
            cancelled_orders: 0,
            completed_order_percentage: 0
        }

        this.documentlist = {
            unique_code: '',
            expired_date: null,
            image_url: ''
        }

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
        if (store !== null) {
            this.store_edit.store_id = store._id;
            this.store_edit.server_token = store.server_token;
            // this.getbankaccounts(store._id);
        }
        if (!JSON.parse(localStorage.getItem('store_document_ulpoaded')) && JSON.parse(localStorage.getItem('admin_store_document_ulpoaded'))) {
            this.helper.router.navigate(['store/upload_document']);
        }

        this.helper.http.post(this.helper.POST_METHOD.GET_SETTING_DETAIL, {}).pipe(map((response: Response) => response.json())).subscribe(res_data => {

            this.setting_data = res_data.setting

        },
            (error: any) => {
                this.helper.http_status(error)
            });

        this.helper.http.post(this.helper.POST_METHOD.GET_DOCUMENT_LIST, { type: 2, id: this.store_edit.store_id, server_token: this.store_edit.server_token }).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {
                this.document_list = [];
            }
            else {
                this.document_list = res_data.documents;
                this.document_list.forEach((document, index) => {
                    this.edit_document[index] = "false";

                    this.get_document_image(document.image_url, index)
                })


            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });

        // this.get_pay_to_store();

        this.helper.http.post(this.helper.POST_METHOD.GET_STORE_DATA, { store_id: this.store_edit.store_id, server_token: this.store_edit.server_token }).pipe(map((response: Response) => response.json())).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            }
            else {
                this.order_detail = res_data.order_detail;

                let chart31 = c3.generate({
                    bindto: '#c1',
                    data: {

                        columns: [
                            [this.title.completed_order, this.order_detail.completed_order_percentage]
                        ],
                        type: 'gauge',
                    },
                    legend: {
                        show: true
                    },
                    gauge: {
                        label: {
                            show: false // to turn off the min/max labels.
                        },
                        width: 30 // for adjusting arc thickness
                    },
                    color: {
                        pattern: ['#1e1e1e'], // the three color levels for the percentage values.

                    }
                });

                this.store_detail = res_data.store_detail;
                this.store_edit.name = res_data.store_detail.name;
                this.store_edit.login_by = res_data.store_detail.login_by;
                this.store_edit.social_id = res_data.store_detail.social_ids;
                this.store_edit.email = res_data.store_detail.email;
                this.store_edit.website_url = res_data.store_detail.website_url;
                this.store_edit.slogan = res_data.store_detail.slogan;
                this.store_edit.country_name = res_data.store_detail.country_details.country_name;
                this.store_edit.city_name = res_data.store_detail.city_details.city_name;
                this.store_edit.country_code = res_data.store_detail.country_details.country_code;
                this.store_edit.address = res_data.store_detail.address;
                this.store_edit.country_phone_code = res_data.store_detail.country_phone_code;
                this.store_edit.phone = res_data.store_detail.phone;
                this.store_edit.store_delivery_name = res_data.store_detail.delivery_details.delivery_name;
                this.store_edit.latitude = res_data.store_detail.location[0];
                this.store_edit.longitude = res_data.store_detail.location[1];
                this.store_edit.image_url = res_data.store_detail.image_url;
                this.store_edit.referral_code = res_data.store_detail.referral_code;
                this.store_edit.referral_credit = res_data.store_detail.wallet;
                this.store_edit.total_referred = res_data.store_detail.total_referrals;
                this.store_edit.beacon_id = res_data.store_detail.beacon_id;

                this.minimum_phone_number_length = res_data.store_detail.country_details.minimum_phone_number_length;
                this.maximum_phone_number_length = res_data.store_detail.country_details.maximum_phone_number_length;
                var country_code = res_data.store_detail.country_details.country_code;
                this.currency = res_data.store_detail.country_details.currency_sign;
                var autocompleteElm = <HTMLInputElement>document.getElementById('address');
                let autocomplete = new google.maps.places.Autocomplete((autocompleteElm), { types: [], componentRestrictions: { country: country_code } });

                autocomplete.addListener('place_changed', () => {
                    var place = autocomplete.getPlace();
                    var lat = place.geometry.location.lat();
                    var lng = place.geometry.location.lng();
                    this.helper.ngZone.run(() => {
                        this.store_edit.address = place.formatted_address
                        this.store_edit.latitude = lat
                        this.store_edit.longitude = lng
                    });
                });
            }

        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });





        jQuery(window).resize(function () {
            if (jQuery(window).width() < 454) {
                jQuery('.box').removeClass('col-xs-1');
                jQuery('.total').removeClass('col-xs-5');
                jQuery('.box').addClass('col-xs-2');
                jQuery('.total').addClass('col-xs-10');
                jQuery('.box1').css('padding', '')
                jQuery('.total1').css('padding', '')
            } else {
                jQuery('.box').removeClass('col-xs-2');
                jQuery('.total').removeClass('col-xs-10');
                jQuery('.box').addClass('col-xs-1');
                jQuery('.total').addClass('col-xs-5');
                jQuery('.box1').css('padding', 0)
                jQuery('.total1').css('padding', 0)
            }
        });
        setTimeout(function () {
            if (jQuery(window).width() < 454) {
                jQuery('.box').removeClass('col-xs-1');
                jQuery('.total').removeClass('col-xs-5');
                jQuery('.box').addClass('col-xs-2');
                jQuery('.total').addClass('col-xs-10');
                jQuery('.box1').css('padding', '')
                jQuery('.total1').css('padding', '')
            } else {
                jQuery('.box').removeClass('col-xs-2');
                jQuery('.total').removeClass('col-xs-10');
                jQuery('.box').addClass('col-xs-1');
                jQuery('.total').addClass('col-xs-5');
                jQuery('.box1').css('padding', 0)
                jQuery('.total1').css('padding', 0)
            }
        }, 500);
    }

    public formData = new FormData();

    image_update($event, document_index) {

        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];
        this.formData.append('image_url', image_url);

        var reader = new FileReader();

        reader.onload = (e: any) => {
            this.document_list[document_index].image_url = e.target.result;
            this.documentlist.image_url = e.target.result;
            jQuery('.document' + document_index).attr('src', e.target.result)
        }
        reader.readAsDataURL(image_url);

    }

    editDocument(document, document_index) {
        this.get_document_image(document.image_url, document_index);
        this.old_image_url = document.image_url;
        this.edit_document.fill("")
        this.edit_document[document_index] = "true"
        this.documentlist.unique_code = document.unique_code;
        this.documentlist.image_url = document.image_url;
        if (document.expired_date != null) {
            var date = new Date(document.expired_date);
            this.documentlist.expired_date = { date: { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }, formatted: date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear() };

        }
    }

    get_document_image(url, document_index) {
        if (url == '') {
            jQuery('.document' + document_index).attr('src', 'default.png')
        } else {
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.setRequestHeader("token", this.store_edit.server_token);
            oReq.responseType = "blob";
            oReq.onload = function (oEvent) {
                var arrayBuffer = oReq.response; // Note: not oReq.responseText
                if (arrayBuffer) {
                    jQuery('.document' + document_index).attr('src', URL.createObjectURL(arrayBuffer));
                } else {
                    jQuery('.document' + document_index).attr('src', 'default.png');
                }
            };
            oReq.send(null);
        }
    }

    updateDocument(document, document_index) {
        console.log(this.documentlist.unique_code)
        if (this.documentlist.image_url == '') {
            this.error_message = 1;
        }
        else if (document.document_details.is_expired_date && this.documentlist.expired_date == null) {
            this.error_message = 2;
        }
        else if (document.document_details.is_unique_code && this.documentlist.unique_code == '') {
            this.error_message = 3;
        }
        else {
            this.myLoading = true;
            this.error_message = 0;
            this.formData.append('type', "2");
            this.formData.append('unique_code', this.documentlist.unique_code);
            this.formData.append('document_id', document._id);
            this.formData.append('id', this.store_edit.store_id);
            this.formData.append('server_token', this.store_edit.server_token);
            if (this.documentlist.expired_date != null) {
                this.formData.append('expired_date', this.documentlist.expired_date.formatted);
            }

            this.helper.http.post(this.helper.POST_METHOD.UPLOAD_DOCUMENT, this.formData).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                this.formData = new FormData();
                this.edit_document.fill("false")
                this.myLoading = false;
                if (res_data.success) {
                    this.document_list[document_index].image_url = res_data.image_url;

                    this.get_document_image(res_data.image_url, document_index)

                    this.document_list[document_index].unique_code = res_data.unique_code;

                    this.document_list[document_index].expired_date = res_data.expired_date;
                    localStorage.setItem('store_document_ulpoaded', res_data.is_document_uploaded);

                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.message();

                }
                else {
                    this.document_list[document_index].image_url = this.old_image_url;
                    this.get_document_image(this.old_image_url, document_index)

                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message();
                }
            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });

        }

    }

    change_image($event) {
        this.image_uploaded = false;
        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];

        if (image_url.type == "image/jpeg" || image_url.type == "image/jpg" || image_url.type == "image/png") {
            this.formData = new FormData();
            if (this.add_bank_account == false) {
                this.formData.append('document', image_url);
            }
            var reader = new FileReader();

            reader.onload = (e: any) => {
                if (this.add_bank_account) {
                    this.document_image = e.target.result;
                    this.new_bank_account.document = e.target.result;
                    this.image_uploaded = true;
                } else {
                    this.store_edit.image_url = e.target.result;
                }
            }
            reader.readAsDataURL(image_url);
        }
    }

    old_password_update() {
        // if (this.add_bank_account) {
        //     this.add_bank_details(this.store_edit.old_password);
        // }
        // else if (this.delete_bank_account) {
        //     this.delete_bank_details(this.store_edit.old_password)
        // }
        // else if(this.withdrawing){
        //     this.withdraw(this.store_edit.old_password);
        // }
        // else {
        this.UpdateStoreDetail(this.store_edit)
        // }
        this.old_password_modal.close();
    }

    UpdateStore(store_data) {

        if (this.store_edit.social_id.length == 0) {
            this.old_password_modal.open();
        } else {
            this.UpdateStoreDetail(store_data)
        }
    }

    UpdateStoreDetail(store_data) {
        this.store_data = store_data
        var store = JSON.parse(localStorage.getItem('store'));
        if ((this.setting_data.is_store_sms_verification == true && store_data.phone !== store.phone) && (this.setting_data.is_store_mail_verification == true && store_data.email !== store.email)) {
            var otp_json = { type: 2, email: this.store_data.email, phone: this.store_data.phone }
            this.generate_otp(otp_json)
        }
        else if (this.setting_data.is_store_sms_verification == true && store_data.phone !== store.phone) {
            this.generate_otp({ type: 2, phone: this.store_data.phone })
        }
        else if (this.setting_data.is_store_mail_verification == true && store_data.email !== store.email) {
            this.generate_otp({ type: 2, email: this.store_data.email })
        }
        else {
            this.store_update(store_data)
        }
    }

    generate_otp(otp_json) {
        this.myLoading = true;
        var store = JSON.parse(localStorage.getItem('store'));
        this.helper.http.post(this.helper.POST_METHOD.ADMIN_OTP_VERIFICATION, otp_json).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.myLoading = false;
            if (res_data.success == true) {
                this.helper.string_log("email", res_data.otp_for_email)
                this.helper.string_log("sms", res_data.otp_for_sms)
                this.modal.open();
                this.otp_for_email = res_data.otp_for_email
                this.otp_for_sms = res_data.otp_for_sms

                if (this.store_data.phone == store.phone || this.setting_data.is_store_sms_verification == false) {
                    jQuery("#otp_for_sms").css("display", "none");
                }

                if (this.store_data.email == store.email || this.setting_data.is_store_mail_verification == false) {
                    jQuery("#otp_for_email").css("display", "none");
                }
            }
            else {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    otp_var(otp) {
        if (otp.sms_otp == undefined) {
            if (otp.email_otp == this.otp_for_email) {
                this.store_update(this.store_data)
                //this.otp_verified({store_id :this.store_data.store_id , email :this.store_data.email , server_token :this.store_data.server_token, is_email_verified:true})
            }
            else {
                this.opt_error_message = 1
            }
        }
        else if (otp.email_otp == undefined) {
            if (otp.sms_otp == this.otp_for_sms) {
                this.store_update(this.store_data)
                //this.otp_verified({store_id :this.store_data.store_id , phone :this.store_data.phone , server_token :this.store_data.server_token, is_phone_number_verified:true})
            }
            else {
                this.opt_error_message = 2
            }
        }
        else {
            if (otp.sms_otp == this.otp_for_sms && otp.email_otp == this.otp_for_email) {
                this.store_update(this.store_data)
                //this.otp_verified({store_id :this.store_data.store_id , email :this.store_data.email , phone : this.store_data.phone , server_token :this.store_data.server_token, is_email_verified:true , is_phone_number_verified:true})
            }
            else {
                this.opt_error_message = 3
            }
        }
    }

    otp_verified(otp_verified_json) {
        this.myLoading = true;
        this.helper.http.post(this.helper.POST_METHOD.OTP_VERIFICATION, otp_verified_json).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == true) {
                this.store_update(this.store_data)
            }
            else {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            }

        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    store_update(store_data) {
        console.log(store_data)
        console.log(this.store_edit.social_id)
        console.log(this.store_edit.login_by)
        this.myLoading = true;
        this.modal.close();
        this.formData.append('store_id', store_data.store_id);
        this.formData.append('server_token', store_data.server_token);
        this.formData.append('phone', store_data.phone);
        this.formData.append('email', store_data.email.trim());
        this.formData.append('old_password', this.store_edit.old_password);
        this.formData.append('new_password', store_data.new_password);
        this.formData.append('name', store_data.name.trim());
        this.formData.append('address', store_data.address.trim());
        this.formData.append('latitude', store_data.latitude);
        this.formData.append('longitude', store_data.longitude);
        this.formData.append('website_url', store_data.website_url.trim());
        this.formData.append('slogan', store_data.slogan.trim());

        if (this.store_edit.social_id.length == 0) {
            this.formData.append('social_id', '');
        } else {
            this.formData.append('social_id', this.store_edit.social_id[0]);
        }

        this.formData.append('login_by', this.store_edit.login_by);

        this.helper.http.post(this.helper.POST_METHOD.UPDATE, this.formData).pipe(map((response: Response) => response.json())).subscribe(res_data => {

            this.myLoading = false;
            this.store_edit.old_password = "";
            this.store_edit.new_password = "";
            this.store_edit.confirm_password = "";
            jQuery('#remove').click();
            this.edit = false;
            this.formData = new FormData();
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()

                this.store_edit.name = this.store_detail.name;
                this.store_edit.website_url = this.store_detail.website_url;
                this.store_edit.slogan = this.store_detail.slogan;
                this.store_edit.address = this.store_detail.address;
                this.store_edit.phone = this.store_detail.phone;
                this.store_edit.email = this.store_detail.email;
                this.store_edit.latitude = this.store_detail.location[0];
                this.store_edit.longitude = this.store_detail.location[1];
                this.store_edit.image_url = this.store_detail.image_url;
                this.store_edit.beacon_id = this.store_detail.beacon_id;
            }
            else {
                this.helper.user_cart.name = res_data.store.name;
                this.helper.user_cart.image = res_data.store.image_url;
                localStorage.setItem('store', JSON.stringify(res_data.store));
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message()
                // location.reload();

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
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

    // add_bank_details(password) {

    //     this.myLoading = true;
    //     let { store_id, server_token, name, city_name, address } = this.store_edit;
    //     let { account_number, routing_number, personal_id_number, state, postal_code } = this.formvalues.value;
    //     this.formData.append('bank_holder_id', store_id);
    //     this.formData.append('server_token', server_token);
    //     this.formData.append('bank_account_holder_name', name);
    //     this.formData.append('password', password);

    //     this.formData.append('account_number', account_number);
    //     this.formData.append('routing_number', routing_number);
    //     this.formData.append('personal_id_number', personal_id_number);
    //     this.formData.append('state', state);
    //     this.formData.append('city', city_name);
    //     this.formData.append('postal_code', postal_code);
    //     this.formData.append('gender', "male");
    //     this.formData.append('dob', "01-01-2000");
    //     this.formData.append('bank_holder_type', "2");
    //     this.formData.append('business_name', "Vaiter Inc. Private Limited");
    //     this.formData.append('social_id', "");
    //     this.formData.append('address', address);

    //     this.helper.http.post(this.helper.POST_METHOD.ADD_BANK_DETAILS, this.formData).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
    //         console.log(res_data)
    //         if (res_data.success) {
    //             this.helper.data.storage = {
    //                 "message": this.helper.MESSAGE_CODE[res_data.message],
    //                 "class": "alert-info"
    //             }
    //             this.formvalues.reset();
    //             this.new_bank_account.document = '';
    //             this.add_bank_account = false;
    //             this.bank_detail_list.push(res_data.bank_detail)
    //         } else {
    //             if(res_data.stripe_error && res_data.stripe_error !== ''){
    //                 this.helper.data.storage = {
    //                     "message": res_data.stripe_error,
    //                     "class": "alert-danger"
    //                 }
    //             }else{
    //                 this.helper.data.storage = {
    //                     "code": res_data.error_code,
    //                     "message": this.helper.ERROR_CODE[res_data.error_code],
    //                     "class": "alert-danger"
    //                 }
    //             }

    //         }
    //         this.myLoading = false;
    //         this.helper.message()
    //     })
    // }

    // getbankaccounts(id) {
    //     this.helper.http.post(this.helper.POST_METHOD.GET_BANK_DETAILS, { id: id, type: this.helper.ADMIN_DATA_ID.STORE }).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
    //         console.log(res_data)
    //         if (res_data.success == false) {
    //             this.bank_detail_list = [];
    //         }
    //         else {
    //             this.bank_detail_list = res_data.bank_detail;
    //         }
    //         this.myLoading = false;
    //     },
    //         (error: any) => {
    //             this.myLoading = false;
    //             this.helper.http_status(error)
    //         });
    // }

    // deletebankaccount(id) {
    //     this.bank_detail_id = id;
    //     this.delete_bank_account = true;
    //     this.old_password_modal.open();
    // }


    // withdrawing_amount(){
    //     this.withdrawing = true;
    //     this.old_password_modal.open();
    // }

    // delete_bank_details(password) {
    //     swal({
    //         title: 'Are you sure?',
    //         text: "You won't be able to revert this!",
    //         type: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#3085d6',
    //         cancelButtonColor: '#d33',
    //         confirmButtonText: 'Yes, delete it!'
    //     }).then(() => {
    //         this.myLoading = true;
    //         let json = {
    //             bank_holder_type: this.helper.ADMIN_DATA_ID.STORE,
    //             bank_holder_id: this.store_edit.store_id,
    //             bank_detail_id: this.bank_detail_id,
    //             password: password
    //         }
    //         this.helper.http.post(this.helper.POST_METHOD.DELETE_BANK_ACCOUNT, json).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
    //             console.log(res_data)
    //             if (res_data.success) {
    //                 this.helper.data.storage = {
    //                     "message": this.helper.MESSAGE_CODE[res_data.message],
    //                     "class": "alert-info"
    //                 }
    //                 this.bank_detail_list = res_data.bank_detail;
    //             } else {
    //                 this.helper.data.storage = {
    //                     "code": res_data.error_code,
    //                     "message": this.helper.ERROR_CODE[res_data.error_code],
    //                     "class": "alert-danger"
    //                 }
    //             }
    //             this.myLoading = false;
    //             this.helper.message();
    //             this.delete_bank_account = false;
    //         })
    //     }).catch(swal.noop)
    // }

    // withdraw(password){
    //     swal({
    //         title: 'Are you sure you want to Withdraw your earning?',
    //         text: `Amount : ${this.currency}${this.pay_to_store}. You won't be able to revert this.`,
    //         type: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#3085d6',
    //         cancelButtonColor: '#d33',
    //         confirmButtonText: 'Yes, Pull Out!'
    //     }).then(() => {
    //         this.myLoading = true;
    //         let { store_id, server_token  } = this.store_edit;
    //         let json = {
    //             store_id : store_id,
    //             password : password,
    //             amount : this.pay_to_store,
    //         }
    //         this.helper.http.post(this.helper.POST_METHOD.WITHDRAW_EARNING, json).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
    //             console.log(res_data)
    //             if (res_data.success) {
    //                 this.helper.data.storage = {
    //                     "message": this.helper.MESSAGE_CODE[res_data.message],
    //                     "class": "alert-info"
    //                 }
    //                 this.ngOnInit();
    //             } else {
    //                 this.helper.data.storage = {
    //                     "code": res_data.error_code,
    //                     "message": this.helper.ERROR_CODE[res_data.error_code],
    //                     "class": "alert-danger"
    //                 }
    //             }
    //             this.helper.message();
    //             this.myLoading = false;
    //             this.withdrawing = false;
    //         })

    //     }).catch(swal.noop)
    // }
    // get_pay_to_store(){
    //     this.helper.http.post(this.helper.POST_METHOD.GET_PAY_TO_STORE, {store_id :this.store_edit.store_id , server_token: this.store_edit.server_token}).pipe(map((response: Response) => response.json())).subscribe(res_data => {
    //         if(res_data.success){
    //             console.log(res_data);
    //             this.pay_to_store = res_data.pay_to_store;
    //             this.paid_to_store = res_data.paid_to_store;
    //         }
    //     })
    // }
}
  