import { Component, OnInit,ViewContainerRef, ViewChild } from '@angular/core';
import {Helper} from "../../store_helper";
import { Http, Response } from '@angular/http';
declare var jQuery:any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
declare var swal: any;
import {ImageCropperComponent, CropperSettings} from 'ng2-img-cropper';
import { map } from 'rxjs/operators';

export interface AddProduct{
    name:String,
    is_visible_in_store:Boolean,
    store_id:Object,
    server_token:String
}
export interface AddItem{
    store_id: Object,
    server_token:String,
    product_id: Object,
    details: String,
    name: String,
    price: any,
    is_visible_in_store:  Boolean,
    is_item_in_stock: Boolean,
    is_most_popular:  Boolean,
    type: Number
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

export class AdminProductsComponent implements OnInit {

    @ViewChild('add_specification_modal')
    add_specification_modal: ModalComponent;

    @ViewChild('edit_product_modal')
    edit_product_modal: ModalComponent;
    @ViewChild('image_crop_modal')
    image_crop_modal: ModalComponent;
    @ViewChild('cropper', undefined)
    cropper:ImageCropperComponent;
    @ViewChild('item_spec_modal')
    item_spec_modal: ModalComponent;

    public image_setting : imageSetting;

    private add_product: AddProduct;
    title:any;
    button:any;
    heading_title:any;
    addproductform:Boolean;
    validation_message:any;
    product_list:any[];
    filtered_product_list:any[] = [];
    item_list: any[] = [];
    filtered_item_list: any[] = [];
    product_already_exist:Boolean = false;
    filter_product_name:String = "";
    myLoading:boolean = true;
    selected_product_id: any = '';
    selected_product_id_for_specification: any = '';
    data: any;
    selected_specification_group_id: any = '';
    selected_specification_group_name: string = '';
    product_data: any = {};
    specification_group_name: string = '';
    selected_item_id: string = '';
    item_detail: any = {};
    specification_price: any = 0;
    private add_item: AddItem;
    item_already_exist: boolean = false;
    new_image_array: any[] = [];
    image_error: string = '';
    cropperSettings: CropperSettings;
    deleted_image_url: any[] = [];
    specification_list: any[] = [];
    specification_name_array: any[] = [];
    delete_specification_array: any[] = [];
    specification_name: string = '';
    selected_item_specification: string = '';
    item_specification_group_list: any[] = [];
    specification_group_list: any[] = [];
    selected_spec_group_for_item: string = '';
    is_product_selected: Boolean = true;

    range_error: boolean = false;

    /// for add item spec
    product_specification_list: any[] = [];
    checked_array: any[] = [];
    specification_id_array: any[] = [];
    spec_list_error: number = 0;
    selected_specification_list: any[] = [];
    spec_button: string;
    index: number;
    item_error: string;

    constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);
        this.cropperSettings = new CropperSettings();
        this.cropperSettings.canvasWidth = 400;
        this.cropperSettings.canvasHeight = 400;
        this.cropperSettings.noFileInput = true;
        this.cropperSettings.preserveSize = true;
        this.cropperSettings.height = 200;
        this.cropperSettings.width = this.cropperSettings.height * this.helper.image_ratio.ITEM_IMAGE;
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

        this.add_product ={
            name:"",
            is_visible_in_store:true,
            store_id:"",
            server_token:""
        }
        this.helper.message();

        this.add_item ={
            store_id: "",
            server_token:"",
            product_id: "",
            details: "",
            name: "",
            price: 0,
            is_visible_in_store:  true,
            is_item_in_stock: true,
            is_most_popular:  false,
            type: 0
        }

        this.add_product.store_id=this.helper.router_id.admin.store_id
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title
        this.validation_message=this.helper.validation_message;
        this.addproductform=false;

        this.helper.http.post(this.helper.POST_METHOD.GET_PRODUCT_LIST,{type: this.helper.ADMIN_DATA_ID.ADMIN, store_id:this.add_product.store_id, server_token:this.add_product.server_token}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
            this.myLoading=false;
            this.helper.string_log('loading' , this.myLoading)
            if(res_data.success == false)
            {
                this.product_list=[];
                this.filtered_product_list=res_data.products;
            }
            else
            {
                this.product_list=res_data.products;
                this.filtered_product_list=res_data.products;

                this.filtered_product_list.forEach((product, index)=>{
                    if(product.sequence_number == undefined){
                        product.sequence_number = index;
                    }
                });
                this.filtered_product_list.sort(this.sortItem);
                if(this.filtered_product_list.length>0){
                    this.selected_product_id = this.filtered_product_list[0]._id;
                    this.get_item_list();
                    this.item_specification_group_list = this.filtered_product_list[0].specifications_details;
                }
                jQuery('#sortable_product').sortable({
                    start: function(event, ui) {
                        var start_pos = ui.item.index();
                        ui.item.data('start_pos', start_pos);
                    },
                    update: (event, ui)=> {
                        var start_pos = ui.item.data('start_pos');
                        var index = ui.item.index();

                        if (start_pos < index) {
                            this.filtered_product_list.forEach((item)=>{
                                if(item.sequence_number >=start_pos+1 && item.sequence_number <=index){
                                    item.sequence_number--;
                                }
                            });

                            let i_index = this.filtered_product_list.findIndex((x)=>x.sequence_number == start_pos);
                            this.filtered_product_list[i_index].sequence_number = index;

                        } else {
                            let i_index = this.filtered_product_list.findIndex((x)=>x.sequence_number == start_pos);
                            this.filtered_product_list[i_index].sequence_number = index;

                            this.filtered_item_list.forEach((product)=>{
                                if(product.sequence_number >=index && product.sequence_number <=start_pos-1){
                                    product.sequence_number++;
                                }
                            });
                        }
                    }
                });
            }

        },
        (error: any) => {
        });

        this.helper.http.post(this.helper.POST_METHOD.GET_SPECIFICATION_GROUP, {
            store_id: this.add_product.store_id, type: this.helper.ADMIN_DATA_ID.ADMIN, server_token: this.add_product.server_token}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if(res_data.success){
                this.specification_group_list = res_data.specification_group;
                if(this.specification_group_list.length>0){
                    this.selected_specification_group_name = res_data.specification_group[0].name;
                    this.specification_list = res_data.specification_group[0].list;
                    this.selected_specification_group_id = res_data.specification_group[0]._id;
                }
            } else {
                this.specification_group_list = [];
                this.specification_list = [];
                this.selected_specification_group_name = '';
            }
        });

        this.helper.http.post(this.helper.POST_METHOD.GET_IMAGE_SETTING, {
        }).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

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

    open_specification(product_id){
        this.selected_product_id_for_specification=product_id;
    }
    close_specification(product_id){
        this.selected_product_id_for_specification='';
    }

    delete_specification_group(id, sp_group_index, event)
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

            this.myLoading=true;
            this.helper.http.post(this.helper.POST_METHOD.DELETE_SPECIFICATION_GROUP,{type: this.helper.ADMIN_DATA_ID.ADMIN, store_id:this.add_product.store_id,server_token:this.add_product.server_token,
                specification_group_id:id}).pipe(map((response: Response) => response.json())) .subscribe(res_data => {

                    this.myLoading=false;
                    if(res_data.success)
                    {
                        this.helper.data.storage = {
                            "message": this.helper.MESSAGE_CODE[res_data.message],
                            "class": "alert-info"
                        }
                        this.specification_group_list.splice(sp_group_index, 1)
                        if(this.selected_specification_group_id == id){
                            if(this.specification_group_list.length>0){
                                this.get_specification(this.specification_group_list[0]._id);
                            } else {
                                this.specification_list = [];
                                this.selected_specification_group_name = '';
                            }
                        }
                    }
                    else
                    {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                    }
                    this.helper.message()
                },
                (error: any) => {
                    this.myLoading=false;
                    this.helper.http_status(error)
                });
        }).catch(swal.noop)
    }

    get_specification(id) {
        this.selected_specification_group_id = id;
        this.specification_name_array = [];
        let index = this.specification_group_list.findIndex((x)=>x._id==id);
        this.selected_specification_group_name = this.specification_group_list[index].name;
        this.specification_list = this.specification_group_list[index].list;
    }

    deleteSpecification(id , specification_index)
    {
        if(id == ''){
            this.specification_name_array.splice(specification_index,1);
        } else {
            this.specification_list.splice(specification_index,1)
            this.delete_specification_array.push(id)
        }
    }

    addSpecification(){
        if(this.specification_name!=''){
            this.specification_name_array.push({name: this.specification_name, price: this.specification_price});
            this.specification_name = '';
            this.specification_price = 0;
        }
    }

    updateSpecification() {

        if(this.specification_name_array.length > 0)
        {
            this.myLoading=true;
            this.helper.http.post(this.helper.POST_METHOD.ADD_SPECIFICATION,{specification_group_id: this.selected_specification_group_id , specification_name :this.specification_name_array ,
                store_id:this.add_product.store_id, type: this.helper.ADMIN_DATA_ID.ADMIN, server_token:this.add_product.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {

                    this.specification_name_array = [];
                    this.myLoading=false;
                    if(res_data.success)
                    {
                        this.specification_list = res_data.specifications
                        if(this.delete_specification_array.length > 0)
                        {
                            this.myLoading=true;
                            this.helper.http.post(this.helper.POST_METHOD.DELETE_SPECIFICATION,{specification_group_id: this.selected_specification_group_id , specification_id :this.delete_specification_array ,
                                store_id:this.add_product.store_id, type: this.helper.ADMIN_DATA_ID.ADMIN, server_token:this.add_product.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {
                                    this.delete_specification_array = [];
                                    this.myLoading=false;
                                    if(res_data.success)
                                    {
                                        this.specification_list = res_data.specifications
                                    }
                                    else
                                    {
                                        this.helper.data.storage = {
                                            "code": res_data.error_code,
                                            "message": this.helper.ERROR_CODE[res_data.error_code],
                                            "class": "alert-danger"
                                        }
                                    }
                                },
                                (error: any) => {
                                    this.myLoading=false;
                                    this.helper.http_status(error)
                                });
                        }
                    }
                    else
                    {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                    }

                },
                (error: any) => {
                    this.myLoading=false;
                    this.helper.http_status(error)
                });
        } else if(this.delete_specification_array.length > 0)
        {
            this.myLoading=true;
            this.helper.http.post(this.helper.POST_METHOD.DELETE_SPECIFICATION,{specification_group_id: this.selected_specification_group_id , specification_id :this.delete_specification_array ,
                store_id:this.add_product.store_id, type: this.helper.ADMIN_DATA_ID.ADMIN, server_token:this.add_product.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {
                    this.delete_specification_array = [];
                    this.myLoading=false;
                    if(res_data.success)
                    {
                        this.specification_list = res_data.specifications
                    }
                    else
                    {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                    }
                },
                (error: any) => {
                    this.myLoading=false;
                    this.helper.http_status(error)
                });
        }
    }

    select_product(product_id, event){
        if(!event.target.attributes.class || event.target.attributes.class.value == 'product_li' || event.target.attributes.class.value == 'product_li success-element'){
            this.selected_product_id = product_id;
            this.selected_product_id_for_specification = '';
            this.selected_specification_group_id = '';
            var index = this.filtered_product_list.findIndex((x)=>x._id==product_id);
            this.item_specification_group_list = this.filtered_product_list[index].specifications_details;

            this.get_item_list();
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

    open_edit_product_modal(product){
        this.product_data = JSON.parse(JSON.stringify(product));
        this.edit_product_modal.open();
    }
    open_add_specification_modal(product_id){
        this.add_specification_modal.open();
    }

    filter_product(data)
    {
        data = data.replace(/^\s+|\s+$/g, '');
        data = data.replace(/ +(?= )/g, '');
        data = new RegExp(data,"gi");

        this.filtered_product_list = this.product_list.filter((product) => {
            var a = product.name.match(data);
            return a !== null
        });
    }
    viewSpecification(id)
    {
        this.helper.router_id.store.specification_product_id=id;
        this.helper.router.navigate(['store/product/specification']);
    }
    addProduct()
    {
        if(!this.product_already_exist && this.add_product.name.trim() != '') {
            this.myLoading = true;
            this.add_product.is_visible_in_store = true;
            this.helper.http.post(this.helper.POST_METHOD.ADD_PRODUCT, this.add_product).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                    this.addproductform = false
                    this.add_product.name = ""
                    this.add_product.is_visible_in_store = true;

                    this.myLoading = false;
                    if (res_data.success == true) {
                        this.helper.data.storage = {
                            "message": this.helper.MESSAGE_CODE[res_data.message],
                            "class": "alert-info"
                        }
                        this.helper.message()
                        res_data.product.specifications_details = [];
                        this.product_list.push(res_data.product)
                        this.filter_product(this.filter_product_name)

                    }
                    else {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                        this.helper.message()
                    }
                },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
    }

    updateProduct(product_data, event)
    {
        var json = {
            store_id: this.add_product.store_id,
            product_id: product_data._id,
            type: this.helper.ADMIN_DATA_ID.ADMIN,
            server_token: this.add_product.server_token,
            is_visible_in_store: event,
            name: product_data.name
        }
        product_data.is_visible_in_store = event;
        this.myLoading=true;
        this.helper.http.post(this.helper.POST_METHOD.UPDATE_PRODUCT,json).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

                this.myLoading=false;
                if(res_data.success == true)
                {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    let index = this.filtered_product_list.findIndex((x)=>x._id==product_data._id);
                    this.filtered_product_list[index].name = product_data.name;
                    this.edit_product_modal.close();
                }
                else
                {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message();
                }
            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });
    }

    add_specification_group()
    {
        if(this.specification_group_name != '') {
            this.myLoading = true;
            this.helper.http.post(this.helper.POST_METHOD.ADD_SPECIFICATION_GROUP,
                {
                    store_id: this.add_product.store_id,
                    server_token: this.add_product.server_token,
                    type: this.helper.ADMIN_DATA_ID.ADMIN,
                    specification_group_name: [this.specification_group_name]
                }).pipe(map((response: Response) => response.json())).subscribe(res_data => {
                    this.specification_group_name = "";
                    this.myLoading = false;
                    if (res_data.success) {
                        this.helper.data.storage = {
                            "message": this.helper.MESSAGE_CODE[res_data.message],
                            "class": "alert-info"
                        }
                        this.specification_group_list = res_data.specification_group;
                    }
                    else {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                    }
                    this.helper.message();
                },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });
        }
    }

    sortItem(a,b) {
        if (a.sequence_number < b.sequence_number)
            return -1;
        if (a.sequence_number > b.sequence_number)
            return 1;
        return 0;
    }

    get_item_list(){
        this.myLoading = true;
        this.helper.http.post(this.helper.POST_METHOD.GET_STORE_PRODUCT_ITEM_LIST,{store_id:this.add_product.store_id, type: this.helper.ADMIN_DATA_ID.ADMIN, server_token:this.add_product.server_token,
            product_id: this.selected_product_id}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
            this.myLoading = false;
            if(res_data.success){
                this.filtered_item_list = res_data.products[0].items;

                if(this.filtered_item_list.length>0){
                    this.selected_item_id = this.filtered_item_list[0]._id;
                    this.item_detail = JSON.parse(JSON.stringify(this.filtered_item_list[0]))
                } else {
                    this.selected_item_id = '';
                    this.item_detail = {};
                }
            } else {
                this.filtered_item_list = [];
                this.selected_item_id = '';
                this.item_detail = {};
            }

            this.filtered_item_list.forEach((item, index)=>{
                if(item.sequence_number == undefined){
                    item.sequence_number = index;
                }
            });
            this.filtered_item_list.sort(this.sortItem);
            jQuery('#sortable').sortable({
                start: function(event, ui) {
                    var start_pos = ui.item.index();
                    ui.item.data('start_pos', start_pos);
                },
                update: (event, ui)=> {
                    var start_pos = ui.item.data('start_pos');
                    var index = ui.item.index();

                    if (start_pos < index) {
                        this.filtered_item_list.forEach((item)=>{
                            if(item.sequence_number >=start_pos+1 && item.sequence_number <=index){
                                item.sequence_number--;
                            }
                        });

                        let i_index = this.filtered_item_list.findIndex((x)=>x.sequence_number == start_pos);
                        this.filtered_item_list[i_index].sequence_number = index;

                    } else {
                        let i_index = this.filtered_item_list.findIndex((x)=>x.sequence_number == start_pos);
                        this.filtered_item_list[i_index].sequence_number = index;

                        this.filtered_item_list.forEach((item)=>{
                            if(item.sequence_number >=index && item.sequence_number <=start_pos-1){
                                item.sequence_number++;
                            }
                        });
                    }
                }
            });
            setTimeout(()=>{
                jQuery('.chosen-select').chosen();
                jQuery('.chosen-select').trigger("chosen:updated");
                jQuery(this.helper.elementRef.nativeElement).find('.chosen-select').on('change', (evnt,res_data) => {
                    this.selected_spec_group_for_item = res_data.selected;
                    console.log(this.selected_spec_group_for_item)
                });
            },1000);
        });
    }

    update_sequence_number(type) {
        if(type == 1){
            this.helper.http.post(this.helper.POST_METHOD.UPDATE_SEQUENCE_NMBER, {type: type, filtered_product_list: this.filtered_product_list}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            });
        } else {
            this.helper.http.post(this.helper.POST_METHOD.UPDATE_SEQUENCE_NMBER, {type: type, filtered_item_list: this.filtered_item_list}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            });
        }

    }


    select_item(item_id, event){
        this.new_image_array = [];
        this.deleted_image_url = [];
        this.selected_item_id = item_id;
        let index = this.filtered_item_list.findIndex((x)=>x._id == item_id);
        this.item_detail = JSON.parse(JSON.stringify(this.filtered_item_list[index]));
    }

    change_product_modifier(boolean){
        this.is_product_selected = boolean
        if(boolean){

            setTimeout(()=>{
                jQuery('#sortable_product').sortable({
                    start: function(event, ui) {
                        var start_pos = ui.item.index();
                        ui.item.data('start_pos', start_pos);
                    },
                    update: (event, ui)=> {
                        var start_pos = ui.item.data('start_pos');
                        var index = ui.item.index();

                        if (start_pos < index) {
                            this.filtered_product_list.forEach((item)=>{
                                if(item.sequence_number >=start_pos+1 && item.sequence_number <=index){
                                    item.sequence_number--;
                                }
                            });

                            let i_index = this.filtered_product_list.findIndex((x)=>x.sequence_number == start_pos);
                            this.filtered_product_list[i_index].sequence_number = index;

                        } else {
                            let i_index = this.filtered_product_list.findIndex((x)=>x.sequence_number == start_pos);
                            this.filtered_product_list[i_index].sequence_number = index;

                            this.filtered_item_list.forEach((product)=>{
                                if(product.sequence_number >=index && product.sequence_number <=start_pos-1){
                                    product.sequence_number++;
                                }
                            });
                        }
                    }
                });
                jQuery('#sortable').sortable({
                    start: function(event, ui) {
                        var start_pos = ui.item.index();
                        ui.item.data('start_pos', start_pos);
                    },
                    update: (event, ui)=> {
                        var start_pos = ui.item.data('start_pos');
                        var index = ui.item.index();

                        if (start_pos < index) {
                            this.filtered_item_list.forEach((item)=>{
                                if(item.sequence_number >=start_pos+1 && item.sequence_number <=index){
                                    item.sequence_number--;
                                }
                            });

                            let i_index = this.filtered_item_list.findIndex((x)=>x.sequence_number == start_pos);
                            this.filtered_item_list[i_index].sequence_number = index;

                        } else {
                            let i_index = this.filtered_item_list.findIndex((x)=>x.sequence_number == start_pos);
                            this.filtered_item_list[i_index].sequence_number = index;

                            this.filtered_item_list.forEach((item)=>{
                                if(item.sequence_number >=index && item.sequence_number <=start_pos-1){
                                    item.sequence_number++;
                                }
                            });
                        }
                    }
                });
                jQuery('.chosen-select').chosen();
                jQuery('.chosen-select').trigger("chosen:updated");
                jQuery(this.helper.elementRef.nativeElement).find('.chosen-select').on('change', (evnt,res_data) => {
                    this.selected_spec_group_for_item = res_data.selected;
                    console.log(this.selected_spec_group_for_item)
                });
            },1000);
        }
    }

    check_item()
    {
        var item_index = this.filtered_item_list.findIndex(x => x.name.toLowerCase()==this.add_item.name.toLowerCase() && x.product_id==this.selected_product_id )
        if(item_index == -1)
        {
            this.item_already_exist = false;
        }
        else
        {
            this.item_already_exist = true;
        }
    }

    add_item_data(){

        if(!this.item_already_exist && this.add_item.name.trim() && this.add_item.price) {
            this.item_error = '';
            this.myLoading = true;
            this.add_item.product_id = this.selected_product_id;
            this.add_item.store_id = this.add_product.store_id;
            this.add_item.server_token = this.add_product.server_token;
            this.add_item.type= this.helper.ADMIN_DATA_ID.ADMIN;
                this.add_item.name = this.add_item.name.trim();
            this.helper.http.post(this.helper.POST_METHOD.ADD_ITEM, this.add_item).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading=false;
                if(res_data.success == true)
                {
                    this.filtered_item_list.push(res_data.item);
                    this.selected_item_id = res_data.item._id;
                    this.item_detail = JSON.parse(JSON.stringify(res_data.item));
                    this.add_item ={
                        store_id: "",
                        server_token:"",
                        product_id: "",
                        details: "",
                        name: "",
                        price: 0,
                        type: 0,
                        is_visible_in_store:  true,
                        is_item_in_stock: true,
                        is_most_popular:  false
                    }
                } else {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message();
                }
            });
        } else if(this.item_already_exist){
            this.item_error = this.helper.messages.item_already_exist;
        } else if(!this.add_item.name.trim()){
            this.item_error = this.helper.validation_message.item_name_required;
        } else if(!this.add_item.price){
            this.item_error = this.helper.validation_message.item_price_required;
        }
    }

    image_update($event, fieldname) {
        this.image_error = "";
        const files = $event.target.files || $event.srcElement.files;

        for(var i=0; i<files.length; i++){
            const image_url = files[i];
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

        var reader = new FileReader();
        reader.onload = (e: any) => {
            this.myLoading = true;
            var new_image = new Image();
            new_image.src = e.target.result;
            // this.cropper.setImage(new_image);
            new_image.onload = () => {
                this.myLoading = false;
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

    remove_new_image(index) {
        this.new_image_array.splice(index, 1)
    }

    delete_item_image(image, index) {
        this.item_detail.image_url.splice(index, 1);
        this.deleted_image_url.push(image)
    }

    open_specification_modal(){
        if(this.selected_spec_group_for_item) {
            this.checked_array = [];
            let json = {
                store_id: this.add_product.store_id,
                server_token: this.add_product.server_token,
                type: this.helper.ADMIN_DATA_ID.ADMIN,
                specification_group_id: this.selected_spec_group_for_item
            }
            this.spec_button = this.button.save;
            this.item_detail.type = 1;
            this.item_detail.is_required = false;
            this.item_detail.max_range = 1;
            this.item_detail.range = 0;
            this.item_detail.specification_group_id = this.selected_spec_group_for_item;
            var index = this.specification_group_list.findIndex((x)=>x._id == this.selected_spec_group_for_item);
            this.item_detail.item_specification_name = this.specification_group_list[index].name;

            this.helper.http.post(this.helper.POST_METHOD.GET_SPECIFICATION_LISTS, json).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                this.product_specification_list = res_data.specification_list.specifications;
                setTimeout(() => {
                    jQuery('.iradio').iCheck({
                        handle: 'radio',
                        radioClass: 'iradio_square-green'
                    });
                    jQuery('.radio1').iCheck('check');
                }, 500);
                this.item_spec_modal.open();
                this.update_check_box();
            });
        }
    }

    update_check_box(){
        setTimeout(() => {
            jQuery('.icheck').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });

            jQuery('.icheck').on('ifChecked', (event) => {
                var id = event.target.getAttribute('value')
                this.specification_id_array.push(id)
                var checked_index = this.product_specification_list.findIndex(x => x._id == id);

                this.checked_array[checked_index] = true;
            });

            jQuery('.icheck').on('ifUnchecked', (event) => {
                var id = event.target.getAttribute('value')
                var i = this.specification_id_array.indexOf(id);
                if (i != -1) {
                    this.specification_id_array.splice(i, 1);
                }
                var checked_index = this.product_specification_list.findIndex(x => x._id == id);
                this.product_specification_list[checked_index].is_default_selected = false;
                this.checked_array[checked_index] = false;
            });

            jQuery('.iradio').on('ifChanged', (event) => {
                var value = Number(event.target.getAttribute('value'))
                this.item_detail.type = value
                for (var i = 0; i <= this.product_specification_list.length - 1; i++) {
                    this.product_specification_list[i].is_default_selected = false
                }
            });
        }, 1000);
    }

    onChange(event, id)
    {
        if(this.item_detail.type == 1)
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

    addiItemSpecification(data)
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
                            name:this.product_specification_list[j].name,
                            unique_id:this.product_specification_list[j].unique_id,
                            price:Number(this.product_specification_list[j].price),
                            is_default_selected:this.product_specification_list[j].is_default_selected,
                            is_user_selected:false});
                    }
                }
            }
            this.selected_specification_list.sort(this.sortSpecification);
            if(this.spec_button === this.button.save)
            {
                if(this.item_detail.specifications_unique_id_count){
                    this.item_detail.specifications_unique_id_count++;
                } else {
                    this.item_detail.specifications_unique_id_count = 1;
                }
                this.item_detail.specifications.push({_id:data.specification_group_id ,
                    unique_id:this.item_detail.specifications_unique_id_count,
                    is_required:this.item_detail.is_required,
                    range: Number(data.range),
                    max_range: Number(data.max_range),
                    name:data.item_specification_name,
                    type:data.type,
                    list:this.selected_specification_list});
            }
            else
            {
                this.item_detail.specifications[data.index].name=data.item_specification_name;
                this.item_detail.specifications[data.index].list=this.selected_specification_list;
                this.item_detail.specifications[data.index].type=data.type;
                this.item_detail.specifications[data.index].is_required=this.item_detail.is_required;
                this.item_detail.specifications[data.index].max_range=Number(data.max_range);
                this.item_detail.specifications[data.index].range=Number(data.range);
            }
            console.log(this.item_detail)
            this.item_spec_modal.close();
            this.selected_specification_list=[];
            this.specification_id_array=[];
            this.spec_list_error=0;
        }
    }
    sortSpecification(a,b) {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    }

    edit_item_specification(specification, index) {
        this.myLoading = true;

        this.checked_array = [];
        this.specification_id_array = [];
        this.product_specification_list = [];
        this.selected_specification_list = [];

        this.index = index
        this.spec_button = this.button.update;
        this.item_detail.type = specification.type;
        this.item_detail.is_required = specification.is_required;
        this.item_detail.range = Number(specification.range);
        this.item_detail.max_range = Number(specification.max_range);
        this.item_detail.item_specification_name = specification.name;
        this.product_specification_list = JSON.parse(JSON.stringify(specification.list));

        specification.list.forEach((value) => {
            this.specification_id_array.push(value._id)
        });
        this.checked_array.length = specification.list.length
        this.checked_array.fill(true);

        var json = {
            store_id: this.add_product.store_id,
            server_token: this.add_product.server_token,
            type: this.helper.ADMIN_DATA_ID.ADMIN,
            product_id: this.item_detail.product_id,
            specification_group_id: specification._id
        }

        this.helper.http.post(this.helper.POST_METHOD.GET_SPECIFICATION_LISTS, json).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {
                    setTimeout(() => {
                        this.myLoading = false;
                        jQuery('.iradio').iCheck({
                            handle: 'radio',
                            radioClass: 'iradio_square-green'
                        });
                        jQuery('.icheck').iCheck('check');
                        jQuery('.iradio' + specification.type).iCheck('check');
                        this.item_spec_modal.open();
                    }, 1000);
                }
                else {
                    setTimeout(() => {
                        this.myLoading = false;
                        jQuery('.iradio').iCheck({
                            handle: 'radio',
                            radioClass: 'iradio_square-green'
                        });
                        jQuery('.icheck').iCheck({
                            handle: 'checkbox',
                            checkboxClass: 'icheckbox_square-green',
                        });
                        jQuery('.icheck').iCheck('check');
                        jQuery('.iradio' + specification.type).iCheck('check');

                        var unique_array = res_data.specification_list.specifications.filter((current) => {
                            return specification.list.filter((current_b) => {
                                return current_b['_id'] == current['_id']
                            }).length == 0
                        });

                        unique_array.filter((current) => {
                            this.product_specification_list.push(current)
                        });
                        this.item_spec_modal.open();
                        this.update_check_box();
                    }, 500);
                }
                setTimeout(() => {
                    jQuery('.icheck').iCheck({
                        handle: 'checkbox',
                        checkboxClass: 'icheckbox_square-green',
                    });
                }, 1000);

                setTimeout(() => {
                    jQuery('.icheck').on('ifChecked', (event) => {
                        var id = event.target.getAttribute('value')
                        this.specification_id_array.push(id)
                        var checked_index = this.product_specification_list.findIndex(x => x._id == id);

                        this.checked_array[checked_index] = true;
                    });

                    jQuery('.icheck').on('ifUnchecked', (event) => {
                        var id = event.target.getAttribute('value')
                        var i = this.specification_id_array.indexOf(id);
                        if (i != -1) {
                            this.specification_id_array.splice(i, 1);
                        }
                        var checked_index = this.product_specification_list.findIndex(x => x._id == id);
                        this.product_specification_list[checked_index].price = 0;
                        this.product_specification_list[checked_index].is_default_selected = false;
                        this.checked_array[checked_index] = false;
                    });

                    jQuery('.iradio').on('ifChanged', (event) => {
                        var value = Number(event.target.getAttribute('value'))
                        this.item_detail.type = value
                        this.product_specification_list.filter((current) => {
                            current.is_default_selected = false
                        });
                    });
                }, 1000);

            },
            (error: any) => {
                this.helper.http_status(error)
            });


    }

    delete_item_specification(index)
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
            this.item_detail.specifications.splice(index, 1);
            swal(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            );
        }).catch(swal.noop)
    }

    updateItem(){
        this.myLoading=true;
        this.item_detail.name=this.item_detail.name.trim();
        this.item_detail.store_id = this.add_product.store_id;
        this.item_detail.server_token = this.add_product.server_token;
        this.item_detail.type = this.helper.ADMIN_DATA_ID.ADMIN;
        this.item_detail.item_id = this.item_detail._id;
        this.item_detail.is_item_in_stock = this.item_detail.is_item_in_stock;
        this.item_detail.is_visible_in_store = this.item_detail.is_visible_in_store;
        this.helper.http.post(this.helper.POST_METHOD.UPDATE_ITEM,this.item_detail).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
                console.log(res_data)
                if(res_data.success == true)
                {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                    this.helper.message();
                    if(this.new_image_array.length > 0)
                    {
                        this.add_image_service()
                    }
                    else if(this.delete_item_image.length > 0)
                    {
                        this.delete_image_service();
                    }
                    else
                    {
                        // this.myLoading=false;
                        this.helper.message();
                    }
                }
                else
                {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message();
                }
            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });
    }
    public formData = new FormData();
    add_image_service()
    {
        this.new_image_array.forEach((image , index) =>{
            if(image !== undefined)
            {
                this.formData.append(index, image.file);
            }
        });
        this.formData.append("item_id", this.selected_item_id);
        this.helper.http.post(this.helper.POST_METHOD.UPDATE_ITEM_IMAGE,this.formData).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

                this.formData = new FormData();
                if(res_data.success==false)
                {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message();
                }
                else
                {
                    if(this.delete_item_image.length > 0)
                    {
                        this.delete_image_service();
                    }
                    else{
                        this.myLoading=false;
                        this.helper.message();
                    }
                }
            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });
    }
    delete_image_service()
    {
        this.helper.http.post(this.helper.POST_METHOD.DELETE_ITEM_IMAGE,{store_id:this.add_product.store_id , type: this.helper.ADMIN_DATA_ID.ADMIN,server_token:this.add_product.server_token,
            _id:this.selected_item_id , image_url:this.deleted_image_url}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
                this.myLoading=false;
                if(res_data.success==false)
                {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.message();
                }
                else
                {
                    this.helper.message();
                }
            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });
    }

    test(id)
    {
        this.helper.router.navigate(['/store/specification', { id: id}]);
    }

    check_range_validation(type, range, max_range, is_required){

        setTimeout(()=>{
            if(Number(this.item_detail.range)>0){
                this.item_detail.is_required = true;
            } else {
                this.item_detail.is_required = false;
            }

            if(this.item_detail.type == 2) {
                if(Number(this.item_detail.range)>=Number(this.item_detail.max_range)) {
                    this.range_error = true;
                } else {
                    this.range_error = false;
                }
            } else {
                this.range_error = false;
            }
            console.log("range: "+this.item_detail.range)
            console.log("max_range: "+this.item_detail.max_range)
            console.log("type: "+this.item_detail.type)
        },100);
    }

}
