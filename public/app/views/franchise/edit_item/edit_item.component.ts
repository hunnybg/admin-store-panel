import { Component, OnInit, ViewChild, Input , Output , EventEmitter} from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../franchise_helper";
declare var jQuery:any;
declare var swal: any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { map } from 'rxjs/operators';

export interface EditItem{
    franchise_id: Object,
    product_id: Object,
    server_token:String,
    product_name: Object,
    details: String,
    name: String,
    price: number,
    is_visible_in_store:  Boolean,
    is_item_in_stock: Boolean,
    is_most_popular:  Boolean,
    item_specification_name:String,
    type:Number,
    store_ids:any[],
    specification_group_id: Object,
    specifications_unique_id_count: number,
    is_required: Boolean,
    image_url: any[]
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
    selector: 'app-edit_item',
    templateUrl: './edit_item.component.html',
    providers: [Helper]

})
export class EditFranchiseItemComponent implements OnInit {

    @ViewChild('myModal')
    modal: ModalComponent;
    @ViewChild('myspec_group_modal')
    myspec_group_modal: ModalComponent;


    myLoading: boolean = true;

    public image_setting : imageSetting;
    private edit_item: EditItem;
    title: any;
    button: any;
    message: any;
    heading_title: any;
    validation_message: any;
    item_id: Object;
    product_specification_list: any[];
    product_specification_list_backup: any[];
    item_specification_list: any[];
    specification_id_array: any[];
    selected_specification_list: any[];
    spec_list_error: number;
    spec_button: string;
    index: number;
    image_array: any[];
    product_specification_group_list: any[];
    new_image_array: any[] = [];
    deleted_image_url: any[];
    item_list: string[] = [];
    item_already_exist: Boolean = false;
    checked_array: any[] = [];
    store_list: any[] = [];
    spec_backup : any;

    image_error: string = '';

    constructor(public helper: Helper) {

    }

    ngAfterViewInit() {

        // setTimeout(function () {
        //
        //     jQuery('.iradio').iCheck({
        //         handle: 'radio',
        //         radioClass: 'iradio_square-green'
        //     });
        //
        // }, 1000);

        // jQuery("input[name='price']").TouchSpin({
        //     min: 0,
        //     step: 1,
        //     decimals: 2,
        //     initval: 0,
        //     forcestepdivisibility: 'none'
        // });
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

        if (!token || !token.token) {
            this.helper.router.navigate(['franchise/login']);
        }
        this.edit_item = {
            franchise_id: "",
            product_id: "",
            server_token: "",
            product_name: "",
            details: "",
            name: "",
            price: null,
            store_ids:[],
            is_visible_in_store: false,
            is_item_in_stock: false,
            is_most_popular: false,
            type: 1,
            item_specification_name: "",
            specification_group_id: "",
            specifications_unique_id_count: 0,
            is_required: false,
            image_url: []
        }

        setTimeout( () => {
            jQuery(this.helper.elementRef.nativeElement).find('.bootstrap-touchspin-down').on('click', (evnt, res_data) => {
                if(this.edit_item.price > 0) {
                    this.edit_item.price--;
                }
            });
            jQuery(this.helper.elementRef.nativeElement).find('.bootstrap-touchspin-up').on('click', (evnt, res_data) => {
                // if(this.edit_item.price > 0){
                    this.edit_item.price++;
                // }
            });
        },1000);

        this.title = this.helper.title
        this.button = this.helper.button
        this.heading_title = this.helper.heading_title
        this.validation_message = this.helper.validation_message;
        this.specification_id_array = [];
        this.selected_specification_list = [];
        this.item_specification_list = [];
        this.product_specification_group_list = [];
        this.spec_list_error = 0
        this.image_array = [];
        this.deleted_image_url = [];
        this.image_append();
        this.item_id = this.helper.router_id.franchise.item_id;

        var franchise = JSON.parse(localStorage.getItem('franchise'));
        if (franchise !== null) {
            this.edit_item.franchise_id = franchise._id
            this.edit_item.server_token = franchise.server_token
            this.helper.http.post(this.helper.POST_METHOD.GET_ITEM_DATA, {
                item_id: this.item_id,
                franchise_id: franchise._id,
                server_token: franchise.server_token
            }).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
                    this.myLoading = false;
                    if (res_data.success == false) {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                        this.helper.router.navigate(['franchise/item']);
                    }
                    else {
                        this.edit_item.product_name = res_data.product.name
                        this.edit_item.product_id = res_data.product._id;
                        this.edit_item.details = res_data.item.details
                        this.edit_item.name = res_data.item.name
                        this.edit_item.price = res_data.item.price
                        this.edit_item.is_visible_in_store = res_data.item.is_visible_in_store
                        this.edit_item.is_item_in_stock = res_data.item.is_item_in_stock
                        this.edit_item.is_most_popular = res_data.item.is_most_popular
                        this.edit_item.image_url = res_data.item.image_url
                        this.item_specification_list = res_data.item.specifications;

                        this.product_specification_list_backup = res_data.product.specifications_detail;
                        this.edit_item.specifications_unique_id_count = res_data.item.specifications_unique_id_count
                        this.item_list = res_data.item_array;
                        this.helper.http.post(this.helper.POST_METHOD.GET_PRODUCT_STORE_LIST,{franchise_id:franchise._id, server_token:franchise.server_token,product_id:res_data.product._id}, {
                        }).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {
                                this.store_list = [];
                                this.edit_item.store_ids = [];
                                console.log(res_data);
                                if(res_data.success === false) {

                                }else{
                                    for(var j=0;j<res_data.products.length;j++){
                                        this.store_list.push(res_data.products[j].store_list);
                                    }
                                     this.update_store_check_box();
                                }                 
                                
                        },
                        (error: any) => {
                                this.myLoading = false;
                                this.helper.http_status(error)
                        });
                    }
                },
                (error: any) => {
                    this.myLoading = false;
                    this.helper.http_status(error)
                });

            this.helper.http.post(this.helper.POST_METHOD.GET_IMAGE_SETTING, {
            }).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                this.image_setting.image_ratio = res_data.image_setting.item_image_ratio;
                    this.image_setting.image_min_width = res_data.image_setting.item_image_min_width;
                    this.image_setting.image_max_width = res_data.image_setting.item_image_max_width;
                    this.image_setting.image_min_height = res_data.image_setting.item_image_min_height;
                    this.image_setting.image_max_height = res_data.image_setting.item_image_max_height;
                    this.image_setting.image_type = res_data.image_setting.image_type;
            },
                (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });

        }
    }

    public formData = new FormData();

    check_item() {
        var item_index = this.item_list.findIndex(x => x.toLowerCase() == this.edit_item.name.toLowerCase())

        if (item_index == -1) {
            this.item_already_exist = false;
        }
        else {
            this.item_already_exist = true;
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
                    new_image.onload = () => {

                        if(new_image.width >= this.image_setting.image_min_width && new_image.width < this.image_setting.image_max_width &&
                            new_image.height >= this.image_setting.image_min_height && new_image.height < this.image_setting.image_max_height ){

                            if(new_image.width == (new_image.height * this.image_setting.image_ratio)){

                                this.new_image_array.unshift({base64_image: e.target.result, file: image_url});
                            } else {
                                console.log("ratio error")
                                this.image_error = this.title.item_image_ratio_error;
                            }

                        } else {
                            console.log("height width error")
                            this.image_error = this.title.item_image_size_error;
                        }

                    }
                }
                reader.readAsDataURL(image_url);
            } else {
                console.log("extension error")
                this.image_error = this.title.item_image_extension_error;
            }
        }
    }

    remove_new_image(index) {
        this.new_image_array.splice(index, 1)
    }

    image_append() {
        this.image_array.push(' ');
    }

    delete_item_image(image, index) {
        this.edit_item.image_url.splice(index, 1);
        this.deleted_image_url.push(image)
    }

    open_specification_group_modal() {
        this.product_specification_group_list = this.product_specification_list_backup;
        this.myspec_group_modal.open();
    }

    open_modal(id, product_id, name, unique_id) {
        this.checked_array = [];
        this.edit_item.specification_group_id = id;
        this.myspec_group_modal.close();
        var json = {
            franchise_id: this.edit_item.franchise_id,
            server_token: this.edit_item.server_token,
            product_id: product_id,
            specification_group_id: id
        }
        this.spec_button = this.button.save;
        this.edit_item.type = 1;
        this.edit_item.is_required = false;

        this.helper.http.post(this.helper.POST_METHOD.GET_SPECIFICATION_LISTS, json).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

                if (res_data.success == false) {
                    if (res_data.error_code == 999) {
                        this.helper.data.storage = {
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                        this.helper.router.navigate(['franchise/logout']);
                    }
                    else {
                        this.edit_item.item_specification_name = name;
                        this.product_specification_list = [];
                        this.modal.open();

                    }
                }
                else {
                    this.edit_item.item_specification_name = name;
                    this.product_specification_list = res_data.specification_list.specifications;

                    setTimeout(() => {
                        jQuery('.iradio').iCheck({
                            handle: 'radio',
                            radioClass: 'iradio_square-green'
                        });
                        jQuery('.radio1').iCheck('check');
                    }, 500);
                    this.modal.open();
                    this.update_check_box();
                }

            },
            (error: any) => {
                this.helper.http_status(error)
            });

    }
    update_store_check_box()
    {
        setTimeout(() => {
            jQuery('.icheck1').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });
            jQuery('#1').iCheck('check');

            jQuery('.icheck1').on('ifChecked', (event) => {
                var id = event.target.getAttribute('value')
                this.edit_item.store_ids.push(id);
                console.log(this.edit_item.store_ids);
                //this.store_list[checked_index]=true;
            });

            jQuery('.icheck1').on('ifUnchecked', (event) => {
                var id = event.target.getAttribute('value')
                var i = this.edit_item.store_ids.indexOf(id);
                if(i != -1) {
                    this.edit_item.store_ids.splice(i, 1);
                }
                console.log("uncheck: "+id);
                /*var checked_index = this.product_specification_list.findIndex(x => x._id == id);
                this.store_list[checked_index]=false;*/
            });

        },1000);
    }
    update_check_box(){
        setTimeout(() => {
            jQuery('.icheck').iCheck({
                handle: 'checkbox',
                checkboxClass: 'icheckbox_square-green',
            });

            // jQuery('.radio1').iCheck('check');

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
                this.edit_item.type = value
                for (var i = 0; i <= this.product_specification_list.length - 1; i++) {
                    this.product_specification_list[i].is_default_selected = false
                }
            });
        }, 1000);
    }


    edit_item_specification(specification, index) {
        this.myLoading = true;

        this.checked_array = [];
        this.specification_id_array = [];
        this.product_specification_list = [];
        this.selected_specification_list = [];

        this.index = index
        this.spec_button = this.button.update;
        this.edit_item.type = specification.type;
        this.edit_item.is_required = specification.is_required;
        this.edit_item.item_specification_name = specification.name;
        this.product_specification_list = JSON.parse(JSON.stringify(specification.list));

        specification.list.forEach((value) => {
            this.specification_id_array.push(value._id)
        });
        this.checked_array.length = specification.list.length
        this.checked_array.fill(true);

        var json = {
            franchise_id: this.edit_item.franchise_id,
            server_token: this.edit_item.server_token,
            product_id: this.edit_item.product_id,
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
                        this.modal.open();
                    }, 1000);
                }
                else {
                    setTimeout(() => {
                        this.myLoading = false;
                        jQuery('.iradio').iCheck({
                            handle: 'radio',
                            radioClass: 'iradio_square-green'
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
                        this.modal.open();
                        this.update_check_box();
                    }, 500);
                }
                // setTimeout(() => {
                //     jQuery('.icheck').iCheck({
                //         handle: 'checkbox',
                //         checkboxClass: 'icheckbox_square-green',
                //     });
                // }, 1000);
                //
                // setTimeout(() => {
                //     jQuery('.icheck').on('ifChecked', (event) => {
                //         var id = event.target.getAttribute('value')
                //         this.specification_id_array.push(id)
                //         var checked_index = this.product_specification_list.findIndex(x => x._id == id);
                //
                //         this.checked_array[checked_index] = true;
                //     });
                //
                //     jQuery('.icheck').on('ifUnchecked', (event) => {
                //         var id = event.target.getAttribute('value')
                //         var i = this.specification_id_array.indexOf(id);
                //         if (i != -1) {
                //             this.specification_id_array.splice(i, 1);
                //         }
                //         var checked_index = this.product_specification_list.findIndex(x => x._id == id);
                //         this.product_specification_list[checked_index].price = 0;
                //         this.product_specification_list[checked_index].is_default_selected = false;
                //         this.checked_array[checked_index] = false;
                //     });
                //
                //     jQuery('.iradio').on('ifChanged', (event) => {
                //         var value = Number(event.target.getAttribute('value'))
                //         this.edit_item.type = value
                //         this.product_specification_list.filter((current) => {
                //             current.is_default_selected = false
                //         });
                //     });
                // }, 1000);

            },
            (error: any) => {
                this.helper.http_status(error)
            });


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
                this.edit_item.specifications_unique_id_count++;
                this.item_specification_list.push({_id:data.specification_group_id ,
                                                    unique_id:this.edit_item.specifications_unique_id_count,
                                                    is_required:data.is_required,
                                                    name:data.item_specification_name,
                                                   type:data.type,
                                                   list:this.selected_specification_list});
            }
            else
            {
                this.item_specification_list[data.index].name=data.item_specification_name;
                this.item_specification_list[data.index].list=this.selected_specification_list;
                this.item_specification_list[data.index].type=data.type;
                this.item_specification_list[data.index].is_required=data.is_required;
            }

            this.modal.close();
            this.selected_specification_list=[];
            this.specification_id_array=[];
            this.spec_list_error=0;
            var franchise = JSON.parse(localStorage.getItem('franchise'));

            this.helper.http.post(this.helper.POST_METHOD.GET_ITEM_DATA,{item_id:this.item_id,franchise_id:franchise._id, server_token:franchise.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {
                    if(res_data.success == false)
                    {
                        if(res_data.error_code == 999)
                        {
                            this.helper.data.storage = {
                                "message": this.helper.ERROR_CODE[res_data.error_code],
                                "class": "alert-danger"
                            }
                            this.helper.router.navigate(['franchise/logout']);
                        }
                        else
                        {
                            this.helper.router.navigate(['franchise/product']);
                        }
                    }
                    else
                    {
                        this.edit_item.item_specification_name="";
                        this.product_specification_list=[];
                        this.product_specification_list_backup=res_data.product.specifications_detail;
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
                var i = this.item_specification_list[index]
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
    onChange(event, id)
    {
        if(this.edit_item.type == 1)
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
   
    // set_specification_list()
    // {
    //     setTimeout(() => {
    //
    //         jQuery('.icheck').iCheck({
    //             handle: 'checkbox',
    //             checkboxClass: 'icheckbox_square-green',
    //         });
    //
    //         jQuery('.icheck').on('ifChecked', (event) => {
    //             var id = event.target.getAttribute('value')
    //             this.specification_id_array.push(id)
    //         });
    //
    //         jQuery('.icheck').on('ifUnchecked', (event) => {
    //             var id = event.target.getAttribute('value')
    //             var i = this.specification_id_array.indexOf(id);
    //             if(i != -1) {
    //                 this.specification_id_array.splice(i, 1);
    //             }
    //         });
    //
    //         jQuery('.iradio').on('ifChanged', (event) => {
    //             var value = Number(event.target.getAttribute('value'))
    //             this.edit_item.type=value
    //             for(var i=0; i<=this.product_specification_list.length - 1; i++)
    //             {
    //                 this.product_specification_list[i].is_default_selected=false
    //             }
    //         });
    //     },500);
    // }
    updateItem(itemdata)
    {
        this.myLoading=true;
        itemdata.name=itemdata.name.trim();
        itemdata.store_id = this.edit_item.store_ids;
        this.helper.http.post(this.helper.POST_METHOD.UPDATE_ITEM,itemdata).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

            
            if(res_data.success == true)
            {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
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
                    this.myLoading=false;
                    this.helper.router.navigate(['franchise/item']);
                }
            }
            else
            {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.router.navigate(['franchise/item']);
            }
        },
        (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
        });
    }

    add_image_service()
    {
        this.new_image_array.forEach((image , index) =>{
            if(image !== undefined)
            {
                this.formData.append(index, image.file);
            }
        });

        this.formData.append("item_id", this.item_id);
        this.helper.http.post(this.helper.POST_METHOD.UPDATE_ITEM_IMAGE,this.formData).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
            
            if(res_data.success==false)
            {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.router.navigate(['franchise/item']);
            }
            else
            {
                if(this.delete_item_image.length > 0)
                {
                    this.delete_image_service();
                }
                else{
                    this.myLoading=false;
                    this.helper.router.navigate(['franchise/item']);
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
        this.helper.http.post(this.helper.POST_METHOD.DELETE_ITEM_IMAGE,{franchise_id:this.edit_item.franchise_id , server_token:this.edit_item.server_token,
                                                                                    _id:this.item_id , image_url:this.deleted_image_url}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{
               this.myLoading=false;       
            if(res_data.success==false)
            {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.router.navigate(['franchise/item']);
            }
            else
            {
                
                this.helper.router.navigate(['franchise/item']);
            }
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }
}
