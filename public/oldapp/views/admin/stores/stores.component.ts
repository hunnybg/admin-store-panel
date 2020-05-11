import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Helper} from "../../helper";
import {Http, Response} from '@angular/http';
declare var jQuery: any;
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import { map } from 'rxjs/operators';

export interface Document {
    unique_code: String,
    expired_date: any,
    image_url: ''
}

@Component({
    selector: 'app-stores',
    templateUrl: './stores.component.html',
    providers: [Helper]
})
export class StoresComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;
    @ViewChild('mysmsModal')
    sms_modal: ModalComponent;
    @ViewChild('mynotificationModal')
    notification_modal: ModalComponent;
    
    @ViewChild('document_full_image')
    document_full_image: ModalComponent;

    selected_document_index: number;
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

    store_detail: any = {};
    is_edit: boolean = false;
    formData = new FormData();
    selected_tab: number = 1;
    number_of_rec: number = 10;
    document_list: any[] = [];
    edit_document: any[] = [];
    old_image_url: string = '';
    error_message: number = 0;
    private documentlist: Document;
    referral_history: any[] = [];
    review_list: any[] = [];
    bank_detail_list: any[] = [];

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

        this.documentlist = {
            unique_code: '',
            expired_date: null,
            image_url: ''
        }
        jQuery("#admin_profit_mode").chosen({disable_search: true});
        setTimeout(function () {
            jQuery("#admin_profit_mode").trigger("chosen:updated");
        });

        jQuery(this.helper.elementRef.nativeElement).find('#admin_profit_mode').on('change', (evnt, res_data) => {
            this.store_detail.admin_profit_mode_on_store = res_data.selected
        });


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
        jQuery(this.helper.elementRef.nativeElement).find('#number_of_rec').on('change', (evnt, res_data) => {
            this.number_of_rec = res_data.selected;
            this.filter(1)
        });
    }

    change_page_type(store_page_type){
        this.store_page_type = store_page_type;
        this.filter(1);
    }

    show_full_image(image_url, document_index){
        this.selected_document_index = document_index;
        this.document_full_image.open();
        this.get_document_image(image_url, document_index);
    }

    edit_data(){
        this.is_edit = true;
        jQuery(".chosen-select").chosen({disable_search: true});
        setTimeout(() =>{
            jQuery(".chosen-select").trigger("chosen:updated");
            jQuery(this.helper.elementRef.nativeElement).find('#admin_profit_mode').on('change', (evnt, res_data) => {
                this.store_detail.admin_profit_mode_on_store = res_data.selected
            });
        }, 1000);
    }

    filter(page) {
        this.page = page;
        this.helper.http.post('/admin/store_list_search_sort', {
            sort_field: this.sort_field, sort_store: this.sort_store, store_page_type: this.store_page_type,number_of_rec: this.number_of_rec,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.store_list = [];
                this.total_pages = [];
                this.store_detail = {};
            }
            else {
                this.store_list = res_data.stores;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                if(this.store_list.length > 0){
                    this.get_store_detail(this.store_list[0]._id);
                } else {
                    this.store_detail = {};
                }
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    get_store_detail(id){
        this.selected_tab = 1;
        let index = this.store_list.findIndex((store)=>store._id==id);
        this.store_detail = JSON.parse(JSON.stringify(this.store_list[index]));
        if(!this.store_detail.is_store_can_add_provider){
            this.store_detail.is_store_can_add_provider = false;
        }
        if(!this.store_detail.is_store_can_complete_order){
            this.store_detail.is_store_can_complete_order = false;
        }
    }

    update_store_detail(){
        this.formData.append('store_id', this.store_detail._id);
        this.formData.append('phone', this.store_detail.phone);
        this.formData.append('email', this.store_detail.email);
        this.formData.append('name', this.store_detail.name);
        this.formData.append('website_url', this.store_detail.website_url);
        this.formData.append('slogan', this.store_detail.slogan);
        this.formData.append('admin_profit_mode_on_store', this.store_detail.admin_profit_mode_on_store);
        this.formData.append('admin_profit_value_on_store', this.store_detail.admin_profit_value_on_store);
        this.formData.append('is_store_can_add_provider', this.store_detail.is_store_can_add_provider);
        this.formData.append('is_store_can_complete_order', this.store_detail.is_store_can_complete_order);
        this.formData.append('is_email_verified', this.store_detail.is_email_verified);
        this.formData.append('is_phone_number_verified', this.store_detail.is_phone_number_verified);
        this.formData.append('is_document_uploaded', this.store_detail.is_document_uploaded);
        this.helper.http.post('/admin/update_store', this.formData).pipe(map((response: Response) => response.json())).subscribe(res_data => {
            this.myLoading = false;
            this.formData = new FormData();
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            } else {
                let user_index = this.store_list.findIndex((x)=>x._id == this.store_detail._id);
                this.store_list[user_index] = JSON.parse(JSON.stringify(this.store_detail));
                this.is_edit = false;
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
            }
            this.helper.message();
        });
    }

    open_modal(type, id) {
        this.store_id = id;
        this.type = type;
        this.modal.open();
        this.wallet = null;
    }

    AddWallet(add_wallet_data) {
        this.helper.http.post('/admin/add_wallet', add_wallet_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.modal.close();
                this.helper.message();
                var index = this.store_list.findIndex(x => x._id == add_wallet_data.store_id);
                this.store_list[index].wallet = this.store_list[index].wallet + +Number(add_wallet_data.wallet).toFixed(2);
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
    change_image($event) {

        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];

        if (image_url.type == "image/jpeg" || image_url.type == "image/jpg" || image_url.type == "image/png") {
            this.formData = new FormData();
            this.formData.append('image_url', image_url);

            var reader = new FileReader();

            reader.onload = (e: any) => {
                this.store_detail.image_url = e.target.result
            }
            reader.readAsDataURL(image_url);
        }
    }

    open_sms_modal(type, id) {
        this.store_id = id;
        this.type = type;
        this.sms_modal.open();
        this.content = "";
    }
    SendSms(sms_data) {
        this.helper.http.post('/admin/send_sms', sms_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
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
        this.helper.http.post('/admin/send_notification', notification_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
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

        this.helper.http.post('/admin/approve_decline_store', {
            store_id: store_id,
            store_page_type: store_page_type
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == false) {

                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            }
            else {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                let user_index = this.store_list.findIndex((x)=>x._id==store_id);
                this.store_list.splice(user_index, 1);

                if(this.store_list.length>0){
                    this.get_store_detail(this.store_list[0]._id);
                } else{
                    this.store_detail = {};
                }
            }
            this.helper.message();
        });
    }

    get_document_list(){
        this.is_edit = false;
        this.selected_tab = 2;
        this.helper.http.post('/admin/view_document_list', {id: this.store_detail._id, type: 2}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
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
            this.documentlist.expired_date = {date: {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()}, formatted: date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()};

        }
    }

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

    get_document_image(url, document_index) {
        if (url == '') {
            jQuery('.document' + document_index).attr('src', 'default.png')
        } else {
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.setRequestHeader("type", 'admin');
            oReq.setRequestHeader("token", this.store_detail.server_token);
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
            this.formData.append('type', this.type);
            this.formData.append('unique_code', this.documentlist.unique_code);
            this.formData.append('document_id', document._id);
            this.formData.append('id', this.store_detail._id);
            this.formData.append('server_token', this.store_detail.server_token);
            if (this.documentlist.expired_date != null) {
                this.formData.append('expired_date', this.documentlist.expired_date.formatted);
            }

            this.helper.http.post('/admin/upload_document', this.formData).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

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

    editStore(id) {
        this.helper.router_id.admin.store_id = id;
        this.helper.router.navigate(['admin/store/edit']);

    }
    viewStoreDetail(id) {
        this.helper.router_id.admin.detail_store_id = id;
        this.helper.router.navigate(['admin/store/view_detail']);

    }
    viewHistory(id, type) {
        this.helper.router_id.admin.history_store_id = id;
        this.helper.router_id.admin.page_type = type;
        this.helper.router.navigate(['admin/store/view_history']);

    }

    viewDocument(id, type) {
        this.helper.router_id.admin.store_id = id;
        this.helper.router_id.admin.document_type = type;
        this.helper.router.navigate(['admin/store/view_document']);

    }

    store_export_csv(store_page_type) {
        this.helper.http.post('/admin/store_list_search_sort', {
            sort_field: this.sort_field, sort_store: this.sort_store, store_page_type: this.store_page_type,
            search_field: this.search_field, search_value: this.search_value
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            var json2csv = require('json2csv');
            res_data.stores.forEach((store, index) => {

                store.city_name = store.city_details.city_name;
                store.delivery_name = store.delivery_details.delivery_name;

            });

            var fieldNames = ['Unique ID', 'First Name', 'Last Name', 'City', 'Delivery', 'Device Type', 'Referral Code',
                'Email', 'Country Phone Code',
                'Phone', 'App Version', 'Wallet', 'Wallet Currency Code', 'Address',
                'Approved','Business',
                'Email Verify', 'Phone Number Verify', 'Document Uploaded',
                'Location'
            ];
            var fields = ['unique_id', 'first_name', 'last_name', 'city_name', 'delivery_name', 'device_type', 'referral_code',
                'email', 'country_phone_code',
                'phone', 'app_version', 'wallet', 'wallet_currency_code', 'address',
                'is_approved','is_business',
                'is_email_verified', 'is_phone_number_verified', 'is_document_uploaded',
                'location'
            ];

            var csv = json2csv({data: res_data.stores, fields: fields, fieldNames: fieldNames});

            var final_csv: any = csv;
            this.helper.downloadFile(final_csv);
        });
    }



    store_export_excel(store_page_type) {
        this.helper.http.post('/admin/store_list_search_sort', {
            sort_field: this.sort_field, sort_store: this.sort_store, store_page_type: this.store_page_type,
            search_field: this.search_field, search_value: this.search_value
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            var json_data = [];
            var json2excel = require('js2excel');
            res_data.stores.forEach((store, index) => {

                store.city_name = store.city_details.city_name;
                store.delivery_name = store.delivery_details.delivery_name;
                
                json_data.push({
                    "Unique ID": store.unique_id, 
                    "Name": store.name,
                    "City": store.city_name,
                    "Delivery":store.delivery_name,
                    "Device Type": store.device_type, 
                    "Referral Code": store.referral_code,
                    "Email":store.email,
                    "Country Phone Code": store.country_phone_code,
                    "Phone": store.phone,
                    "App Version": store.app_version, 
                    "Wallet": store.wallet ,
                    "Wallet Currency Code":store.wallet_currency_code,
                    "Address": store.address,
                    "Approved": store.is_approved,
                    'Business':store.is_business,
                    "Email Verify": store.is_email_verified,
                    "Phone Number Verify": store.is_phone_number_verified,
                    "Document Uploaded": store.is_document_uploaded,
                    "Location": store.location
                });

            });
            
            json2excel.json2excel({
                data: json_data,
                name: 'store_excel',
                formateDate: 'yyyy/mm/dd'
            });

           
        });
    }

    get_referral_history(){
        this.is_edit = false;
        this.selected_tab = 3;
        this.helper.http.post('/admin/get_user_referral_history', {id: this.store_detail._id, type: this.helper.ADMIN_DATA_ID.STORE}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
                this.myLoading = false;
                console.log(res_data)
                if (res_data.success == false) {
                    this.referral_history = [];
                }
                else {
                    this.referral_history = res_data.referral_history;
                }
            },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    get_bank_detail(){
        this.is_edit = false;
        this.selected_tab = 4;
        this.myLoading = true;
        this.helper.http.post('/admin/new_get_bank_detail', {id: this.store_detail._id, type: this.helper.ADMIN_DATA_ID.STORE}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
                this.myLoading = false;
                console.log(res_data)
                if (res_data.success == false) {
                    this.bank_detail_list = [];
                }
                else {
                    this.bank_detail_list = res_data.bank_detail;
                }
            },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    get_review_history(){
        this.is_edit = false;
        this.selected_tab = 5;
        this.myLoading = true;
        this.helper.http.post('/admin/get_store_review_history', {store_id: this.store_detail._id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == false) {
                    this.review_list = [];
                }
                else {
                    this.review_list = res_data.review_list;
                }
            },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    menu(){
        this.helper.router_id.admin.store_id = this.store_detail._id;
        this.helper.router.navigate(['/admin/store/products']);
    }

    get_setting(){
        this.helper.router_id.admin.store_id = this.store_detail._id;
        this.helper.router.navigate(['/admin/store/setting']);
    }

    Array(number){
        var array = []
        for(var i= 0; i< number; i++){
            array.push(' ')
        }
        return array;
    }

}
