import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {Response} from '@angular/http';
import {Helper} from "../../helper";
declare var jQuery: any;
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
    selector: 'app-review',
    templateUrl: './review.component.html',
    providers: [Helper]
})
export class ReviewComponent implements OnInit {

    @ViewChild('modal')
    modal: ModalComponent;
    @ViewChild('modal1')
    modal1: ModalComponent;
    @ViewChild('modal2')
    modal2: ModalComponent;
    @ViewChild('modal3')
    modal3: ModalComponent;
    @ViewChild('modal4')
    modal4: ModalComponent;
    @ViewChild('modal5')
    modal5: ModalComponent;

    title: any;
    button: any;
    heading_title: any;
    DATE_FORMAT: any;
    review_list: any[];
    sort_field: string;
    sort_review: number;
    search_field: string;
    search_value: string;
    start_date: string;
    end_date: string;
    page: number;
    selected_review_index:number = 0;
    total_page: number;
    total_pages: number[];
    myLoading: boolean = true;
    review_id: Object;
    //show: boolean ;

    constructor(private helper: Helper, public vcr: ViewContainerRef) {
        helper.toastr.setRootViewContainerRef(vcr);
    }
    ngAfterViewInit() {

        jQuery(".chosen-select").chosen({disable_search: true});
        setTimeout(function () {
            jQuery(".chosen-select").trigger("chosen:updated");
        }, 1000);
    }

    ngOnInit() {
        this.sort_field = "order_unique_id";
        this.sort_review = -1;
        this.search_field = "user_review_to_provider";
        this.search_value = "";
        this.start_date = '';
        this.end_date = '';
        this.page = 1

        this.helper.message()

        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.title = this.helper.title
        this.DATE_FORMAT = this.helper.DATE_FORMAT
        this.review_list = [];
        //this.show = false;
        this.review_id = "";
        this.review_history(1);

        jQuery(this.helper.elementRef.nativeElement).find('#sort_field').on('change', (evnt, res_data) => {

            this.sort_field = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#sort_review').on('change', (evnt, res_data) => {

            this.sort_review = res_data.selected;

        });
        jQuery(this.helper.elementRef.nativeElement).find('#search_field').on('change', (evnt, res_data) => {

            this.search_field = res_data.selected;

        });
    }

    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    review_history(page) {
        this.selected_review_index = 0;
        this.page = page;
        this.helper.http.post('/admin/get_review_list', {
            start_date: this.start_date, end_date: this.end_date,
            sort_field: this.sort_field, sort_review: this.sort_review,
            search_field: this.search_field, search_value: this.search_value, page: this.page
        }).map((res: Response) => res.json()).subscribe(res_data => {
            this.myLoading = false;
            if (res_data.success == false) {

                this.review_list = [];
                this.total_pages = [];

            }
            else {

                this.review_list = res_data.reviews;

                this.total_page = res_data.pages;
                this.total_pages = Array(res_data.pages).fill((x, i) => i).map((x, i) => i + 1)
            }
        },
            (error: any) => {
                this.myLoading = false;
                this.helper.http_status(error);
            });
    }

    viewReviewDetail(id) {
        this.helper.router_id.admin.view_review_detail_id = id;
        this.helper.router.navigate(['admin/view_review_detail']);

    }



//    review_modal(id) {
//        this.review_id = id;
//        this.modal.open();
//      
//                
//    }
    
    review_modal(id , index)
    {
        this.review_id = id;
        this.modal.open()
        this.selected_review_index = index;
    }
    
    review_modal1(id , index)
    {
        this.review_id = id;
        this.modal1.open()
        this.selected_review_index = index;
    }
    
    review_modal2(id , index)
    {
        this.review_id = id;
        this.modal2.open()
        this.selected_review_index = index;
    }
    
    review_modal3(id , index)
    {
        this.review_id = id;
        this.modal3.open()
        this.selected_review_index = index;
    }
    review_modal4(id , index)
    {
        this.review_id = id;
        this.modal4.open()
        this.selected_review_index = index;
    }
    
     review_modal5(id , index)
    {
        this.review_id = id;
        this.modal5.open()
        this.selected_review_index = index;
    }
    
    

}
