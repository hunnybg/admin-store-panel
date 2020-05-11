import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;
import { map } from 'rxjs/operators';


export interface Provider_Vehicle {
    vehicle_name: String,
    admin_vehicle_id: Object,
    vehicle_id: Object,
    vehicle_plate_no: String,
    vehicle_color: String,
    vehicle_model: String,
    vehicle_year: null,
    service_id: Object,
    admin_service_id: Object

}

@Component({
    selector: 'app-provider_vehicle',
    templateUrl: './provider_vehicle.component.html',
    providers: [Helper]
})
export class ProviderVehicleComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    vehicle_list: any[];
    provider_id: Object;
    provider_vehicle_id: Object;
    myLoading: boolean = true;
    document_list: any[];
    vehicle_service_list: any[];
    edit_vehicle: any[] = [];
    private provider_vehicle_list: Provider_Vehicle;
    id: Object;

    constructor(private helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }


    ngAfterViewInit() {
        jQuery("#admin_vehicle_id").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }


    ngOnInit() {
        //jQuery(".chosen-select").chosen();
        this.provider_id = this.helper.router_id.admin.provider_vehicle_id;
        this.id = this.helper.router_id.admin.pro_vehicle_id;

        this.provider_vehicle_id = "";
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.title = this.helper.title;
        this.vehicle_list = [];
        this.document_list = [];


        this.provider_vehicle_list = {
            vehicle_name: '',
            admin_vehicle_id: null,
            vehicle_id: null,
            vehicle_plate_no: '',
            vehicle_color: '',
            vehicle_model: '',
            vehicle_year: null,
            service_id: null,
            admin_service_id: null
        }

        this.helper.http.get('/admin/vehicle_list_for_provider').pipe(map((res: Response) => res.json())).subscribe(res => {
            this.vehicle_service_list = res.vehicles;
            setTimeout(function () {
                jQuery("#admin_vehicle_id").trigger("chosen:updated");
            }, 1000);
        });

        jQuery(this.helper.elementRef.nativeElement).find('#admin_vehicle_id').on('change', (evnt, res_data) => {

            this.provider_vehicle_list.admin_vehicle_id = res_data.selected;
        });



        this.helper.http.post('/admin/provider_vehicle_list', {
            provider_id: this.provider_id
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.vehicle_list = [];
            }
            else {
                this.vehicle_list = res_data.provider_vehicles;
                this.helper.http.get('/admin/vehicle_list_for_provider').pipe(map((res: Response) => res.json())).subscribe(res => {
                    this.vehicle_service_list = res.vehicles;
                    setTimeout(function () {
                        jQuery("#admin_vehicle_id").trigger("chosen:updated");
                    }, 1000);
                });
                this.vehicle_list.forEach((vehicle, index) => {
                    this.edit_vehicle[index] = "false";
                    console.log(vehicle);
                    console.log("main vehicle");
                    this.get_document_list(vehicle._id, 9, vehicle.provider_id);

                    this.helper.http.get('/admin/vehicle_list_for_provider').pipe(map((res: Response) => res.json())).subscribe(res => {
                        this.vehicle_service_list = res.vehicles;
                        setTimeout(function () {
                            jQuery("#admin_vehicle_id").trigger("chosen:updated");
                        }, 1000);
                    });
                })
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });

    }


    get_document_list(id, type, user_type_id) {
        this.helper.http.post('/admin/view_document_list', {id: id, type: type, user_type_id: user_type_id}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            this.document_list = res_data.documents;
        });
    }
    editVehicle(vehicle, vehicle_index) {
        this.edit_vehicle.fill("")
        this.edit_vehicle[vehicle_index] = "true";
        this.provider_vehicle_list.vehicle_name = vehicle.vehicle_name;
        this.provider_vehicle_list.admin_vehicle_id = vehicle.admin_vehicle_id;
        this.provider_vehicle_list.vehicle_id = vehicle.vehicle_id;
        this.provider_vehicle_list.vehicle_plate_no = vehicle.vehicle_plate_no;
        this.provider_vehicle_list.vehicle_color = vehicle.vehicle_color;
        this.provider_vehicle_list.vehicle_model = vehicle.vehicle_model;
        this.provider_vehicle_list.vehicle_year = vehicle.vehicle_year;
        this.provider_vehicle_list.service_id = vehicle.service_id;
        this.provider_vehicle_list.admin_service_id = vehicle.admin_service_id;

        this.helper.http.get('/admin/vehicle_list_for_provider').pipe(map((res: Response) => res.json())).subscribe(res => {
            this.vehicle_service_list = res.vehicles;
            setTimeout(function () {
                jQuery("#admin_vehicle_id").trigger("chosen:updated");
            }, 1000);
        });

        jQuery(this.helper.elementRef.nativeElement).find('#admin_vehicle_id').on('change', (evnt, res_data) => {

            this.provider_vehicle_list.admin_vehicle_id = res_data.selected;
        });
    }

    UpdateVehicle(vehicle, v_index) {

        console.log("UpdateVehicle :");
        console.log(vehicle._id);
        console.log(this.provider_vehicle_list.vehicle_name);
        console.log("--UpdateVehicle :--");
        this.myLoading = true;
        this.helper.http.post('/admin/provider_vehicle_update', {
            provider_vehicle_id: vehicle._id, vehicle_name: this.provider_vehicle_list.vehicle_name, vehicle_id: this.provider_vehicle_list.admin_vehicle_id,
            admin_vehicle_id: this.provider_vehicle_list.admin_vehicle_id,
            vehicle_plate_no: this.provider_vehicle_list.vehicle_plate_no,
            vehicle_color: this.provider_vehicle_list.vehicle_color,
            vehicle_model: this.provider_vehicle_list.vehicle_model,
            vehicle_year: this.provider_vehicle_list.vehicle_year,
            service_id: this.provider_vehicle_list.service_id,
            admin_service_id: this.provider_vehicle_list.admin_service_id

        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            this.edit_vehicle.fill("false");
            if (res_data.success == true) {
                this.vehicle_list[v_index].vehicle_name = res_data.provider_vehicle.vehicle_name;
                this.vehicle_list[v_index].vehicle_color = res_data.provider_vehicle.vehicle_color;
                this.vehicle_list[v_index].vehicle_id = res_data.provider_vehicle.vehicle_id;
                this.vehicle_list[v_index].admin_vehicle_id = res_data.provider_vehicle.admin_vehicle_id;

                console.log(this.vehicle_list[v_index].vehicle_name);

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });

    }



//    editProviderVehicle(id) {
//        this.helper.router_id.admin.pro_vehicle_id = id;
//        this.helper.router.navigate(['admin/edit_vehicle']);
//    }


    onChangeVehicle(id, event) {
        this.helper.http.post('/admin/provider_vehicle_approve_decline', {vehicle_id: id, is_approved: event}).pipe(map((res: Response) => res.json())).subscribe(res_data => {

            if (res_data.success == false) {

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }

    editProviderVehicle(id) {
        this.helper.router_id.admin.provider_vehicle_id = id;
        this.helper.router.navigate(['admin/edit_vehicle']);

    }


    viewProviderDocument(id, user_type_id, type) {
        this.helper.router_id.admin.provider_vehicle_id = id;
        this.helper.router_id.admin.document_type = type;
        this.helper.router.navigate(['admin/provider_vehicle_documents']);
    }



}
