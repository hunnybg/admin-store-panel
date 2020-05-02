import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { Helper } from "../../store_helper";
import { Response } from '@angular/http';

export interface StoreOwnerRegister {
    name: string,
    email: string,
    password: string
}

@Component({
    selector: 'app-store-owner-register',
    templateUrl: './store_owner_register.component.html',
    providers: [Helper]
})

export class StoreOwnerRegisterComponent implements OnInit {

    myLoading: boolean = false;
    title: any;
    button: any;
    validation_message: any;
    store_owner_register: StoreOwnerRegister;
    formData = new FormData();

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }
    ngOnInit() {
        this.helper.message()

        this.title = this.helper.title
        this.button = this.helper.button
        this.validation_message = this.helper.validation_message;

        this.store_owner_register = {
            name: "",
            email: "",
            password: ""
        }

    }

    register() {
        if (this.store_owner_register.name.trim() == '' || this.store_owner_register.email.trim() == '' || this.store_owner_register.password.trim() == '') {
            this.helper.data.storage = {
                "message": this.helper.validation_message.enter_valid_data,
                "class": "alert-danger"
            }
            this.helper.message();
            return;
        } else {
            this.helper.http.post(this.helper.POST_METHOD.STORE_OWNER_REGISTER, this.store_owner_register).map((res: Response) => res.json()).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == false) {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message();
                } else {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    localStorage.setItem('store_owner_id', JSON.stringify(res_data.store_owner._id));
                    localStorage.setItem('store_owner_server_token', JSON.stringify(res_data.store_owner.server_token));
                    this.helper.message();
                    this.helper.router_id.from_login = true;
                    this.helper.router.navigate(['store/owner_dashboard']);
                }
            })
        }
    }
}