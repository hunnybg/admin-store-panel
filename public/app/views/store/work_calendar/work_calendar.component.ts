import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, Renderer2 } from "@angular/core";
import { Helper } from "../../store_helper";
declare var jQuery: any;
declare var caleandar: any;
import { Response } from '@angular/http';


@Component({
  selector: 'app-work-calendar',
  templateUrl: './work_calendar.component.html',
  styleUrls: ['./work_calendar.component.css'],
  providers: [Helper],
})

export class WorkCalendarComponent implements OnInit, AfterViewInit, OnDestroy {

  calOptions: any = {};
  title: any;
  button: any;
  heading_title: any;
  VAITER_TYPES: any;
  VAITER_NUMBER_TYPES: any;

  date_value: any;
  shift_counts: any[] = [];
  shifts: any[] = [];
  whole_month_schedules: any[] = [];

  shift_date: Date;
  month: number;
  year: number;
  events: any[] = [];
  settings: any;

  store_id: string;
  myLoading: boolean = false;

  constructor(public helper: Helper, public rd: Renderer2) {

  }

  ngOnInit() {
    let store = JSON.parse(localStorage.getItem('store'));
    if (store) {
        this.store_id = store._id;
    } else {
        this.helper.router.navigate(['/store/login'])
    }
    if (this.helper.data.storage.message && this.helper.data.storage.message !== '') {
        this.helper.message()
    }

    this.title = this.helper.title;
    this.button = this.helper.button;
    this.heading_title = this.helper.heading_title;
    this.VAITER_TYPES = this.helper.VAITER_TYPES;
    this.myLoading = true;

    this.shift_date = new Date();
    this.settings = {
      Color: '',
      LinkColor: '',
      NavShow: true,
      NavVertical: false,
      NavLocation: '',
      DateTimeShow: true,
      DateTimeFormat: 'mmm, yyyy',
      DatetimeLocation: '',
      EventClick: '',
      EventTargetWholeDay: false,
      DisabledDays: [],
    };
    this.get_shifts_count();
    this.get_monthly_total_work();
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {

  }

  get_shifts_count() {
    this.helper.http.post(this.helper.POST_METHOD.GET_MONTHLY_SHIFT_COUNT, { shift_date: this.shift_date, store_id: this.store_id }).map((res: Response) => res.json()).subscribe(res_data => {
      if (res_data.success) {
        this.shift_counts = res_data.shift_times;
      } else {
        this.shift_counts = [];
      }
      let present_date = new Date()
      this.plot_calendar(present_date);
    })
  }

  get_monthly_total_work() {
    this.helper.http.post(this.helper.POST_METHOD.GET_MONTHLY_TOTAL_WORK, { shift_date: this.shift_date, store_id: this.store_id }).map((res: Response) => res.json()).subscribe(res_data => {
      if (res_data.success) {
        this.whole_month_schedules = res_data.shifts;
      } else {
        this.whole_month_schedules = [];
      }
    })
  }

  plot_calendar(date: Date) {
    this.myLoading = true;
    this.shift_date = new Date(date);
    this.month = this.shift_date.getMonth();
    this.year = this.shift_date.getFullYear();

    if(this.shift_counts.length == 0){
      this.events = [];
    }
    else{
      this.shift_counts.forEach((shift_yearly) => {
        let year = shift_yearly._id;
        shift_yearly.month_list.forEach((shift_monthly)=>{
          shift_monthly.day_list.forEach((day_list , day_index)=>{
            let event = {
              'Date':  new Date(year, shift_monthly.month-1, day_list.day),
              'Title': day_list.count,
              'Link': day_list.day
            }
            this.events.push(event);
          })
        })
        
      })
    }

    
    setTimeout(() => {
      let element = document.getElementById("caleandar");
      caleandar(element, this.events, this.settings);
      this.get_shifts_on_day(this.shift_date.getDate())
    }, 1000)

  }

  get_shifts_on_day(day) {
    this.shift_date = new Date(this.shift_date.setDate(day));
    this.helper.http.post(this.helper.POST_METHOD.GET_SHIFT_ON_SPECIFIC_DAY, { shift_date: this.shift_date, store_id: this.store_id }).map((res: Response) => res.json()).subscribe(res_data => {
      if (res_data.success) {
        this.shifts = res_data.shifts
      } else {
        this.shifts = [];
      }
      this.myLoading = false;
    })
  }

  change_month(order) {
    order = Number(order)
    this.month += order;
    this.shifts = [];
    this.shift_date = new Date(this.shift_date.setFullYear(this.year));
    this.shift_date = new Date(this.shift_date.setMonth(this.month));
    this.get_monthly_total_work();
  }
}