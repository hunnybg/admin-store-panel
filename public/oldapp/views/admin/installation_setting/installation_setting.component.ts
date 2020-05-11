import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-installation_setting',
    templateUrl: './installation_setting.component.html',
    providers: [Helper]

})
export class InstallationSettingComponent implements OnInit {


    title: any;
    button: any;
    type: String;
    heading_title: any;
    edit_button: Boolean;
    //public store_logo : string = "web_images/store_logo.png";

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);

    }

    ngOnInit() {
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;

        var admin_id = localStorage.getItem('admin_id');
        if (admin_id != "" || admin_id != undefined) {
            this.helper.http.post('/admin/get_detail', {admin_id: admin_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == true) {
                    if (res_data.admin.admin_type == 3) {
                        this.edit_button = false;
                    }
                }
            });
        }
    }

    public formData = new FormData();


    logo_image($event) {
        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const logo_image = files[0];
        // this.add_delivery.icon_url=icon_url
        //this.formData.append('image_url', this.add_delivery.image_url);
        this.formData.append('logo_image', logo_image);
    }

    title_image($event) {
        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const title_image = files[0];
        // this.add_delivery.icon_url=icon_url
        //this.formData.append('image_url', this.add_delivery.image_url);
        this.formData.append('title_image', title_image);
    }

    mail_title_image($event) {
        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const mail_title_image = files[0];
        // this.add_delivery.icon_url=icon_url
        //this.formData.append('image_url', this.add_delivery.image_url);
        this.formData.append('mail_title_image', mail_title_image);
    }

    mail_logo_image($event) {
        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const mail_logo_image = files[0];
        // this.add_delivery.icon_url=icon_url
        //this.formData.append('image_url', this.add_delivery.image_url);
        this.formData.append('mail_logo_image', mail_logo_image);
    }

    store_logo_image($event) {
        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const store_logo_image = files[0];
        // this.add_delivery.icon_url=icon_url
        //this.formData.append('image_url', this.add_delivery.image_url);
        this.formData.append('store_logo_image', store_logo_image);
    }

    user_logo_image($event) {
        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const user_logo_image = files[0];
        // this.add_delivery.icon_url=icon_url
        //this.formData.append('image_url', this.add_delivery.image_url);
        this.formData.append('user_logo_image', user_logo_image);
    }



    addImage(image_data) {
        //this.store_logo = "web_images/store_logos.png";
        this.helper.http.post('/admin/upload_logo_images', this.formData).pipe(map((res: Response) => res.json())).subscribe(res_data => {


            this.helper.data.storage = {
                "message": this.helper.MESSAGE_CODE[res_data.message],
                "class": "alert-info"
            }
            this.helper.message();
            location.reload();
            //this.store_logo = "web_images/store_logo.png";
            //           this.helper.router.navigate(['setting/installation_setting']);

        });
    }
}
