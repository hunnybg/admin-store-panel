import { Component, ViewContainerRef, OnInit, ViewChild } from "@angular/core";
import { Helper } from "../../helper";
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
declare var jQuery: any
import { Http, Response } from '@angular/http';
declare var swal: any;
import { map } from 'rxjs/operators';

@Component({
    selector: "app-vaiter",
    templateUrl: "./vaiter.component.html",
    providers: [Helper]
})

export class VaiterComponent implements OnInit {
    @ViewChild('myModal')
    modal: ModalComponent;
    @ViewChild('mysmsModal')
    sms_modal: ModalComponent;
    @ViewChild('mynotificationModal')
    notification_modal: ModalComponent;

    @ViewChild('add_new_vaiter_modal')
    add_new_vaiter_modal: ModalComponent;

    @ViewChild('vehicleModal')
    vehicle_modal: ModalComponent;
    @ViewChild('add_vehicle_modal')
    add_vehicle_modal: ModalComponent;

    edit_vehicle: any[] = [];
    provider_list: any[] = [];
    title: any;
    button: any;
    heading_title: any;

    sort_field: string;
    sort_vaiter: number;
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
    vaiter_page_type: number = 2;
    vaiter_id: Object;
    public message: string = "";
    public class: string;
    myLoading: boolean = false;
    vaiter_detail: any = {};
    is_edit: boolean = false;
    formData = new FormData();
    selected_tab: number = 1;
    number_of_rec: number = 10;
    document_list: any[] = [];
    edit_document: any[] = [];
    old_image_url: string = '';
    error_message: number = 0;
    store_id: string;
    private documentlist: Document;
    add_vaiter: any = {};
    add_vehicle: any = {};
    first_name: string = '';
    vaiter_list: any[] = [];
    adding_vaiter: boolean = false;
    errors: boolean = false;
    error_msg: string = '';
    new_image;
    wallet_currency_code;
    
    constructor(private helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {
        jQuery("#vehicle").chosen({ disable_search: true });
        jQuery(".chosen-select").chosen({ disable_search: true });
        jQuery(this.helper.elementRef.nativeElement).find('#employee_type_id').on('change', (evnt, res_data) => {
            console.log(res_data);
            this.add_vaiter.employee_type = res_data.selected;
        });
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }
    ngOnInit() {

        var store = JSON.parse(localStorage.getItem('store'));
        if (store !== null) {
            this.store_id = store._id;
            this.wallet_currency_code = store.wallet_currency_code
        } else {
            this.helper.router.navigate(['/store/login'])
        }

        if (this.helper.data.storage.message !== undefined) {
            this.helper.message()
        }
        this.sort_field = "unique_id";
        this.sort_vaiter = -1;
        this.search_field = "first_name";
        this.search_value = "";
        this.page = 1;

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;

        if (this.helper.route.snapshot.url[1].path == 'approved_providers') {
            this.vaiter_page_type = 1;
        }
        else if (this.helper.route.snapshot.url[1].path == 'pending_for_approval') {
            this.vaiter_page_type = 2;
        }
        else if (this.helper.route.snapshot.url[1].path == 'online_provider') {
            this.vaiter_page_type = 3;

        }

        this.filter(this.page);


        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_vaiter').on('change', (evnt, res_data) => {
            this.sort_vaiter = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });

        jQuery(this.helper.elementRef.nativeElement).find('#number_of_rec').on('change', (evnt, res_data) => {
            this.number_of_rec = res_data.selected;
            this.filter(1)
        });

        jQuery(this.helper.elementRef.nativeElement).find('#employee_type_id').on('change', (evnt, res_data) => {
            console.log(res_data);
            this.add_vaiter.employee_type = res_data.selected;
        });


    }

    edit_vaiter() {
        this.is_edit = true;
        setTimeout(() => {
            jQuery('#update_employee_type_id').on('change', (evnt, res_data) => {
                console.log(res_data);
                this.vaiter_detail.employee_type = Number(res_data.selected);
            });

            jQuery("#update_employee_type_id").chosen({ disable_search: true });
            jQuery("#update_employee_type_id").trigger("chosen:updated");

        }, 100);
    }


    change_page_type(vaiter_page_type) {
        this.vaiter_page_type = vaiter_page_type;
        this.filter(1);
    }

    add_new_vaiter() {
        this.add_new_vaiter_modal.open();
        this.adding_vaiter = true;
        this.vaiter_detail = {
            image_url: ''
        }
        setTimeout(() => {
            jQuery('#employee_type_id').on('change', (evnt, res_data) => {
                console.log(res_data);
                this.add_vaiter.employee_type = Number(res_data.selected);
            });
        }, 1000);
    }

    AddVaiter(AddVaiterForm) {
        console.log(AddVaiterForm)
        if (AddVaiterForm.valid) {
            let { first_name, last_name, email, phone, password, hourly_vage, employee_type } = AddVaiterForm.value;
            if (first_name.trim() == '' || last_name.trim() == '' || email.trim() == '' || phone.trim() == '' || password.trim() == '') {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[440],
                    "class": "alert-danger"
                }
                this.helper.message();
                return;
            }
            if (!hourly_vage) {
                hourly_vage = 0;
            } else {
                hourly_vage = Number(hourly_vage);
            }

            this.formData = new FormData();
            this.formData.append('first_name', first_name);
            this.formData.append('last_name', last_name);
            this.formData.append('email', email);
            this.formData.append('phone', phone);
            this.formData.append('password', password);
            this.formData.append('store_id', this.store_id);
            this.formData.append('hourly_vage', hourly_vage);
            this.formData.append('employee_type', employee_type);
            this.formData.append('image_url', this.new_image);

            this.helper.http.post('/store/add_new_vaiter', this.formData).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
                this.myLoading = false;
                console.log(res_data);
                if (res_data.success) {
                    AddVaiterForm.reset();
                    this.add_vaiter = {};
                    this.add_new_vaiter_modal.close();
                    this.adding_vaiter = false;
                    this.helper.data.storage = {
                        "message": "Waiter Added Successfully",
                        "class": "alert-info"
                    }
                    this.helper.message();
                    this.formData = new FormData();
                    this.errors = false;
                    this.error_msg = '';
                    this.new_image = null;
                    this.filter(this.page);
                    setTimeout(function () {
                        jQuery(".chosen-select").trigger("chosen:updated");
                    }, 500);

                } else {
                    // this.formData = new FormData();
                    console.log(this.formData)
                    if (res_data.error_code == 634 || res_data.error_code == "634") {
                        this.helper.router.navigate(['store/login']);
                        return;
                    }
                    this.errors = true;
                    this.error_msg = this.helper.ERROR_CODE[res_data.error_code];
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-warn"
                    }
                    this.helper.message();
                }
            });
        } else {
            this.helper.data.storage = {
                "message": this.helper.ERROR_CODE[440],
                "class": "alert-danger"
            }
            this.helper.message();
        }
    }
    get_vaiter_detail(id) {
        this.selected_tab = 1;
        let index = this.vaiter_list.findIndex((vaiter) => vaiter._id == id);
        this.vaiter_detail = JSON.parse(JSON.stringify(this.vaiter_list[index]));
    }

    filter(page) {
        this.page = page;
        this.helper.http.post('/store/get_vaiters', {
            store_id: this.store_id, number_of_rec: this.number_of_rec,
            sort_field: this.sort_field, sort_vaiter: this.sort_vaiter, vaiter_page_type: this.vaiter_page_type,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            console.log(res_data)
            if (res_data.success == false) {
                this.vaiter_list = [];
                this.total_pages = [];
                this.vaiter_detail = {};
            }
            else {

                this.vaiter_list = res_data.vaiters;
                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
                if (this.vaiter_list.length > 0) {
                    this.get_vaiter_detail(this.vaiter_list[0]._id);
                } else {
                    this.vaiter_detail = {};
                }
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }
    vaiter_export_csv(vaiter_page_type) {
        this.helper.http.post("/store/get_vaiters", {
            store_id: this.store_id,
            sort_field: this.sort_field, sort_vaiter: this.sort_vaiter, vaiter_page_type: this.vaiter_page_type,
            search_field: this.search_field, search_value: this.search_value
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            console.log(res_data)
            var json2csv = require('json2csv');

            var fieldNames = ['Unique ID', 'First Name', 'Last Name', 'Device Type',
                'Email', 'Country Phone Code',
                'Phone', 'App Version', 'Wallet', 'Wallet Currency Code',
                'Approved', 'Active', 'Online'];
            var fields = ['unique_id', 'first_name', 'last_name', 'device_type',
                'email', 'country_phone_code',
                'phone', 'app_version', 'wallet', 'wallet_currency_code',
                'is_approved', 'is_active_for_job', 'is_online'];
            var csv = json2csv({ data: res_data.vaiters, fields: fields, fieldNames: fieldNames });

            var final_csv: any = csv;
            this.helper.downloadFile(csv);
        });

    }

    change_image($event) {
        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];
        if (image_url.type == "image/jpeg" || image_url.type == "image/jpg" || image_url.type == "image/png") {
            this.formData = new FormData();
            this.formData.append('image_url', image_url);
            this.new_image = image_url
            var reader = new FileReader();

            reader.onload = (e: any) => {
                this.vaiter_detail.image_url = e.target.result;
            }
            reader.readAsDataURL(image_url);
        }
    }

    open_notification_modal(type, id) {
        this.vaiter_id = id;
        this.type = type;
        this.notification_modal.open();
        this.content = "";
    }

    approved(vaiter_page_type, vaiter_id) {

        this.helper.http.post('/store/vaiter_approve_decline', {
            vaiter_id: vaiter_id,
            vaiter_page_type: vaiter_page_type
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
                let user_index = this.vaiter_list.findIndex((x) => x._id == vaiter_id);
                this.vaiter_list.splice(user_index, 1);
                if (this.vaiter_list.length > 0) {
                    this.get_vaiter_detail(this.vaiter_list[0]._id);
                } else {
                    this.vaiter_detail = {};
                }
            }
            this.helper.message();
        });
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
                var index = this.vaiter_list.findIndex(x => x._id == add_wallet_data.vaiter_id);
                this.vaiter_list[index].wallet = this.vaiter_list[index].wallet + +Number(add_wallet_data.wallet).toFixed(2);
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
    update_vaiter_detail() {
        if (this.vaiter_detail.first_name.trim() == '' || this.vaiter_detail.last_name.trim() == '' || this.vaiter_detail.email.trim() == '' || this.vaiter_detail.phone.trim() == '') {
            this.helper.data.storage = {
                "message": this.helper.ERROR_CODE[440],
                "class": "alert-danger"
            }
            this.helper.message();
            return;
        }
        this.formData.append('vaiter_id', this.vaiter_detail._id);
        this.formData.append('phone', this.vaiter_detail.phone);
        this.formData.append('email', this.vaiter_detail.email);
        this.formData.append('first_name', this.vaiter_detail.first_name);
        this.formData.append('last_name', this.vaiter_detail.last_name);
        this.formData.append('hourly_vage', this.vaiter_detail.hourly_vage);
        this.formData.append('employee_type', this.vaiter_detail.employee_type);

        // this.formData.append('image_url', this.new_image);
        this.helper.http.post('/store/update_vaiter', this.formData).pipe(map((response: Response) => response.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                let message = this.helper.ERROR_CODE[res_data.error_code] !== undefined ? this.helper.ERROR_CODE[res_data.error_code] : this.helper.ERROR_CODE[1005];
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": message,
                    "class": "alert-danger"
                }
                this.formData = new FormData();
            } else {
                let vaiter_index = this.vaiter_list.findIndex((x) => x._id == this.vaiter_detail._id);
                this.vaiter_list[vaiter_index] = JSON.parse(JSON.stringify(this.vaiter_detail));
                this.is_edit = false;
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
            }
            this.helper.message();
        });
    }
    delete_vaiter(id, index) {
        console.log(id)
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(() => {
            this.helper.http.post('/store/delete/vaiter', { id: id }).pipe(map((response: Response) => response.json())).subscribe(res_data => {
                if (res_data.success == true) {
                    this.helper.data.storage = {
                        "message": "Vaiter Deleted Succesfully",
                        "class": "alert-info"
                    }
                    this.helper.message();
                    this.vaiter_list.splice(index, 1);
                    // this.filter(this.page)
                    if (this.vaiter_list.length == 0) {
                        this.vaiter_detail = {};
                    } else {
                        this.vaiter_detail = this.vaiter_list[0];
                    }
                }
                else {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                }
            });
            swal(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            );
        }).catch(swal.noop)
    }
    modalClosed(AddVaiterForm) {
        AddVaiterForm.reset();
        this.adding_vaiter = false;
        this.vaiter_detail = JSON.parse(JSON.stringify(this.vaiter_list[0]));
        this.add_vaiter = {};

    }
    // change_records(number_of_rec){
    //     console.log(number_of_rec)
    //     this.number_of_rec = number_of_rec;
    //     this.filter(1)
    // }


    option_change(event) {
        console.log(event)
    }
}