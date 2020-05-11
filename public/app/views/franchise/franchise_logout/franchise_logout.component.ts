import { Component, OnInit } from '@angular/core';
import {Helper} from "../../franchise_helper";
import {Response } from '@angular/http';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-franchise_logout',
  template: '',
  providers: [Helper]
})
export class FranchiseLogoutComponent implements OnInit {

    myLoading:boolean = true;
        constructor(private helper:Helper) { 
        
        }

        ngOnInit() {
            
            var franchise = JSON.parse(localStorage.getItem('franchise'));
            if(franchise!==null)
            {
                this.helper.http.post(this.helper.POST_METHOD.LOGOUT,{franchise_id:franchise._id}).pipe(map((res:Response) => res.json())).subscribe(res_data=>{

                    this.myLoading=false;
                        this.helper.tokenService.removeToken();
                        localStorage.removeItem('franchise');
                        this.helper.router.navigate(['franchise/login']);
                   
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
                localStorage.removeItem('franchise');
                this.helper.router.navigate(['franchise/login']);
            }
            
        }

}
