import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Helper} from "../../helper";
import {Response} from '@angular/http';
declare var jQuery: any;
import { map } from 'rxjs/operators';

export interface AdminForgotPassword {
    email: String
}

@Component({
    selector: 'app-admin_forgot_password',
    templateUrl: './admin_forgot_password.component.html',
    providers: [Helper]
})
export class AdminForgotPasswordComponent implements OnInit {

    private admin_forgot_password: AdminForgotPassword;
    title: any;
    button: any;
    public message: string;
    public class: string;
    validation_message: any;
    myLoading: boolean = false;
    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.helper.message()
        this.admin_forgot_password = {
            email: "",
        }
        this.title = this.helper.title
        this.button = this.helper.button
        this.validation_message = this.helper.validation_message;
    }
    adminForgotPassword(forgotpassworddata) {
        this.myLoading = true;
        this.helper.http.post('/api/admin/forgot_password', {email:forgotpassworddata.email.trim(), type: 1}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
       
            this.myLoading = false;
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
            }
            else {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.router.navigate(['admin/login']);

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}
