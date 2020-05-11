import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../franchise_helper";
declare var jQuery:any;
import { map } from 'rxjs/operators';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {ImageCropperComponent, CropperSettings, Bounds} from 'ng2-img-cropper';

export interface EditProduct{

    name:String,
    details:String,
    is_visible_in_store:Boolean,
    franchise_id:Object,
    server_token:String,
    store_ids:any,
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
export class EditFranchiseProductComponent implements OnInit {

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
    store_list:any[];
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
        this.cropperSettings.width = this.cropperSettings.height * 1.25;


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
            this.helper.router.navigate(['franchise/login']);
        }
        this.edit_product ={

            name:"",
            details:"",
            is_visible_in_store:true,
            franchise_id:"",
            store_ids:[],
            server_token:"",
            image_url:""

        }
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title;
        this.validation_message=this.helper.validation_message;
        this.product_id =this.helper.router_id.franchise.product_id
        var franchise = JSON.parse(localStorage.getItem('franchise'));
        if(franchise!==null)
        {
            this.edit_product.franchise_id=franchise._id
            this.edit_product.server_token=franchise.server_token
            this.helper.http.post(this.helper.POST_METHOD.GET_STORE_DATA,{store_ids:franchise.store_ids}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
                if(res_data.success == false)
                {
                    /*this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message()*/
                    this.store_list=[];
                }
                else
                {
                    this.store_list=res_data.stores;
                    this.update_check_box();
                }
            },
            (error: any) => {
            });
            this.helper.http.post(this.helper.POST_METHOD.GET_PRODUCT_DATA,{product_id:this.product_id,franchise_id:franchise._id, server_token:franchise.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {

                this.myLoading=false;
                if(res_data.success == false)
                {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['franchise/product']);
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
        }).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

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
    update_check_box()
    {
        setTimeout(() => {
            jQuery('.icheck').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
            jQuery('#1').iCheck('check');

            jQuery('.icheck').on('ifChecked', (event) => {
                var id = event.target.getAttribute('value')
                this.edit_product.store_ids.push(id);
                console.log(this.edit_product.store_ids);
                //this.store_list[checked_index]=true;
            });

            jQuery('.icheck').on('ifUnchecked', (event) => {
                var id = event.target.getAttribute('value')
                var i = this.edit_product.store_ids.indexOf(id);
                if(i != -1) {
                    this.edit_product.store_ids.splice(i, 1);
                }
                console.log("uncheck: "+id);
                /*var checked_index = this.product_specification_list.findIndex(x => x._id == id);
                this.store_list[checked_index]=false;*/
            });

        },1000);
    }
    image_update($event) {
        this.image_error = "";
        this.formData = new FormData();
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
        var image_url = dataURLtoFile(this.cropper.image.image, 'hello.jpg');

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

                } else {
                    this.image_error = this.title.item_image_size_error;
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
        var franchise = JSON.parse(localStorage.getItem('franchise'));
        this.formData.append("name", product_data.name.trim());
        this.formData.append("details", product_data.details);
        this.formData.append("is_visible_in_store", product_data.is_visible_in_store);
        this.formData.append("franchise_id", franchise._id);
        this.formData.append("store_ids", this.edit_product.store_ids);
        this.formData.append("product_id", product_data.product_id);
        this.formData.append("server_token", franchise.server_token);
        this.helper.http.post(this.helper.POST_METHOD.UPDATE_PRODUCT,this.formData).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

            this.myLoading=false;
            if(res_data.success == true)
            {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }

                    this.helper.router.navigate(['franchise/product']);
            }
            else
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.router.navigate(['franchise/product']);
            }
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }
}
