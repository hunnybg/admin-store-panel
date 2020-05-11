import { Component, OnInit , ViewContainerRef} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {Helper} from "../../franchise_helper";
import {Response} from '@angular/http';
declare var jQuery:any;
import { map } from 'rxjs/operators';

export interface FranchiseNewPassword{
        type:string,
        id:Object,
        server_token:string,
        password: String,
        confirm_password: String    
}

@Component({
  selector: 'app_new_forgot_password',
  templateUrl: './franchise_new_password.component.html',
    providers: [Helper]
})
export class FranchiseNewPasswordComponent implements OnInit {
    
    private store_new_password: FranchiseNewPassword;
    title:any;
    button:any;
    public message: string;
    public class: string;
    validation_message:any;
    myLoading:boolean = true;
    constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);			
    }

    ngOnInit() {
        
        let token = this.helper.tokenService.getToken();
        if(token && token.token) {
            this.helper.router.navigate(['store/stores']);
        }
        this.helper.message();

        this.store_new_password={
            type:"",
            id:null,
            server_token:"",
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
                this.helper.router.navigate(['store/login']);
            } else {
                this.store_new_password={
                    type:'store',
                    id:json.id,
                    server_token:json.server_token,
                    password: "",
                    confirm_password: ""
                }

                this.helper.http.post(this.helper.POST_METHOD.CHECK_DETAIL,this.store_new_password).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
                    this.myLoading=false;
                    if(!res_data.success)
                    {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                        this.helper.router.navigate(['store/login']);
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
    
    storeNewPassword(newpassworddata)
    {
        this.myLoading=true;
        this.helper.http.post(this.helper.POST_METHOD.NEW_PASSWORD,this.store_new_password).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
               this.myLoading=false;
            if(res_data.success == false)
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
            }
            else
            {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.router.navigate(['store/login']);
                
            }

        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }

}
