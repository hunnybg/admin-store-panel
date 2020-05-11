import { Component, OnInit,ViewContainerRef , ViewChild} from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../franchise_helper";
declare var jQuery:any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    providers: [Helper]
})
export class FranchiseStoreHistoryComponent implements OnInit {

    @ViewChild('modal')
    modal: ModalComponent;

    title:any;
    button:any;
    ORDER_STATE:any;
    heading_title:any;
    status:any;
    franchise_id:Object;
    server_token:String;
    order_list:any[];

    sort_field:string;
    sort_order:number;
    search_field:string;
    search_value:string;
    start_date:string;
    end_date:string;
    page:number;
    total_page:number;
    total_pages:number[];

    order_id:Object = '';
    rating:number = 1;
    review:string = '';
    type:number;
    selected_order_index:number = 0;

    myLoading:boolean = true;
    constructor(private helper:Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {
        jQuery(".chosen-select").chosen({disable_search: true});

        setTimeout(function() {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);


    }


    ngOnInit() {
        this.sort_field="unique_id";
        this.sort_order=-1;
        this.search_field="user_detail.first_name";
        this.search_value="";
        this.start_date='';
        this.end_date='';
        this.page=1

        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {

            this.helper.router.navigate(['franchise/logout']);
        }
        this.helper.message()
        var franchise = JSON.parse(localStorage.getItem('franchise'));
        if(franchise!==null)
        {
            this.franchise_id=franchise._id
            this.server_token=franchise.server_token
        }
        /*if(!JSON.parse(localStorage.getItem('store_document_ulpoaded')) && JSON.parse(localStorage.getItem('admin_store_document_ulpoaded')))
        {
            this.helper.router.navigate(['store/upload_document']);
        }*/
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title
        this.ORDER_STATE=this.helper.ORDER_STATE
        this.status=this.helper.status
        this.order_list=[];

        this.store_history(1)

        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt,res_data) => {

            this.sort_field=res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_order').on('change', (evnt,res_data) => {

            this.sort_order=res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt,res_data) => {

            this.search_field=res_data.selected;

        });
    }

    activeRoute(routename: string): boolean{
        return this.helper.router.url.indexOf(routename) > -1;
    }

    order_detail(id)
    {
      this.helper.router_id.franchise.order_id=id;
      this.helper.router.navigate(['franchise/order/detail']);
    }

    
    view_invoice(id) {
        this.helper.router_id.franchise.view_order_earning_id = id;
        this.helper.router.navigate(['franchise/order_earning_detail']);

    }
    viewcart_detail(id)
    {
        this.helper.router_id.franchise.order_id=id;
        this.helper.router.navigate(['franchise/cart/detail']);
    }
    store_history(page)
    {
        this.myLoading=true;
        this.selected_order_index = 0;
        this.page=page;
        this.helper.http.post(this.helper.POST_METHOD.HISTORY,{franchise_id:this.franchise_id, server_token:this.server_token, start_date:this.start_date,end_date:this.end_date,
                                                        sort_field:this.sort_field,sort_order:this.sort_order,
                                                        search_field:this.search_field,search_value:this.search_value,page:this.page }).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

            this.myLoading=false;
            if(res_data.success == false)
            {  
                this.order_list=[];
                this.total_pages=[];
            }
            else
            {
                this.order_list=res_data.orders;
                this.total_page=res_data.pages;
                this.total_pages=Array(res_data.pages).fill((x,i)=>i).map((x,i)=>i+1)
            }
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        });
    }

    give_rate_modal(orderid , index, type)
    {
        this.rating = 1;
        this.review = '';
        this.type = type;
        this.order_id = orderid;
        this.modal.open()
        this.selected_order_index = index;
    }

    give_rate() {
        this.myLoading=true;
        this.modal.close()
        let method = '';
        var json = {};
        if(this.type == 1){
             method = this.helper.POST_METHOD.STORE_RATING_TO_USER;
             json = {
                 franchise_id: this.franchise_id,
                 server_token: this.server_token,
                 store_rating_to_user: this.rating,
                 store_review_to_user: this.review,
                 order_id: this.order_id
             }
        } else {
             method = this.helper.POST_METHOD.STORE_RATING_TO_PROVIDER;
             json = {
                franchise_id: this.franchise_id,
                server_token: this.server_token,
                store_rating_to_provider: this.rating,
                store_review_to_provider: this.review,
                order_id: this.order_id
             }
        }
        this.helper.http.post(method , json).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.myLoading=false;
            if(res_data.success) {
                var index = this.order_list.findIndex(x => x._id==this.order_id)
                if(this.type == 1){
                    this.order_list[index].is_store_rated_to_user = true;
                    if(this.order_list[index].review_detail.length == 0)
                    {
                        this.order_list[index].review_detail[0] = {"store_rating_to_user": this.rating };
                    } else {
                        this.order_list[index].review_detail[0].store_rating_to_user = this.rating;
                    }

                } else {
                    this.order_list[index].is_store_rated_to_provider = true;
                    if(this.order_list[index].review_detail.length == 0)
                    {
                        this.order_list[index].review_detail[0] = {"store_rating_to_provider": this.rating };
                    } else {
                        this.order_list[index].review_detail[0].store_rating_to_provider = this.rating;
                    }
                }
            } else {

            }

            this.rating = 1;
            this.review = '';
        },
        (error: any) => {
        this.myLoading=false;
        this.helper.http_status(error)
        });
    }
}
