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
    selector: 'app-provider',
    templateUrl: './provider.component.html',
    providers: [Helper]

})
export class ProviderComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;
    @ViewChild('mysmsModal')
    sms_modal: ModalComponent;
    @ViewChild('mynotificationModal')
    notification_modal: ModalComponent;

    @ViewChild('vehicleModal')
    vehicle_modal: ModalComponent;
    edit_vehicle: any[] = [];
    provider_list: any[];
    title: any;
    button: any;
    heading_title: any;

    sort_field: string;
    sort_provider: number;
    search_field: string;
    search_value: string;
    page: number;
    review_list: any[] = [];
    referral_history: any[] = [];
    bank_detail_list: any[] = [];

    type: number;
    amount: number;
    wallet: number;
    content: string;
    vehicle_id: Object = null;
    //vehicle_id: Object;

    is_document_uploaded: Boolean;
    total_page: number;
    total_pages: number[];
    vehicle_list: any[];
    vehicle_service_list: any[] = [];
    provider_page_type: number = 2;
    provider_id: Object;
    public message: string = "";
    public class: string;
    myLoading: boolean = true;
    provider_detail: any = {};
    is_edit: boolean = false;
    formData = new FormData();
    selected_tab: number = 1;
    number_of_rec: number = 10;
    document_list: any[] = [];
    edit_document: any[] = [];
    old_image_url: string = '';
    error_message: number = 0;
    private documentlist: Document;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }
    ngAfterViewInit() {
        //        jQuery("#vehicle").chosen({disable_search: true});
        //        setTimeout(function () {
        //            jQuery(".chosen-select").trigger("chosen:updated");
        //        }, 1000);

        jQuery("#vehicle").chosen({disable_search: true});
        jQuery(".chosen-select").chosen({disable_search: true});
        //        jQuery(this.helper.elementRef.nativeElement).find('#vehicle_id').on('change', (evnt, res_data) => {
        //
        //            this.vehicle_id = res_data.selected;
        //            console.log(this.vehicle_id)
        //            console.log("this.vehicle_id")
        //        });
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }


    ngOnInit() {

        this.helper.message()
        // console.log(this.helper.route.snapshot.url[1]);
        this.sort_field = "unique_id";
        this.sort_provider = -1;
        this.search_field = "first_name";
        this.search_value = "";
        this.page = 1;
        this.documentlist = {
            unique_code: '',
            expired_date: null,
            image_url: ''
        }

        if (this.helper.route.snapshot.url[1].path == 'approved_providers') {
            this.provider_page_type = 1;
        }
        else if (this.helper.route.snapshot.url[1].path == 'pending_for_approval') {
            this.provider_page_type = 2;
        }
        else if (this.helper.route.snapshot.url[1].path == 'online_provider') {
            this.provider_page_type = 3;

        }

        this.is_document_uploaded = false;
        this.provider_id = "";
        this.filter(this.page);

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.provider_list = [];
        this.type = 8;

        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_provider').on('change', (evnt, res_data) => {

            this.sort_provider = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
        //this.helper.http.get('/admin/vehicle_list_for_provider').pipe(map((res: Response) => res.json())).subscribe(res => {
            //this.vehicle_service_list = res.vehicles;
        //});


        jQuery(this.helper.elementRef.nativeElement).find('#vehicle').on('change', (evnt, res_data) => {

            this.vehicle_id = res_data.selected;
            //console.log(this.vehicle_id);
            //console.log(res_data.selected);
        });
        jQuery(this.helper.elementRef.nativeElement).find('#number_of_rec').on('change', (evnt, res_data) => {
            this.number_of_rec = res_data.selected;
            this.filter(1)
        });


    }

    change_page_type(provider_page_type){
        this.provider_page_type = provider_page_type;
        this.filter(1);
    }
    filter(page) {
        this.page = page;
        this.helper.http.post('/api/provider/provider_list_search_sort', {
            sort_field: this.sort_field, sort_provider: this.sort_provider, provider_page_type: this.provider_page_type,
            search_field: this.search_field, search_value: this.search_value, page: this.page, number_of_rec: this.number_of_rec
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;

            if (res_data.success == false) {
                this.provider_list = [];
                this.total_pages = [];
                this.provider_detail = {};
            }
            else {

                this.provider_list = res_data.providers;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                if(this.provider_list.length > 0){
                    this.get_provider_detail(this.provider_list[0]._id);
                } else {
                    this.provider_detail = {};
                }
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    get_provider_detail(id){
        this.selected_tab = 1;
        let index = this.provider_list.findIndex((provider)=>provider._id==id);
        this.provider_detail = JSON.parse(JSON.stringify(this.provider_list[index]));
    }

    get_referral_history(){
        this.is_edit = false;
        this.selected_tab = 3;
        this.myLoading = true;
        this.helper.http.post('/admin/get_user_referral_history', {id: this.provider_detail._id, type: 8}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
                this.myLoading = false;
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

    get_review_history(){
        this.is_edit = false;
        this.selected_tab = 4;
        this.myLoading = true;
        this.helper.http.post('/admin/get_provider_review_history', {provider_id: this.provider_detail._id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
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

    get_vehicle_detail(){

    }

    get_bank_detail(){
        this.is_edit = false;
        this.selected_tab = 5;
        this.myLoading = true;
        this.helper.http.post('/admin/get_bank_detail', {id: this.provider_detail._id, type: this.helper.ADMIN_DATA_ID.PROVIDER}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
                this.myLoading = false;
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

    update_provider_detail(){
        this.formData.append('provider_id', this.provider_detail._id);
        this.formData.append('phone', this.provider_detail.phone);
        this.formData.append('email', this.provider_detail.email);
        this.formData.append('first_name', this.provider_detail.first_name);
        this.formData.append('last_name', this.provider_detail.last_name);
        this.helper.http.post('/admin/update_provider', this.formData).pipe(map((response: Response) => response.json())).subscribe(res_data => {
            this.myLoading = false;
            this.formData = new FormData();
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            } else {
                let user_index = this.provider_list.findIndex((x)=>x._id == this.provider_detail._id);
                this.provider_list[user_index] = JSON.parse(JSON.stringify(this.provider_detail));
                this.is_edit = false;
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
            }
            this.helper.message();
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
                this.provider_detail.image_url = e.target.result
            }
            reader.readAsDataURL(image_url);
        }
    }

    //    open_vehicle_modal(id) {
    //        this.provider_id = id;
    //        this.vehicle_modal.open();
    //
    //        this.helper.http.get('/admin/vehicle_list_for_provider').pipe(map((res: Response) => res.json())).subscribe(res => {
    //            this.vehicle_list = res.vehicles;
    //            console.log(this.vehicle_list);
    //        });
    //        setInterval(() => {
    //            jQuery(this.helper.elementRef.nativeElement).find('#vehicle').on('change', (evnt, res_data) => {
    //                this.vehicle_id = res_data.selected;
    //                console.log(this.vehicle_id)
    //                console.log("res_data.selected");
    //                console.log(res_data.selected);
    //            });
    //        }, 1000);
    //
    //    }
    //    AddVehicle(add_vehicle_data) {
    //        this.helper.http.post('/admin/add_vehicle', add_vehicle_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
    //            console.log(add_vehicle_data);
    //            this.vehicle_id = add_vehicle_data.vehicle_id;
    //            console.log(this.vehicle_id);
    //            console.log(add_vehicle_data.vehicle_id);
    //            console.log(res_data.success);
    //            if (res_data.success == true) {
    //                this.helper.data.storage = {
    //                    "message": this.helper.MESSAGE_CODE[res_data.message],
    //                    "class": "alert-info"
    //                }
    //                this.vehicle_modal.close();
    //            }
    //        });
    //    }


    open_modal(type, id) {
        this.provider_id = id;
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
                var index = this.provider_list.findIndex(x => x._id == add_wallet_data.provider_id);
                this.provider_list[index].wallet = this.provider_list[index].wallet + +Number(add_wallet_data.wallet).toFixed(2);
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

    open_sms_modal(type, id) {

        this.provider_id = id;
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

        this.provider_id = id;
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

    approved(provider_page_type, provider_id) {

        this.helper.http.post('/admin/provider_approve_decline', {
            provider_id: provider_id,
            provider_page_type: provider_page_type
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
            }
            else {
                let user_index = this.provider_list.findIndex((x)=>x._id==provider_id);
                this.provider_list.splice(user_index, 1);

                if(this.provider_list.length>0){
                    this.get_provider_detail(this.provider_list[0]._id);
                } else{
                    this.provider_detail = {};
                }
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message();
            }
        });
    }

    get_document_list(){
        this.is_edit = false;
        this.selected_tab = 2;
        this.helper.http.post('/admin/view_document_list', {id: this.provider_detail._id, type: 8}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
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

    vehicle_image_update($event, document, document_index) {
        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];
        this.formData.append('image_url', image_url);

        var reader = new FileReader();

        reader.onload = (e: any) => {
            jQuery('.document' + document_index).attr('src', e.target.result)
            document.image_url = e.target.result;
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
            oReq.setRequestHeader("token", this.provider_detail.server_token);
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
            this.formData.append('id', this.provider_detail._id);
            this.formData.append('server_token', this.provider_detail.server_token);
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
                        localStorage.setItem('provider_document_ulpoaded', res_data.is_document_uploaded);

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

    editProvider(id) {
        this.helper.router_id.admin.provider_id = id;
        this.helper.router.navigate(['admin/provider/edit']);

    }

    providerVehicle(id) {
        this.myLoading = true;
        this.helper.http.post('/admin/provider_vehicle_list', {
            provider_id: id
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.vehicle_list = [];
                this.vehicle_modal.open();
                this.vehicle_service_list = [];
            }
            else {
                this.vehicle_list = res_data.provider_vehicles;
                this.vehicle_list.forEach((vehicle, index) => {
                    this.edit_vehicle[index] = "false";
                });
                this.vehicle_modal.open();
                this.vehicle_service_list = res_data.vehicles;
            }
        },(error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });

    }

    viewProvider(id) {
        this.helper.router_id.admin.provider_id = id;
        this.helper.router.navigate(['admin/provider/view_detail']);

    }


    viewBankDetail(id) {
        this.helper.router_id.admin.view_provider_bank_detail_id = id;
        this.helper.router.navigate(['/admin/provider/view_bank_detail']);
    }




    viewHistory(id, type) {
        this.helper.router_id.admin.history_provider_id = id;
        this.helper.router_id.admin.page_type = type;
        this.helper.router.navigate(['admin/provider/view_history']);

    }
    viewDocument(id, type) {
        this.helper.router_id.admin.provider_id = id;
        this.helper.router_id.admin.document_type = type;
        this.helper.router.navigate(['admin/provider/view_document']);
    }

    provider_export_csv(provider_page_type) {
        this.helper.http.post('/api/provider/provider_list_search_sort', {
            sort_field: this.sort_field, sort_provider: this.sort_provider, provider_page_type: this.provider_page_type,
            search_field: this.search_field, search_value: this.search_value
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            var json2csv = require('json2csv');
            res_data.providers.forEach((provider, index) => {
                provider.city_name = provider.city_details.city_name;
            });

            var fieldNames = ['Unique ID', 'First Name', 'Last Name', 'City', 'Device Type', 'Referral Code',
                'Email', 'Country Phone Code',
                'Phone', 'App Version', 'Wallet', 'Wallet Currency Code', 'Address',
                'Approved', 'Active', 'Online', 'In Delivery',
                'Email Verify', 'Phone Number Verify', 'Document Uploaded',
                'Location'
            ];
            var fields = ['unique_id', 'first_name', 'last_name', 'city_name', 'device_type', 'referral_code',
                'email', 'country_phone_code',
                'phone', 'app_version', 'wallet', 'wallet_currency_code', 'address',
                'is_approved', 'is_active_for_job', 'is_online', 'is_in_delivery',
                'is_email_verified', 'is_phone_number_verified', 'is_document_uploaded',
                'location'
            ];

            var csv = json2csv({data: res_data.providers, fields: fields, fieldNames: fieldNames});

            var final_csv: any = csv;
            this.helper.downloadFile(final_csv);
        });
    }




    provider_export_excel(provider_page_type) {
        this.helper.http.post('/api/provider/provider_list_search_sort', {
            sort_field: this.sort_field, sort_provider: this.sort_provider, provider_page_type: this.provider_page_type,
            search_field: this.search_field, search_value: this.search_value
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            var json_data = [];
            var json2excel = require('js2excel');
            res_data.providers.forEach((provider, index) => {
                provider.city_name = provider.city_details.city_name;
                json_data.push({
                    "Unique ID": provider.unique_id, 
                    "First Name": provider.first_name ,
                    "Last Name":provider.last_name,
                    "City": provider.city_name,
                    "Device Type": provider.device_type, 
                    "Referral Code": provider.referral_code,
                    "Email":provider.email,
                    "Country Phone Code": provider.country_phone_code,
                    "Phone": provider.phone,
                    "App Version": provider.app_version, 
                    "Wallet": provider.wallet ,
                    "Wallet Currency Code":provider.wallet_currency_code,
                    "Address": provider.address,
                    "Approved": provider.is_approved,
                    "Active": provider.is_active_for_job, 
                    "Online": provider.is_online ,
                    "In Delivery":provider.is_in_delivery,
                    "Email Verify": provider.is_email_verified,
                    "Phone Number Verify": provider.is_phone_number_verified,
                    "Document Uploaded": provider.is_document_uploaded,
                    "Location": provider.location
                });
            });


            json2excel.json2excel({
                data: json_data,
                name: 'provider_excel',
                formateDate: 'yyyy/mm/dd'
            });

            
        });
    }

    editProviderVehicle(id, index){
        this.edit_vehicle[index] = 'true';
        setTimeout(()=>{
            jQuery("#admin_vehicle_id").chosen({disable_search: true});
            jQuery("#admin_vehicle_id").trigger("chosen:updated");
            jQuery(this.helper.elementRef.nativeElement).find('#admin_vehicle_id').on('change', (evnt, res_data) => {
                this.vehicle_list[index].admin_vehicle_id = res_data.selected;
            });
        },1000);
    }

    updateProviderVehicle(provider_vehicle_data) {
        this.myLoading = true;
        this.helper.http.post('/admin/provider_vehicle_update', provider_vehicle_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == true) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.message();
                    this.vehicle_list.forEach((vehicle, index) => {
                        this.edit_vehicle[index] = "false";
                    });
                    this.vehicle_modal.close();
                }
                else {
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

    updateVehicleDocument(document, document_index, vehicle) {
        if (document.image_url == '') {
            this.error_message = 1;
        }
        else if (document.document_details.is_expired_date && document.expired_date == null) {
            this.error_message = 2;
        }
        else if (document.document_details.is_unique_code && document.unique_code == '') {
            this.error_message = 3;
        }
        else {
            this.myLoading = true;
            this.error_message = 0;
            this.formData.append('type', '9');
            this.formData.append('unique_code', this.documentlist.unique_code);
            this.formData.append('document_id', document._id);
            this.formData.append('id', vehicle._id);
            this.formData.append('server_token', this.provider_detail.server_token);
            if (document.expired_date != null) {
                this.formData.append('expired_date', document.expired_date.formatted);
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
                        localStorage.setItem('provider_document_ulpoaded', res_data.is_document_uploaded);

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

}
