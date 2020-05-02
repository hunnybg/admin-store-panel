import { Component, OnInit ,ViewContainerRef , ViewChild, Output, EventEmitter} from '@angular/core';
import {Response } from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Helper} from "../../franchise_helper";
declare var jQuery:any;
declare var c3: any;

export interface FranchiseEdit{

        franchise_id: Object,
        server_token:String,
        name: String,
        email: String,
        old_password: String,
        new_password: String,
        login_by: String,
        social_id: any[],
        confirm_password: String,
        website_url: String,
        slogan: String,
        country_name: String,
        country_code: String,
        city_name: String,
        address: String,
        country_phone_code: String,
        phone: Number,
        store_delivery_name: String,
        latitude: Number,
        longitude: Number,
        famous_for: String,
        image_url: String,
        offer: String,
        referral_code:String,
    referral_credit:String,
    total_referred:Number


}

export interface OrderDetail{
    total_orders: Number,
    accepted_orders: Number,
    completed_orders: Number,
    cancelled_orders: Number,
    completed_order_percentage: Number
}

@Component({
    selector: 'profile',
    templateUrl: './profile.component.html',
    providers: [Helper]
})
export class FranchiseProfileComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;

    @ViewChild('oldPasswordModal')
    old_password_modal: ModalComponent;

    private franchise_edit: FranchiseEdit;
    private order_detail: OrderDetail;

    title:any;
    button:any;
    heading_title:any;
    validation_message:any;
    minimum_phone_number_length:number = 8;
    maximum_phone_number_length:number = 10;
    setting_data:any;
    franchise_detail:any;
    otp_for_email:number;
    otp_for_sms:number;
    franchise_data:any;
    opt_error_message:number;
    edit:Boolean;

    myLoading:boolean = true;

    constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);

    }
    ngOnInit() {
        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {
            this.helper.router.navigate(['franchise/login']);
        }
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title
        this.validation_message=this.helper.validation_message
        this.edit=false;

        this.franchise_edit ={
                franchise_id:"",
                server_token:"",
                name: "",
                email: "",
                old_password: "",
                new_password: "",
                confirm_password:"",
                login_by: "",
                social_id: [],
                website_url: "",
                slogan: "",
                country_name: "",
                country_code:"",
                city_name: "",
                address: "",
                country_phone_code: "",
                phone: null,
                store_delivery_name: "",
                latitude: null,
                longitude: null,
                famous_for: "",
                image_url: "",
                offer: "",
                referral_code:"",
                referral_credit:"",
                total_referred:0
        }
        this.order_detail = {
            total_orders: 0,
            accepted_orders: 0,
            completed_orders: 0,
            cancelled_orders: 0,
            completed_order_percentage: 0
        }

        var franchise = JSON.parse(localStorage.getItem('franchise'));
        if(franchise!==null)
        {
            this.franchise_edit.franchise_id= franchise._id;
            this.franchise_edit.server_token= franchise.server_token;
        }
        if(!JSON.parse(localStorage.getItem('franchise_document_ulpoaded')) && JSON.parse(localStorage.getItem('admin_franchise_document_ulpoaded')))
        {
            this.helper.router.navigate(['franchise/upload_document']);
        }

        this.helper.http.post(this.helper.POST_METHOD.GET_SETTING_DETAIL,{}).map((response: Response) => response.json()) .subscribe(res_data => {

            this.setting_data=res_data.setting

        },
        (error: any) => {
                this.helper.http_status(error)
        });




        this.helper.http.post(this.helper.POST_METHOD.GET_FRANCHISE_DATA,{franchise_id:this.franchise_edit.franchise_id, server_token:this.franchise_edit.server_token}).map((response: Response) => response.json()) .subscribe(res_data => {

            this.myLoading=false;
            if(res_data.success == false)
            {
                  this.helper.data.storage = {
                      "code": res_data.error_code,
                      "message": this.helper.ERROR_CODE[res_data.error_code],
                      "class": "alert-danger"
                  }
            }
            else
            {
                this.order_detail=res_data.order_detail;

                let chart31 = c3.generate({
                    bindto: '#c1',
                    data: {

                        columns: [
                            [this.title.completed_order, this.order_detail.completed_order_percentage]
                        ],
                        type: 'gauge',
                    },
                    legend: {
                        show: true
                    },
                    gauge: {
                        label: {
                            show: false // to turn off the min/max labels.
                        },
                        width: 30 // for adjusting arc thickness
                    },
                    color: {
                        pattern: ['#1e1e1e'], // the three color levels for the percentage values.

                    }
                });

                this.franchise_detail=res_data.franchise_detail;
                this.franchise_edit.name=res_data.franchise_detail.name;
                this.franchise_edit.login_by=res_data.franchise_detail.login_by;
                this.franchise_edit.social_id = res_data.franchise_detail.social_ids;
                this.franchise_edit.email= res_data.franchise_detail.email;
                this.franchise_edit.website_url= res_data.franchise_detail.website_url;
                this.franchise_edit.slogan= res_data.franchise_detail.slogan;
                this.franchise_edit.country_name= res_data.franchise_detail.country_details.country_name;
                this.franchise_edit.city_name= res_data.franchise_detail.city_details.city_name;
                this.franchise_edit.country_code = res_data.franchise_detail.country_details.country_code;
                this.franchise_edit.address= res_data.franchise_detail.address;
                this.franchise_edit.country_phone_code= res_data.franchise_detail.country_phone_code;
                this.franchise_edit.phone= res_data.franchise_detail.phone;
                this.franchise_edit.store_delivery_name= res_data.franchise_detail.delivery_details.delivery_name;
                this.franchise_edit.latitude= res_data.franchise_detail.location[0];
                this.franchise_edit.longitude= res_data.franchise_detail.location[1];
                this.franchise_edit.famous_for= res_data.franchise_detail.famous_for;
                this.franchise_edit.image_url= res_data.franchise_detail.image_url;
                this.franchise_edit.offer= res_data.franchise_detail.offer;
                this.franchise_edit.referral_code= res_data.franchise_detail.referral_code;
                this.franchise_edit.referral_credit= res_data.franchise_detail.wallet;
                this.franchise_edit.total_referred= res_data.franchise_detail.total_referrals;
                this.minimum_phone_number_length=res_data.franchise_detail.country_details.minimum_phone_number_length;
                this.maximum_phone_number_length=res_data.franchise_detail.country_details.maximum_phone_number_length;
                var country_code = res_data.franchise_detail.country_details.country_code;

                var autocompleteElm = <HTMLInputElement>document.getElementById('address');
                let autocomplete = new google.maps.places.Autocomplete((autocompleteElm),{types: ['address'], componentRestrictions: { country: country_code } });

                autocomplete.addListener( 'place_changed', () => {
                        var place = autocomplete.getPlace();
                        var lat = place.geometry.location.lat();
                        var lng = place.geometry.location.lng();
                        this.franchise_edit.address=place.formatted_address
                        this.franchise_edit.latitude=lat
                        this.franchise_edit.longitude=lng
                });
            }
            
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
        




        jQuery(window).resize(function() {
            if (jQuery(window).width() < 454) {
                jQuery('.box').removeClass('col-xs-1');
                jQuery('.total').removeClass('col-xs-5');
                jQuery('.box').addClass('col-xs-2');
                jQuery('.total').addClass('col-xs-10');
                jQuery('.box1').css('padding','')
                jQuery('.total1').css('padding','')
            } else {
                jQuery('.box').removeClass('col-xs-2');
                jQuery('.total').removeClass('col-xs-10');
                jQuery('.box').addClass('col-xs-1');
                jQuery('.total').addClass('col-xs-5');
                jQuery('.box1').css('padding',0)
                jQuery('.total1').css('padding',0)
            }
        });
        setTimeout(function() {
            if (jQuery(window).width() < 454) {
                jQuery('.box').removeClass('col-xs-1');
                jQuery('.total').removeClass('col-xs-5');
                jQuery('.box').addClass('col-xs-2');
                jQuery('.total').addClass('col-xs-10');
                jQuery('.box1').css('padding','')
                jQuery('.total1').css('padding','')
            } else {
                jQuery('.box').removeClass('col-xs-2');
                jQuery('.total').removeClass('col-xs-10');
                jQuery('.box').addClass('col-xs-1');
                jQuery('.total').addClass('col-xs-5');
                jQuery('.box1').css('padding',0)
                jQuery('.total1').css('padding',0)
            }
        },500);
    }
    public formData = new FormData();

    change_image($event) {
        
        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];

        if(image_url.type == "image/jpeg" || image_url.type == "image/jpg" || image_url.type == "image/png")
        {
            this.formData = new FormData();
            this.formData.append('image_url', image_url);

            var reader = new FileReader();

            reader.onload =  (e : any) => {
                this.franchise_edit.image_url = e.target.result
            }
            reader.readAsDataURL(image_url);
        }
    }

    old_password_update(){
        this.old_password_modal.close();
        this.UpdateFranchiseDetail(this.franchise_edit)
    }

    UpdateFranchise(franchise_data){

        if(this.franchise_edit.social_id.length == 0){

            this.old_password_modal.open();
        } else {
            this.UpdateFranchiseDetail(franchise_data)
        }
    }

    UpdateFranchiseDetail(franchise_data)
    {
        
        this.franchise_data=franchise_data
        var franchise = JSON.parse(localStorage.getItem('franchise'));
        if((this.setting_data.is_franchise_sms_verification == true && franchise_data.phone !== franchise.phone) && (this.setting_data.is_franchise_mail_verification == true && franchise_data.email !== franchise.email))
        {
            var otp_json = {type:2, email:this.franchise_data.email, phone:this.franchise_data.phone}
            this.generate_otp(otp_json)
        }
        else if(this.setting_data.is_franchise_sms_verification == true && franchise_data.phone !== franchise.phone)
        {
            this.generate_otp({type:2, phone:this.franchise_data.phone})
        }
        else if(this.setting_data.is_franchise_mail_verification == true && franchise_data.email !== franchise.email)
        {
            this.generate_otp({type:2, email:this.franchise_data.email})
        }
        else
        {
            this.franchise_update(franchise_data)
        }
    }

    generate_otp(otp_json)
    {
        this.myLoading=true;
        var franchise = JSON.parse(localStorage.getItem('franchise'));
        this.helper.http.post(this.helper.POST_METHOD.ADMIN_OTP_VERIFICATION,otp_json).map((res:Response) => res.json()).subscribe(res_data=>{

            this.myLoading=false;
            if(res_data.success == true)
            {
                this.helper.string_log("email" , res_data.otp_for_email)
                this.helper.string_log("sms" , res_data.otp_for_sms)
                this.modal.open();
                this.otp_for_email=res_data.otp_for_email
                this.otp_for_sms=res_data.otp_for_sms
                
                if(this.franchise_data.phone == franchise.phone || this.setting_data.is_franchise_sms_verification == false)
                  {
                      jQuery("#otp_for_sms").css("display", "none");
                  }

                  if(this.franchise_data.email == franchise.email || this.setting_data.is_franchise_mail_verification == false)
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

    otp_var(otp)
    {
        if(otp.sms_otp == undefined)
        {
            if(otp.email_otp == this.otp_for_email)
            {
              this.franchise_update(this.franchise_data)
                //this.otp_verified({store_id :this.store_data.store_id , email :this.store_data.email , server_token :this.store_data.server_token, is_email_verified:true})
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
              this.franchise_update(this.franchise_data)
                //this.otp_verified({store_id :this.store_data.store_id , phone :this.store_data.phone , server_token :this.store_data.server_token, is_phone_number_verified:true})
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
                this.franchise_update(this.franchise_data)
                //this.otp_verified({store_id :this.store_data.store_id , email :this.store_data.email , phone : this.store_data.phone , server_token :this.store_data.server_token, is_email_verified:true , is_phone_number_verified:true})
            }
            else
            {
                this.opt_error_message = 3
            }
        }
    }

    otp_verified(otp_verified_json)
    {
        this.myLoading=true;
        this.helper.http.post(this.helper.POST_METHOD.OTP_VERIFICATION,otp_verified_json).map((res:Response) => res.json()).subscribe(res_data=>{
            this.myLoading=false;
            if(res_data.success == true)
            {
                this.franchise_update(this.franchise_data)
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

    franchise_update(franchise_data)
    {

        this.myLoading=true;
      this.modal.close();
      this.formData.append('franchise_id',franchise_data.franchise_id);
      this.formData.append('server_token',franchise_data.server_token);
      this.formData.append('phone',franchise_data.phone);
      this.formData.append('email',franchise_data.email.trim());
      this.formData.append('old_password',franchise_data.old_password);
      this.formData.append('new_password',franchise_data.new_password);
      this.formData.append('name',franchise_data.name.trim());
      this.formData.append('address',franchise_data.address.trim());
      this.formData.append('latitude',franchise_data.latitude);
      this.formData.append('longitude',franchise_data.longitude);
      this.formData.append('website_url',franchise_data.website_url.trim());
      if(franchise_data.famous_for != undefined){
          this.formData.append('famous_for',franchise_data.famous_for.trim());
      }
      if(franchise_data.slogan != undefined){
          this.formData.append('slogan',franchise_data.slogan.trim());
      }
      if(franchise_data.offer != undefined){
          this.formData.append('offer',franchise_data.offer.trim());
      }
        this.formData.append('social_id',franchise_data.social_id);
        this.formData.append('login_by',franchise_data.login_by);

      this.helper.http.post(this.helper.POST_METHOD.UPDATE,this.formData).map((response: Response) => response.json()) .subscribe(res_data => {

          this.myLoading=false;
          this.franchise_edit.old_password="";
          this.franchise_edit.new_password="";
          this.franchise_edit.confirm_password="";
          jQuery('#remove').click();
          this.edit=false;
          if(res_data.success == false)
          {
            this.helper.data.storage = {
                "code": res_data.error_code,
                "message": this.helper.ERROR_CODE[res_data.error_code],
                "class": "alert-danger"
            }
            this.helper.message()
            this.formData = new FormData();
            this.franchise_edit.name=this.franchise_detail.name;
            this.franchise_edit.website_url= this.franchise_detail.website_url;
            this.franchise_edit.slogan= this.franchise_detail.slogan;
            this.franchise_edit.address= this.franchise_detail.address;
            this.franchise_edit.phone= this.franchise_detail.phone;
            this.franchise_edit.email= this.franchise_detail.email;
            this.franchise_edit.latitude= this.franchise_detail.location[0];
            this.franchise_edit.longitude= this.franchise_detail.location[1];
            this.franchise_edit.famous_for= this.franchise_detail.famous_for;
            this.franchise_edit.image_url= this.franchise_detail.image_url;
            this.franchise_edit.offer= this.franchise_detail.offer;


          }
          else
          {
              localStorage.setItem('franchise', JSON.stringify(res_data.franchise));
              this.helper.data.storage = {
                  "message": this.helper.MESSAGE_CODE[res_data.message],
                  "class": "alert-info"
              }
              this.helper.message()
               location.reload();
              
          }
      },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }

}
