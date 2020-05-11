import { Component , ViewChild,ViewContainerRef } from '@angular/core';
import {Response } from '@angular/http';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Helper} from "../../franchise_helper";
declare var jQuery:any;
import { FacebookService, InitParams, LoginResponse, LoginOptions } from 'ngx-facebook';
declare var gapi;
import { map } from 'rxjs/operators';

export interface FranchiseRegister{

        name: String,
        email: String,
        password: String,
        social_unique_id: String,
        login_by:String,
        confirm_password: String,
        website_url: String,
        slogan: String,
        country_id: Object,
        city_id: Object,
        address: String,
        country_phone_code: String,
        phone: Number,
	    store_delivery_id: Object,
        latitude: Number,
        longitude: Number,
        famous_for: String,
        image_url: String,
       
        is_email_verified:Boolean,
        is_phone_number_verified:Boolean
}

@Component({
    selector: 'franchise_register',
    templateUrl: 'franchise_register.template.html',
    providers: [Helper, FacebookService]
})
export class franchise_registerComponent {

    @ViewChild('myModal')
    modal: ModalComponent;

    private franchise_register: FranchiseRegister;
    title:any;
    button:any;
    code:any;
    image_url:string;
    minimum_phone_number_length:number;
    maximum_phone_number_length:number;
    country_list:any[];
    city_list:any[];
    delivery_list:any[];
    country_phone_code_list:any[];
    setting_data:any;
    otp_for_email:number;
    otp_for_sms:number;
    stor_data:any;
    opt_error_message:number;
    
    validation_message:any;

    myLoading:boolean = true;
    constructor(public helper: Helper, private fb: FacebookService, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);

        let initParams: InitParams = {
            appId: '601526146700337',
            xfbml: true,
            version: 'v2.10'
        };

        fb.init(initParams);
    }

    ngAfterViewInit() {
            jQuery(".chosen-select").chosen();
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

        this.title=this.helper.title
        this.button=this.helper.button
        this.validation_message=this.helper.validation_message;

        this.franchise_register ={

            name: "",
            email: "",
            password: "",
            social_unique_id: "",
            login_by: this.title.manual,
            confirm_password: "",
            website_url: "",
            slogan: "",
            country_id: "",
            city_id: "",
            address: "",
            country_phone_code: "",
            phone: null,
            store_delivery_id: "",
            latitude: null,
            longitude: null,
            famous_for: "",
            image_url: "./default.png",
          
            is_phone_number_verified: false,
            is_email_verified : false

        }
        this.helper.http.get(this.helper.GET_METHOD.GET_COUNTRY_LIST).pipe(map((response: Response) => response.json())) .subscribe(res_data => {

            this.country_list = res_data.countries;
            setTimeout(function() {
                jQuery(".chosen-select").trigger("chosen:updated");
            },1000);

        },
        (error: any) => {
                this.helper.http_status(error)
        });
        this.helper.http.post(this.helper.POST_METHOD.GET_SETTING_DETAIL,{}).pipe(map((response: Response) => response.json())) .subscribe(res_data => {
            this.myLoading=false;
            this.setting_data=res_data.setting

          
            if(res_data.setting.is_show_optional_field_in_franchise_register == false)
            {
                jQuery("#Optiona_field").css("display", "none");
            }
            if(!this.setting_data.is_franchise_login_by_social){
                jQuery('#social').hide();
            }
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
        this.city_list=[]
        this.minimum_phone_number_length=10
        this.maximum_phone_number_length=10
        this.delivery_list=[]


        jQuery(this.helper.elementRef.nativeElement).find('#country').on('change', (evnt,res_data) => {

                        this.get_city_list(res_data.selected)

        });

        jQuery(this.helper.elementRef.nativeElement).find('#city').on('change', (evnt,res_data) => {

                        this.get_delivery_list(res_data.selected)

        });

        jQuery(this.helper.elementRef.nativeElement).find('#delivery').on('change', (evnt,res_data) => {

                        this.franchise_register.store_delivery_id=res_data.selected

        });


    }
    public formData = new FormData();

    image_update($event) {
        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];

        if(image_url.type == "image/jpeg" || image_url.type == "image/jpg" || image_url.type == "image/png")
        {
            this.formData = new FormData();
            this.image_url= image_url
            var reader = new FileReader();

            reader.onload =  (e : any) => {
                this.franchise_register.image_url = e.target.result
            }
            reader.readAsDataURL(image_url);
        }

    }

    google_register(){

        gapi.load('auth2', () => {
            let auth2 = gapi.auth2.init({
                client_id: '1062107977876-q30ugfv61img1eu9qjm1kiuirenma111.apps.googleusercontent.com',
                fetch_basic_profile: true,
                scope: 'profile'
            });

            auth2.signIn().then(()=> {
                this.myLoading=true;
                if (auth2.isSignedIn.get()) {
                    let profile = auth2.currentUser.get().getBasicProfile();

                    this.franchise_register.name = profile.getName();
                    this.franchise_register.social_unique_id = profile.getId();
                    this.franchise_register.login_by = this.title.social
                    this.franchise_register.email = profile.getEmail();
                    this.franchise_register.password = '123456';
                    this.franchise_register.confirm_password = '123456';
                    let image_url = profile.getImageUrl();
                    this.generate_file(image_url);
                }
            });
        });
        var interval = setInterval(function() {
            // clearInterval(interval)
        }, 1000);

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

                        this.franchise_register.name = res.name;
                        this.franchise_register.social_unique_id = res.id;
                        this.franchise_register.login_by = this.title.social
                        this.franchise_register.email = res.email;
                        this.franchise_register.password = '123456';
                        this.franchise_register.confirm_password = '123456';
                        let image_url = "https://graph.facebook.com/" + res.id + "/picture?width=250&height=250";

                        this.generate_file(image_url)


                    })
                    .catch((error: any) => console.error(error));
            })
            .catch((error: any) => console.error(error));

    }

    generate_file(image_url){
        var getFileBlob = function (url, cb) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = "blob";
            xhr.addEventListener('load', function() {
                cb(xhr.response);
            });
            xhr.send();
        };

        var blobToFile = function (blob, name) {
            blob.lastModifiedDate = new Date();
            blob.name = "profile";
            return blob;
        };

        var getFileObject = function(filePathOrUrl, cb) {
            getFileBlob(filePathOrUrl, function (blob) {
                cb(blobToFile(blob, image_url));
            });
        };

        getFileObject(image_url,  (fileObject) => {

            var reader = new FileReader();
            this.image_url= fileObject;
            reader.onload =  (e : any) => {
                this.franchise_register.image_url = e.target.result
            }
            reader.readAsDataURL(fileObject);
            this.myLoading=false;
        });
    }

    get_city_list(countryid)
    {
       
        jQuery('#basic-addon2').show();

        this.franchise_register.phone=null;
        this.franchise_register.country_id=countryid
        this.delivery_list=[];
        this.franchise_register.store_delivery_id = '';
        this.franchise_register.city_id='';
        this.myLoading=true;
        this.helper.http.post(this.helper.POST_METHOD.GET_CITY_LIST,{country_id:countryid}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
            this.myLoading=false;
            if(res_data.success)
            {

                this.franchise_register.country_phone_code=res_data.country_phone_code
                this.city_list=res_data.cities
                this.minimum_phone_number_length=res_data.minimum_phone_number_length
                this.maximum_phone_number_length=res_data.maximum_phone_number_length;
                
                var country_code = res_data.country_code;

                var autocompleteElm = <HTMLInputElement>document.getElementById('address');
                let autocomplete = new google.maps.places.Autocomplete((autocompleteElm),{types: ['address'], componentRestrictions: { country: country_code } });

                autocomplete.addListener( 'place_changed', () => {
                        let place = autocomplete.getPlace();
                        let lat = place.geometry.location.lat();
                        let lng = place.geometry.location.lng();
                        this.franchise_register.address=place.formatted_address
                        this.franchise_register.latitude=lat
                        this.franchise_register.longitude=lng
                });

            }
            else
            {
                if(res_data.error_code!==801)
                {
                    this.franchise_register.country_phone_code=res_data.country_phone_code
                    this.minimum_phone_number_length=res_data.minimum_phone_number_length
                    this.maximum_phone_number_length=res_data.maximum_phone_number_length
                    
                    let country_code = res_data.country_code;

                    let autocompleteElm = <HTMLInputElement>document.getElementById('address');
                    let autocomplete = new google.maps.places.Autocomplete((autocompleteElm),{types: ['address'], componentRestrictions: { country: country_code } });

                    autocomplete.addListener( 'place_changed', () => {
                            var place = autocomplete.getPlace();
                            var lat = place.geometry.location.lat();
                            var lng = place.geometry.location.lng();
                            this.franchise_register.address=place.formatted_address
                            this.franchise_register.latitude=lat
                            this.franchise_register.longitude=lng
                    });
                }
                else
                {
                    this.franchise_register.country_phone_code=""
                }
                this.city_list=[];
            }
            setTimeout(function() {
                jQuery("#city").trigger("chosen:updated");
            }, 1000);

        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
        setInterval(function() {
            
        }, 100);

    }

    get_delivery_list(cityid)
    {
        this.myLoading=true;
        this.franchise_register.city_id=cityid;
        this.franchise_register.store_delivery_id = '';
        this.helper.http.post(this.helper.POST_METHOD.GET_DELIVERY_LIST_FOR_CITY,{city_id:cityid}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
            this.myLoading=false;
            if(res_data.success)
            {
                this.delivery_list=res_data.deliveries
            }
            else {
                this.delivery_list = [];
            }
            setTimeout(function() {
                jQuery("#delivery").trigger("chosen:updated");
            }, 1000);
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });

    }

    franchiseRegister1(stordata)
    {
       
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if(reg.test(stordata.email.trim()) && stordata.password.trim() === stordata.confirm_password.trim()){

            this.myLoading=true;
            this.stor_data=stordata
            if(this.setting_data.is_franchise_sms_verification == true || this.setting_data.is_franchise_mail_verification == true)
            {
                this.helper.http.post(this.helper.POST_METHOD.ADMIN_OTP_VERIFICATION,{type:2, email:stordata.email, phone:stordata.phone}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
                    this.myLoading=false;
                    
                    if(res_data.success == true)
                    {
                        this.helper.string_log("email" , res_data.otp_for_email)
                        this.helper.string_log("sms" , res_data.otp_for_sms)
                        this.modal.open();
                        this.otp_for_email=res_data.otp_for_email
                        this.otp_for_sms=res_data.otp_for_sms
                        if(this.setting_data.is_franchise_sms_verification == false)
                        {
                            jQuery("#otp_for_sms").css("display", "none");
                        }

                        if(this.setting_data.is_franchise_mail_verification == false)
                        {
                            jQuery("#otp_for_email").css("display", "none");
                        }
                    }
                    else
                    {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
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
            else {

                this.register(stordata)
            }
        }
    }

    otp_var(otp)
    {
        if(otp.sms_otp == undefined)
        {
            if(otp.email_otp == this.otp_for_email)
            {
                this.franchise_register.is_email_verified = true;
                this.register(this.stor_data)
            }
            else
            {
                this.opt_error_message = 1
            }
        }
        else if(otp.email_otp == undefined)
        {
            if(otp.sms_otp == this.otp_for_sms)
            {
                this.franchise_register.is_phone_number_verified = true;
                this.register(this.stor_data)
            }
            else
            {
                this.opt_error_message = 2
            }
        }
        else
        {
            if(otp.sms_otp == this.otp_for_sms && otp.email_otp == this.otp_for_email)
            {
                this.franchise_register.is_email_verified = true;
                this.franchise_register.is_phone_number_verified = true;
                this.register(this.stor_data)
            }
            else
            {
                this.opt_error_message = 3
            }
        }
    }

    register(franchise_data)
    {
        if(this.franchise_register.login_by == this.title.social){
            this.franchise_register.password = '';
            this.franchise_register.confirm_password='';
        }
        this.myLoading=true;
        this.formData.append('image_url', this.image_url);
        this.formData.append('phone',franchise_data.phone.trim());
        this.formData.append('password',this.franchise_register.password.trim());
        this.formData.append('country_id',franchise_data.country_id);
        this.formData.append('city_id',franchise_data.city_id);
        this.formData.append('social_id', this.franchise_register.social_unique_id);
        this.formData.append('login_by', this.franchise_register.login_by);
        this.formData.append('store_delivery_id',franchise_data.store_delivery_id);
        this.formData.append('country_phone_code',franchise_data.country_phone_code);
        this.formData.append('name',franchise_data.name.trim());
        this.formData.append('email',franchise_data.email.trim());
        this.formData.append('address',franchise_data.address.trim());
        this.formData.append('latitude',franchise_data.latitude);
        this.formData.append('longitude',franchise_data.longitude);
        this.formData.append('website_url',franchise_data.website_url.trim());
        this.formData.append('famous_for',franchise_data.famous_for);
        this.formData.append('slogan',franchise_data.slogan);
       
        this.formData.append('is_phone_number_verified',this.franchise_register.is_phone_number_verified);
        this.formData.append('is_email_verified',this.franchise_register.is_email_verified);
        console.log("bhargav: ");
        console.log(this.helper.POST_METHOD.REGISTER);
        this.helper.http.post(this.helper.POST_METHOD.REGISTER,this.formData).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

            this.myLoading=false;
                            if(res_data.success == false)
                            {
                                this.helper.data.storage = {
                                    "message": this.helper.ERROR_CODE[res_data.error_code],
                                    "class": "alert-danger"
                                }
                                this.helper.message();
                                this.formData = new FormData();
                                if(this.franchise_register.login_by == this.title.social){
                                    this.franchise_register.password = '123456';
                                    this.franchise_register.confirm_password='123456';
                                }
                            }
                            else
                            {
                                this.helper.data.storage = {
                                    "message": this.helper.MESSAGE_CODE[res_data.message],
                                    "class": "alert-info"
                                }
                                this.helper.router.navigate(['franchise/login']);
                            }
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }
}
