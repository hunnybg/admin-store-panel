import { Component, OnInit, ViewChild } from '@angular/core';
import { smoothlyMenu } from '../../../app.helpers';
import {Response } from '@angular/http';
declare var jQuery:any;
import {Helper} from "../../../views/franchise_helper";
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { UUID } from 'angular2-uuid';

@Component({
    selector: 'topnavbar',
    templateUrl: 'topnavbar.template.html',
    providers: [Helper]
})
export class TopnavbarComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;
    franchise_id:Object;
    server_token:String;
    interval:any;
    declined:Boolean;
    error_code : any;
    menu_title:any;
    title:any;
    heading_title:any;
    constructor(private helper:Helper) {

        helper.trans.addLangs([ 'sp','fr','hi','cn','en']);
            
        var language = JSON.parse(localStorage.getItem('language'));
        if(language == '' || language == undefined)
        {
            language = 'en'
        }
        helper.trans.setDefaultLang('en');
        helper.trans.use(language);

        const browserLang = helper.trans.getBrowserLang();
    }

    toggleNavigation(): void {

        // if(jQuery(window).width()>768){
                jQuery("body").toggleClass("mini-navbar");
                jQuery(".full_menu").toggleClass("full_menu1");

                // jQuery("nav").toggleClass("navbar");
                // jQuery("nav").toggleClass("navbar1");
                // jQuery("nav span a").toggleClass("minimalize-styl-2");
                // jQuery("nav span a").toggleClass("minimalize-styl-3");
        // }
        // else
        // {
        //     jQuery("body").toggleClass("body1");
        //     jQuery("body1").toggleClass("body");
        // }
        smoothlyMenu();

    }
    public notification: any = {
        show: false,
        closeDelay: null,
        title: '',
        body: '',
        icon: ''
    };

    ngAfterViewInit() {
        // setTimeout(function() {
        //     jQuery("body").trigger({ type: 'keydown', which: '123'});
        //     //     var e = jQuery.Event( "keypress", { keyCode: 123  } );
        //     //     jQuery("body").trigger(e);
        // }, 2000);
    }

     ngOnInit() {

         let cart_unique_token = localStorage.getItem('store_cart_unique_token');
         if(cart_unique_token == "" || cart_unique_token == null || cart_unique_token == undefined){
             let uuid = UUID.UUID();
             localStorage.setItem('store_cart_unique_token', uuid);
         }

        //////// for disabel inspect elemnt ///////////


        // jQuery(document).bind("contextmenu",function(e) {
        //  e.preventDefault();
        // });
        //
        // jQuery(document).keydown(function(e){
        //     if(e.which === 123){
        //        return false;
        //     }
        //     if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        //          return false;
        //       }
        //       if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        //          return false;
        //       }
        //       if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        //          return false;
        //       }
        // });

         ////////////////////////////////////

         ////////// for disable browser back button ///////////

         // window.onpopstate = (e) => {
         //     window.history.forward(1);
         // }

         ///////////////////////////

        this.declined = false;
        let franchise = JSON.parse(localStorage.getItem('franchise'));
        this.menu_title = this.helper.menu_title;
        this.title = this.helper.title;
        this.heading_title = this.helper.heading_title;
        this.error_code = this.helper.error_code
        if(franchise!==null)
        {
            this.franchise_id=franchise._id
            this.server_token=franchise.server_token
        }
        // this.notification = {
        //     show: true,
        //     closeDelay: this.helper.TIMEOUT.PUSH_NOTIFICATION,
        //     title: "",
        //     sound: 'driver_arrived_at_pickup.mp3',
        //     body: "",
        //     icon: 'web_images/store_logo.png'
        // }
        this.new_order();

        this.interval=setInterval(() => {
            
            this.new_order()

        },this.helper.TIMEOUT.NEW_PUSH_NOTIFICATION_REQUEST);

     }
     activeRoute(routename: string): boolean{
         return this.helper.router.url.indexOf(routename) > -1;
     }
     ngOnDestroy() {
        clearInterval(this.interval);
    }
     myShowFunction()
     {
         this.helper.router.navigate(['franchise/order']);
     }

    new_order()
    {
        this.helper.http.post('/api/franchise/franchise_notify_new_order',{franchise_id:this.franchise_id, server_token:this.server_token}).pipe(map((res_data: Response) => res_data.json())).subscribe((res_data: any) => {

                let display:any = jQuery('.modal').css('display');
                if(res_data.success==true)
                {
                    localStorage.setItem('franchise_document_ulpoaded', res_data.store_detail.is_document_uploaded);
                    var order_data = res_data.order
                    //this.notification.title=order_data.user_detail.first_name + order_data.user_detail.last_name;
                    //this.notification.body=res_data.order.unique_id;
                    //this.notification.icon=order_data.user_detail.image_url;
                    jQuery('#button').click();


                    if(res_data.franchise_detail.is_document_uploaded)
                    {
                        this.helper.data.storage = {
                            "message":  "",
                            "class": "alert-danger"
                        }
                        if(res_data.franchise_detail.is_approved == false && display != "block")
                        {
                            this.declined = true;
                            this.modal.open();
                        }
                        else if(res_data.franchise_detail.is_approved == true && (display == "block" || "inline"))
                        {
                            this.declined = false;
                            this.modal.close();
                        }
                    }
                    else
                    {
                        localStorage.setItem('admin_franchise_document_ulpoaded', res_data.setting_detail.is_upload_store_documents);
                        if(res_data.setting_detail.is_upload_franchise_documents){

                            this.helper.router.navigate(['franchise/upload_document']);
                        }

                    }
                }
                else
                {
                    if(res_data.error_code === this.error_code.TOKEN_EXPIRED || res_data.error_code === this.error_code.STORE_DATA_NOT_FOUND)
                    {
                        
                        this.helper.data.storage = {
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                        this.helper.router.navigate(['franchise/logout']);
                    }
                    else
                    {
                        localStorage.setItem('franchise_document_ulpoaded', res_data.franchise_detail.is_document_uploaded);
                        if(res_data.franchise_detail.is_document_uploaded)
                        {

                            if(res_data.franchise_detail.is_approved == false && display != "block")
                            {
                                this.declined = true;
                                this.modal.open();
                            }
                            else if(res_data.franchise_detail.is_approved == true && (display == "block" || "inline"))
                            {
                                this.declined = false;
                                this.modal.close();
                            }
                        }
                        else
                        {
                            localStorage.setItem('admin_franchise_document_ulpoaded', res_data.setting_detail.is_upload_franchise_documents);
                            if(res_data.setting_detail.is_upload_franchise_documents) {
                                this.helper.data.storage = {
                                    "message": "Upload Document First",
                                    "class": "alert-danger"
                                }
                                this.helper.router.navigate(['franchise/upload_document']);
                            }
                        }
                    }
                }

            },
            (error: any) => {
                this.helper.http_status(error)
            });
    }


}
