import {Component, OnInit, ViewContainerRef, ViewChild} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {ImageCropperComponent, CropperSettings, Bounds} from 'ng2-img-cropper';

export interface AddVehicle {
    vehicle_name: String,
    description: String,
    image_url: any,
    map_pin_image_url: any,
    is_business: Boolean

}
export interface imageSetting {
    image_ratio: number,
    image_min_width: number,
    image_max_width: number
    image_min_height: number,
    image_max_height: number,

    map_pin_image_ratio: number,
    map_pin_image_min_width: number,
    map_pin_image_max_width: number
    map_pin_image_min_height: number,
    map_pin_image_max_height: number,

    image_type: any[],
    map_pin_image_type: any[]

}

@Component({
    selector: 'app-add_vehicle',
    templateUrl: './add_vehicle.component.html',
    providers: [Helper]
})
export class AddVehicleComponent implements OnInit {
    
    @ViewChild('image_crop_modal')
    image_crop_modal: ModalComponent;
    @ViewChild('cropper', undefined)
    cropper: ImageCropperComponent;
    
    @ViewChild('map_pin_image_crop_modal')
    map_pin_image_crop_modal: ModalComponent;
    @ViewChild('cropper_map_pin', undefined)
    cropper_map_pin: ImageCropperComponent;


    private add_vehicle: AddVehicle;
    public image_setting: imageSetting;
    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    vehicle_id: Object;
    vehicle_exist: any;
    vehicle_list: any[];

    error: any;
    type: String;
    myLoading: boolean = false;
    image_error: string = '';
    map_pin_image_error: string = '';

    
    data: any;
    map_pin_data: any;
    
    cropperSettings: CropperSettings;
    cropperMapPinSettings: CropperSettings;
    

    constructor(public helper: Helper, vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);

        this.cropperSettings = new CropperSettings();
        this.cropperSettings.canvasWidth = 400;
        this.cropperSettings.canvasHeight = 400;
        this.cropperSettings.noFileInput = true;
        this.cropperSettings.preserveSize = true;
        this.cropperSettings.height = 200;
        this.cropperSettings.width = this.cropperSettings.height * this.helper.image_ratio.VEHICLE_IMAGE;

        this.cropperMapPinSettings = new CropperSettings();
        this.cropperMapPinSettings.canvasWidth = 400;
        this.cropperMapPinSettings.canvasHeight = 400;
        this.cropperMapPinSettings.noFileInput = true;
        this.cropperMapPinSettings.preserveSize = true;
        this.cropperMapPinSettings.height = 200;
        this.cropperMapPinSettings.width = this.cropperMapPinSettings.height * this.helper.image_ratio.VEHICLE_MAP_PIN;


        this.data = {};
        this.map_pin_data = {};
        
    }



    ngAfterViewInit() {
        jQuery(document).ready(function (jQ) {
            jQ("#vehicle").chosen();
            jQ("#vehicle").trigger("chosen:updated");

        });
    }
    ngOnDestroy() {
        this.helper.router_id.admin.vehicle_id = "";
    }

    ngOnInit() {

        this.add_vehicle = {
            vehicle_name: "",
            description: "",
            image_url: "./plus_box.png",
            map_pin_image_url: "./plus_box.png",
            is_business: false,

        }
        this.image_setting = {
            image_ratio: 1,
            image_min_width: 100,
            image_max_width: 100,
            image_min_height: 100,
            image_max_height: 100,
            image_type: [],
            map_pin_image_type: [],
            map_pin_image_ratio: 1,
            map_pin_image_min_width: 100,
            map_pin_image_max_width: 100,
            map_pin_image_min_height: 100,
            map_pin_image_max_height: 100


        }

        this.vehicle_id = this.helper.router_id.admin.vehicle_id;

        this.helper.http.post('/api/admin/get_image_setting', {
        }).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            this.image_setting.image_ratio = res_data.image_setting.vehicle_image_ratio;
            this.image_setting.image_min_width = res_data.image_setting.vehicle_image_min_width;
            this.image_setting.image_max_width = res_data.image_setting.vehicle_image_max_width;
            this.image_setting.image_min_height = res_data.image_setting.vehicle_image_min_height;
            this.image_setting.image_max_height = res_data.image_setting.vehicle_image_max_height;




            this.image_setting.map_pin_image_ratio = res_data.image_setting.vehicle_map_pin_ratio;
            this.image_setting.map_pin_image_min_width = res_data.image_setting.vehicle_map_pin_min_width;
            this.image_setting.map_pin_image_max_width = res_data.image_setting.vehicle_map_pin_max_width;
            this.image_setting.map_pin_image_min_height = res_data.image_setting.vehicle_map_pin_min_height;
            this.image_setting.map_pin_image_max_height = res_data.image_setting.vehicle_map_pin_max_height;



            this.image_setting.image_type = res_data.image_setting.image_type;
            this.image_setting.map_pin_image_type = res_data.image_setting.map_pin_image_type;
            
            setTimeout(() => {
                this.cropperSettings.width = this.cropperSettings.height * res_data.image_setting.vehicle_image_ratio;
                this.cropperMapPinSettings.width = this.cropperMapPinSettings.height * res_data.image_setting.vehicle_map_pin_ratio;
                
            }, 1000);




        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });

        if (this.vehicle_id == '') {
            this.type = "add";
            this.helper.http.get('/admin/vehicle_list').pipe(map((res: Response) => res.json())).subscribe(res => this.vehicle_list = res, error => this.error = error);

            this.vehicle_exist = ""
        }
        else {
            jQuery('#add').hide();
            this.type = "edit";
            this.helper.http.post('/admin/get_vehicle_detail', {vehicle_id: this.vehicle_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }

                    this.helper.router.navigate(['admin/vehicle']);

                }
                else {
                    this.add_vehicle.vehicle_name = res_data.vehicle.vehicle_name;
                    this.add_vehicle.description = res_data.vehicle.description;
                    this.add_vehicle.is_business = res_data.vehicle.is_business;
                    this.add_vehicle.image_url = res_data.vehicle.image_url;
                    this.add_vehicle.map_pin_image_url = res_data.vehicle.map_pin_image_url;
                }
            });
        }
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.validation_message = this.helper.validation_message;

    }
    public formData = new FormData();
    
    
    main_image_update($event) {
        this.image_error = "";

        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];
        var index = this.image_setting.image_type.indexOf(image_url.type);
        if (index !== -1) {
            var reader = new FileReader();
            reader.onload = (e: any) => {
                var new_image = new Image();
                new_image.src = e.target.result;
                this.cropper.setImage(new_image);
                new_image.onload = () => {

                    if (new_image.width >= this.image_setting.image_min_width && new_image.width <= this.image_setting.image_max_width &&
                        new_image.height >= this.image_setting.image_min_height && new_image.height <= this.image_setting.image_max_height) {

                        if (new_image.width == (new_image.height * this.image_setting.image_ratio)) {
                            this.add_vehicle.image_url = e.target.result;
                            this.formData.append('image_url', image_url)
                        } else {
                            this.image_crop_modal.open();
                            this.image_error = this.title.vehicle_image_ratio_error;
                        }
                    } else {
                        this.image_error = this.title.vehicle_image_size_error;
                        this.image_crop_modal.open();
                    }
                }
            }
            reader.readAsDataURL(image_url);
        } else {
            jQuery('#remove').click();
            this.image_error = this.title.vehicle_image_extension_error;
        }
    }

    crop($event) {
        this.image_error = '';
        function dataURLtoFile(dataurl, filename) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, {type: mime});
        }
        let image_type = this.image_setting.image_type
        image_type = image_type[0].split('/')
        var image_url = dataURLtoFile(this.cropper.image.image, 'image.' + image_type[0]);

        var reader = new FileReader();
        reader.onload = (e: any) => {
            var new_image = new Image();
            new_image.src = e.target.result;
            // this.cropper.setImage(new_image);
            new_image.onload = () => {

                if (new_image.width >= this.image_setting.image_min_width && new_image.width <= this.image_setting.image_max_width &&
                    new_image.height >= this.image_setting.image_min_height && new_image.height <= this.image_setting.image_max_height) {

                    this.add_vehicle.image_url = e.target.result;
                    this.formData.append('image_url', image_url)
                    this.image_crop_modal.close();

                } else {
                    this.image_error = this.title.vehicle_image_size_error;
                }

            }
        }
        reader.readAsDataURL(image_url);

    }


    
    map_pin_image_update($event) {
        this.map_pin_image_error = "";
        //this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const map_pin_image_url = files[0];
        var index = this.image_setting.map_pin_image_type.indexOf(map_pin_image_url.type);
        if (index !== -1) {
            var reader = new FileReader();
            reader.onload = (e: any) => {
                var new_image = new Image();
                new_image.src = e.target.result;
                this.cropper_map_pin.setImage(new_image);
                new_image.onload = () => {
                    if (new_image.width >= this.image_setting.map_pin_image_min_width && new_image.width <= this.image_setting.map_pin_image_max_width &&
                        new_image.height >= this.image_setting.map_pin_image_min_height && new_image.height <= this.image_setting.map_pin_image_max_height) {

                        if (new_image.width == (new_image.height * this.image_setting.map_pin_image_ratio)) {
                            this.formData.append('map_pin_image_url', map_pin_image_url);
                            this.add_vehicle.map_pin_image_url = e.target.result;
                        } else {
                            this.map_pin_image_crop_modal.open();
                            this.map_pin_image_error = this.title.vehicle_image_ratio_error;
                        }
                    } else {
                        this.map_pin_image_error = this.title.vehicle_image_size_error;
                        this.map_pin_image_crop_modal.open();
                    }
                }
            }
            reader.readAsDataURL(map_pin_image_url);
        } else {
            jQuery('#remove').click();
            this.map_pin_image_error = this.title.vehicle_image_extension_error;
        }
    }
    
    
    cropDeliveryMapPin($event) {
        this.map_pin_image_error = '';
        function dataURLtoFile(dataurl, filename) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, {type: mime});
        }
        let map_pin_image_type = this.image_setting.map_pin_image_type
        map_pin_image_type = map_pin_image_type[0].split('/')
        var map_pin_image_url = dataURLtoFile(this.cropper_map_pin.image.image, 'image.' + map_pin_image_type[0]);

        var reader = new FileReader();
        reader.onload = (e: any) => {
            var new_image = new Image();
            new_image.src = e.target.result;

            new_image.onload = () => {
               if (new_image.width >= this.image_setting.map_pin_image_min_width && new_image.width <= this.image_setting.map_pin_image_max_width &&
                        new_image.height >= this.image_setting.map_pin_image_min_height && new_image.height <= this.image_setting.map_pin_image_max_height) {

                    this.add_vehicle.map_pin_image_url = e.target.result;
                    this.formData.append('map_pin_image_url', map_pin_image_url)
                    this.map_pin_image_crop_modal.close();

                } else {
                    this.map_pin_image_error = this.title.vehicle_image_size_error;
                }

            }
        }
        reader.readAsDataURL(map_pin_image_url);

    }




    addVehicle(vehicle_data) {
        if (this.type == "add") {
            this.myLoading = true;
            this.formData.append("vehicle_name", vehicle_data.vehicle_name);
            this.formData.append("description", vehicle_data.description);
            this.formData.append("is_business", vehicle_data.is_business);
            this.helper.http.post('/admin/add_vehicle_data', this.formData).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == false) {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                } else {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                }
                this.helper.router.navigate(['admin/vehicle']);
            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        } else {
            this.updateVehicle(vehicle_data)
        }

    }


    updateVehicle(vehicle_data) {
        {
            this.myLoading = true;
            this.formData.append("vehicle_name", vehicle_data.vehicle_name);
            this.formData.append("description", vehicle_data.description);
            this.formData.append("is_business", vehicle_data.is_business);
            this.formData.append("vehicle_id", vehicle_data.vehicle_id);

            this.helper.http.post('/admin/update_vehicle', this.formData).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == false) {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                } else {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                }
                this.helper.router.navigate(['admin/vehicle']);

            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
    }
}
