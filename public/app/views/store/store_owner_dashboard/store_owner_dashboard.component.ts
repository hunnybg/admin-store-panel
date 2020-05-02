import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Helper } from "../../store_helper";
import { Response } from '@angular/http';
import { UUID } from 'angular2-uuid';

@Component({
    selector: 'app-store-owner-dashboard',
    templateUrl: './store_owner_dashboard.component.html',
    providers: [Helper]
})

export class StoreOwnerDashboardComponent implements OnInit {

    myLoading: boolean = false;
    title: any;
    button: any;
    validation_message: any;
    owner_id: string;
    server_token: string;

    store_owner: any;
    stores: any[] = [];
    store_data: {
        name: '',
        email: '',
        server_token: '',
        image_url: ''
        is_document_uploaded: ''
    };
    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }
    ngOnInit() {

        this.title = this.helper.title
        this.button = this.helper.button
        this.validation_message = this.helper.validation_message;

        this.owner_id = JSON.parse(localStorage.getItem("store_owner_id"))
        this.server_token = JSON.parse(localStorage.getItem("store_owner_server_token"));
        if (!this.owner_id || !this.server_token) {
            this.helper.data.storage = {
                code: this.helper.error_code.TOKEN_EXPIRED,
                message: this.helper.ERROR_CODE[999],
                class: "alert-danger"
            }
            this.helper.message()
            this.helper.router.navigate(['store/logout']);
        } else {
            this.get_store_owner_details();
        }
    }

    get_store_owner_details() {
        let json = {
            store_owner_id: this.owner_id,
            server_token: this.server_token
        }

        this.helper.http.post(this.helper.POST_METHOD.GET_STORE_OWNER_DETAIL, json).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
                if (res_data.error_code == this.helper.error_code.TOKEN_EXPIRED || res_data.error_code == this.helper.error_code.STORE_DATA_NOT_FOUND) {
                    this.helper.router.navigate(['store/logout']);
                }
            } else {
                if (this.helper.router_id.from_login) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.message();
                }
                this.store_owner = res_data.store_owner;
                this.stores = res_data.stores;
            }
        })
    }

    auto_login_store(id) {
        this.helper.http.post(this.helper.POST_METHOD.LOGIN, { store_id: id }).map((res: Response) => res.json()).subscribe(res_data => {

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
                this.store_data = res_data.store;
                this.helper.tokenService.setToken(this.store_data.server_token);
                this.helper.user_cart.name = this.store_data.name;
                this.helper.user_cart.image = this.store_data.image_url;
                localStorage.setItem('store', JSON.stringify(this.store_data));
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.user_cart.cart_data.cart_id = null;
                this.helper.user_cart.cart_unique_token = UUID.UUID();

                if (this.store_data.is_document_uploaded) {
                    this.helper.router.navigate(['store/order']);
                }
                else {
                    this.helper.router.navigate(['store/upload_document']);
                }
            }
        }, (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
    }

    add_new_store() {
        
        this.helper.router_id.store_owner_email = this.store_owner.email;
        this.helper.router_id.store_owner_id = this.owner_id;
        this.helper.router.navigate(['store/register']);
    }
}