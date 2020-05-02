import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Helper} from "../../helper";
import {Http, Response} from '@angular/http';


@Component({
    selector: 'app-delivery',
    templateUrl: './delivery.component.html',
    providers: [Helper]
})
export class DeliveryComponent implements OnInit {

    delivery_list: any[];
    title: any;
    button: any;
    heading_title: any;
    public message: string;
    public class: string;
    myLoading: boolean = true;
    filter_delivery_name: String = "";
    filtered_delivery_list: any[] = [];

    constructor(public helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }

    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    ngOnInit() {
        this.helper.message()
        this.helper.http.get('admin/delivery_list').map((res: Response) => res.json()).subscribe(data => {
            this.myLoading = false;

            if (data.success == false) {

                this.delivery_list = [];
                this.filtered_delivery_list = [];
            }
            else {
                this.delivery_list = data.deliveries;
                this.filtered_delivery_list = data.deliveries;
            }


        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            })
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }

    filter_delivery_list(data) {
        data = data.replace(/^\s+|\s+$/g, '');
        data = data.replace(/ +(?= )/g, '');
        data = new RegExp(data, "gi");

        var delivery_array = this.delivery_list.filter((delivery_data) => {
            console.log(delivery_data);
            var a = delivery_data.delivery_name.match(data);
            return a !== null;
        })


        this.filtered_delivery_list = delivery_array;
    }

    is_business_change(id, event) {
        this.helper.http.post('/admin/delivery_toggle_change', {delivery_id: id, is_business: event}).map((res: Response) => res.json()).subscribe(res_data => {

            if (res_data.success == false) {

            }
        });

    }


    editDelivery(id, event) {
        if (event.target.attributes.class != undefined) {
            var value = event.target.attributes.class.value
            value = value.split(' ')
            if (value[0] !== "switch") {
                this.helper.router_id.admin.delivery_id = id;
                this.helper.router.navigate(['admin/delivery/edit']);
            }
        }
        else if (event.target.tagName !== "SMALL") {
            this.helper.router_id.admin.delivery_id = id;
            this.helper.router.navigate(['admin/delivery/edit']);
        }
    }


}
