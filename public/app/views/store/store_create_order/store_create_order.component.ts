import { Component, OnInit ,ViewContainerRef, ViewChild } from '@angular/core';
import {Response } from '@angular/http';
import {Helper} from "../../store_helper";
declare var jQuery:any;
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { map } from 'rxjs/operators';

export interface CartProductItems{
    item_id: Object,
    unique_id: number,
    item_name: string,
    quantity: number,
    image_url: any,
    details: string,
    specifications: any[],
    item_price: number,
    item_tax: number,
    total_specification_tax: number,
    total_item_tax: number,
    tax: number,
    total_tax: number,
    total_specification_price: number,
    total_price: number,
    total_item_price: number,
    note_for_item: string
}

export interface cartProducts{
    items: any[],
    product_id: Object,
    product_name: string,
    unique_id: number,
    total_item_price: number,
    total_item_tax: number
}

@Component({
    selector: 'app-store_create_order',
    templateUrl: './store_create_order.component.html',
    providers: [Helper]
})
export class StoreCreateOrderComponent implements OnInit {

    @ViewChild('itemModal')
    item_modal: ModalComponent;

    title:any;
    button:any;
    heading_title:any;
    public message: string = "";
    public class: string;
    product_list:any[];
    filtered_product_list:any[] = [];
    store_id:string;
    is_use_item_tax: Boolean = false;
    item_tax: number = 0;
    server_token:string;
    currency:any;
    selected_product:string;
    filter_product_name:String = "";

    myLoading:boolean = true;

    qty: number = 1;
    note_for_item: string = '';
    //note_for_item: string = '';
    current_item: any = {image_url: []};
    required_count: number = 0;
    private total: number = 0;
    required_temp_count: number = 0;
    delivery_currency : string = '';
    product_name: string = '';
    product_unique_id: number = 0;
    start_screex: number = 0;
    end_screex: number = 0;

    private cartProductItems : CartProductItems;
    private cartProducts : cartProducts;

    constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);
    }

    ngAfterViewInit() {
        jQuery(".chosen-select").chosen();
    }

    activeRoute(routename: string): boolean{
        return this.helper.router.url.indexOf(routename) > -1;
    }

    ngOnInit() {
        let token = this.helper.tokenService.getToken();

        if(!token || !token.token) {

            this.helper.router.navigate(['store/owner_dashboard']);
        }
        this.helper.message();

        this.cartProductItems = {
            item_id: null,
            unique_id: 0,
            item_name: '',
            quantity: 0,
            image_url: [],
            details: '',
            specifications: [],
            item_price: 0,
            item_tax: 0,
            total_specification_price: 0,
            total_price: 0,
            total_item_price: 0,
            note_for_item: '',
            tax: 0,
            total_item_tax: 0,
            total_specification_tax: 0,
            total_tax: 9
        }
        this.cartProducts = {
            items: [],
            product_id: null,
            product_name: '',
            unique_id: 0,
            total_item_price: 0,
            total_item_tax: 0
        }

        var store = JSON.parse(localStorage.getItem('store'));
        if(store!==null)
        {
            this.store_id=store._id
            this.server_token=store.server_token
            this.is_use_item_tax = store.is_use_item_tax;
            this.item_tax = store.item_tax;
        }
        if(!JSON.parse(localStorage.getItem('store_document_ulpoaded')) && JSON.parse(localStorage.getItem('admin_store_document_ulpoaded')))
        {
            this.helper.router.navigate(['store/upload_document']);
        }
        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title;
        this.selected_product=this.title.all

        jQuery(this.helper.elementRef.nativeElement).find('#selected_product').on('change', (evnt,res_data) => {

            this.selected_product=res_data.selected;

        });

        this.helper.http.post(this.helper.POST_METHOD.GET_STORE_PRODUCT_ITEM_LIST,{store_id:this.store_id, server_token:this.server_token}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

                this.myLoading=false;
                if(res_data.success == false)
                {
                    this.helper.data.storage = {
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.product_list=[];
                    this.filtered_product_list=[];
                    this.helper.message()
                }
                else
                {
                    this.currency=res_data.currency;
                    this.helper.user_cart.currency = this.currency;
                    let product_list = res_data.products.filter((product)=>{
                        let item_list = product.items.filter((item) =>{
                            return (item.is_item_in_stock==true && item.is_visible_in_store == true)
                        });
                        product.items = item_list;
                        return product.is_visible_in_store == true;
                    });

                    let specification_price;
                    let product_array = product_list.filter((product_data) => {
                        let item_array = product_data.items.filter((item_data) => {
                            specification_price = 0;
                            item_data.specifications.filter((specification_group) => {
                                specification_group.list.filter((specification) => {
                                    if(specification.is_default_selected){
                                        specification_price = specification_price + specification.price;
                                    }
                                })
                            })

                            let total_item_price = item_data.price + specification_price;
                            item_data.total_item_price = total_item_price;
                            return item_data;
                        });
                        product_data.items = item_array;
                        return product_data;
                    });
                    this.product_list=product_array;
                    this.filtered_product_list=product_array;

                    setTimeout(function() {
                        jQuery(".chosen-select").trigger("chosen:updated");
                    }, 1000);
                }
            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });

        jQuery('#loop').click();

        jQuery(window).resize(function(){

            if((jQuery(window).width()>772 && jQuery(window).width()<935) || jQuery(window).width()<365){
                jQuery('.div1').removeClass('col-xs-4');
                jQuery('.div2').removeClass('col-xs-8');
                jQuery('.div1').addClass('col-xs-12');
                jQuery('.div2').addClass('col-xs-12');
            }
            else
            {
                jQuery('.div1').removeClass('col-xs-12');
                jQuery('.div2').removeClass('col-xs-12');
                jQuery('.div1').addClass('col-xs-4');
                jQuery('.div2').addClass('col-xs-8');
            }
        });

        setTimeout(function() {
            if((jQuery(window).width()>772 && jQuery(window).width()<935) || jQuery(window).width()<365){
                jQuery('.div1').removeClass('col-xs-4');
                jQuery('.div2').removeClass('col-xs-8');
                jQuery('.div1').addClass('col-xs-12');
                jQuery('.div2').addClass('col-xs-12');
            }
            else
            {
                jQuery('.div1').removeClass('col-xs-12');
                jQuery('.div2').removeClass('col-xs-12');
                jQuery('.div1').addClass('col-xs-4');
                jQuery('.div2').addClass('col-xs-8');
            }
        },500);


    }

    open_item_modal(item, item_index , product_index, event){

        if(event.target.attributes.class != undefined) {
            if(event.target.attributes.class.value !== "carousel-indicators_li" && event.target.attributes.class.value !== "carousel-indicators_li active"){
                this.qty = 1;
                this.required_count = 0;
                this.current_item = JSON.parse(JSON.stringify(item));
                this.product_unique_id = this.filtered_product_list[product_index].unique_id;
                this.product_name = this.filtered_product_list[product_index].name;
                this.calculate_is_required();
                this.calculateTotalAmount();
                this.item_modal.open();
            }
        } else {
            this.qty = 1;
            this.required_count = 0;
            this.current_item = JSON.parse(JSON.stringify(item));
            this.product_unique_id = this.filtered_product_list[product_index].unique_id;
            this.product_name = this.filtered_product_list[product_index].name;
            this.calculate_is_required();
            this.calculateTotalAmount();
            this.item_modal.open();
        }
    }

    close_item_modal(){
        this.current_item = {image_url :[]};
        this.item_modal.close();
    }

    calculate_is_required(){
        this.current_item.specifications.forEach((specification_group) => {
            if(specification_group.is_required){
                this.required_count++;
            }
        })
    }

    calculateTotalAmount(){
        this.total = this.current_item.price;
        this.required_temp_count = 0;
        this.current_item.specifications.forEach((specification_group , specification_group_index) => {
            let isAllowed = false;
            var default_selected_count = 0
            specification_group.list.forEach((specification , specification_index) => {

                if(specification.is_default_selected){
                    this.total = this.total + specification.price;
                    default_selected_count++;
                }
                specification_group.default_selected_count = default_selected_count;
            });

            if(specification_group.type ==1 && specification_group.is_required) {
                if(specification_group.range) {
                    if (default_selected_count >= specification_group.range) {
                        this.required_temp_count++;
                    }
                } else {
                    if (default_selected_count >= 1) {
                        this.required_temp_count++;
                    }
                }
            } else if(specification_group.type == 2 && specification_group.is_required) {
                if(specification_group.range) {
                    if (default_selected_count >= specification_group.range) {
                        this.required_temp_count++;
                    }
                } else {
                    if (default_selected_count >= 1) {
                        this.required_temp_count++;
                    }
                }
            }

        });
        this.total = this.total * this.qty;

    }

    changeradio(event, specification_group_index, specification_index){

        var index = this.current_item.specifications[specification_group_index].list.findIndex(x => x.is_default_selected == true)
        if(index !== -1){
            this.current_item.specifications[specification_group_index].list[index].is_default_selected = false;
        }
        this.current_item.specifications[specification_group_index].list[specification_index].is_default_selected = true;
        this.calculateTotalAmount();
    }

    changecheckbox(event, specification_group_index, specification_index){
        this.current_item.specifications[specification_group_index].list[specification_index].is_default_selected = event.target.checked;
        this.calculateTotalAmount();
    }

    incerase_qty(){
        this.qty++;
        this.calculateTotalAmount();
    }

    decrease_qty(){
        if(this.qty>1){
            this.qty--;
            this.calculateTotalAmount();
        }
    }

    dragstart_image(event){
        this.start_screex = event.screenX
    }
    dragend_image(event, length){
        this.end_screex = event.screenX;
        var a = jQuery('.a.active').attr('data-slide-to');
        a = Number(a);
        if(this.start_screex < this.end_screex && a > 0){
            a = a-1;
            jQuery('.a#aa'+a).click()
        } else if(this.start_screex > this.end_screex && a < length){
            a = a+1;
            jQuery('.a#aa'+a).click()
        }
    }


    filter_product(data)
    {
        data = data.replace(/^\s+|\s+$/g, '');
        data = data.replace(/ +(?= )/g, '');
        data = new RegExp(data,"gi");

        var product_array = [];
        this.product_list.forEach((product) => {

            var item_array = product.items.filter((item_data) => {
                var a = item_data.name.match(data);
                return a !== null;
            })
            if(item_array.length>0)
            {
                product_array.push({_id:product._id , name:product.name , store_id:product.store_id , unique_id:product.unique_id,
                    is_visible_in_store: product.is_visible_in_store , items:item_array})
            }
        });
        this.filtered_product_list = product_array;
    }

    check_spec_validation(){
        return true;
    }

    addToCart(){
        // if(this.check_spec_validation()){
            let specificationPriceTotal = 0;
            let specificationPrice = 0;
            let specificationList = [];

            this.current_item.specifications.forEach((specification_group , specification_group_index) => {

                let specificationItemCartList = [];
                specification_group.list.forEach((specification , specification_index) => {

                    if(specification.is_default_selected){

                        specificationPrice = specificationPrice + specification.price;
                        specificationPriceTotal = specificationPriceTotal + specification.price;
                        specificationItemCartList.push(specification)
                    }
                });

                if(specificationItemCartList.length > 0){
                    let specificationsItem_json ={
                        list: specificationItemCartList,
                        unique_id: specification_group.unique_id,
                        name: specification_group.name,
                        price: specificationPrice,
                        type: specification_group.type,
                    }
                    specificationList.push(specificationsItem_json);
                }
                specificationPrice = 0;

            });

            this.cartProductItems.item_id = this.current_item._id;
            this.cartProductItems.unique_id = this.current_item.unique_id;
            this.cartProductItems.item_name = this.current_item.name;
            this.cartProductItems.quantity = this.qty;
            this.cartProductItems.image_url = this.current_item.image_url;
            this.cartProductItems.details = this.current_item.details;
            this.cartProductItems.specifications = specificationList;
            this.cartProductItems.item_price = this.current_item.price;

            if(this.is_use_item_tax){
                this.cartProductItems.tax = this.current_item.tax;
            } else {
                this.cartProductItems.tax = this.item_tax;
            }
            this.cartProductItems.item_tax = this.cartProductItems.tax * this.current_item.price * 0.01;
            this.cartProductItems.total_specification_tax = this.cartProductItems.tax * specificationPriceTotal * 0.01;
            this.cartProductItems.total_tax = this.cartProductItems.item_tax + this.cartProductItems.total_specification_tax;
            this.cartProductItems.total_item_tax = this.cartProductItems.total_tax * this.cartProductItems.quantity;

            this.cartProductItems.total_specification_price = specificationPriceTotal;
            this.cartProductItems.total_price = specificationPriceTotal + this.current_item.price;
            this.cartProductItems.total_item_price = this.total;
            this.cartProductItems.note_for_item = this.note_for_item;
            //this.cartProductItems.note_for_item = this.note_for_item;


            this.helper.user_cart.total_cart_amount = this.helper.user_cart.total_cart_amount + this.total;
            this.helper.user_cart.total_item_tax = this.helper.user_cart.total_item_tax + this.cartProductItems.total_item_tax;

            if(this.isProductExistInLocalCart(this.cartProductItems))
            {

            } else {
                let cartProductItemsList = [];
                cartProductItemsList.push(this.cartProductItems)
                this.cartProducts.items = cartProductItemsList;
                this.cartProducts.product_id = this.current_item.product_id;
                this.cartProducts.product_name = this.product_name
                this.cartProducts.unique_id = this.product_unique_id
                this.cartProducts.total_item_price = this.total;
                this.cartProducts.total_item_tax = this.cartProductItems.total_item_tax;

                this.helper.user_cart.cart_data.cart.push(this.cartProducts);
                this.helper.user_cart.cart_data.selectedStoreId = this.store_id;
                var store = JSON.parse(localStorage.getItem('store'));

                this.helper.user_cart.cart_data.total_item++;
            }


            this.current_item = {image_url:[]};
            this.cartProductItems = {
                item_id: null,
                unique_id: 0,
                item_name: '',
                quantity: 0,
                image_url: [],
                details: '',
                specifications: [],
                item_price: 0,
                item_tax: 0,
                total_specification_price: 0,
                total_price: 0,
                total_item_price: 0,
                note_for_item: '',
                tax: 0,
                total_item_tax: 0,
                total_specification_tax: 0,
                total_tax: 9
            }
            this.cartProducts = {
                items: [],
                product_id: null,
                product_name: '',
                unique_id: 0,
                total_item_price: 0,
                total_item_tax: 0
            }
            this.item_modal.close();
        // } else {
        //     console.log("spec error")
        // }

    }

    isProductExistInLocalCart(cartProductItems){

        let bool = false;
        this.helper.user_cart.cart_data.cart.forEach((cart_item) =>{

            if(cart_item.product_id == this.current_item.product_id && bool == false){
                cart_item.items.push(cartProductItems);
                cart_item.total_item_price = cart_item.total_item_price + this.total;
                cart_item.total_item_tax = cart_item.total_item_tax + this.cartProductItems.total_item_tax;
                this.helper.user_cart.cart_data.total_item++;
                bool = true;
            }
        });
        return bool;
    }

    checkbag(){
        if(this.helper.user_cart.cart_data.total_item > 0){
            jQuery("#outbox").toggle();
        }
    }
}
