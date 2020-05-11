import {Component, OnInit} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;



export interface AddDocument {

    document_name: String,
    country_id: Object,
    document_for: Number,

    country_name: String,
    is_show: Boolean,
    is_mandatory: Boolean,
    is_expired_date: Boolean,
    is_unique_code: Boolean,
    document_type_name: String

}


@Component({
    selector: 'app-add_document',
    templateUrl: './add_document.component.html',
    providers: [Helper]
})
export class AddDocumentComponent implements OnInit {

    private add_document: AddDocument;
    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    country_name: String;
    ADMIN_DATA_ID: any;


    country_list: any[];
    type: String;
    document_id: Object;
    document_exist: any;
    document_list: any[];
    error: any;

    myLoading: boolean = true;

    constructor(private helper: Helper) {

    }
    ngAfterViewInit() {

        jQuery("#document_for").chosen({disable_search: true});
        jQuery("#country_id").chosen();

        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");

            jQuery('input').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
        }, 1000);
    }
    ngOnDestroy() {
        this.helper.router_id.admin.document_id = "";
    }

    ngOnInit() {

        this.add_document = {


            document_name: "",
            country_id: "",
            country_name: "",
            document_for: 8,
            is_show: false,
            is_mandatory: false,
            is_expired_date: false,
            is_unique_code: false,
            document_type_name:""



        }
        this.document_id = this.helper.router_id.admin.document_id
        this.helper.http.get('/admin/get_server_country_list').pipe(map((res: Response) => res.json())).subscribe(res => {
            this.country_list = res.countries

        });

        jQuery(this.helper.elementRef.nativeElement).find('#document_for').on('change', (evnt, res_data) => {

            this.add_document.document_for = res_data.selected;


        });
        jQuery(this.helper.elementRef.nativeElement).find('#country_id').on('change', (evnt, res_data) => {

            this.add_document.country_id = res_data.selected;


        });

        if (this.document_id == '') {
            this.type = "add";
            this.document_exist = ""
        }
        else {
            jQuery('.add').hide();
            this.type = "edit";
            this.helper.http.post('/admin/get_document_detail', {document_id: this.document_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {

                    this.helper.router.navigate(['admin/document']);

                }
                else {



                    this.add_document.document_name = res_data.document.document_name;
                    this.add_document.country_id = res_data.document.country_id;
                    this.add_document.country_name = res_data.document.country_details.country_name;
                    this.add_document.document_for = res_data.document.document_for;
                    this.add_document.is_show = res_data.document.is_show;
                    this.add_document.is_mandatory = res_data.document.is_mandatory;
                    this.add_document.is_expired_date = res_data.document.is_expired_date;
                    this.add_document.is_unique_code = res_data.document.is_unique_code;

                    if(res_data.document.document_for == 2)
                    {
                        this.add_document.document_type_name = "Store";
                    }else if (res_data.document.document_for == 7)
                    {
                        this.add_document.document_type_name = "User";
                    }else if (res_data.document.document_for == 8)
                    {
                        this.add_document.document_type_name = "Provider";
                    }else if (res_data.document.document_for == 9)
                    {
                        this.add_document.document_type_name = "Provider Vehicle";
                    }

                }
            });

        }
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.validation_message = this.helper.validation_message;
        this.ADMIN_DATA_ID = this.helper.ADMIN_DATA_ID;

    }

    AddDocument(document_data) {
        if (this.type == 'add') {
            this.myLoading = true;
            this.helper.http.post('/admin/add_document_data', document_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {

                this.myLoading = false;
                if (res_data.success == true) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.router.navigate(['admin/document']);
                }
                else {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['admin/document']);
                }



            }, (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
        } else {

            this.updateDocument(document_data)
        }
    }
    updateDocument(document_data) {
        this.myLoading = true;
        this.helper.http.post('/admin/update_document', document_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }

                this.helper.router.navigate(['admin/document']);
            }
            else {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }

                this.helper.router.navigate(['admin/document']);

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}
