import { Component, OnInit, ViewChild ,ElementRef} from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery:any;
declare var swal: any;
import {ImageCropperComponent, CropperSettings} from 'ng2-img-cropper';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

export interface AddItem{
    store_id: Object,
    server_token:String,
    product_id: Object,
    details: String,
    name: String,
    price: number,
    is_visible_in_store:  Boolean,
    is_item_in_stock: Boolean,
    is_most_popular:  Boolean,
    item_specification_name:String,
    type:Number,
    specification_group_id: Object,
    specifications_unique_id_count: number,
    is_required: Boolean
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
  selector: 'app-add_item',
  templateUrl: './add_item.component.html',
    providers: [Helper]
})
export class AddItemComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;
    @ViewChild('myspec_group_modal')
    myspec_group_modal: ModalComponent;

    @ViewChild('image_crop_modal')
    image_crop_modal: ModalComponent;
    @ViewChild('cropper', undefined)
    cropper:ImageCropperComponent;
    
    private add_item: AddItem;
    public image_setting : imageSetting;
    title:any;
    button:any;
    heading_title:any;
    validation_message:any;
    product_list:any[];
    product_data:any;
    product_specification_list:any[];
    product_specification_group_list:any[];
    specification_id_array:any[];
    selected_specification_list:any[];
    item_specification_list:any[];
    spec_list_error:number;
    // htmlToAdd:string;
    image_array:any[];
    myLoading:boolean = true;
    new_image_array: any[] = [];
    checked_array: any[] = [];
    item_list: any[] = [];
    item_already_exist: Boolean = false;
    message:any;
    image_error: string = '';

    data: any;
    cropperSettings: CropperSettings;

    constructor(private helper:Helper) {
        this.cropperSettings = new CropperSettings();
        this.cropperSettings.canvasWidth = 400;
        this.cropperSettings.canvasHeight = 400;
        this.cropperSettings.noFileInput = true;
        this.cropperSettings.preserveSize = true;
        this.cropperSettings.height = 200;
        this.cropperSettings.width = this.cropperSettings.height * this.helper.image_ratio.ITEM_IMAGE;


        this.data = {};
    }
    ngAfterViewInit() {
        jQuery("#product").chosen()
    }

    ngOnInit() {
        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {
            this.helper.router.navigate(['store/login']);
        }
        this.add_item ={
            store_id: "",
            server_token:"",
            product_id: "",
            details: "",
            name: "",
            price: 10,
            is_visible_in_store:  true,
            is_item_in_stock: true,
            is_most_popular:  false,
            type:1,
            item_specification_name:"",
            specification_group_id:"",
            specifications_unique_id_count:0,
            is_required:false
        }

        this.image_setting = {
            image_ratio : 1,
            image_min_width: 100,
            image_max_width: 100,
            image_min_height: 100,
            image_max_height: 100,
            image_type: []
        }
        let store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.add_item.store_id=store._id
            this.add_item.server_token=store.server_token

            this.helper.http.post(this.helper.POST_METHOD.GET_PRODUCT_LIST,{store_id:store._id, server_token:store.server_token}).map((res_data: Response) => res_data.json()) .subscribe(res_data => {

                this.myLoading=false;
                if(res_data.success === false) {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message()
                    this.product_data= {};
                    this.product_list = [];
                    this.item_list= [];
                } else {
                    this.product_data = res_data.products
                    this.product_list = res_data.products
                    this.item_list = res_data.item_array;
                    setTimeout(function() {
                        jQuery("#product").chosen()
                        jQuery("#product").trigger("chosen:updated");
                    },1000);
                }
            },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });

            this.helper.http.post(this.helper.POST_METHOD.GET_IMAGE_SETTING, {
            }).map((res_data: Response) => res_data.json()).subscribe(res_data => {

                    this.image_setting.image_ratio = res_data.image_setting.item_image_ratio;
                    this.image_setting.image_min_width = res_data.image_setting.item_image_min_width;
                    this.image_setting.image_max_width = res_data.image_setting.item_image_max_width;
                    this.image_setting.image_min_height = res_data.image_setting.item_image_min_height;
                    this.image_setting.image_max_height = res_data.image_setting.item_image_max_height;
                    this.image_setting.image_type = res_data.image_setting.image_type;

                    setTimeout(() => {
                        this.cropperSettings.width = this.cropperSettings.height * res_data.image_setting.product_image_ratio;
                    },1000);
                },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title;
        this.validation_message=this.helper.validation_message;
        this.message = this.helper.messages;
        this.specification_id_array=[];
        this.selected_specification_list=[];
        this.item_specification_list=[];
        this.spec_list_error=0
        this.product_specification_group_list=[];
        this.image_array=[];

        jQuery(this.helper.elementRef.nativeElement).find('#product').on('change', (evnt,res_data) => {

            this.add_item.product_id=res_data.selected;
            this.item_specification_list=[];
            this.set_specification_list(res_data.selected)
            this.check_item();
        });
        setTimeout( () => {
            jQuery(this.helper.elementRef.nativeElement).find('.bootstrap-touchspin-down').on('click', (evnt, res_data) => {
                if(this.add_item.price > 0) {
                    this.add_item.price--;
                }
            });
            jQuery(this.helper.elementRef.nativeElement).find('.bootstrap-touchspin-up').on('click', (evnt, res_data) => {
                this.add_item.price++;
            });
        },1000);

    }

    check_item()
    {
        var item_index = this.item_list.findIndex(x => x.item_name.toLowerCase()==this.add_item.name.toLowerCase() && x.product_id==this.add_item.product_id )
        if(item_index == -1)
        {
            this.item_already_exist = false;
        }
        else
        {
            this.item_already_exist = true;
        }
    }
    
    public formData = new FormData();

    image_update($event, fieldname) {
        this.image_error = "";
        const files = $event.target.files || $event.srcElement.files;

        // for(var i=0; i<files.length; i++){
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

                                this.new_image_array.unshift({base64_image: e.target.result, file: image_url});
                            } else {
                                this.image_crop_modal.open();
                                this.image_error = this.title.item_image_ratio_error;
                            }

                        } else {
                            this.image_crop_modal.open();
                            this.image_error = this.title.item_image_size_error;
                        }

                    }
                }
                reader.readAsDataURL(image_url);
            } else {
                this.image_error = this.title.item_image_extension_error;
            }
        // }
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

        var reader = new FileReader();
        reader.onload = (e: any) => {
            var new_image = new Image();
            new_image.src = e.target.result;
            // this.cropper.setImage(new_image);
            new_image.onload = () => {

                if(new_image.width >= this.image_setting.image_min_width && new_image.width < this.image_setting.image_max_width &&
                    new_image.height >= this.image_setting.image_min_height && new_image.height < this.image_setting.image_max_height ){

                    this.new_image_array.unshift({base64_image: e.target.result, file: image_url});
                    // this.formData.append('image_url', image_url)
                    this.image_crop_modal.close();

                } else {
                    this.image_error = this.title.item_image_size_error;
                }

            }
        }
        reader.readAsDataURL(image_url);

    }

    remove_new_image(index)
    {
        this.new_image_array.splice(index , 1)
    }

    open_specification_group_modal()
    {
        this.myspec_group_modal.open();
    }

    open_specification_modal(id , product_id ,name , unique_id)
    {
        this.myLoading=true;
        this.checked_array=[];
        this.add_item.specification_group_id = id;
        // this.add_item.specification_group_unique_id = unique_id;
        this.myspec_group_modal.close();
        var json =  {    store_id:this.add_item.store_id, 
                        server_token:this.add_item.server_token,
                        product_id:product_id,
                        specification_group_id:id
                    }
        this.add_item.is_required=false;
        this.add_item.type=1;
        this.helper.http.post(this.helper.POST_METHOD.GET_SOECIFICATION_LIST, json).map((res_data: Response) => res_data.json()) .subscribe(res_data => {

                this.myLoading=false;
                if(res_data.success == false)
                {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }

                        this.add_item.item_specification_name=name;
                        this.product_specification_list=[];
                        this.modal.open();

                }
                else
                {
                    this.add_item.item_specification_name=name;
                    this.product_specification_list=res_data.specification_list.specifications;
                    this.modal.open();
                }
                this.update_check_box();

            },
            (error: any) => {
                this.helper.http_status(error)
            });
    }

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
                this.specification_id_array.push(id)
                var checked_index = this.product_specification_list.findIndex(x => x._id == id);

                this.checked_array[checked_index]=true;
            });

            jQuery('.icheck').on('ifUnchecked', (event) => {
                var id = event.target.getAttribute('value')
                var i = this.specification_id_array.indexOf(id);
                if(i != -1) {
                    this.specification_id_array.splice(i, 1);
                }
                var checked_index = this.product_specification_list.findIndex(x => x._id == id);
                this.product_specification_list[checked_index].price = 0;
                this.product_specification_list[checked_index].is_default_selected = false;
                this.checked_array[checked_index]=false;
            });

            jQuery('.iradio').iCheck({
                handle:'radio',
                radioClass: 'iradio_square-green'
            });

            jQuery('.iradio').on('ifChanged', (event) => {
                var value = Number(event.target.getAttribute('value'))
                this.add_item.type=value
                for(var i=0; i<=this.product_specification_list.length - 1; i++)
                {
                    this.product_specification_list[i].is_default_selected=false;
                }
            });
        },1000);
    }

    addSpecification(data)
    {
        var size = this.specification_id_array.length;
        if(size == 0)
        {
            this.spec_list_error=1
        }
        else
        {
            for(var i=0; i<size; i++)
            {
                var product_size = this.product_specification_list.length;
                for(var j=0; j<product_size ; j++)
                {
                    if(this.product_specification_list[j]._id === this.specification_id_array[i])
                    {
                        this.selected_specification_list.push({_id:this.product_specification_list[j]._id,
                                     unique_id:this.product_specification_list[j].unique_id,
                                     name:this.product_specification_list[j].name,
                                     price:Number(this.product_specification_list[j].price),
                                     is_default_selected:this.product_specification_list[j].is_default_selected,
                                     is_user_selected:false});
                    }
                }
            }
            this.add_item.specifications_unique_id_count++;
            this.selected_specification_list.sort(this.sortSpecification);
            this.item_specification_list.push({_id:data.specification_group_id ,
                                                    is_required:data.is_required,
                                                    name:data.item_specification_name,
                                                   type:data.type,
                                                    unique_id:this.add_item.specifications_unique_id_count,
                                                   list:this.selected_specification_list})
            this.modal.close()
            this.selected_specification_list=[];
            this.specification_id_array=[];
            this.spec_list_error=0;
            var store = JSON.parse(localStorage.getItem('store'));

            this.helper.http.post(this.helper.POST_METHOD.GET_PRODUCT_LIST,{store_id:store._id, server_token:store.server_token}).map((res_data: Response) => res_data.json()) .subscribe(res_data => {

                if(res_data.success == false)
                {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    
                    this.add_item.item_specification_name="";
                    this.add_item.type=1;
                }
                else
                {
                    this.product_data=res_data.products;
                    this.add_item.item_specification_name="";
                    this.add_item.type=1;
                    this.set_specification_list(this.add_item.product_id);
                }
            },
            (error: any) => {
                this.helper.http_status(error)
            });
        }
    }
    sortSpecification(a,b) {
        if (a.name < b.name)
          return -1;
        if (a.name > b.name)
          return 1;
        return 0;
    }
    delete_item_specification(specification)
    {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then(() => {
                var i = this.item_specification_list.indexOf(specification);
                if(i != -1) {
                    this.item_specification_list.splice(i, 1);
                }
                swal(
                  'Deleted!',
                  'Your file has been deleted.',
                  'success'
                );
        }).catch(swal.noop)
    }

    set_specification_list(productid)
    {
        for(var i=0; i<=this.product_data.length-1; i++)
        {
            if(this.product_data[i]._id === productid)
            {
                this.product_specification_group_list=this.product_data[i].specifications_details;
            }
        }
        
    }
    onChange(event, id)
    {
        if(this.add_item.type == 1)
        {
            if(event == true)
            {
                for(var i=0; i<=this.product_specification_list.length - 1; i++)
                {
                    if(this.product_specification_list[i]._id !== id)
                    {
                        if(this.product_specification_list[i].is_default_selected == true)
                        {
                            this.product_specification_list[i].is_default_selected=false
                        }
                    }
                }
            }
        }
    }

    addItem(itemdata)
    {
        this.myLoading=true;
        itemdata.name=itemdata.name.trim();

        setTimeout( () => {
            this.helper.http.post(this.helper.POST_METHOD.ADD_ITEM,itemdata).map((res:Response) => res.json()).subscribe(res_data=>{

                
                if(res_data.success == true)
                {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    if(this.new_image_array.length > 0)
                    {
                        this.new_image_array.forEach((image , index) =>{
                            if(image !== undefined)
                            {
                                this.formData.append(index, image.file);
                            }
                        });
                        this.formData.append("item_id", res_data.item._id);
                        this.helper.http.post(this.helper.POST_METHOD.UPLOAD_ITEM_IMAGE,this.formData).map((res:Response) => res.json()).subscribe(res_data=>{
                            this.myLoading=false;
                            this.helper.router.navigate(['store/item']);
                        },
                        (error: any) => {
                            this.myLoading=false;
                            this.helper.http_status(error)
                        });
                    }
                    else
                    {
                        this.myLoading=false;
                        this.helper.router.navigate(['store/item']);
                    }

                }
                else
                {
                    
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['store/item']);
                }
            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });
        },5000);
    }
}
