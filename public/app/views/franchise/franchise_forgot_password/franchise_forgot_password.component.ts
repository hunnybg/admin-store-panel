import { Component, OnInit , ViewContainerRef} from '@angular/core';
import {Helper} from "../../franchise_helper";
import {Response} from '@angular/http';
declare var jQuery:any;

export interface FranchiseForgotPassword{
        email: String    
}

@Component({
    selector: 'app_franchise_forgot_password',
    templateUrl: './franchise_forgot_password.component.html',
    providers: [Helper]
})
export class FranchiseForgotPasswordComponent implements OnInit {
    
    private store_forgot_password: FranchiseForgotPassword;
    title:any;
    button:any;
    public message: string;
    public class: string;
    validation_message:any;

    myLoading:boolean = false;

    constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);			
    }

    ngOnInit() {
        
        let token = this.helper.tokenService.getToken();
        if(token && token.token) {
            this.helper.data.storage = {
                "message": 999,
                "class": "alert-info"
            }
            this.helper.router.navigate(['franchise/stores']);
        }
        this.helper.message()
        
        
        this.store_forgot_password={
            email: "",
        }
        this.title=this.helper.title
        this.button=this.helper.button
        this.validation_message=this.helper.validation_message;
    }
    
    storeForgotPassword(forgotpassworddata)
    {
        this.myLoading=true;
        this.helper.http.post(this.helper.POST_METHOD.FORGOT_PASSWORD,{email:forgotpassworddata.email.trim(), type:2}).map((res:Response) => res.json()).subscribe(res_data=>{
            
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
