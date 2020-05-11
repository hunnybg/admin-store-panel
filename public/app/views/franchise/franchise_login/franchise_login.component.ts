import { Component,ViewContainerRef , OnInit, ViewChild, NgZone } from '@angular/core';
import {Helper} from "../../franchise_helper";
import {Response} from '@angular/http';
declare var jQuery:any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { FacebookService, InitParams, LoginResponse, LoginOptions } from 'ngx-facebook';
declare var gapi;
import { map } from 'rxjs/operators';

export interface FranchiseLogin{
    email: String,
    password: String,
    login_by: String,
    social_id: String
}

@Component({
    selector: 'franchise_login',
    templateUrl: 'franchise_login.template.html',
    providers: [Helper, FacebookService]
})
export class franchise_loginComponent implements OnInit {

  @ViewChild('myModal')
  modal: ModalComponent;

    private franchise_login: FranchiseLogin;
    title:any;
    button:any;
    setting_data:any;
    email_placeholder:Number = 1;
    email_or_phone_error: Boolean = false;
    otp_for_email:number;
    otp_for_sms:number;
    franchise_data:any;
    opt_error_message:number = 0;
    validation_message:any;
    myLoading:boolean = true;
    constructor(public helper: Helper,private fb: FacebookService, public vcr: ViewContainerRef,  private zone: NgZone){
        helper.toastr.setRootViewContainerRef(vcr);

        let initParams: InitParams = {
            appId: '601526146700337',
            xfbml: true,
            version: 'v2.10'
        };

        fb.init(initParams);
    }

    ngOnInit() {

        let token = this.helper.tokenService.getToken();
        if(token && token.token) {

            this.helper.router.navigate(['franchise/stores']);
        }

        this.title=this.helper.title
        this.button=this.helper.button
        this.validation_message=this.helper.validation_message;

        this.helper.message()
        this.franchise_login={
            email: "",
            password: "",
            login_by: this.title.manual,
            social_id: ""
        }


        this.helper.http.post(this.helper.POST_METHOD.GET_SETTING_DETAIL,{}).pipe(map((response: Response) => response.json())) .subscribe(res_data => {

            this.myLoading=false;
            this.setting_data=res_data.setting

            if(this.setting_data.is_franchise_login_by_phone == true && this.setting_data.is_franchise_login_by_email == true)
            {
              this.email_placeholder = 1
            }
            else if(this.setting_data.is_franchise_login_by_phone == true)
            {
              this.email_placeholder = 2
            }
            else if(this.setting_data.is_franchise_login_by_email == true)
            {
              this.email_placeholder = 3
            }

            if(!this.setting_data.is_franchise_login_by_social){
                jQuery('#social').hide();
            }

        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });

    }

    google_register(){
        gapi.load('auth2', () => {
            let auth2 = gapi.auth2.init({
                client_id: '1062107977876-q30ugfv61img1eu9qjm1kiuirenma111.apps.googleusercontent.com',
                fetch_basic_profile: true,
                scope: 'profile'
            });

            auth2.signIn().then(()=> {

                if (auth2.isSignedIn.get()) {
                    let profile = auth2.currentUser.get().getBasicProfile();

                    this.franchise_login.social_id = profile.getId();
                    this.franchise_login.login_by = this.title.social;
                    this.myLoading=true;
                    this.franchiseLogin1(this.franchise_login)
                }
            });
        });

    }

    facebook_register(){

        const loginOptions: LoginOptions = {
            enable_profile_selector: true,
            return_scopes: true,
            scope: 'public_profile,email'
        };

        this.fb.login(loginOptions)
            .then((response: LoginResponse) =>{
                this.myLoading=true;
                this.fb.api('/me?fields=id,name,email')
                    .then((res: any) => {

                        this.franchise_login.social_id = res.id;
                        this.franchise_login.login_by = this.title.social
                        this.franchise_login.email = '';
                        this.franchise_login.password = '';
                        this.franchiseLogin1(this.franchise_login)
                    })
                    .catch((error: any) => console.error(error));
            })
            .catch((error: any) => console.error(error));

    }

    franchiseLogin(logindata)
    {
        this.franchise_login.social_id = '';
        this.franchise_login.login_by = this.title.manual

        logindata.email=logindata.email.trim();
        if(this.email_placeholder == 1)
        {
            var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
            if(!isNaN(logindata.email) || reg.test(logindata.email))
            {
                this.email_or_phone_error=false;
                this.franchiseLogin1(this.franchise_login)
            }
            else
            {
                this.email_or_phone_error=true;
            }
        }
        else
        {
            this.email_or_phone_error=false;
            this.franchiseLogin1(this.franchise_login)
        }
    }

    franchiseLogin1(logindata)
    {

        this.helper.http.post(this.helper.POST_METHOD.LOGIN,logindata).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

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
                    this.franchise_data = res_data;
                    if((this.setting_data.is_franchise_sms_verification == true && this.franchise_data.franchise.is_phone_number_verified == false) && (this.setting_data.is_franchise_mail_verification == true && this.franchise_data.franchise.is_email_verified == false))
                    {
                        var otp_json = {type:2, email:this.franchise_data.franchise.email, phone:this.franchise_data.franchise.phone}
                        this.generate_otp(otp_json)
                    }
                    else if(this.setting_data.is_franchise_sms_verification == true && this.franchise_data.franchise.is_phone_number_verified == false)
                    {
                        this.generate_otp({type:2, phone:this.franchise_data.franchise.phone})
                    }
                    else if(this.setting_data.is_franchise_mail_verification == true && this.franchise_data.franchise.is_email_verified == false)
                    {
                        this.generate_otp({type:2, email:this.franchise_data.franchise.email})
                    }
                    else
                    {
                        this.helper.tokenService.setToken(this.franchise_data.franchise.server_token);
                        localStorage.setItem('franchise', JSON.stringify(this.franchise_data.franchise));
                        console.log(this.franchise_data.franchise);
                        /*this.helper.data.storage = {
                            "message": this.helper.MESSAGE_CODE[this.franchise_data.message],
                            "class": "alert-info"
                        }

                        if(this.franchise_data.franchise.is_document_uploaded)
                        {
                            this.helper.router.navigate(['franchise/stores']);
                        }
                        else
                        {*/
                            this.helper.router.navigate(['franchise/stores']);
                        //}

                    }

                }
            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });
    }

    generate_otp(otp_json)
    {
        this.myLoading=true;
        this.helper.http.post(this.helper.POST_METHOD.ADMIN_OTP_VERIFICATION,otp_json).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
            this.myLoading=false;
            if(res_data.success == true)
            {
                this.helper.string_log("email" , res_data.otp_for_email)
                this.helper.string_log("sms" , res_data.otp_for_sms)
                this.modal.open();
                this.otp_for_email=res_data.otp_for_email
                this.otp_for_sms=res_data.otp_for_sms
                
                if(this.franchise_data.franchise.is_phone_number_verified == true || this.setting_data.is_franchise_sms_verification == false)
                {
                    jQuery("#otp_for_sms").css("display", "none");
                }

                if(this.franchise_data.franchise.is_email_verified == true || this.setting_data.is_franchise_mail_verification == false)
                {
                    jQuery("#otp_for_email").css("display", "none");
                }
            }
            else
            {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[this.franchise_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()

            }
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }

    otp_var(otp)
    {
        if(otp.sms_otp == undefined)
        {
            if(otp.email_otp == this.otp_for_email)
            {

                this.otp_verified({franchise_id :this.franchise_data.franchise._id , email :this.franchise_data.franchise.email , server_token :this.franchise_data.franchise.server_token, is_email_verified:true})
            }
            else
            {
                this.opt_error_message = 1;
            }
        }
        else if(otp.email_otp == undefined)
        {
            if(otp.sms_otp == this.otp_for_sms)
            {
                this.otp_verified({franchise_id :this.franchise_data.franchise._id , phone :this.franchise_data.franchise.phone , server_token :this.franchise_data.franchise.server_token, is_phone_number_verified:true})
            }
            else
            {
                this.opt_error_message = 2;
            }
        }
        else
        {
            if(otp.sms_otp == this.otp_for_sms && otp.email_otp == this.otp_for_email)
            {
                this.otp_verified({franchise_id :this.franchise_data.franchise._id , email :this.franchise_data.franchise.email , phone : this.franchise_data.franchise.phone , server_token :this.franchise_data.franchise.server_token, is_email_verified:true , is_phone_number_verified:true})
            }
            else
            {
                this.opt_error_message = 3;
            }
        }
    }

    otp_verified(otp_verified_json)
    {
        this.modal.close();
        this.myLoading=true;
        this.helper.http.post(this.helper.POST_METHOD.OTP_VERIFICATION,otp_verified_json).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
            this.myLoading=false;
            if(res_data.success == true)
            {
                this.helper.tokenService.setToken(this.franchise_data.franchise.server_token);
                localStorage.setItem('franchise', JSON.stringify(this.franchise_data.franchise));
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[this.franchise_data.message],
                    "class": "alert-info"
                }
                this.helper.router.navigate(['franchise/order']);
            }
            else{
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            }
                
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }
}
