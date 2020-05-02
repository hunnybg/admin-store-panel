import {Component, OnInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";

@Component({
    selector: 'app-wallet_request_bank_detail',
    templateUrl: './wallet_request_bank_detail.component.html',
    providers: [Helper]
})
export class WalletRequestBankDetailComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    wallet_request_bank_detail_id: Object;
    bank_detail: any[];


    bank_name: String;
    bank_branch: String;
    bank_account_number: String;
    bank_account_holder_name: String;
    bank_beneficiary_address: String;
    bank_unique_code: String;
    bank_swift_code: String;

    created_at: any;
    updated_at: any;
    myLoading: boolean = true;


    constructor(public helper: Helper) {
    }

    ngOnInit() {

        this.wallet_request_bank_detail_id = this.helper.router_id.admin.wallet_request_bank_detail_id;

        this.helper.http.post('/admin/get_wallet_request_bank_detail', {bank_detail_id: this.wallet_request_bank_detail_id}).map((res_data: Response) => res_data.json()).subscribe(res_data => {
            this.myLoading = false;

            if (res_data.success == false) {
                this.helper.router.navigate(['admin/provider/view_bank_detail']);
            }
            else {

                this.bank_name = res_data.bank_detail.bank_name
                this.created_at = res_data.bank_detail.created_at
                this.updated_at = res_data.bank_detail.updated_at
                this.bank_branch = res_data.bank_detail.bank_branch
                this.bank_account_number = res_data.bank_detail.bank_account_number
                this.bank_account_holder_name = res_data.bank_detail.bank_account_holder_name
                this.bank_beneficiary_address = res_data.bank_detail.bank_beneficiary_address
                this.bank_unique_code = res_data.bank_detail.bank_unique_code
                this.bank_swift_code = res_data.bank_detail.bank_swift_code


            }

        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
    }

}
