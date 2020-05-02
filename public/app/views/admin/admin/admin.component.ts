import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Helper} from "../../helper";
import {Http, Response} from '@angular/http';
declare var swal: any;

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    providers: [Helper]
})
export class AdminComponent implements OnInit {
    admin_list: any[];
    title: any;
    button: any;
    heading_title: any;
    public message: string;
    public class: string;
    myLoading: boolean = true;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }


    ngOnInit() {
        this.helper.message();
        this.helper.http.get('admin/lists').map((res: Response) => res.json()).subscribe(data => {
            this.myLoading = false;

            if (data.success == false) {
                this.admin_list = [];
            }
            else {
                this.admin_list = data.admins;
            }

        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });


        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;

    }

    editAdmin(id) {
        this.helper.router_id.admin.admin_id = id;
        this.helper.router.navigate(['admin/edit']);
    }

    deleteAdmin(id, admin_index) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(() => {
            this.helper.http.post('/admin/delete', {admin_id: id}).map((response: Response) => response.json()).subscribe(res_data => {
                if (res_data.success == true) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }

                    this.helper.message();
                    this.admin_list.splice(admin_index, 1);
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




}
