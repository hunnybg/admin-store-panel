import { Component, OnInit, ViewChild } from '@angular/core';
import { smoothlyMenu } from '../../../app.helpers';
import { Response } from '@angular/http';
declare var jQuery: any;
import { Helper } from "../../../views/store_helper";
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { UUID } from 'angular2-uuid';
import { map } from 'rxjs/operators';
import { PushNotificationComponent } from 'ng2-notifications/ng2-notifications';

@Component({
    selector: 'topnavbar',
    templateUrl: 'topnavbar.template.html',
    providers: [Helper]
})
export class TopnavbarComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;
    @ViewChild('myNotification')
    myNotification: PushNotificationComponent;

    store_id: Object;
    server_token: String;
    interval: any;
    declined: Boolean;
    error_code: any;
    menu_title: any;
    title: any;
    heading_title: any;
    audio: any;
    no_provider_audio: any;
    admin_phone: string = '';
    admin_email: string = '';

    constructor(private helper: Helper) {

        helper.trans.addLangs(['sp', 'fr', 'hi', 'cn', 'en']);

        var language = JSON.parse(localStorage.getItem('language'));
        if (language == '' || language == undefined) {
            language = 'en'
        }
        helper.trans.setDefaultLang('en');
        helper.trans.use(language);

        const browserLang = helper.trans.getBrowserLang();
    }

    toggleNavigation(): void {

        jQuery("body").toggleClass("mini-navbar");
        jQuery(".full_menu").toggleClass("full_menu1");
        smoothlyMenu();

    }
    public notification: any = {
        show: false,
        closeDelay: null,
        title: '',
        body: '',
        icon: ''
    };

    public no_provider_notification: any = {
        show: true,
        closeDelay: this.helper.TIMEOUT.PUSH_NOTIFICATION,
        title: '',
        body: '',
        icon: 'web_images/store_logo.png'
    };

    ngAfterViewInit() {
    }

    ngOnInit() {

        this.audio = new Audio();
        this.audio.src = "audio.mp3";
        this.audio.load();
        this.no_provider_audio = new Audio();
        this.no_provider_audio.src = "audio.mp3";
        this.no_provider_audio.load();

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
        let store = JSON.parse(localStorage.getItem('store'));
        this.menu_title = this.helper.menu_title;
        this.title = this.helper.title;
        this.heading_title = this.helper.heading_title;
        this.error_code = this.helper.error_code
        if (store !== null) {
            this.store_id = store._id
            this.server_token = store.server_token
        }
        this.notification = {
            show: true,
            closeDelay: this.helper.TIMEOUT.PUSH_NOTIFICATION,
            title: "",
            body: "",
            icon: 'web_images/store_logo.png'
        }
        this.new_order();
        this.get_order_list();

        this.interval = setInterval(() => {

            this.new_order();
            // this.get_order_list();

        }, this.helper.TIMEOUT.NEW_PUSH_NOTIFICATION_REQUEST);

    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }
    ngOnDestroy() {
        clearInterval(this.interval);
    }
    myShowFunction() {
        this.myNotification.close(this.notification);
        this.helper.router.navigate(['/store/order']);
    }

    NO_PROVIDER_FOUND() {
        this.helper.router.navigate(['store/deliveries']);
    }

    go_to_order() {
        this.helper.router.navigate(['/store/order']);
    }

    get_order_data(order_id) {
        this.helper.router_id.store.order_id = order_id;
        this.helper.router.navigate(['store/order']);
    }

    go_to_deliveries() {
        this.helper.router.navigate(['/store/deliveries']);
    }

    get_order_list() {
        this.helper.http.post('/api/store/get_order_list', {
            store_id: this.store_id,
            server_token: this.server_token
        }).pipe(map((res_data: Response) => res_data.json())).subscribe((res_data: any) => {
            this.helper.router_id.store.new_order_list = res_data.new_order_list;
            this.helper.router_id.store.no_deliveryman_orders = res_data.no_deliveryman_orders;
        });
    }

    dashboard() {
        this.helper.router_id.from_login = false;
        this.helper.router.navigate(['store/owner_dashboard']);
    }

    new_order() {
        this.helper.http.post('/api/store/store_notify_new_order', { store_id: this.store_id, server_token: this.server_token }).pipe(map((res_data: Response) => res_data.json())).subscribe((res_data: any) => {

            let display: any = jQuery('.modal').css('display');
            if (res_data.success == true) {
                localStorage.setItem('store_document_ulpoaded', res_data.store_detail.is_document_uploaded);
                var order_data = res_data.order;
                this.helper.router_id.store.new_order_list.push(order_data)
                this.notification.title = order_data.user_detail.first_name + order_data.user_detail.last_name;
                this.notification.body = res_data.order.unique_id;
                this.notification.icon = order_data.user_detail.image_url != '' ? order_data.user_detail.image_url : 'web_images/store_logo.png';

                jQuery('#button').click();
                this.audio.play();

                if (res_data.no_deliveryman_orders) {
                    this.helper.router_id.store.no_deliveryman_orders.push(res_data.no_deliveryman_orders)
                    this.no_provider_notification.title = this.helper.status.no_delivery_man_found;
                    this.no_provider_notification.body = res_data.no_deliveryman_orders.unique_id;
                    this.notification.icon = res_data.no_deliveryman_orders.image_url != '' ? res_data.no_deliveryman_orders.image_url : 'web_images/store_logo.png';

                    jQuery('#no_provider').click();
                    this.no_provider_audio.play();
                }


                if (res_data.store_detail.is_document_uploaded) {
                    this.helper.data.storage = {
                        "message": "",
                        "class": "alert-danger"
                    }
                    if (res_data.store_detail.is_approved == false && display != "block") {
                        this.declined = true;
                        this.admin_phone = res_data.setting_detail.admin_contact_phone_number;
                        this.admin_email = res_data.setting_detail.admin_contact_email
                        this.modal.open();
                    }
                    else if (res_data.store_detail.is_approved == true && (display == "block" || "inline")) {
                        this.declined = false;
                        this.modal.close();
                    }
                }
                else {
                    localStorage.setItem('admin_store_document_ulpoaded', res_data.setting_detail.is_upload_store_documents);
                    if (res_data.setting_detail.is_upload_store_documents) {
                        this.helper.data.storage = {
                            "message": "Upload Document First",
                            "class": "alert-danger"
                        }
                        this.helper.router.navigate(['store/profile']);
                    }

                }
            }
            else {
                if (res_data.error_code === this.error_code.TOKEN_EXPIRED || res_data.error_code === this.error_code.STORE_DATA_NOT_FOUND) {
                    console.log("TOP NAV ISSUE")
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['store/owner_dashboard']);
                } else {
                    if (res_data.no_deliveryman_orders) {
                        this.helper.router_id.store.no_deliveryman_orders.push(res_data.no_deliveryman_orders)
                        this.no_provider_notification.title = this.helper.status.no_delivery_man_found;
                        this.no_provider_notification.body = res_data.no_deliveryman_orders.unique_id;
                        this.notification.icon = res_data.no_deliveryman_orders.image_url != '' ? res_data.no_deliveryman_orders.image_url : 'web_images/store_logo.png';

                        jQuery('#no_provider').click();
                        this.no_provider_audio.play();
                    }
                    localStorage.setItem('store_document_ulpoaded', res_data.store_detail.is_document_uploaded);
                    if (res_data.store_detail.is_document_uploaded) {

                        if (res_data.store_detail.is_approved == false && display != "block") {
                            this.declined = true;
                            this.admin_phone = res_data.setting_detail.admin_contact_phone_number;
                            this.admin_email = res_data.setting_detail.admin_contact_email;
                            this.modal.open();
                        }
                        else if (res_data.store_detail.is_approved == true && (display == "block" || "inline")) {
                            this.declined = false;
                            this.modal.close();
                        }
                    }
                    else {
                        localStorage.setItem('admin_store_document_ulpoaded', res_data.setting_detail.is_upload_store_documents);
                        if (res_data.setting_detail.is_upload_store_documents) {
                            this.helper.data.storage = {
                                "message": "Upload Document First",
                                "class": "alert-danger"
                            }
                            this.helper.router.navigate(['store/profile']);
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
