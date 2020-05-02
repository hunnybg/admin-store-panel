import { Component, OnInit , ViewContainerRef} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {Helper} from "../../helper";
import {Response} from '@angular/http';
declare var jQuery:any;

export interface AdminNewPassword{
        type:string,
        id:Object,
        server_token:string,
        password: String,
        confirm_password: String    
}

@Component({
  selector: 'app-admin_new_password',
  templateUrl: './admin_new_password.component.html',
    providers: [Helper]
})
export class AdminNewPasswordComponent implements OnInit {
    
    private admin_new_password: AdminNewPassword;
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
      this.helper.message();

        this.admin_new_password={
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
                this.helper.router.navigate(['admin/login']);
            } else {
                this.admin_new_password={
                    type:'admin',
                    id:json.id,
                    server_token:json.server_token,
                    password: "",
                    confirm_password: ""
                }

               this.helper.http.post('/api/admin/check_detail', this.admin_new_password).map((res: Response) => res.json()).subscribe(res_data => { this.myLoading=false;
                   
                    if(!res_data.success)
                    {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                        this.helper.router.navigate(['admin/login']);
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
  
  adminNewPassword(newpassworddata)
    {
       this.myLoading = true;
        this.helper.http.post('/api/admin/new_password', this.admin_new_password).map((res: Response) => res.json()).subscribe(res_data => {
            
            this.myLoading = false;
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
                this.helper.router.navigate(['admin/login']);
                
            }

        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }

}
