import { Component, OnInit,ViewContainerRef } from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery:any;
declare var swal: any;
import { map } from 'rxjs/operators';
import { trigger, state ,transition, style, animate}  from '@angular/animations';

export interface specification{
   name:string;
}

@Component({
    selector: 'app-specification',
    templateUrl: './specification.component.html',
    providers: [Helper],
    animations: [
        trigger('fadeInDownBig', [
            state('true', 
                style({ transform: 'translateY(-250px)', opacity: 0}),

            ),
            state('false', style({
                transform: 'translateY(0)', opacity: 1
            })),
              transition('true => false', animate('500ms', style({transform: 'translateY(0)', opacity: 1}))),
              transition('false => true', animate('500ms', style({transform: 'translateY(-250px)', opacity: 0})))
        ]),


       
    ],
})


export class SpecificationComponent implements OnInit {

    title:any;
    button:any;
    heading_title:any;
    product_id:Object;
    message:any;
    store_id:Object;
    server_token:String;
    specification_list:any[];
    specification_name:String;
    deleted_specification_list:any[];
    delete_specification_array:any[] = [];
    specification_name_array:any[];
    specification_name_arrays:any[];
    new_specification_list:any[];
    spec_already:Number;
    edit_specification_group:any[];
    default:string;
    hide_specification_group: any[];
    myLoading:boolean = true;
    constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngOnInit() {
        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {

            this.helper.router.navigate(['store/login']);
        }
        this.helper.message()

        this.hide_specification_group = [];
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title;
        this.message=this.helper.messages;
        this.deleted_specification_list=[];
        this.new_specification_list=[];
        this.spec_already=0;
        this.product_id =this.helper.router_id.store.specification_product_id;
        this.specification_name_array = [];
        this.specification_name_arrays = [];
        this.edit_specification_group = [];
        this.default = "false";
        if(this.product_id == "" || this.product_id == undefined)
        {
            this.helper.router.navigate(['store/product']);
        }
        else
        {
            var store = JSON.parse(localStorage.getItem('store'));
            if(store!==null)
            {
                this.store_id=store._id
                this.server_token=store.server_token
                this.helper.http.post(this.helper.POST_METHOD.GET_SPECIFICATION_GROUP,{product_id:this.product_id,store_id:store._id, server_token:store.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {

                    this.myLoading=false;
                    if(res_data.success == false)
                    {
                        this.helper.data.storage = {
                            "code": res_data.error_code,
                            "message": this.helper.ERROR_CODE[res_data.error_code],
                            "class": "alert-danger"
                        }
                        this.helper.message()
                        this.specification_list=[];
                    }
                    else
                    {
                        this.specification_list=res_data.specification_group;
                        this.specification_list.forEach( (spec , index) => {
                            this.edit_specification_group[index]="false"
                            this.hide_specification_group[index]="false"
                        })
                    }
                },
                (error: any) => {
                    this.myLoading=false;
                        this.helper.http_status(error)
                });
            }
        }
    }
    checkSpecification(name)
    {
        var specification_index = this.specification_list.findIndex(x => x.name.toLowerCase()==name.toLowerCase().trim())
        if(specification_index == -1)
        {
            this.spec_already = 0;
        }
        else
        {
            this.spec_already = 1;
        }
    }

    addSpecificationGroup(data)
    {
        this.myLoading=true;
        this.specification_name="";
        this.new_specification_list.push(data.specification_name.trim())

        this.helper.http.post(this.helper.POST_METHOD.ADD_SPECIFICATION_GROUP,{store_id:this.store_id, product_id:this.product_id,server_token:this.server_token,specification_group_name:this.new_specification_list}).pipe(map((response: Response) => response.json())) .subscribe(res_data => {

            this.new_specification_list=[];
            this.myLoading=false;
            if(res_data.success)
            {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                
                var res_array_index = res_data.specification_group.findIndex(x => x.name==data.specification_name.trim())
                res_data.specification_group[res_array_index].list=[];
                this.specification_list.push(res_data.specification_group[res_array_index])
                this.edit_specification_group.push('false');
                this.hide_specification_group.push('false');
            }
            else
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
            }
            this.helper.message();
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }

    hide_specifications_group(specification_group_index)
    {
        this.hide_specification_group[specification_group_index]='true'
        // this.edit_specification_group[specification_group_index]='';
        jQuery('#spec_list'+specification_group_index).hide(1000);
    }

    show_specifications_group(specification_group_index)
    {
        this.hide_specification_group[specification_group_index]='false'
        // this.edit_specification_group[specification_group_index]='false';
        jQuery('#spec_list'+specification_group_index).show(1000);
    }
    deleteSpecification_group(id , specification_group_index)
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
            this.helper.http.post(this.helper.POST_METHOD.DELETE_SPECIFICATION_GROUP,{store_id:this.store_id, product_id:this.product_id,server_token:this.server_token,specification_group_id:id}).pipe(map((response: Response) => response.json())) .subscribe(res_data => {

                this.myLoading=false;
                if(res_data.success)
                {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }

                    this.specification_list.splice(specification_group_index , 1)
                    this.edit_specification_group.push(specification_group_index , 1);
                    this.hide_specification_group.push(specification_group_index , 1);
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

    editSpecification(id , specification_group_index)
    {
        // this.hide_specification_group[specification_group_index]=''
        this.edit_specification_group.fill("")
        this.edit_specification_group[specification_group_index]="true"
    }
    
    append_specification(specification_group_index)
    {
            this.specification_name_array.push("")
            this.specification_name_arrays.push("")
    }
    
    updateSpecification(id,specification_list_index)
    {
        this.edit_specification_group.fill("false")
        
        var store = JSON.parse(localStorage.getItem('store'));
        this.specification_name_arrays = this.specification_name_arrays.filter(v=>v!='');
        
        this.specification_name_arrays = this.specification_name_arrays.filter((elem, index, self) => {
            
            elem = elem.trim();
            var exist_index = this.specification_list[specification_list_index].list.findIndex(x => x.name.toLowerCase().trim()==elem.toLowerCase().trim())
           
            if(exist_index !== -1)
            {
                return;
            }
            else{
                return index == self.indexOf(elem);
            }
        });

        this.specification_name_array = [];
        if(this.specification_name_arrays.length > 0)
        {
            this.myLoading=true;
            this.helper.http.post(this.helper.POST_METHOD.ADD_SPECIFICATION,{specification_group_id: id , specification_name :this.specification_name_arrays ,product_id:this.product_id,store_id:store._id, server_token:store.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {
                
                this.specification_name_arrays = [];
                this.myLoading=false;
                if(res_data.success)
                {
                    this.specification_list[specification_list_index].list = res_data.specifications
                    if(this.delete_specification_array.length > 0)
                    {
                        this.myLoading=true;
                        this.helper.http.post(this.helper.POST_METHOD.DELETE_SPECIFICATION,{specification_group_id: id , specification_id :this.delete_specification_array ,product_id:this.product_id,store_id:store._id, server_token:store.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {
                            this.delete_specification_array = [];
                                this.myLoading=false;
                            if(res_data.success)
                            {
                                this.specification_list[specification_list_index].list = res_data.specifications
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
        }
        else if(this.delete_specification_array.length > 0)
        {
            this.myLoading=true;
            this.helper.http.post(this.helper.POST_METHOD.DELETE_SPECIFICATION,{specification_group_id: id , specification_id :this.delete_specification_array ,product_id:this.product_id,store_id:store._id, server_token:store.server_token}).pipe(map((res_data: Response) => res_data.json())) .subscribe(res_data => {
                this.delete_specification_array = [];
                this.myLoading=false;
                if(res_data.success)
                {
                    this.specification_list[specification_list_index].list = res_data.specifications;
                }
                else{
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

    deleteSpecification(id , specification_group_index , specification_index)
    {
        if(id == '')
        {
           this.specification_name_array.splice(specification_index , 1) 
           this.specification_name_arrays.splice(specification_index , 1) 
        }
        else
        {
            this.specification_list[specification_group_index].list.splice(specification_index,1)
            this.delete_specification_array.push(id)
        } 
    }
}
