import {Component, OnInit} from '@angular/core';
import {Response} from '@angular/http';
import {Observable} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";
declare var jQuery: any;
import { map } from 'rxjs/operators';

export interface EditProviderVehicle {

    vehicle_id: Object,
    service_id: Object,
    admin_service_id: Object,
    admin_vehicle_id: Object,
    vehicle_year: Number,
    vehicle_model: String,
    vehicle_name: String,
    vehicle_plate_no: String,
    vehicle_color: String,
    is_approved: Boolean

}

@Component({
    selector: 'app-edit_provider_vehicle',
    templateUrl: './edit_provider_vehicle.component.html',
    providers: [Helper]
})
export class EditProviderVehicleComponent implements OnInit {

    private edit_provider_vehicle: EditProviderVehicle;
    title: any;
    button: any;
    heading_title: any;
    validation_message: any;
    vehicle_service_list: any[] = [];
    vehicle_list: any[] = [];

    document_list: any[] = [];
    provider_vehicle_id: Object;
    error: any;

    myLoading: boolean = true;

    constructor(private helper: Helper) {

    }
    ngAfterViewInit() {
        jQuery("#admin_vehicle_id").chosen({disable_search: true});


    }

    ngOnInit() {
        this.edit_provider_vehicle = {

            vehicle_id: "",
            service_id: "",
            admin_service_id: "",
            admin_vehicle_id: "",
            vehicle_year: null,
            vehicle_model: "",
            vehicle_name: "",
            vehicle_plate_no: "",
            vehicle_color: "",
            is_approved: false


        }
        this.provider_vehicle_id = this.helper.router_id.admin.provider_vehicle_id;
        this.helper.http.get('/admin/vehicle_list_for_provider').pipe(map((res: Response) => res.json())).subscribe(res => {
            this.vehicle_service_list = res.vehicles;
            setTimeout(function () {
                jQuery(".chosen-select").trigger("chosen:updated");
            }, 1000);

        });

        jQuery(this.helper.elementRef.nativeElement).find('#admin_vehicle_id').on('change', (evnt, res_data) => {

            this.edit_provider_vehicle.admin_vehicle_id = res_data.selected;


        });




        this.helper.http.post('/admin/get_provider_vehicle_detail', {provider_vehicle_id: this.provider_vehicle_id}).pipe(map((res_data: Response) => res_data.json())).subscribe(res_data => {

            if (res_data.success == false) {

                this.helper.router.navigate(['admin/provider_vehicles']);

            }
            else {

                this.edit_provider_vehicle.vehicle_id = res_data.provider_vehicle_detail.vehicle_id;
                this.edit_provider_vehicle.service_id = res_data.provider_vehicle_detail.service_id;
                this.edit_provider_vehicle.admin_service_id = res_data.provider_vehicle_detail.admin_service_id;
                this.edit_provider_vehicle.admin_vehicle_id = res_data.provider_vehicle_detail.admin_vehicle_id;
                this.edit_provider_vehicle.vehicle_year = res_data.provider_vehicle_detail.vehicle_year;
                this.edit_provider_vehicle.vehicle_model = res_data.provider_vehicle_detail.vehicle_model;
                this.edit_provider_vehicle.vehicle_name = res_data.provider_vehicle_detail.vehicle_name;

                this.edit_provider_vehicle.vehicle_plate_no = res_data.provider_vehicle_detail.vehicle_plate_no;
                this.edit_provider_vehicle.vehicle_color = res_data.provider_vehicle_detail.vehicle_color;
                this.edit_provider_vehicle.is_approved = res_data.provider_vehicle_detail.is_approved;



            }
        });


        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.validation_message = this.helper.validation_message;



    }

    updateProviderVehicle(provider_vehicle_data) {
        this.myLoading = true;

        this.edit_provider_vehicle.vehicle_id = provider_vehicle_data.admin_vehicle_id;
        this.helper.http.post('/admin/provider_vehicle_update', provider_vehicle_data).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == true) {
                this.helper.data.storage = {
                    "message": this.helper.MESSAGE_CODE[res_data.message],
                    "class": "alert-info"
                }
                this.vehicles(res_data.provider_vehicle.provider_id);

                this.helper.router.navigate(['admin/pending_for_approval']);
            }
            else {
                this.helper.data.storage = {
                    "message": this.helper.ERROR_CODE[res_data.error_code],
                    "class": "alert-danger"
                }

                this.helper.router.navigate(['admin/provider_vehicles']);

            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
    }


    vehicles(provider_id) {
        this.helper.http.post('/admin/provider_vehicle_list', {
            provider_id: provider_id
        }).pipe(map((res: Response) => res.json())).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {
                this.vehicle_list = [];
            }
            else {
                this.vehicle_list = res_data.provider_vehicles;

                this.vehicle_list.forEach((vehicle, index) => {

                    console.log(vehicle);
                    console.log("main vehicle");
                    this.get_document_list(vehicle._id, 9, vehicle.provider_id);

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

}
