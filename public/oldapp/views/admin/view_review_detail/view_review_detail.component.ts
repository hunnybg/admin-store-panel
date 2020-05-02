import {Component, OnInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Helper} from "../../helper";

@Component({
    selector: 'app-view_review_detail',
    templateUrl: './view_review_detail.component.html',
    providers: [Helper]
})
export class ViewReviewDetailComponent implements OnInit {
    title: any;
    button: any;
    heading_title: any;
    DATE_FORMAT: any;
    review_id: Object;
    user_first_name: String;
    user_last_name: String;
    provider_first_name: String;
    provider_last_name: String;
    store_name: String;

    like_count: number;
    dislike_count: number;
    
    user_rating_to_provider: Number;
    user_review_to_provider: String;
    user_rating_to_store: Number;
    user_review_to_store: String;
    provider_rating_to_user: Number;
    provider_review_to_user: String;
    provider_rating_to_store: Number;
    provider_review_to_store: String;
    store_rating_to_provider: Number;
    store_review_to_provider: String;
    store_rating_to_user: Number;
    store_review_to_user: String;
    order_unique_id: Number;
    created_at: any;
    myLoading: boolean = true;



    constructor(public helper: Helper) {
    }

    ngOnInit() {
        this.review_id = this.helper.router_id.admin.view_review_detail_id;

        this.helper.http.post('/admin/get_review_detail', {review_id: this.review_id}).map((res_data: Response) => res_data.json()).subscribe(res_data => {
            this.myLoading = false;
            console.log(res_data.success);
            if (res_data.success == false) {

                this.helper.router.navigate(['admin/view_review_detail']);

            }
            else {
                console.log(res_data.review_detail);





                this.user_first_name = res_data.review_detail.user_detail[0].first_name
                this.user_last_name = res_data.review_detail.user_detail[0].last_name
                this.provider_first_name = res_data.review_detail.provider_detail[0].first_name
                this.provider_last_name = res_data.review_detail.provider_detail[0].last_name
                this.store_name = res_data.review_detail.store_detail[0].name
                
                this.like_count = res_data.review_detail.id_of_users_like_store_comment.length;
                this.dislike_count = res_data.review_detail.id_of_users_dislike_store_comment.length;
                
                

                this.user_rating_to_provider = res_data.review_detail.user_rating_to_provider
                this.user_rating_to_provider = res_data.review_detail.user_rating_to_provider
                this.user_review_to_provider = res_data.review_detail.user_review_to_provider

                this.user_rating_to_store = res_data.review_detail.user_rating_to_store
                this.user_review_to_store = res_data.review_detail.user_review_to_store

                this.provider_rating_to_user = res_data.review_detail.provider_rating_to_user


                this.provider_review_to_user = res_data.review_detail.provider_review_to_user
                this.provider_rating_to_store = res_data.review_detail.provider_rating_to_store
                this.provider_review_to_store = res_data.review_detail.provider_review_to_store

                this.store_rating_to_provider = res_data.review_detail.store_rating_to_provider
                this.store_review_to_provider = res_data.review_detail.store_review_to_provider
                this.store_rating_to_user = res_data.review_detail.store_rating_to_user

                this.store_review_to_user = res_data.review_detail.store_review_to_user
                this.order_unique_id = res_data.review_detail.order_unique_id
                this.created_at = res_data.review_detail.created_at

            }

        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error)
            });
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.DATE_FORMAT = this.helper.DATE_FORMAT;
    }

}
