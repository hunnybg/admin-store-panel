import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;
import { map } from 'rxjs/operators';

export interface Document {
    unique_code: String,
    expired_date: any,
    image_url: ''
}


@Component({
    selector: 'app-view_document',
    templateUrl: './view_document.component.html',
    providers: [Helper]
})
export class ViewDocumentComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    id: Object;
    server_token: string;
    type: Number;
    edit_document: any[] = [];
    document_list: any[] = [];
    old_image_url: string = '';
    error_message: number = 0;

    myLoading: boolean = true;

    private documentlist: Document;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }


    ngOnInit() {
        this.server_token = localStorage.getItem('admin_token');
        this.type = this.helper.router_id.admin.document_type;

        if (this.type == 7) {
            this.id = this.helper.router_id.admin.user_id;

        }
        else if (this.type == 2) {
            this.id = this.helper.router_id.admin.store_id;

        }
        else if (this.type == 8) {
            this.id = this.helper.router_id.admin.provider_id;

        }
        this.helper.message()
        this.title = this.helper.title
        this.button = this.helper.button
        this.heading_title = this.helper.heading_title
        this.validation_message = this.helper.validation_message;

        this.documentlist = {
            unique_code: '',
            expired_date: null,
            image_url: ''
        }



        this.helper.http.post('/admin/view_document_list', {id: this.id, type: this.type}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
            this.myLoading = false;
            console.log(res_data);
            if (res_data.success == false) {

                if (this.type == 7) {
                    this.helper.router.navigate(['admin/user/view_document']);
                }
                else if (this.type == 2) {
                    this.helper.router.navigate(['admin/store/view_document']);
                }
                else if (this.type == 8) {
                    this.helper.router.navigate(['admin/provider/view_document']);
                }

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
            this.documentlist.expired_date = {date: {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()}, formatted: date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()};

        }
    }

    get_document_image(url, document_index) {
        if (url == '') {
            jQuery('.document' + document_index).attr('src', 'default.png')
        } else {
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.setRequestHeader("type", 'admin');
            oReq.setRequestHeader("token", this.server_token);
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
        
        console.log(document);
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
            this.formData.append('id', this.id);
            this.formData.append('server_token', this.server_token);
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

}
