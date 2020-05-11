import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;
import { map } from 'rxjs/operators';

export interface ImageSetting {
    //    image_ratio: Number,
    //    image_min_width: Number,
    //    image_max_width: Number,
    //    image_min_height: Number,
    //    image_max_height: Number,
    //    map_pin_min_width: Number,
    //    map_pin_min_height: Number,
    //    map_pin_max_width: Number,
    //    map_pin_max_height: Number,
    //    icon_ratio: Number,
    //    map_pin_ratio: Number,
    //    icon_maximum_size: Number,
    //    icon_minimum_size: Number
    delivery_image_ratio: number,
    delivery_icon_ratio: number,
    delivery_map_pin_ratio: number,

    vehicle_image_ratio: number,
    vehicle_map_pin_ratio: number,

    product_image_ratio: number,
    item_image_ratio: number,

    image_type: any[],
    icon_image_type: any[],
    map_pin_image_type: any[],


    delivery_icon_minimum_size: number,
    delivery_icon_maximum_size: number,


    delivery_image_min_width: number,
    delivery_image_min_height: number,

    vehicle_image_min_width: number,
    vehicle_image_min_height: number,

    item_image_min_width: number,
    item_image_min_height: number,

    product_image_min_width: number,
    product_image_min_height: number,

    delivery_image_max_width: number,
    delivery_image_max_height: number,

    vehicle_image_max_width: number,
    vehicle_image_max_height: number,

    item_image_max_width: number,
    item_image_max_height: number,

    product_image_max_width: number,
    product_image_max_height: number,

    delivery_map_pin_min_width: number,
    delivery_map_pin_min_height: number,
    vehicle_map_pin_min_width: number,
    vehicle_map_pin_min_height: number,

    delivery_map_pin_max_width: number,
    delivery_map_pin_max_height: number,
    vehicle_map_pin_max_width: number,
    vehicle_map_pin_max_height: number,

    ads_fullscreen_image_ratio: number,
    ads_banner_image_ratio: number,

    ads_fullscreen_image_min_width: number,
    ads_fullscreen_image_min_height: number,
    ads_fullscreen_image_max_width: number,
    ads_fullscreen_image_max_height: number,
    ads_banner_image_min_width: number,
    ads_banner_image_min_height: number,
    ads_banner_image_max_width: number,
    ads_banner_image_max_height: number
}

@Component({
    selector: 'app-image_setting',
    templateUrl: './image_setting.component.html',
    providers: [Helper]
})
export class ImageSettingComponent implements OnInit {

    private image_setting: ImageSetting;

    title: any;
    button: any;
    heading_title: any;
    admin_image_type_list: any[];
    edit_button: Boolean;
    myLoading: boolean = true;

constructor(public helper: Helper, public vcr: ViewContainerRef) {
    helper.toastr.setRootViewContainerRef(vcr);
}

ngAfterViewInit() {
    jQuery("#min_image_width").chosen();
    jQuery("#max_image_width").chosen();
    jQuery("#map_pin_min_width").chosen();
    jQuery("#map_pin_max_width").chosen();
    jQuery("#maximum").chosen();
    jQuery("#minimum").chosen();
    setTimeout(function () {
        jQuery(".chosen-select").trigger("chosen:updated");
        jQuery('input').iCheck({
            handle: 'checkbox',
            checkboxClass: 'icheckbox_square-green',
        });

    }, 1000);
}

ngOnInit() {
    this.admin_image_type_list = this.helper.ADMIN_IMAGE_TYPES;
    this.image_setting = {

        delivery_image_ratio: null,
        delivery_icon_ratio: null,
        delivery_map_pin_ratio: null,
        image_type: [],
        icon_image_type: [],
        map_pin_image_type: [],


        vehicle_image_ratio: null,
        vehicle_map_pin_ratio: null,

        product_image_ratio: null,
        item_image_ratio: null,


        delivery_icon_minimum_size: null,
        delivery_icon_maximum_size: null,


        delivery_image_min_width: null,
        delivery_image_min_height: null,

        vehicle_image_min_width: null,
        vehicle_image_min_height: null,

        item_image_min_width: null,
        item_image_min_height: null,

        product_image_min_width: null,
        product_image_min_height: null,

        delivery_image_max_width: null,
        delivery_image_max_height: null,

        vehicle_image_max_width: null,
        vehicle_image_max_height: null,

        item_image_max_width: null,
        item_image_max_height: null,

        product_image_max_width: null,
        product_image_max_height: null,

        delivery_map_pin_min_width: null,
        delivery_map_pin_min_height: null,
        vehicle_map_pin_min_width: null,
        vehicle_map_pin_min_height: null,

        delivery_map_pin_max_width: null,
        delivery_map_pin_max_height: null,
        vehicle_map_pin_max_width: null,
        vehicle_map_pin_max_height: null,

        ads_fullscreen_image_ratio: null,
        ads_banner_image_ratio: null,

        ads_fullscreen_image_min_width: null,
        ads_fullscreen_image_min_height: null,
        ads_fullscreen_image_max_width: null,
        ads_fullscreen_image_max_height: null,
        ads_banner_image_min_width: null,
        ads_banner_image_min_height: null,
        ads_banner_image_max_width: null,
        ads_banner_image_max_height: null
    }

    var admin_id = localStorage.getItem('admin_id');
    if (admin_id != "" || admin_id != undefined) {
        this.helper.http.post('/admin/get_detail', {admin_id: admin_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
            console.log(res_data.success);
            console.log(res_data.admin.admin_type);
            if (res_data.success == true) {
                if (res_data.admin.admin_type == 3) {
                    this.edit_button = false;
                }
            }
        });
    }

    this.helper.http.post('/admin/get_image_setting_detail', {}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
        this.myLoading = false;

        //this.image_setting.image_type = res_data.image_setting_data.image_type;
        //this.image_setting.icon_image_type = res_data.image_setting_data.icon_image_type;
        //this.image_setting.map_pin_image_type = res_data.image_setting_data.map_pin_image_type;

        res_data.image_setting_data.image_type.forEach(function (image_type_data) {
            var img = image_type_data.split('/');
            console.log(img);
            setTimeout(() => {
                jQuery('#icheck' + img[1]).iCheck('check');
            }, 1000);
        });

        res_data.image_setting_data.icon_image_type.forEach(function (image_icon_type_data) {
            var img1 = image_icon_type_data.split('/');
            console.log('#icon_icheck' + img1[1]);
            setTimeout(() => {
                jQuery('#icon_icheck' + img1[1]).iCheck('check');
            }, 1000);
        });

        res_data.image_setting_data.map_pin_image_type.forEach(function (image_map_pin_type_data) {
            var img2 = image_map_pin_type_data.split('/');
            setTimeout(() => {
                jQuery('#map_icheck' + img2[1]).iCheck('check');
            }, 1000);
        });


        //            setTimeout(() => {
        //                jQuery('#icheck' + res_data.image_setting_data.image_type).iCheck('check');
        //                console.log(res_data.image_setting_data.image_type);
        //            }, 1000);
        //            setTimeout(() => {
        //                jQuery('#icon_icheck' + res_data.image_setting_data.icon_image_type).iCheck('check');
        //                console.log(res_data.image_setting_data.icon_image_type);
        //            }, 1000);
        //            setTimeout(() => {
        //                jQuery('#map_icheck' + res_data.image_setting_data.map_pin_image_type).iCheck('check');
        //                console.log(res_data.image_setting_data.map_pin_image_type);
        //            }, 1000);


        this.image_setting.delivery_image_ratio = res_data.image_setting_data.delivery_image_ratio;
        this.image_setting.delivery_icon_ratio = res_data.image_setting_data.delivery_icon_ratio;
        this.image_setting.delivery_map_pin_ratio = res_data.image_setting_data.delivery_map_pin_ratio;
        this.image_setting.vehicle_image_ratio = res_data.image_setting_data.vehicle_image_ratio;

        this.image_setting.vehicle_map_pin_ratio = res_data.image_setting_data.vehicle_map_pin_ratio;
        this.image_setting.product_image_ratio = res_data.image_setting_data.product_image_ratio;
        this.image_setting.item_image_ratio = res_data.image_setting_data.item_image_ratio;
        this.image_setting.delivery_icon_minimum_size = res_data.image_setting_data.delivery_icon_minimum_size;


        this.image_setting.delivery_icon_maximum_size = res_data.image_setting_data.delivery_icon_maximum_size;

        this.image_setting.delivery_image_min_width = res_data.image_setting_data.delivery_image_min_width;
        this.image_setting.delivery_image_min_height = res_data.image_setting_data.delivery_image_min_height;
        this.image_setting.vehicle_image_min_width = res_data.image_setting_data.vehicle_image_min_width;
        this.image_setting.vehicle_image_min_height = res_data.image_setting_data.vehicle_image_min_height;

        this.image_setting.item_image_min_width = res_data.image_setting_data.item_image_min_width;
        this.image_setting.item_image_min_height = res_data.image_setting_data.item_image_min_height;
        this.image_setting.product_image_min_width = res_data.image_setting_data.product_image_min_width;
        this.image_setting.product_image_min_height = res_data.image_setting_data.product_image_min_height;


        this.image_setting.delivery_image_max_width = res_data.image_setting_data.delivery_image_max_width;
        this.image_setting.delivery_image_max_height = res_data.image_setting_data.delivery_image_max_height;
        this.image_setting.vehicle_image_max_width = res_data.image_setting_data.vehicle_image_max_width;
        this.image_setting.vehicle_image_max_height = res_data.image_setting_data.vehicle_image_max_height;


        this.image_setting.item_image_max_width = res_data.image_setting_data.item_image_max_width;
        this.image_setting.item_image_max_height = res_data.image_setting_data.item_image_max_height;
        this.image_setting.product_image_max_width = res_data.image_setting_data.product_image_max_width;
        this.image_setting.product_image_max_height = res_data.image_setting_data.product_image_max_height;


        this.image_setting.delivery_map_pin_min_width = res_data.image_setting_data.delivery_map_pin_min_width;
        this.image_setting.delivery_map_pin_min_height = res_data.image_setting_data.delivery_map_pin_min_height;
        this.image_setting.vehicle_map_pin_min_width = res_data.image_setting_data.vehicle_map_pin_min_width;
        this.image_setting.vehicle_map_pin_min_height = res_data.image_setting_data.vehicle_map_pin_min_height;

        this.image_setting.delivery_map_pin_max_width = res_data.image_setting_data.delivery_map_pin_max_width;
        this.image_setting.delivery_map_pin_max_height = res_data.image_setting_data.delivery_map_pin_max_height;
        this.image_setting.vehicle_map_pin_max_width = res_data.image_setting_data.vehicle_map_pin_max_width;
        this.image_setting.vehicle_map_pin_max_height = res_data.image_setting_data.vehicle_map_pin_max_height;


    });

    setTimeout(() => {

        jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifChecked', (event, res_data) => {

            var id = event.target.getAttribute('value')
            this.image_setting.image_type.push(id)



        });

        jQuery(this.helper.elementRef.nativeElement).find('.icheck').on('ifUnchecked', (event, res_data) => {

            var id = event.target.getAttribute('value')
            var i = this.image_setting.image_type.indexOf(id);
            if (i != -1) {
                this.image_setting.image_type.splice(i, 1);
            }

        });



        jQuery(this.helper.elementRef.nativeElement).find('.icon_icheck').on('ifChecked', (event, res_data) => {

            var id = event.target.getAttribute('value')
            this.image_setting.icon_image_type.push(id)


        });

        jQuery(this.helper.elementRef.nativeElement).find('.icon_icheck').on('ifUnchecked', (event, res_data) => {

            var id = event.target.getAttribute('value')
            var i = this.image_setting.icon_image_type.indexOf(id);
            if (i != -1) {
                this.image_setting.icon_image_type.splice(i, 1);
            }

        });




        jQuery(this.helper.elementRef.nativeElement).find('.map_icheck').on('ifChecked', (event, res_data) => {

            var id = event.target.getAttribute('value')
            this.image_setting.map_pin_image_type.push(id)


        });

        jQuery(this.helper.elementRef.nativeElement).find('.map_icheck').on('ifUnchecked', (event, res_data) => {

            var id = event.target.getAttribute('value')
            var i = this.image_setting.map_pin_image_type.indexOf(id);
            if (i != -1) {
                this.image_setting.map_pin_image_type.splice(i, 1);
            }
            console.log(id);
            console.log(i);
        });



        //
        //            jQuery(this.helper.elementRef.nativeElement).find('.icon_icheck').on('ifChecked', (event, res_data) => {
        //
        //                var id = event.target.getAttribute('value')
        //                this.image_setting.icon_image_type = id;
        //
        //            });
        //
        //            jQuery(this.helper.elementRef.nativeElement).find('.icon_icheck').on('ifUnchecked', (event, res_data) => {
        //
        //                var id = event.target.getAttribute('value')
        //                this.image_setting.icon_image_type = id;
        //            });


        //

        //            jQuery(this.helper.elementRef.nativeElement).find('.map_icheck').on('ifChecked', (event, res_data) => {
        //
        //                var id = event.target.getAttribute('value')
        //                this.image_setting.map_pin_image_type = id;
        //
        //            });
        //
        //            jQuery(this.helper.elementRef.nativeElement).find('.map_icheck').on('ifUnchecked', (event, res_data) => {
        //
        //                var id = event.target.getAttribute('value')
        //                this.image_setting.map_pin_image_type = id;
        //            });




    });

    jQuery(this.helper.elementRef.nativeElement).find('#min_image_width').on('change', (evnt, res_data) => {


        this.image_setting.delivery_image_min_width = res_data.selected;
        this.get_min_image_height(res_data.selected);
        console.log(res_data.selected);

    });

    jQuery(this.helper.elementRef.nativeElement).find('#max_image_width').on('change', (evnt, res_data) => {
        this.image_setting.delivery_image_max_width = res_data.selected;
        this.get_max_image_height(res_data.selected);
        console.log(res_data.selected);
    });


    jQuery(this.helper.elementRef.nativeElement).find('#map_pin_min_width').on('change', (evnt, res_data) => {
        this.image_setting.delivery_map_pin_min_width = res_data.selected;
        this.get_min_map_pin_height(res_data.selected);
        console.log(res_data.selected);

    });
    jQuery(this.helper.elementRef.nativeElement).find('#map_pin_max_width').on('change', (evnt, res_data) => {
        this.image_setting.delivery_map_pin_max_width = res_data.selected;
        this.get_max_map_pin_height(res_data.selected);
        console.log(res_data.selected);

    });

    jQuery(this.helper.elementRef.nativeElement).find('#minimum').on('change', (evnt, res_data) => {
        this.image_setting.delivery_icon_minimum_size = res_data.selected;
        this.get_icon_max_size(res_data.selected);
        console.log(res_data.selected);

    });


    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
}

get_min_image_height(min_image_width) {
    this.image_setting.delivery_image_min_height = min_image_width / this.image_setting.delivery_image_ratio;
    console.log(this.image_setting.delivery_image_min_height);
    console.log(min_image_width);
    console.log(this.image_setting.delivery_image_ratio);
}

get_max_image_height(max_image_width) {
    this.image_setting.delivery_image_max_height = max_image_width / this.image_setting.delivery_image_ratio;
    console.log(this.image_setting.delivery_image_max_height);
    console.log(max_image_width);
    console.log(this.image_setting.delivery_image_ratio);
}



get_min_map_pin_height(min_map_pin_width) {
    this.image_setting.delivery_map_pin_min_height = min_map_pin_width / this.image_setting.delivery_map_pin_ratio;
}


get_max_map_pin_height(max_map_pin_width) {
    this.image_setting.delivery_map_pin_max_height = max_map_pin_width / this.image_setting.delivery_map_pin_ratio;

}

get_icon_max_size(icon_minimum_size) {
    this.image_setting.delivery_icon_maximum_size = icon_minimum_size / this.image_setting.delivery_icon_ratio;

}


AdminImageSetting(adminimagesettingdata) {
    console.log(adminimagesettingdata);
    this.helper.http.post('/admin/update_image_setting', adminimagesettingdata).pipe(map((res: Response) => res.json())).subscribe(res_data => {
        this.myLoading = false;
        this.helper.data.storage = {
            "message": this.helper.MESSAGE_CODE[res_data.message],
            "class": "alert-info"
        }
        console.log(res_data);
        this.helper.message();
        this.helper.router.navigate(['setting/image_setting']);
    },
        (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
}

}
