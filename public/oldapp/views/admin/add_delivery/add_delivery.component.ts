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
export interface AddDelivery {
    delivery_name: String,
    description: String,
    image_url: any,
    icon_url: any,
    map_pin_url: any,
    delivery_type: Object,
    is_business: Boolean,
    sequence_number: number,
    famous_products_tags: any[]
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

    icon_image_ratio: number,
    icon_minimum_size: number,
    icon_maximum_size: number,
    image_type: any[],
    map_pin_image_type: any[],
    icon_image_type: any[]
}

@Component({
    selector: 'app-add_delivery',
    templateUrl: './add_delivery.component.html',
    providers: [Helper]
})
export class AddDeliveryComponent implements OnInit {

    @ViewChild('image_crop_modal')
    image_crop_modal: ModalComponent;
    @ViewChild('cropper', undefined)
    cropper: ImageCropperComponent;

    @ViewChild('map_pin_image_crop_modal')
    map_pin_image_crop_modal: ModalComponent;
    @ViewChild('cropper_map_pin', undefined)
    cropper_map_pin: ImageCropperComponent;

    @ViewChild('icon_image_crop_modal')
    icon_image_crop_modal: ModalComponent;
    @ViewChild('cropper_icon', undefined)
    cropper_icon: ImageCropperComponent;

    private add_delivery: AddDelivery;
    public image_setting: imageSetting;
    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    delivery_type_list: any[] = [];
    delivery_id: Object;
    delivery_exist: any;
    delivery_list: any[];
    products_tags_array: any[] = [];
    products_tags_arrays: any[] = [];
    deleted_product_tag_array: any[] = [];

    error: any;
    type: String;
    myLoading: boolean = false;
    image_error: string = '';
    icon_image_error: string = '';
    map_pin_image_error: string = '';

    image_note: string = '';
    image_note_ratio: string = '';

    map_pin_note: string = '';
    map_pin_note_ratio: string = '';

    icon_note: string = '';
    icon_note_ratio: string = '';

    add_tag: boolean = false;
    tags_array: any[];
    product_tag: boolean = false;

    data: any;
    map_pin_data: any;
    icon_data: any;
    cropperSettings: CropperSettings;
    cropperMapPinSettings: CropperSettings;
    cropperIconSettings: CropperSettings;


    constructor(public helper: Helper, vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);

        this.cropperSettings = new CropperSettings();
        this.cropperSettings.canvasWidth = 400;
        this.cropperSettings.canvasHeight = 400;
        this.cropperSettings.noFileInput = true;
        this.cropperSettings.preserveSize = true;
        this.cropperSettings.height = 200;
        this.cropperSettings.width = this.cropperSettings.height * this.helper.image_ratio.DELIVERY_IMAGE;

        this.cropperMapPinSettings = new CropperSettings();
        this.cropperMapPinSettings.canvasWidth = 400;
        this.cropperMapPinSettings.canvasHeight = 400;
        this.cropperMapPinSettings.noFileInput = true;
        this.cropperMapPinSettings.preserveSize = true;
        this.cropperMapPinSettings.height = 200;
        this.cropperMapPinSettings.width = this.cropperMapPinSettings.height * this.helper.image_ratio.DELIVER_MAP_PIN;

        this.cropperIconSettings = new CropperSettings();
        this.cropperIconSettings.canvasWidth = 400;
        this.cropperIconSettings.canvasHeight = 400;
        this.cropperIconSettings.noFileInput = true;
        this.cropperIconSettings.preserveSize = true;
        this.cropperIconSettings.height = 200;
        this.cropperIconSettings.width = this.cropperIconSettings.height * this.helper.image_ratio.DELIVERY_ICON;


        this.data = {};
        this.map_pin_data = {};
        this.icon_data = {};
    }
    ngAfterViewInit() {
        jQuery("#delivery_type").chosen({disable_search: true});
        jQuery("input[name='sequence_number']").TouchSpin({
            min: 0,
            max: 100,
            step: 1,
            initval: 0,
            boostat: 5,
            forcestepdivisibility: 'none'
        });
    }
    ngOnDestroy() {
        this.helper.router_id.admin.delivery_id = "";
    }
    ngOnInit() {

        this.add_delivery = {

            delivery_name: "",
            description: "",
            image_url: "./plus_box.png",
            icon_url: "./plus_box.png",
            map_pin_url: "./plus_box.png",
            delivery_type: "",
            is_business: false,
            sequence_number: 1,
            famous_products_tags: []

        }

        this.image_setting = {
            image_ratio: 1,
            image_min_width: 100,
            image_max_width: 100,
            image_min_height: 100,
            image_max_height: 100,
            image_type: [],
            map_pin_image_type: [],
            icon_image_type: [],
            map_pin_image_ratio: 1,
            map_pin_image_min_width: 100,
            map_pin_image_max_width: 100,
            map_pin_image_min_height: 100,
            map_pin_image_max_height: 100,
            icon_image_ratio: 1,
            icon_minimum_size: 100,
            icon_maximum_size: 100

        }

        this.delivery_id = this.helper.router_id.admin.delivery_id;

        setTimeout(() => {
            jQuery(this.helper.elementRef.nativeElement).find('.bootstrap-touchspin-down').on('click', (evnt, res_data) => {
                if (this.add_delivery.sequence_number > 0) {
                    this.add_delivery.sequence_number--;
                }
            });
            jQuery(this.helper.elementRef.nativeElement).find('.bootstrap-touchspin-up').on('click', (evnt, res_data) => {
                this.add_delivery.sequence_number++;

            });
        }, 1000);


        this.helper.http.post('/api/admin/get_image_setting', {
        }).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            this.image_setting.image_ratio = res_data.image_setting.delivery_image_ratio;
            this.image_setting.image_min_width = res_data.image_setting.delivery_image_min_width;
            this.image_setting.image_max_width = res_data.image_setting.delivery_image_max_width;
            this.image_setting.image_min_height = res_data.image_setting.delivery_image_min_height;
            this.image_setting.image_max_height = res_data.image_setting.delivery_image_max_height;




            this.image_setting.map_pin_image_ratio = res_data.image_setting.delivery_map_pin_ratio;
            this.image_setting.map_pin_image_min_width = res_data.image_setting.delivery_map_pin_min_width;
            this.image_setting.map_pin_image_max_width = res_data.image_setting.delivery_map_pin_max_width;
            this.image_setting.map_pin_image_min_height = res_data.image_setting.delivery_map_pin_min_height;
            this.image_setting.map_pin_image_max_height = res_data.image_setting.delivery_map_pin_max_height;

            this.image_setting.icon_image_ratio = res_data.image_setting.delivery_icon_ratio;
            this.image_setting.icon_minimum_size = res_data.image_setting.delivery_icon_minimum_size;
            this.image_setting.icon_maximum_size = res_data.image_setting.delivery_icon_maximum_size;

            this.image_setting.image_type = res_data.image_setting.image_type;
            this.image_setting.icon_image_type = res_data.image_setting.icon_image_type;
            this.image_setting.map_pin_image_type = res_data.image_setting.map_pin_image_type;



            setTimeout(() => {
                this.cropperSettings.width = this.cropperSettings.height * res_data.image_setting.delivery_image_ratio;
                this.cropperMapPinSettings.width = this.cropperMapPinSettings.height * res_data.image_setting.delivery_map_pin_ratio;
                this.cropperIconSettings.width = this.cropperIconSettings.height * res_data.image_setting.delivery_icon_ratio;
            }, 1000);





        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });

        if (this.delivery_id == '') {
            this.type = "add";
            this.helper.http.get('/admin/delivery_list').pipe(map((res: Response) => res.json())).subscribe(res => this.delivery_list = res, error => this.error = error);

            this.delivery_exist = ""
        }
        else {
            jQuery('#add').hide();
            this.type = "edit";
            this.helper.http.post('/admin/get_delivery_detail', {delivery_id: this.delivery_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {
                    this.helper.router.navigate(['admin/delivery']);
                }
                else {

                    this.add_delivery.delivery_name = res_data.delivery.delivery_name;
                    this.add_delivery.description = res_data.delivery.description;
                    this.add_delivery.is_business = res_data.delivery.is_business;
                    this.add_delivery.delivery_type = res_data.delivery.delivery_type;
                    this.add_delivery.icon_url = res_data.delivery.icon_url;
                    this.add_delivery.image_url = res_data.delivery.image_url;
                    this.add_delivery.map_pin_url = res_data.delivery.map_pin_url;
                    this.add_delivery.sequence_number = res_data.delivery.sequence_number;
                    this.add_delivery.famous_products_tags = res_data.delivery.famous_products_tags;





                }
            });
        }



        // this.helper.http.get('/admin/get_delivery_type').pipe(map((res: Response) => res.json())).subscribe(res => {


            this.delivery_type_list = this.helper.DELIVERY_TYPE;

            if(this.delivery_type_list.length==1){
                this.add_delivery.delivery_type = this.delivery_type_list[0].value
            }
            setTimeout(function () {
                jQuery(".chosen-select").trigger("chosen:updated");
            }, 1000);
        // });
        jQuery(this.helper.elementRef.nativeElement).find('#delivery_type').on('change', (evnt, res_data) => {

            this.add_delivery.delivery_type = res_data.selected;


        });

        this.tags_array = [];
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.validation_message = this.helper.validation_message;

    }

    updateTag() {
        this.products_tags_arrays.forEach((tag) => {
            if (tag != "") {
                this.add_delivery.famous_products_tags.push(tag);
            }
        });
        this.add_tag = false;
        this.products_tags_array = [];
        this.products_tags_arrays = [];
    }

    append_tag() {

        this.products_tags_array.push("");
        this.products_tags_arrays.push("");
    }

    deleteTag(tag_index, Bool) {
        if (Bool) {
            this.products_tags_array.splice(tag_index, 1);
            this.products_tags_arrays.splice(tag_index, 1);
        } else {
            this.deleted_product_tag_array.push(this.add_delivery.famous_products_tags[tag_index]);
            this.add_delivery.famous_products_tags.splice(tag_index, 1);
        }
    }

    public formData = new FormData();

    image_update($event) {
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
                            this.add_delivery.image_url = e.target.result;
                            this.formData.append('image_url', image_url)
                        } else {
                            this.image_crop_modal.open();
                            this.image_error = this.title.delivery_image_ratio_error;
                        }
                    } else {
                        this.image_error = this.title.delivery_image_size_error;
                        this.image_crop_modal.open();
                    }
                }
            }
            reader.readAsDataURL(image_url);
        } else {
            jQuery('#remove').click();
            this.image_error = this.title.delivery_image_extension_error;
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

            new_image.onload = () => {

                if (new_image.width >= this.image_setting.image_min_width && new_image.width <= this.image_setting.image_max_width &&
                    new_image.height >= this.image_setting.image_min_height && new_image.height <= this.image_setting.image_max_height) {

                    this.add_delivery.image_url = e.target.result;
                    this.formData.append('image_url', image_url)
                    this.image_crop_modal.close();

                } else {
                    this.image_error = this.title.delivery_image_size_error;
                }

            }
        }
        reader.readAsDataURL(image_url);

    }





    map_pin_url_update($event) {
        this.map_pin_image_error = "";
        const files = $event.target.files || $event.srcElement.files;
        const map_pin_url = files[0];
        var index = this.image_setting.map_pin_image_type.indexOf(map_pin_url.type);
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
                            this.formData.append('map_pin_url', map_pin_url);
                            this.add_delivery.map_pin_url = e.target.result;
                        } else {
                            this.map_pin_image_crop_modal.open();
                            this.map_pin_image_error = this.title.delivery_image_ratio_error;
                        }
                    } else {
                        this.map_pin_image_error = this.title.delivery_image_size_error;
                        this.map_pin_image_crop_modal.open();
                    }
                }
            }
            reader.readAsDataURL(map_pin_url);
        } else {
            jQuery('#remove').click();
            this.map_pin_image_error = this.title.delivery_image_extension_error;
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
        var map_pin_url = dataURLtoFile(this.cropper_map_pin.image.image, 'image.' + map_pin_image_type[0]);

        var reader = new FileReader();
        reader.onload = (e: any) => {
            var new_image = new Image();
            new_image.src = e.target.result;
            // this.cropper.setImage(new_image);
            new_image.onload = () => {
                if (new_image.width >= this.image_setting.map_pin_image_min_width && new_image.width <= this.image_setting.map_pin_image_max_width &&
                    new_image.height >= this.image_setting.map_pin_image_min_height && new_image.height <= this.image_setting.map_pin_image_max_height) {

                    this.add_delivery.map_pin_url = e.target.result;
                    this.formData.append('map_pin_url', map_pin_url)
                    this.map_pin_image_crop_modal.close();

                } else {
                    this.map_pin_image_error = this.title.delivery_image_size_error;
                }

            }
        }
        reader.readAsDataURL(map_pin_url);

    }





    icon_url_update($event) {
        this.icon_image_error = "";
        const files = $event.target.files || $event.srcElement.files;
        const icon_url = files[0];
        var index = this.image_setting.icon_image_type.indexOf(icon_url.type);
        if (index !== -1) {
            var reader = new FileReader();
            reader.onload = (e: any) => {
                var new_image = new Image();
                new_image.src = e.target.result;
                this.cropper_icon.setImage(new_image);
                new_image.onload = () => {
                    if (new_image.width >= this.image_setting.icon_minimum_size && new_image.width <= this.image_setting.icon_maximum_size &&
                        new_image.height >= this.image_setting.icon_minimum_size && new_image.height <= this.image_setting.icon_maximum_size) {

                        if (new_image.width == (new_image.height * this.image_setting.icon_image_ratio)) {
                            this.formData.append('icon_url', icon_url);
                            this.add_delivery.icon_url = e.target.result;
                        } else {
                            this.icon_image_crop_modal.open();
                            this.icon_image_error = this.title.delivery_image_ratio_error;
                        }
                    } else {
                        this.icon_image_error = this.title.delivery_image_size_error;
                        this.icon_image_crop_modal.open();
                    }
                }
            }
            reader.readAsDataURL(icon_url);
        } else {
            jQuery('#remove').click();
            this.icon_image_error = this.title.delivery_image_extension_error;
        }
    }



    cropIcon($event) {
        this.icon_image_error = '';
        function dataURLtoFile(dataurl, filename) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, {type: mime});
        }
        let icon_image_type = this.image_setting.icon_image_type
        icon_image_type = icon_image_type[0].split('/')
        var icon_url = dataURLtoFile(this.cropper_icon.image.image, 'image.' + icon_image_type[0]);

        var reader = new FileReader();
        reader.onload = (e: any) => {
            var new_image = new Image();
            new_image.src = e.target.result;

            new_image.onload = () => {
                if (new_image.width >= this.image_setting.icon_minimum_size && new_image.width <= this.image_setting.icon_maximum_size &&
                    new_image.height >= this.image_setting.icon_minimum_size && new_image.height <= this.image_setting.icon_maximum_size) {

                    this.add_delivery.icon_url = e.target.result;
                    this.formData.append('icon_url', icon_url)
                    this.icon_image_crop_modal.close();

                } else {
                    this.icon_image_error = this.title.delivery_image_size_error;
                }
            }
        }
        reader.readAsDataURL(icon_url);
    }





    addDelivery(delivery_data) {
        if (this.type == "add") {

            this.myLoading = true;
            this.formData.append("delivery_name", delivery_data.delivery_name);
            this.formData.append("description", delivery_data.description);
            this.formData.append("delivery_type", this.add_delivery.delivery_type.toString());
            this.formData.append("is_business", delivery_data.is_business);
            this.formData.append("sequence_number", delivery_data.sequence_number);

            this.formData.append("famous_products_tags", this.add_delivery.famous_products_tags);

            this.helper.http.post('/admin/add_delivery_data', this.formData).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                if (res_data.success == true) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.router.navigate(['admin/delivery']);
                } else {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['admin/delivery']);

                }

            },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
        else {

            this.updateDelivery(delivery_data)
        }
    }



    updateDelivery(delivery_data) {
        console.log(this.add_delivery.delivery_type)
        this.myLoading = true;
        this.formData.append("delivery_name", delivery_data.delivery_name);
        this.formData.append("description", delivery_data.description);
        this.formData.append("is_business", delivery_data.is_business);
        this.formData.append("delivery_type", this.add_delivery.delivery_type.toString());
        this.formData.append("famous_products_tags", this.add_delivery.famous_products_tags);
        this.formData.append("deleted_product_tag_array", this.deleted_product_tag_array);

        this.formData.append("delivery_id", delivery_data.delivery_id);
        this.formData.append("sequence_number", delivery_data.sequence_number);

        this.helper.http.post('/admin/update_delivery', this.formData).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.router.navigate(['admin/delivery']);
            }
            else {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.router.navigate(['admin/delivery']);

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }
}
