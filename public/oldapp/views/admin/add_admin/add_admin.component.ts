import {Component, OnInit} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;


export interface AddAdmin {
    admin_type: Number,
    username: String,
    password: String,
    email: String,
    urls: String[],
}

@Component({
    selector: 'app-add_admin',
    templateUrl: './add_admin.component.html',
    providers: [Helper]
})
export class AddAdminComponent implements OnInit {

    private add_admin: AddAdmin;
    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    type: String;
    admin_id: Object;
    admin_exist: any;
    error: any;
    admin_list: any[];

    myLoading: boolean = true;
    url_list: any[];
    constructor(private helper: Helper) {

    }
    ngAfterViewInit() {

        jQuery("#admin_type").chosen({disable_search: true});

        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
            jQuery('input').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
        }, 1000);
    }
    ngOnDestroy() {
        this.helper.router_id.admin.admin_id = "";
    }

    ngOnInit() {
        this.url_list = this.helper.ADMIN_URL;
        this.add_admin = {
            admin_type: 1,
            username: "",
            password: "",
            email: "",
            urls: []

        }
        this.admin_id = this.helper.router_id.admin.admin_id;
        jQuery(this.helper.elementRef.nativeElement).find('#admin_type').on('change', (evnt, res_data) => {

            this.add_admin.admin_type = res_data.selected;
            if (res_data.selected == 3) {
                this.url_list = this.helper.ADMIN_URL;
                setTimeout(() => {
                    jQuery('.icheck').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_square-green',
                    });

                    jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifChecked', (event, res_data) => {

                        var id = event.target.getAttribute('value')
                        this.add_admin.urls.push(id);

                    });

                    jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifUnchecked', (event, res_data) => {

                        var id = event.target.getAttribute('value')
                        var i = this.add_admin.urls.indexOf(id);
                        if (i != -1) {
                            this.add_admin.urls.splice(i, 1);

                        }
                    });


                }, 1000);
            }


        });



        if (this.admin_id == '') {
            this.type = "add";
            this.admin_exist = ""
        }
        else {
            jQuery('#add').hide();
            this.type = "edit";
            this.helper.http.post('/admin/get_detail', {admin_id: this.admin_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {
                    this.helper.router.navigate(['admin/list']);
                }
                else {
                    this.add_admin.username = res_data.admin.username;
                    this.add_admin.email = res_data.admin.email;
                    this.add_admin.admin_type = res_data.admin.admin_type;
                    this.add_admin.urls = res_data.admin.urls;

                    if(this.add_admin.admin_type == 3){
                        setTimeout(() => {
                            jQuery('.icheck').iCheck({
                                handle: 'checkbox',
                                checkboxClass: 'icheckbox_square-green',
                            });

                            jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifChecked', (event, res_data) => {
                                var id = event.target.getAttribute('value')
                                this.add_admin.urls.push(id);
                            });

                            jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifUnchecked', (event, res_data) => {
                                var id = event.target.getAttribute('value')
                                var i = this.add_admin.urls.indexOf(id);
                                if (i != -1) {
                                    this.add_admin.urls.splice(i, 1);
                                }
                            });
                        }, 1000);
                    }
                }
            });

        }


        this.title = this.helper.title
        this.button = this.helper.button
        this.heading_title = this.helper.heading_title
        this.validation_message = this.helper.validation_message;
    }
    AddAdmin(admin_data) {
        if (this.type == 'add') {
            this.myLoading = true;
            this.helper.http.post('/admin/add', admin_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == true) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.router.navigate(['admin/list']);
                }
                else {

                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['admin/list']);
                }


            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        } else {
            this.updateAdmin(admin_data)
        }

    }

    updateAdmin(admin_data) {
        this.myLoading = true;
        this.helper.http.post('/admin/update', admin_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.router.navigate(['admin/list']);
            }
            else {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.router.navigate(['admin/list']);

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }


}
