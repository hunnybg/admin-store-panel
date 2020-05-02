import { Component,ElementRef,OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Data } from "./data";
import { Router, ActivatedRoute,  NavigationExtras} from '@angular/router';
import { TokenService } from 'angular2-auth';
import { price_validation } from '../constant';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import {IMyOptions, IMyDateModel} from 'mydatepicker';
import {Router_id} from "./routing_hidden_id";


import {ERROR_CODE_CONSTANT,ADMIN_DATA_ID, ORDER_STATE, WEEK, MONTH, DAY ,DATE_FORMAT, TIMEOUT, ADMIN_PROMO_FOR_ID, PROMO_RECURSION_ID, PROMO_RECURSION_STRING, PROMO_RECURSION ,WALLET_REQUEST_STATUS, ORDER_STATUS_ID,ADMIN_PROFIT_ON_DELIVERYS,ADMIN_PROFIT_ON_ORDERS,ADMIN_IMAGE_TYPES,ADMIN_PROMO_FOR_DELIVERY_SERVICE,ADMIN_PROMO_FOR,ADMIN_IMAGE_RATIO,ADMIN_URL} from "../constant";
import {TranslateService} from 'ng2-translate';


import {title, button,heading_title , status ,wallet_request_status, message ,tooltip_title,sub_menu_title, menu_title,lable_title,setting_tab_title} from './admin/admin_panel_string';
import {ERROR_CODE} from './admin/admin_panel_error_message';
import {MESSAGE_CODE} from './admin/admin_panel_success_message';
import {validation_message} from './admin/admin_panel_validation_message';

@Component({
    selector: 'helper'
})

export class Helper {

    ///// for constant ////////////
    public error_code : any = ERROR_CODE_CONSTANT;
    public ORDER_STATE : any = ORDER_STATE;
    public WALLET_REQUEST_STATUS : any = WALLET_REQUEST_STATUS;
    
    public ADMIN_PROFIT_ON_DELIVERYS : any = ADMIN_PROFIT_ON_DELIVERYS;
    public ADMIN_PROFIT_ON_ORDERS : any = ADMIN_PROFIT_ON_ORDERS;
    public ADMIN_IMAGE_TYPES : any = ADMIN_IMAGE_TYPES;
    public ADMIN_PROMO_FOR : any = ADMIN_PROMO_FOR;
    public ADMIN_PROMO_FOR_DELIVERY_SERVICE : any = ADMIN_PROMO_FOR_DELIVERY_SERVICE;
    public ADMIN_URL : any = ADMIN_URL;
    
    public ADMIN_PROMO_FOR_ID : any = ADMIN_PROMO_FOR_ID;
    
    public DATE_FORMAT : any = DATE_FORMAT;
    
    
    
    public TIMEOUT : any = TIMEOUT;
    public ADMIN_DATA_ID : any = ADMIN_DATA_ID;
    public ORDER_STATUS_ID:any = ORDER_STATUS_ID;
    public title: any = title;
    public button: any = button;
    public heading_title: any = heading_title;
    public ERROR_CODE: any = ERROR_CODE;
    public MESSAGE_CODE: any = MESSAGE_CODE;
    public status: any = status;
    public wallet_request_status: any = wallet_request_status;
    public image_ratio:any = ADMIN_IMAGE_RATIO;
    
    
    public messages:any = message;
    public lable_title:any = lable_title;
    public tooltip_title:any = tooltip_title;
    public sub_menu_title:any = sub_menu_title;
    
    public setting_tab_title:any = setting_tab_title;
    
    
    public menu_title:any = menu_title;
    public validation_message:any = validation_message;


    public WEEK: any = WEEK;
    public MONTH: any = MONTH;
    public DAY: any = DAY;
    public PROMO_RECURSION_ID: any = PROMO_RECURSION_ID;
    public PROMO_RECURSION_STRING: any = PROMO_RECURSION_STRING;
    public PROMO_RECURSION: any = PROMO_RECURSION;

   	constructor(public trans:TranslateService, public http:Http , public route: ActivatedRoute ,  public  router_id: Router_id, public toastr: ToastsManager , public router: Router,  public elementRef:ElementRef, public data: Data, public tokenService: TokenService) {

            
    }
    
    message() {
            this.toastr.dispose();
            if(this.data.storage.message !== '')
            {
                if(this.data.storage.class == "alert-info")
                {
                    var a = this.data.storage.message;
                    // this.toastr.success(this.data.storage.message, null, {toastLife: TIMEOUT.TOASTER_NOTIFICATION})
                   this.toastr.custom('<span>' + this.data.storage.message + '</span>', null, {enableHTML: true, toastLife: TIMEOUT.TOASTER_NOTIFICATION});
                    
                }
                else if(this.data.storage.class == "alert-danger")
                {

                    if(this.data.storage.code == this.error_code.TOKEN_EXPIRED || this.data.storage.code == this.error_code.STORE_DATA_NOT_FOUND)
                    {
                        this.router.navigate(['store/logout']);
                    }
                    this.toastr.custom('<span>' + this.data.storage.message + '</span>', null, {enableHTML: true, toastLife: TIMEOUT.TOASTER_NOTIFICATION});
                    // this.toastr.error(this.data.storage.message, null, {toastLife: TIMEOUT.TOASTER_NOTIFICATION})

                }
                this.data.storage = {
                    "code": '',
                    "message": '',
                    "class": ''
                }
            }
        }

        
        
        downloadFile(data: Response) {
            var blob = new Blob([data], {type: 'text/csv'});
            var url = window.URL.createObjectURL(blob);
            var element = document.createElement('a');
            element.setAttribute('href', url);
            element.setAttribute('download', url + '.csv');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
        
        
        
//        downloadExcelFile(data: Response) {
//            var blob = new Blob([data], {type: 'text/xlsx'});
//            var url = window.URL.createObjectURL(blob);
//            var element = document.createElement('a');
//            element.setAttribute('href', url);
//            element.setAttribute('download', url + '.xlsx');
//            element.style.display = 'none';
//            document.body.appendChild(element);
//            element.click();
//            document.body.removeChild(element);
//        }
        

        http_status(error)
        {
            if (error.status === 500) {
                console.log("Internal Server Error")
            }
            else if (error.status === 502) {
                console.log("Bad Gateway")
            }
            else if (error.status === 404) {
               console.log("Url Not Found")
            }
            if (error.status === 403) {
                console.log("Forbidden Error")
            }
            else if (error.status === 503) {
                console.log("Service Unavailable")
            }
            else if (error.status === 504) {
                console.log("Gateway Timeout")
            }
            else if (error.status === 408) {
                console.log("Request Timeout")
            }
            else if (error.status === 413) {
                console.log("Request Entity To Large")
            }
        }

        private myStartDatePickerOptions: IMyOptions = {
            // other options...
            dateFormat: 'mm-dd-yyyy',
            openSelectorOnInputClick: true,
            showInputField:true,
            showClearDateBtn:false,
            editableMonthAndYear:false,
            editableDateField:false,
            disableUntil:{year: null, month: null, day: null},
            selectionTxtFontSize: '13px',
            alignSelectorRight:false,
            disableSince: {year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()+1}
        };
        private myEndDatePickerOptions: IMyOptions = {
            // other options...
            dateFormat: 'mm-dd-yyyy',
            openSelectorOnInputClick: true,
            showInputField:true,
            showClearDateBtn:false,
            editableMonthAndYear:false,
            editableDateField:false,
            disableUntil:{year: null, month: null, day: null},
            selectionTxtFontSize: '13px',
            alignSelectorRight:true,
            disableSince: {year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()+1}
        };
        
        
        private ExpiryDatePickerOptions: IMyOptions = {
            // other options...
            dateFormat: 'mm-dd-yyyy',
            openSelectorOnInputClick: true,
            showInputField:true,
            showClearDateBtn:false,
            editableMonthAndYear:false,
            editableDateField:false,
            disableUntil:{year: new Date().getFullYear(), month: new Date().getMonth(), day: new Date().getDate()-1},
            selectionTxtFontSize: '13px',
            alignSelectorRight:false,
            disableSince: {year: 0, month: 0, day: 0}
        };
        
        onStartDateChanged(event: IMyDateModel) {
            // event properties are: event.date, event.jsdate, event.formatted and event.epoc
            if(event.date.day !== 0)
            {
                this.myEndDatePickerOptions.disableUntil.year=event.date.year;
                this.myEndDatePickerOptions.disableUntil.month=event.date.month;
                this.myEndDatePickerOptions.disableUntil.day=event.date.day;
            }
            else
            {
                this.myEndDatePickerOptions.disableUntil.year=null;
                this.myEndDatePickerOptions.disableUntil.month=null;
                this.myEndDatePickerOptions.disableUntil.day=null;
            }
        }
        onEndDateChanged(event: IMyDateModel) {
            // event properties are: event.date, event.jsdate, event.formatted and event.epoc
            if(event.date.day !== 0)
            {
                this.myStartDatePickerOptions.disableSince.year=event.date.year;
                this.myStartDatePickerOptions.disableSince.month=event.date.month;
                this.myStartDatePickerOptions.disableSince.day=event.date.day;
            }
            else
            {
                this.myStartDatePickerOptions.disableSince.year=new Date().getFullYear();
                this.myStartDatePickerOptions.disableSince.month=new Date().getMonth()+1;
                this.myStartDatePickerOptions.disableSince.day=new Date().getDate()+1;
            }
        }
        
        
        
         /// date picker for promo code //
        
         private promocodeStartDatePickerOptions: IMyOptions = {
            // other options...
            dateFormat: 'mm-dd-yyyy',
            openSelectorOnInputClick: false,
            showInputField:true,
            showClearDateBtn:false,
            editableMonthAndYear:false,
            editableDateField:false,
            disableUntil:{year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()-1},
            selectionTxtFontSize: '13px',
            alignSelectorRight:true,
             disableSince: {year: 0, month: 0, day: 0}
        };
        private promocodeEndDatePickerOptions: IMyOptions = {
            // other options...
            dateFormat: 'mm-dd-yyyy',
            openSelectorOnInputClick: false,
            showInputField:true,
            showClearDateBtn:false,
            editableMonthAndYear:false,
            editableDateField:false,
            disableUntil:{year: new Date().getFullYear(), month: new Date().getMonth()+1, day: new Date().getDate()-1},
            selectionTxtFontSize: '13px',
            alignSelectorRight:true,
            disableSince: {year: 0, month: 0, day: 0}
        };


        promocodeOnStartDateChanged(event: IMyDateModel) {
            // event properties are: event.date, event.jsdate, event.formatted and event.epoc
            if(event.date.day !== 0)
            {
                this.promocodeEndDatePickerOptions.disableUntil.year=event.date.year;
                this.promocodeEndDatePickerOptions.disableUntil.month=event.date.month;
                this.promocodeEndDatePickerOptions.disableUntil.day=event.date.day-1;
            }
            else
            {
                this.promocodeEndDatePickerOptions.disableUntil.year=null;
                this.promocodeEndDatePickerOptions.disableUntil.month=null;
                this.promocodeEndDatePickerOptions.disableUntil.day=null;
            }
        }
        promocodeOnEndDateChanged(event: IMyDateModel) {
            // event properties are: event.date, event.jsdate, event.formatted and event.epoc
            if(event.date.day !== 0)
            {
                this.promocodeStartDatePickerOptions.disableSince.year=event.date.year;
                this.promocodeStartDatePickerOptions.disableSince.month=event.date.month;
                this.promocodeStartDatePickerOptions.disableSince.day=event.date.day+1;
            }
            else
            {
                this.promocodeStartDatePickerOptions.disableSince.year=new Date().getFullYear();
                this.promocodeStartDatePickerOptions.disableSince.month=new Date().getMonth()+1;
                this.promocodeStartDatePickerOptions.disableSince.day=new Date().getDate()+1;
            }
        }
       
        
        ////

        number_validation(evt)
        {
            
            
            var charCode = (evt.which) ? evt.which : evt.keyCode
            if (charCode > 31 && (charCode < 48 || charCode > 57))
            {
                if( charCode == 46)
                {
                        return true;
                }
                else
                {
                        return false;
                }
            }
            return true;
        }
        
        location_validation(evt)
        {
            var charCode = (evt.which) ? evt.which : evt.keyCode
            if ((charCode > 31 && (charCode < 48 || charCode > 57)))
            {
                if( charCode == 46 || charCode == 45)
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }
            return true;
        }
        
        
        
        
        
        

        price_validation(evt, price)
        {
            var charCode = (evt.which) ? evt.which : evt.keyCode
            price = price.toString();
            price = price.split(".");
            if(price[0] <= price_validation.MAX_PRICE)
            {
                if(price[1] == undefined)
                {
                    if (charCode > 31 && (charCode < 48 || charCode > 57))
                    {
                        if( charCode == 46 && price[0] > 1)
                        {
                                return true;
                        }
                        return false;
                    }
                    return true;
                }
                else
                {
                    if(price[1] <= price_validation.MAX_PRICE_AFTER_POINT)
                    {
                        if (charCode > 31 && (charCode < 48 || charCode > 57))
                        {
                            return false;
                        }
                        return true;
                    }
                    else
                    {
                        if(charCode == 8)
                        {
                            return true;
                        }
                        return false;
                    }
                }
            }
            else
            {
                if(price[1] != undefined)
                {
                    if(price[1] <= price_validation.MAX_PRICE_AFTER_POINT)
                    {
                        if (charCode > 31 && (charCode < 48 || charCode > 57))
                        {
                            return false;
                        }
                        return true;
                    }
                    else
                    {
                        if(charCode == 8)
                        {
                            return true;
                        }
                        return false;
                    }
                }
                else
                {
                    if(charCode == 46 || charCode == 8)
                    {
                        return true;
                    }
                    return false;
                }

            }
        }
        
        
        
        getIDFromEmailToken(email_token) {

            var server_token = "", id = "", milli = "";
            var milli_seconds = 0;
            var length = 30; // 13 milli seconds so * 2 => 26

            var milli_token = email_token.substr(0, length);
            var id_token = email_token.substr(length);

            for (var i = 0; i < length; i++) {
                if (i % 2 == 0) {
                    milli = milli + milli_token.charAt(i);
                } else {
                    server_token = server_token + milli_token.charAt(i);
                }
            }

            milli = milli.split("").reverse().join("");
            milli_seconds = parseInt(milli);

            length = id_token.length;
            for (var i = 0; i < length; i++) {
                if (i % 2 == 0) {
                    id = id + id_token.charAt(i);
                } else {
                    server_token = server_token + id_token.charAt(i);
                }
            }
            return {id:id , server_token:server_token , milli_seconds : milli_seconds};

        }
}
