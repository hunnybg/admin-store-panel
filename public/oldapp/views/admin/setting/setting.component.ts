import {Component, OnInit} from '@angular/core';
import {Helper} from "../../helper";
import {Http, Response} from '@angular/http';
declare var jQuery: any;

@Component({
    selector: 'app-setting',
    templateUrl: './setting.component.html',
    providers: [Helper]
})
export class settingComponent implements OnInit {

    title: any;
    button: any;
    heading_title: any;
    setting_tab_title: any;
    public message: string = "";
    public class: string;
    constructor(public helper: Helper) {

        setTimeout(() => {
            this.message = ""
            this.helper.data.storage = {
                "message": '',
                "class": ''
            }
        }, 3000);
    }

    activeRoute(routename: string): boolean {
        return this.helper.router.url.indexOf(routename) > -1;
    }

    ngOnInit() {
        this.title = this.helper.title;
        this.button = this.helper.button;
        this.heading_title = this.helper.heading_title;
        this.setting_tab_title = this.helper.setting_tab_title
    }
    close() {
        this.message = "";
    }

}
