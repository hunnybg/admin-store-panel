import { Component, OnInit, ViewChild ,ElementRef,ViewContainerRef} from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../franchise_helper";
declare var jQuery:any;
declare var swal: any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { map } from 'rxjs/operators';

export interface FranchiseStoreRegister{

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
  selector: 'app-add_store',
  templateUrl: './add_store.component.html',
    providers: [Helper]
})
export class AddFranchiseStoreComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;

    private store_register: FranchiseStoreRegister;
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
    is_referral:Boolean = true;
    is_country_referral:Boolean = true;
    referral_code:string = '';
    is_referral_apply:Boolean = false;
    validation_message:any;


    myLoading:boolean = true;
    constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);

    }

    ngAfterViewInit() {
            jQuery(".chosen-select").chosen();
    }

    
    ngOnInit() {

        let token = this.helper.tokenService.getToken();
        
        /*if(token && token.token) {
            this.helper.data.storage = {
                "message": 999,
                "class": "alert-info"
            }

            this.helper.router.navigate(['franchise/stores']);
        }*/
        console.log("token: ");
        console.log(token);
        this.helper.message()

        this.title=this.helper.title
        this.button=this.helper.button
        this.validation_message=this.helper.validation_message;

        this.store_register ={

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

                        this.store_register.store_delivery_id=res_data.selected

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
                this.store_register.image_url = e.target.result
            }
            reader.readAsDataURL(image_url);
        }

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
                this.store_register.image_url = e.target.result
            }
            reader.readAsDataURL(fileObject);
            this.myLoading=false;
        });
    }
        
    get_city_list(countryid)
    {
        this.is_referral_apply=false;
        this.referral_code = '';
        jQuery('#basic-addon2').show();

        this.store_register.phone=null;
        this.store_register.country_id=countryid
        this.delivery_list=[];
        this.store_register.store_delivery_id = '';
        this.store_register.city_id='';
        this.myLoading=true;
        this.helper.http.post(this.helper.POST_METHOD.GET_CITY_LIST,{country_id:countryid}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
            this.myLoading=false;
            if(res_data.success)
            {

                this.store_register.country_phone_code=res_data.country_phone_code
                this.city_list=res_data.cities
                this.minimum_phone_number_length=res_data.minimum_phone_number_length
                this.maximum_phone_number_length=res_data.maximum_phone_number_length;
                this.is_country_referral = res_data.is_referral_store;
                var country_code = res_data.country_code;

                var autocompleteElm = <HTMLInputElement>document.getElementById('address');
                let autocomplete = new google.maps.places.Autocomplete((autocompleteElm),{types: ['address'], componentRestrictions: { country: country_code } });

                autocomplete.addListener( 'place_changed', () => {
                        let place = autocomplete.getPlace();
                        let lat = place.geometry.location.lat();
                        let lng = place.geometry.location.lng();
                        this.store_register.address=place.formatted_address
                        this.store_register.latitude=lat
                        this.store_register.longitude=lng
                });

            }
            else
            {
                if(res_data.error_code!==801)
                {
                    this.store_register.country_phone_code=res_data.country_phone_code
                    this.minimum_phone_number_length=res_data.minimum_phone_number_length
                    this.maximum_phone_number_length=res_data.maximum_phone_number_length
                    this.is_country_referral = res_data.is_referral_store;
                    let country_code = res_data.country_code;

                    let autocompleteElm = <HTMLInputElement>document.getElementById('address');
                    let autocomplete = new google.maps.places.Autocomplete((autocompleteElm),{types: ['address'], componentRestrictions: { country: country_code } });

                    autocomplete.addListener( 'place_changed', () => {
                            var place = autocomplete.getPlace();
                            var lat = place.geometry.location.lat();
                            var lng = place.geometry.location.lng();
                            this.store_register.address=place.formatted_address
                            this.store_register.latitude=lat
                            this.store_register.longitude=lng
                    });
                }
                else
                {
                    this.store_register.country_phone_code=""
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
        this.store_register.city_id=cityid;
        this.store_register.store_delivery_id = '';
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
    storeRegister(stordata)
    {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        
        if(reg.test(stordata.email.trim()) && stordata.password.trim() === stordata.confirm_password.trim()){

            this.myLoading=true;
            this.stor_data=stordata
            if(this.setting_data.is_store_sms_verification == true || this.setting_data.is_store_mail_verification == true)
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
                        if(this.setting_data.is_store_sms_verification == false)
                        {
                            jQuery("#otp_for_sms").css("display", "none");
                        }

                        if(this.setting_data.is_store_mail_verification == false)
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
                this.store_register.is_email_verified = true;
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
                this.store_register.is_phone_number_verified = true;
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
                this.store_register.is_email_verified = true;
                this.store_register.is_phone_number_verified = true;
                this.register(this.stor_data)
            }
            else
            {
                this.opt_error_message = 3
            }
        }
    }

    register(store_data)
    {
        if(this.store_register.login_by == this.title.social){
            this.store_register.password = '';
            this.store_register.confirm_password='';
        }
        var franchise = JSON.parse(localStorage.getItem('franchise'));
        this.myLoading=true;
        this.formData.append('image_url', this.image_url);
        this.formData.append('phone',store_data.phone.trim());
        this.formData.append('password',this.store_register.password.trim());
        this.formData.append('country_id',store_data.country_id);
        this.formData.append('franchise_id',franchise._id);
        this.formData.append('city_id',store_data.city_id);
        //this.formData.append('social_id', this.store_register.social_unique_id);
        this.formData.append('login_by', "manual");
        this.formData.append('store_delivery_id',store_data.store_delivery_id);
        this.formData.append('country_phone_code',store_data.country_phone_code);
        this.formData.append('name',store_data.name.trim());
        this.formData.append('email',store_data.email.trim());
        this.formData.append('address',store_data.address.trim());
        this.formData.append('latitude',store_data.latitude);
        this.formData.append('longitude',store_data.longitude);
        if(store_data.website_url != undefined){
            this.formData.append('website_url',store_data.website_url.trim());
        }else{
            this.formData.append('website_url','');
        }
        this.formData.append('famous_for',store_data.famous_for);
        this.formData.append('slogan',store_data.slogan);
        this.formData.append('referral_code','');
        this.formData.append('is_phone_number_verified',store_data.is_phone_number_verified);
        this.formData.append('is_email_verified',store_data.is_email_verified);

        this.helper.http.post(this.helper.POST_METHOD.STORE_REGISTER,this.formData).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

            this.myLoading=false;
            console.log(res_data);
                            if(res_data.success == false)
                            {
                                this.helper.data.storage = {
                                    "message": this.helper.ERROR_CODE[res_data.error_code],
                                    "class": "alert-danger"
                                }
                                this.helper.message();
                                this.formData = new FormData();
                                if(this.store_register.login_by == this.title.social){
                                    this.store_register.password = '123456';
                                    this.store_register.confirm_password='123456';
                                }
                            }
                            else
                            {
                                var array = [];
                                array = franchise.store_ids;
                                array.push(res_data.store._id);
                                franchise.store_ids = array;
                                localStorage.setItem('franchise', JSON.stringify(franchise))
                                this.helper.data.storage = {
                                    "message": this.helper.MESSAGE_CODE[res_data.message],
                                    "class": "alert-info"
                                }

                                this.helper.router.navigate(['franchise/stores']);
                            }
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }

}
