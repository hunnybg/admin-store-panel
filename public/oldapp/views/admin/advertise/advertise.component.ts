import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
import { map } from 'rxjs/operators';
declare var jQuery: any;

declare var swal: any;

@Component({
    selector: 'app-advertise',
    templateUrl: './advertise.component.html',
    providers: [Helper]
})
export class AdvertiseComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    DATE_FORMAT: any;
    public message: string = "";
    public class: string;
    country_list: any[];
    city_list: any[];
    filtered_country_list: any[] = [];
    selected_country: string;
    selected_is_ads_visible: boolean;
    filter_country_name: String = "";
    myLoading: boolean = true;

    advertise_index: number;

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }
    ngAfterViewInit() {
        jQuery("#ads_type").chosen({disable_search: true});
        jQuery(".chosen-select").chosen();
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);

    }

    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }



    ngOnInit() {
        this.helper.message();

        this.title = this.helper.title
        this.button = this.helper.button
        this.DATE_FORMAT = this.helper.DATE_FORMAT
        this.heading_title = this.helper.heading_title;
        this.selected_country = this.title.all

        jQuery(this.helper.elementRef.nativeElement).find('#selected_country').on('change', (evnt, res_data) => {

            this.selected_country = res_data.selected;
            this.get_city_list(res_data.selected);

        });

        jQuery(this.helper.elementRef.nativeElement).find('#selected_is_ads_visible').on('change', (evnt, res_data) => {

            this.selected_is_ads_visible = res_data.selected;
            this.get_visible_advertise_list(res_data.selected);
            console.log(res_data.selected);


        });

        this.helper.http.post('/admin/advertise_list', {}).pipe(map((res: Response) => res.json())).subscribe(res_data => {


            this.myLoading = false;
            console.log(res_data.success);

            if (res_data.success == false) {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }

                this.country_list = [];
                this.filtered_country_list = [];
                //this.helper.message()
            }
            else {

                this.country_list = res_data.countries;
                this.filtered_country_list = res_data.countries;

                //               


                setTimeout(function () {
                    jQuery(".chosen-select").trigger("chosen:updated");
                }, 1000);
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });


    }
    get_city_list(countryid) {
        this.selected_country = countryid;
        this.helper.http.post('/api/admin/get_city_list', {country_id: countryid}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.city_list = res_data.cities
        });
        setTimeout(function () {
            jQuery("#select_city").trigger("chosen:updated");
        }, 1000);
    }

    get_visible_advertise_list(is_ads_visible) {

        this.selected_is_ads_visible = is_ads_visible;
        this.helper.http.post('/admin/get_visible_advertiset', {is_ads_visible: is_ads_visible}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.filtered_country_list = res_data.advertises;
        });
    }

    filter_ads(data) {
        data = data.replace(/^\s+|\s+$/g, '');
        data = data.replace(/ +(?= )/g, '');
        data = new RegExp(data, "gi");

        var country_array = [];
        this.country_list.forEach((country) => {
            var advertise_array = country.advertises_detail.filter((advertise_data) => {
                var a = advertise_data.country_id.match(data);
                return a !== null;
            })
            if (advertise_array.length > 0) {
                country_array.push({_id: country._id, advertises: advertise_array})
            }
        });
        this.filtered_country_list = country_array;
    }

    delete_advertise(advertise_id, index, advertise_index) {
        swal({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(() => {

            this.filtered_country_list[index].advertises_detail.splice(advertise_index, 1);
            this.helper.http.post('/admin/delete_advertise', {
                advertise_id: advertise_id
            }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
                if (res_data.success == true) {
                    this.helper.data.storage = {
                        "message": this.helper.MESSAGE_CODE[res_data.message],
                        "class": "alert-info"
                    }

                    this.helper.message();
                }
                else {
                    this.helper.data.storage = {
                        "code": res_data.error_code,
                        "message": this.helper.ERROR_CODE[res_data.error_code],
                        "class": "alert-danger"
                    }
                }
            });

            swal(
                'Deleted!',
                'Your file has been deleted.',
                'success'
            );
        }).catch(swal.noop)
    }

    onChange(id, event) {
        this.helper.http.post('/admin/change_advertise_visibility', {advertise_id: id, is_ads_visible: event}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == false) {

            }
        },
            (error: any) => {
                this.helper.http_status(error)
            });
    }

    onChange_visible(event) {
        console.log(event);
        this.helper.http.post('/admin/get_visible_advertise', {is_ads_visible: event}).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            console.log(res_data.success);
            if (res_data.success == true) {
                this.filtered_country_list = res_data.countries;
            }
        },
            (error: any) => {
                this.helper.http_status(error)
            });
    }


    editAdvertise(id) {
        this.helper.router_id.admin.advertise_id = id;
        this.helper.router.navigate(['admin/advertise/edit']);
    }

}
