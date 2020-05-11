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
    selector: 'app-edit-order',
    templateUrl: './edit_order.component.html',
    providers: [Helper]
})
export class StoreEditOrderComponent implements OnInit {

    constructor(public helper: Helper, public vcr: ViewContainerRef){
        helper.toastr.setRootViewContainerRef(vcr);
    }
    @ViewChild('itemModal')
    item_modal: ModalComponent;

    @ViewChild('edititemModal')
    edit_item_modal: ModalComponent;

    store_id:string;
    server_token:string;
    myLoading:boolean = true;
    order: any = {cart_detail:{}};
    last_item: boolean = false;
    title:any;
    button:any;
    heading_title:any;

    filtered_product_list:any[] = [];
    product_list: any[] = [];
    qty: number = 1;
    note_for_item: string = '';
    //note_for_item: string = '';
    current_item: any = {image_url: []};
    required_count: number = 0;
    private total: number = 0;
    required_temp_count: number = 0;
    is_use_item_tax: Boolean = false;
    item_tax: number = 0;
    product_name: string = '';
    product_unique_id: number = 0;
    currency:any;
    selected_product:string;
    private cartProductItems : CartProductItems;
    private cartProducts : cartProducts;

    add_boolean: boolean = false;
    start_screex: number = 0;
    end_screex: number = 0;

    selected_product_index: number = 0;
    selected_item_index: number = 0;

    ngOnInit() {
        let token = this.helper.tokenService.getToken();

        if (!token || !token.token) {

            this.helper.router.navigate(['store/owner_dashboard']);
        }
        this.helper.message();

        var store = JSON.parse(localStorage.getItem('store'));
        if (store !== null) {
            this.store_id = store._id
            this.server_token = store.server_token
            this.is_use_item_tax = store.is_use_item_tax;
            this.item_tax = store.item_tax;
        }
        if(this.helper.router_id.store.order_id == ''){
            this.helper.router.navigate(['store/order'])
        } else {
            this.get_order_data();
        }

        this.title=this.helper.title
        this.button=this.helper.button
        this.heading_title=this.helper.heading_title;

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

        this.helper.http.post(this.helper.POST_METHOD.GET_STORE_PRODUCT_ITEM_LIST,{store_id:this.store_id, server_token:this.server_token}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

            this.myLoading=false;

            if(res_data.success == false)
            {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }
                this.filtered_product_list=[];
                this.helper.message()
            }
            else
            {
                this.product_list = res_data.products;
                this.currency=res_data.currency;
                let product_list = res_data.products.filter((product)=>{
                    let item_list = product.items.filter((item) =>{
                        return (item.is_item_in_stock==true && item.is_visible_in_store == true)
                    });
                    product.items = item_list;
                    return product.is_visible_in_store == true;
                });
                this.filtered_product_list=product_list;
            }
        },
        (error: any) => {
            this.myLoading=false;
            this.helper.http_status(error)
        });



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

    open_edit_item_modal(item, product, selected_item_index, selected_product_index){

        this.selected_item_index = selected_item_index;
        this.selected_product_index = selected_product_index;

        let product_index = this.product_list.findIndex((x) => x._id == product.product_id)
        let item_index = this.product_list[product_index].items.findIndex((x) => x._id == item.item_id)

        let current_specification = this.product_list[product_index].items[item_index].specifications;
        let order_specification = item.specifications;
        let new_specification = [];
        current_specification.forEach((x) => {
            var index = order_specification.findIndex((order_sp) => order_sp.unique_id == x.unique_id)
            if(index == -1){
                new_specification.push(x);
            } else {
                var new_specification_list = [];
                x.list.forEach((y)=>{
                    var list_index = order_specification[index].list.findIndex((order_sp_list) => order_sp_list.unique_id == y.unique_id)
                    if(list_index == -1){
                        y.is_default_selected = false;
                        new_specification_list.push(y);
                    } else {
                        order_specification[index].list[list_index].price = y.price;
                        new_specification_list.push(order_specification[index].list[list_index]);
                    }
                });
                let json = {
                    list: new_specification_list,
                    "unique_id" : x.unique_id,
                    "name" : x.name,
                    "is_required": x.is_required,
                    "range": x.range,
                    "max_range": x.max_range,
                    "price" : x.price,
                    "type" : x.type
                }
                new_specification.push(json);
            }
        });

        this.qty = item.quantity;
        this.required_count = 0;
        this.current_item = JSON.parse(JSON.stringify(item));
        this.current_item.price = this.product_list[product_index].items[item_index].price;
        this.current_item.specifications = new_specification;
        this.calculate_is_required();
        this.calculateTotalAmount();
        this.edit_item_modal.open();
    }

    close_item_modal(){
        this.current_item = {image_url :[]};
        this.item_modal.close();
        this.edit_item_modal.close();
    }
    calculate_is_required(){
        this.current_item.specifications.forEach((specification_group) => {
            if(specification_group.is_required){
                this.required_count++;
            }
        })
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
                if (specification_group.range) {
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

    newitem_incerase_qty(){
        this.qty++;
        this.calculateTotalAmount();
    }

    newitem_decrease_qty(){
        if(this.qty>1){
            this.qty--;
            this.calculateTotalAmount();
        }
    }

    updateCart(){
        console.log("update cart")
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

        this.order.cart_detail.order_details[this.selected_product_index].items[this.selected_item_index].item_price = this.current_item.price;
        this.order.cart_detail.order_details[this.selected_product_index].items[this.selected_item_index].total_specification_price = specificationPriceTotal;
        this.order.cart_detail.order_details[this.selected_product_index].items[this.selected_item_index].total_price = this.current_item.price+ specificationPriceTotal;
        this.order.cart_detail.order_details[this.selected_product_index].items[this.selected_item_index].total_item_price = this.total;
        this.order.cart_detail.order_details[this.selected_product_index].items[this.selected_item_index].note_for_item = this.note_for_item;
       
        //this.order.cart_detail.order_details[this.selected_product_index].items[this.selected_item_index].note_for_item = this.note_for_item;
       
        
        this.order.cart_detail.order_details[this.selected_product_index].items[this.selected_item_index].specifications = specificationList;
        
        console.log("total_item_price"+this.order.cart_detail.order_details[this.selected_product_index].items[this.selected_item_index].total_item_price );
        var total_item_price = 0;
        this.order.cart_detail.order_details[this.selected_product_index].items.forEach((item) =>{
            total_item_price = total_item_price + item.total_item_price;
        });
        this.order.cart_detail.order_details[this.selected_product_index].total_item_price = total_item_price;

        this.edit_item_modal.close();
        // this.update_order_data();

    }

    addToCart(){

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
        this.cartProductItems.total_item_price = this.total;
        this.cartProductItems.note_for_item = this.note_for_item;
        this.cartProductItems.total_price = specificationPriceTotal + this.current_item.price;
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


            this.order.cart_detail.order_details.push(this.cartProducts);
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
        this.last_item = false;
        // this.update_order_data();
        this.add_boolean = false;
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

    get_order_data(){
        this.helper.http.post(this.helper.POST_METHOD.GET_ORDER_DETAIL, {
            store_id: this.store_id,
            server_token: this.server_token,
            order_id: this.helper.router_id.store.order_id
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;
                console.log(res_data)
                if(res_data.success){
                    this.order = res_data.order;
                    this.check_last_item();
                } else {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                    this.helper.router.navigate(['store/order'])
                }
            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });
    }

    increase_qty(product_index, item_index){
        this.order.cart_detail.order_details[product_index].items[item_index].quantity++;
        this.calculate_amount(product_index, item_index, true,true);
    }

    remove_from_cart(product_index, item_index){
        this.order.cart_detail.order_details[product_index].items.splice(item_index, 1);
        if(this.order.cart_detail.order_details[product_index].items.length == 0){
            this.order.cart_detail.order_details.splice(product_index, 1);
            this.calculate_amount(product_index, item_index, false, false);
        } else {
            this.calculate_amount(product_index, item_index, true, false);
        }
        this.check_last_item();
    }
    check_last_item(){
        if(this.order.cart_detail.order_details.length ==1 && this.order.cart_detail.order_details[0].items.length == 1){
            this.last_item = true;
        }
    }

    decrease_qty(product_index, item_index){
        if(this.order.cart_detail.order_details[product_index].items[item_index].quantity > 1) {
            this.order.cart_detail.order_details[product_index].items[item_index].quantity--;
            this.calculate_amount(product_index, item_index, true, true);
        }
    }

    calculate_amount(product_index, item_index, product_bool, item_bool){
        // this.myLoading = true;
        if(item_bool){
            this.order.cart_detail.order_details[product_index].items[item_index].total_price =
                (this.order.cart_detail.order_details[product_index].items[item_index].item_price + this.order.cart_detail.order_details[product_index].items[item_index].total_specification_price);

            this.order.cart_detail.order_details[product_index].items[item_index].total_item_price =
                (this.order.cart_detail.order_details[product_index].items[item_index].item_price + this.order.cart_detail.order_details[product_index].items[item_index].total_specification_price) * this.order.cart_detail.order_details[product_index].items[item_index].quantity;
            this.order.cart_detail.order_details[product_index].items[item_index].total_item_tax = this.order.cart_detail.order_details[product_index].items[item_index].total_tax * this.order.cart_detail.order_details[product_index].items[item_index].quantity;
        }

        if(product_bool){
            var total_item_price = 0;
            var total_item_tax = 0;
            this.order.cart_detail.order_details[product_index].items.forEach((item) =>{
                total_item_price = total_item_price + item.total_item_price;
                total_item_tax = total_item_tax + item.total_item_tax;
            });
            this.order.cart_detail.order_details[product_index].total_item_price = total_item_price;
            this.order.cart_detail.order_details[product_index].total_item_tax = total_item_tax;
        }

    }

    update_order_data(){
        let totalItemsPriceWithQuantity = 0;
        let totalSpecificationPriceWithQuantity = 0;
        let totalItemsCount = 0;
        let totalCartAmount = 0;
        let totalSpecificationCount = 0;
        let totalItemTax = 0;
        this.order.cart_detail.order_details.forEach((order_product) => {
            order_product.items.forEach((order_item) =>{
                totalItemsPriceWithQuantity += (order_item.item_price * order_item.quantity);
                totalSpecificationPriceWithQuantity += (order_item.total_specification_price * order_item.quantity);
                totalItemsCount += order_item.quantity;
                order_item.specifications.forEach((specification) => {
                    totalSpecificationCount +=  (specification.list.length);
                });
            });
            totalCartAmount += order_product.total_item_price;
            totalItemTax += order_product.total_item_tax;
        });

        let json = {
            store_id: this.store_id,
            server_token: this.server_token,
            order_id: this.helper.router_id.store.order_id,
            total_cart_price: totalCartAmount,
            total_item_count: totalItemsCount,
            total_item_tax: totalItemTax,
            order_details: this.order.cart_detail.order_details
        }
        console.log(json)

        this.helper.http.post(this.helper.POST_METHOD.STORE_UPDATE_ORDER, json).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                this.myLoading = false;

                if(res_data.success){
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }
                } else {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-info"
                    }
                }
                this.helper.router.navigate(['store/order']);

            },
            (error: any) => {
                this.myLoading=false;
                this.helper.http_status(error)
            });
    }

}
