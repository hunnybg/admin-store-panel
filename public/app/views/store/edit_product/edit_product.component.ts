import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery:any;
declare var swal:any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {ImageCropperComponent, CropperSettings, Bounds} from 'ng2-img-cropper';

export interface EditProduct{

    name:String,
    details:String,
    is_visible_in_store:Boolean,
    store_id:Object,
    server_token:String,
    image_url:any

}

export interface imageSetting{
    image_ratio: number,
    image_min_width: number,
    image_max_width: number
    image_min_height: number,
    image_max_height: number,
    image_type: any[]
}

@Component({
    selector: 'app-edit_product',
    templateUrl: './edit_product.component.html',
    providers: [Helper]

})
export class EditProductComponent implements OnInit {

    @ViewChild('image_crop_modal')
    image_crop_modal: ModalComponent;
    @ViewChild('cropper', undefined)
    cropper:ImageCropperComponent;

    private edit_product: EditProduct;
    title:any;
    button:any;
    heading_title:any;
    product_id:Object;
    product_list: string[] = [];
    product_already_exist:Boolean = false;
    validation_message:any;
    image_error: string = '';
    public image_setting : imageSetting;

    data: any;
    cropperSettings: CropperSettings;

    myLoading:boolean = true;
    constructor(public helper: Helper , vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);

        this.cropperSettings = new CropperSettings();
        this.cropperSettings.canvasWidth = 400;
        this.cropperSettings.canvasHeight = 400;
        this.cropperSettings.noFileInput = true;
        this.cropperSettings.preserveSize = true;
        this.cropperSettings.height = 200;
        this.cropperSettings.width = this.cropperSettings.height * this.helper.image_ratio.PRODUCT_IMAGE;


        this.data = {};
    }

    ngOnInit() {

        this.image_setting = {
            image_ratio : 1,
            image_min_width: 100,
            image_max_width: 100,
            image_min_height: 100,
            image_max_height: 100,
            image_type: []
        }
        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {
            this.helper.router.navigate(['store/login']);
        }
        this.edit_product ={

            name:"",
            details:"",
            is_visible_in_store:true,
            store_id:"",
            server_token:"",
            image_url:""

        }
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title;
        this.validation_message=this.helper.validation_message;
        this.product_id =this.helper.router_id.store.product_id
        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.edit_product.store_id=store._id
            this.edit_product.server_token=store.server_token
            this.helper.http.post(this.helper.POST_METHOD.GET_PRODUCT_DATA,{product_id:this.product_id,store_id:store._id, server_token:store.server_token}).map((res_data: Response) => res_data.json()) .subscribe(res_data => {

                this.myLoading=false;
                if(res_data.success == false)
                {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['store/product']);
                }
                else
                {
                    this.edit_product.name=res_data.product.name;
                    this.edit_product.details=res_data.product.details;
                    this.edit_product.is_visible_in_store=res_data.product.is_visible_in_store;
                    this.edit_product.image_url=res_data.product.image_url;
                    this.product_list = res_data.product_array;
                }
            },
            (error: any) => {
                this.myLoading=false;
                    this.helper.http_status(error)
            });
        }

        this.helper.http.post(this.helper.POST_METHOD.GET_IMAGE_SETTING, {
        }).map((res_data: Response) => res_data.json()).subscribe(res_data => {

            this.image_setting.image_ratio = res_data.image_setting.product_image_ratio;
            this.image_setting.image_min_width = res_data.image_setting.product_image_min_width;
            this.image_setting.image_max_width = res_data.image_setting.product_image_max_width;
            this.image_setting.image_min_height = res_data.image_setting.product_image_min_height;
            this.image_setting.image_max_height = res_data.image_setting.product_image_max_height;
            this.image_setting.image_type = res_data.image_setting.image_type;

            setTimeout(() => {
                this.cropperSettings.width = this.cropperSettings.height * res_data.image_setting.product_image_ratio;
            },1000)

        },
        (error: any) => {
            this.myLoading = false;
            this.helper.http_status(error)
        });
    }
    public formData = new FormData();

    image_update($event) {

        this.image_error = "";
        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];
        console.log(image_url.size);
        var index = this.image_setting.image_type.indexOf(image_url.type);
        if (index !== -1) {
            var reader = new FileReader();

            reader.onload = (e: any) => {
                var new_image = new Image();
                new_image.src = e.target.result;
                this.cropper.setImage(new_image);
                new_image.onload = () => {

                    if(new_image.width >= this.image_setting.image_min_width && new_image.width < this.image_setting.image_max_width &&
                        new_image.height >= this.image_setting.image_min_height && new_image.height < this.image_setting.image_max_height ){

                        if(new_image.width == (new_image.height * this.image_setting.image_ratio)){
                            this.edit_product.image_url = e.target.result;
                            this.formData.append('image_url', image_url)
                        } else {
                            this.image_crop_modal.open();
                            this.image_error = this.title.item_image_ratio_error;
                        }
                    } else {
                        this.image_error = this.title.item_image_size_error;
                        this.image_crop_modal.open();
                    }
                }
            }
            reader.readAsDataURL(image_url);
        } else {
            jQuery('#remove').click();
            this.image_error = this.title.item_image_extension_error;
        }
    }

    crop($event){
        this.image_error = '';
        function dataURLtoFile(dataurl, filename) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, {type:mime});
        }
        let image_type = this.image_setting.image_type
        image_type= image_type[0].split('/')
        var image_url = dataURLtoFile(this.cropper.image.image, 'image.'+image_type[0]);
        console.log(image_url.size);
        var reader = new FileReader();
        reader.onload = (e: any) => {
            var new_image = new Image();
            new_image.src = e.target.result;
            // this.cropper.setImage(new_image);
            new_image.onload = () => {

                if(new_image.width >= this.image_setting.image_min_width && new_image.width < this.image_setting.image_max_width &&
                    new_image.height >= this.image_setting.image_min_height && new_image.height < this.image_setting.image_max_height ){
                    this.edit_product.image_url = e.target.result;
                    this.formData.append('image_url', image_url)
                    this.image_crop_modal.close();

                } else if(new_image.width >= this.image_setting.image_min_width && new_image.height >= this.image_setting.image_min_height) {

                    this.image_crop_modal.close();
                    swal({
                        title: 'Image Size Not Proper',
                        text: "Your Image Convert To width - "+this.image_setting.image_max_width+" && height - " +this.image_setting.image_max_height,
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, Convert it!'
                    }).then(() => {
                        new_image.width = this.image_setting.image_max_width;
                        new_image.height = this.image_setting.image_max_height;
                        this.edit_product.image_url = new_image.src;
                        var image_url1 = dataURLtoFile(new_image.src, 'image.'+image_type[0]);
                        console.log(image_url1.size);
                        this.formData.append('image_url', image_url1)
                        this.image_crop_modal.close();
                    }).catch(()=>{
                        swal.noop
                        this.image_crop_modal.open();
                    })

                } else if(new_image.width < this.image_setting.image_max_width && new_image.height < this.image_setting.image_max_height){

                    this.image_crop_modal.close();
                    swal({
                        title: 'Image Size Not Proper',
                        text: "Your Image Convert To width - "+this.image_setting.image_min_width+" && height - " +this.image_setting.image_min_height,
                        type: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, Convert it!'
                    }).then(() => {
                        new_image.width = this.image_setting.image_min_width;
                        new_image.height = this.image_setting.image_min_height;
                        var image_url1 = dataURLtoFile(new_image.src, 'image.'+image_type[0]);
                        console.log(image_url1.size);
                        this.edit_product.image_url = new_image.src;
                        this.formData.append('image_url', image_url1)
                    }).catch(()=>{
                        swal.noop
                        this.image_crop_modal.open();
                    })

                }

            }
        }
        reader.readAsDataURL(image_url);

    }

    remove_image()
    {
        this.formData = new FormData();
    }

    check_product()
    {
        var product_index = this.product_list.findIndex(x => x.toLowerCase()==this.edit_product.name.toLowerCase())
   
        if(product_index == -1)
        {
            this.product_already_exist = false;
        }
        else
        {
            this.product_already_exist = true;
        }
    }

    updateProduct(product_data)
    {
        this.myLoading=true;
        this.formData.append("name", product_data.name.trim());
        this.formData.append("details", product_data.details);
        this.formData.append("is_visible_in_store", product_data.is_visible_in_store);
        this.formData.append("store_id", product_data.store_id);
        this.formData.append("product_id", product_data.product_id);
        this.formData.append("server_token", product_data.server_token);
        this.helper.http.post(this.helper.POST_METHOD.UPDATE_PRODUCT,this.formData).map((res:Response) => res.json()).subscribe(res_data=>{

            this.myLoading=false;
            if(res_data.success == true)
            {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }

                    this.helper.router.navigate(['store/product']);
            }
            else
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.router.navigate(['store/product']);
            }
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }
}
