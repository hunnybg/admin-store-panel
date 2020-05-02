import { Component, OnInit } from '@angular/core';
import {Helper} from "../../store_helper";
import {Response } from '@angular/http';

@Component({
  selector: 'app-store_logout',
  template: '',
  providers: [Helper]
})
export class StoreLogoutComponent implements OnInit {

    myLoading:boolean = true;
        constructor(private helper:Helper) { 
        
        }

        ngOnInit() {
            
            var store = JSON.parse(localStorage.getItem('store'));
            if(store!==null)
            {
                this.helper.http.post(this.helper.POST_METHOD.LOGOUT,{store_id:store._id}).map((res:Response) => res.json()).subscribe(res_data=>{

                    this.myLoading=false;
                        this.helper.tokenService.removeToken();
                        localStorage.removeItem('store');
                        this.helper.router.navigate(['store/login']);
                   
                },
                (error: any) => {
                    this.myLoading=false;
                        this.helper.http_status(error)
                });
            }
            else
            {
                this.myLoading=false;
                this.helper.tokenService.removeToken();
                localStorage.removeItem('store');
                this.helper.router.navigate(['store/login']);
            }
            this.helper.user_cart.cart_data = {
                cart_id: null,
                city_id: null,
                deliveryAddress: '',
                deliveryLatLng: [0,0],
                cart: [],
                selectedStoreId: null,
                total_item: 0
            }
            this.helper.user_cart.total_cart_amount = 0;
            this.helper.user_cart.order_payment_id = null;
        }

}
