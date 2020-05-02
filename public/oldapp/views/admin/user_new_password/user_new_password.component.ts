import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {Helper} from "../../helper";
import {Response} from '@angular/http';
declare var jQuery: any;
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export interface UserNewPassword {
    type: string,
    id: Object,
    server_token: string,
    password: String,
    confirm_password: String
}

@Component({
    selector: 'app-user_new_password',
    templateUrl: './user_new_password.component.html',
    providers: [Helper]
})
export class UserNewPasswordComponent implements OnInit {

    private user_new_password: UserNewPassword;
    title: any;
    button: any;
    public message: string;
    public class: string;
    validation_message: any;
    myLoading: boolean = true;
    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        this.helper.message();

        this.helper.for_forgot_password = true;
        this.user_new_password = {
            type: "",
            id: null,
            server_token: "",
            password: "",
            confirm_password: ""
        }
       this.helper.route.params.subscribe((x: Params) => {

            var current_date = new Date(Date.now())
            var email_token = x['email_token']
            var json = this.helper.getIDFromEmailToken(email_token);

            var difference = current_date.getTime() - json.milli_seconds;
            difference = difference/(3600 * 60 * 24)

            if(difference > 5) {
                this.helper.data.storage = {
                    "message": this.helper.error_code.TOKEN_INVALID,
                    "class": "alert-info"
                }
                document.location.href = 'https://vaiter.io';
                // this.helper.router.navigate(['admin/login']);
            } else {
                this.user_new_password={
                    type:'user',
                    id:json.id,
                    server_token:json.server_token,
                    password: "",
                    confirm_password: ""
                }

                 this.helper.http.post('/api/admin/check_detail', this.user_new_password).map((res: Response) => res.json()).subscribe(res_data => {
                    this.myLoading=false;
                    console.log(res_data)
                    if(!res_data.success)
                    {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                        // this.helper.router.navigate(['admin/login']);
                        document.location.href = 'https://vaiter.io';

                    }

                },
                (error: any) => {
                    this.myLoading=false;
                    this.helper.http_status(error)
                });
            }
        });
        this.title=this.helper.title
        this.button=this.helper.button
        this.validation_message=this.helper.validation_message
    }

    userNewPassword(newpassworddata) {
        this.myLoading = true;
        this.helper.http.post('/api/admin/new_password', this.user_new_password).map((res: Response) => res.json()).subscribe(res_data => {
            console.log(newpassworddata);
            this.myLoading = false;
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
            }
            else {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                document.location.href = 'https://vaiter.io';
                // this.helper.router.navigate(['admin/login']);
                
            }

        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

}
