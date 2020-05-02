import { Component, OnInit,ViewContainerRef} from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery:any;

export interface Document{
    unique_code: string,
    expired_date: any,
    image_url:''
}

@Component({
  selector: 'app-upload_document',
  templateUrl: './upload_document.component.html',
  providers: [Helper]
})
export class StoreUploadDocumentComponent implements OnInit {

	title:any;
    button:any;
    heading_title:any;
    validation_message:any;
    store_id:Object;
    server_token:string;
    edit_document:any[] = [];
    document_list:any[] = [];	
    old_image_url:string = '';
    error_message:number = 0;

    myLoading:boolean = true;

    private documentlist: Document;	

  	constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);
    }

  	ngOnInit() {
  		let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {

            this.helper.router.navigate(['store/login']);
        }
        this.helper.message()

        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title
        this.validation_message=this.helper.validation_message;

        this.documentlist ={
        	unique_code:'',
            expired_date:null,
            image_url:''
        }

        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
        	this.store_id=store._id
            this.server_token=store.server_token
        }

        this.helper.http.post(this.helper.POST_METHOD.GET_DOCUMENT_LIST,{type:2 ,id:this.store_id, server_token:this.server_token}).map((res_data: Response) => res_data.json()) .subscribe(res_data => {
          
          this.myLoading=false;
        	if(res_data.success == false)
            {
                this.helper.data.storage = {
                    "code": res_data.error_code,
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.helper.message();
                this.document_list=[];
            }
            else
            {
                this.document_list=res_data.documents;
                this.document_list.forEach( (document , index) => {
                    this.edit_document[index]="false";

                    this.get_document_image(document.image_url ,index)
                })


            }
        },
        (error: any) => {
          this.myLoading=false;
                this.helper.http_status(error)
        });
  	}

  	public formData = new FormData();

    image_update($event , document_index) {

        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const image_url = files[0];
        this.formData.append('image_url', image_url);

        var reader = new FileReader();

        reader.onload =  (e : any) => {
            this.document_list[document_index].image_url = e.target.result;
            this.documentlist.image_url=e.target.result;
            jQuery('.document'+document_index).attr('src' , e.target.result)
        }
        reader.readAsDataURL(image_url);

    }

  	editDocument(document , document_index)
  	{
        this.get_document_image(document.image_url ,document_index);
        this.old_image_url=document.image_url;
        this.edit_document.fill("")
        this.edit_document[document_index]="true"
        this.documentlist.unique_code=document.unique_code;
        this.documentlist.image_url=document.image_url;
        if(document.expired_date != null)
        {
        	var date = new Date(document.expired_date);
        	this.documentlist.expired_date = { date: { year: date.getFullYear(), month: date.getMonth()+1, day: date.getDate() }   , formatted:date.getMonth()+1 + '-' +  date.getDate() + '-' + date.getFullYear()};

        }
  	}

  	get_document_image(url ,document_index)
    {
        if(url == '')
        {
            jQuery('.document'+document_index).attr('src' , 'default.png')
        } else {
            var oReq = new XMLHttpRequest();
            oReq.open("GET", url, true);
            oReq.setRequestHeader("token", this.server_token);
            oReq.responseType = "blob";
            oReq.onload = function (oEvent) {
                var arrayBuffer = oReq.response; // Note: not oReq.responseText
                if (arrayBuffer) {
                    jQuery('.document' + document_index).attr('src', URL.createObjectURL(arrayBuffer));
                } else {
                    jQuery('.document' + document_index).attr('src', 'default.png');
                }
            };
            oReq.send(null);
        }
    }

  	updateDocument(document , document_index)
  	{   
         if(this.documentlist.image_url == '')
         {
             this.error_message=1;
         }
         else if(document.document_details.is_expired_date && this.documentlist.expired_date == null)
         {
             this.error_message=2;
         }
         else if(document.document_details.is_unique_code && this.documentlist.unique_code == '')
         {
             this.error_message=3;
         }
         else
         {
           this.myLoading=true;
             this.error_message=0;
              this.formData.append('type', 2);
              this.formData.append('unique_code',this.documentlist.unique_code);
              this.formData.append('document_id',document._id);
              this.formData.append('id',this.store_id);
              this.formData.append('server_token',this.server_token);
              if(this.documentlist.expired_date != null)
              {
                  this.formData.append('expired_date',this.documentlist.expired_date.formatted);
              }

            this.helper.http.post(this.helper.POST_METHOD.UPLOAD_DOCUMENT,this.formData).map((res_data: Response) => res_data.json()) .subscribe(res_data => {

              this.formData = new FormData();
              this.edit_document.fill("false")
              this.myLoading=false;
              if(res_data.success)
              {
                this.document_list[document_index].image_url = res_data.image_url;

                  this.get_document_image( res_data.image_url, document_index)

                this.document_list[document_index].unique_code = res_data.unique_code;

                this.document_list[document_index].expired_date = res_data.expired_date;
                localStorage.setItem('store_document_ulpoaded', res_data.is_document_uploaded);

                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.helper.message();
                
              }
              else
              {
                  this.document_list[document_index].image_url = this.old_image_url;
                  this.get_document_image( this.old_image_url, document_index)

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
  		  
  	}

}
