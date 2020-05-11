import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;
import { map } from 'rxjs/operators';


@Component({
    selector: 'app-country',
    templateUrl: './country.component.html',
    providers: [Helper]
})
export class countryComponent implements OnInit {

    country_list: any[];
    title: any;
    button: any;
    heading_title: any;
    
    public message: string;
    public class: string;
    myLoading: boolean = true;
    filter_country_name: String = "";
    filtered_country_list: any[] = [];

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);

    }
    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }


    ngOnInit() {
        this.helper.message();
        this.helper.http.get('admin/country_list').pipe(map((res: Response) => res.json())).subscribe(data => {
            this.myLoading = false;
            if (data.success == false) {
                this.country_list = [];
                this.filtered_country_list = [];
            }
            else {
                this.country_list = data.countries;
                this.filtered_country_list = data.countries;
                console.log(data.countries);
                
            }
        },
        (error: any) => {
            this.myLoading=false;
                this.helper.http_status(error)
        })
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }
    
    
    filter_country_list(data) {
        data = data.replace(/^\s+|\s+$/g, '');
        data = data.replace(/ +(?= )/g, '');
        data = new RegExp(data, "gi");

            var country_array = this.country_list.filter((country_data) => {
                console.log(country_data);
                var a = country_data.country_name.match(data);
                return a !== null;
            })

        
        this.filtered_country_list = country_array;
    }
    
    

    is_business_change(id, event) {
        this.helper.http.post('/admin/country_toggle_change', {country_id: id, is_business: event}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == false) {

            }
        });

    }

    is_referral_user_change(id, event) {
        this.helper.http.post('/admin/country_toggle_change', {country_id: id, is_referral_user: event}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == false) {

            }
        });

    }

    is_referral_store_change(id, event) {
        this.helper.http.post('/admin/country_toggle_change', {country_id: id, is_referral_store: event}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == false) {

            }
        });

    }
    is_referral_provider_change(id, event) {
        this.helper.http.post('/admin/country_toggle_change', {country_id: id, is_referral_provider: event}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == false) {

            }
        });

    }

    editCountry(id) {
        this.helper.router_id.admin.country_id = id;
        this.helper.router.navigate(['admin/country/edit']);

    }

}
