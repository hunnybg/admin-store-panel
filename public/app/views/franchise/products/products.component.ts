import { Component, OnInit,ViewContainerRef } from '@angular/core';
import {Helper} from "../../franchise_helper";
import { Http, Response } from '@angular/http';
declare var jQuery:any;
//import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';
import { map } from 'rxjs/operators';

export interface AddProduct{

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
    selector: 'app-products',
    templateUrl: './products.component.html',
    providers: [Helper]
})

export class FranchiseProductsComponent implements OnInit {


    private add_product: AddProduct;
    title:any;
    button:any;
    heading_title:any;
    addproductform:Boolean;
    validation_message:any;
    product_list:any[];
    store_list:any[];
    filtered_product_list:any[] = [];
    product_already_exist:Boolean = false;
    filter_product_name:String = "";
    myLoading:boolean = true;
    public image_setting : imageSetting;
    image_error: string = '';

    constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);
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
            this.helper.router.navigate(['franchise/logout']);
        }
        this.add_product ={

            name:"",
            details:"",
            is_visible_in_store:true,
            franchise_id:"",
            server_token:"",
            store_ids:[],
            image_url:""

        }
        this.helper.message()


        var franchise = JSON.parse(localStorage.getItem('franchise'));
        if(franchise!==null)
        {
            this.add_product.franchise_id=franchise._id
            this.add_product.server_token=franchise.server_token
        }
        
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title
        this.validation_message=this.helper.validation_message;
        this.addproductform=false;

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
        this.helper.http.post(this.helper.POST_METHOD.GET_PRODUCT_LIST,{franchise_id:this.add_product.franchise_id, server_token:this.add_product.server_token}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{


            this.myLoading=false;
            this.helper.string_log('loading' , this.myLoading)
            if(res_data.success == false)
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
                this.product_list=[];
                this.filtered_product_list=res_data.products;
            }
            else
            {
                this.product_list=res_data.products;
                this.filtered_product_list=res_data.products;
            }

                // var oReq = new XMLHttpRequest();
                // oReq.open("GET", "/store_products/599bc66519f683158430f4781ggK.jpg", true);
                // oReq.setRequestHeader("deviceid", "xyz");
                // oReq.responseType = "blob";
                // oReq.onload = function (oEvent) {
                //     var arrayBuffer = oReq.response; // Note: not oReq.responseText
                //     if (arrayBuffer) {
                //
                //         jQuery('#img').attr('src' , URL.createObjectURL(arrayBuffer))
                //     }
                // };
                // oReq.send(null);
        },
        (error: any) => {
        });

        this.helper.http.post(this.helper.POST_METHOD.GET_IMAGE_SETTING, {
        }).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                this.image_setting.image_ratio = res_data.image_setting.product_image_ratio;
                this.image_setting.image_min_width = res_data.image_setting.product_image_min_width;
                this.image_setting.image_max_width = res_data.image_setting.product_image_max_width;
                this.image_setting.image_min_height = res_data.image_setting.product_image_min_height;
                this.image_setting.image_max_height = res_data.image_setting.product_image_max_height;
                this.image_setting.image_type = res_data.image_setting.image_type;

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
                this.add_product.store_ids.push(id);
                console.log(this.add_product.store_ids);
                //this.store_list[checked_index]=true;
            });

            jQuery('.icheck').on('ifUnchecked', (event) => {
                var id = event.target.getAttribute('value')
                var i = this.add_product.store_ids.indexOf(id);
                if(i != -1) {
                    this.add_product.store_ids.splice(i, 1);
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
                new_image.onload = () => {
console.log(this.image_setting);
console.log(new_image.width);
console.log(new_image.height);
                    if(new_image.width >= this.image_setting.image_min_width && new_image.width < this.image_setting.image_max_width &&
                        new_image.height >= this.image_setting.image_min_height && new_image.height < this.image_setting.image_max_height ){

                        if(new_image.width == (new_image.height * this.image_setting.image_ratio)){
                            console.log(111)
                        } else {
                            console.log("ratio error")
                            jQuery('#remove').click();
                            this.image_error = this.title.item_image_ratio_error;
                        }

                    } else {
                        console.log("height width error")
                        jQuery('#remove').click();
                        this.image_error = this.title.item_image_size_error;
                    }

                }
            }
            reader.readAsDataURL(image_url);
        } else {
            jQuery('#remove').click();
            this.image_error = this.title.item_image_extension_error;
        }
    }

    check_product()
    {
        var product_index = this.product_list.findIndex(x => x.name.toLowerCase()==this.add_product.name.trim().toLowerCase())
   
        if(product_index == -1)
        {
            this.product_already_exist = false;
        }
        else
        {
            this.product_already_exist = true;
        }
    }

    editProduct(id)
    {
        this.helper.router_id.franchise.product_id=id;
        this.helper.router.navigate(['franchise/product/edit']);

    }

    filter_product(data)
    {
        data = data.replace(/^\s+|\s+$/g, '');
        data = data.replace(/ +(?= )/g, '');
        data = new RegExp(data,"gi");

        this.filtered_product_list = this.product_list.filter((product) => {
            console.log(product);
            var a = product.name.match(data);
            return a !== null
        });
    }
    viewSpecification(id)
    {
      this.helper.router_id.franchise.specification_product_id=id;
      this.helper.router.navigate(['franchise/product/specification']);
    }
    addProduct(product_data)
    {
        this.myLoading=true;
        var franchise = JSON.parse(localStorage.getItem('franchise'));
        this.formData.append("name", product_data.name.trim());
        this.formData.append("details", product_data.details);
        this.formData.append("is_visible_in_store", product_data.is_visible_in_store);
        this.formData.append("franchise_id", franchise._id);
        this.formData.append("store_ids", this.add_product.store_ids);
        this.formData.append("server_token", franchise.server_token);
        this.helper.http.post(this.helper.POST_METHOD.ADD_PRODUCT,this.formData).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
            this.addproductform=false
            this.add_product.name=""
            this.add_product.details=""
            this.add_product.is_visible_in_store=true
            this.add_product.image_url=""

            this.myLoading=false;
            if(res_data.success == true)
            {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.message()
                    this.formData = new FormData();
                    jQuery('#remove').click();
                    this.product_list.push(res_data.franchise_product)
                    this.filter_product(this.filter_product_name)
                    
            }
            else
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message()
            }
        },
        (error: any) => {
            this.myLoading=false;
            this.helper.http_status(error)
        });
    }
    test(id)
    {
        this.helper.router.navigate(['/franchise/specification', { id: id}]);
    }

}
