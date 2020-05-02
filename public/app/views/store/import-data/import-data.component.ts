import {Component, OnInit, ViewContainerRef} from "@angular/core";
import {Helper} from "../../store_helper";
import {Response} from "@angular/http";
declare var jQuery;

@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
    providers: [Helper]
})
export class ImportDataComponent implements OnInit {

    constructor(public helper: Helper, public vcr: ViewContainerRef){ }

    public formData = new FormData();
    type: number;
    store_id: string;


  ngOnInit() {
      var store = JSON.parse(localStorage.getItem('store'));
      if(store!==null)
      {
          this.store_id=store._id
      }
  }

    upload_excel($event, type) {
        this.type = type;
        this.formData = new FormData();
        const files = $event.target.files || $event.srcElement.files;
        const logo_image = files[0];
        this.formData.append('excel', logo_image);
    }

    upload_excel_data() {
        this.formData.append('type', this.type);
        this.formData.append('store_id', this.store_id);
        this.helper.http.post('/admin/upload_store_data_excel', this.formData).map((res: Response) => res.json()).subscribe(res_data => {
            jQuery('remove_'+this.type).click();
            this.formData = new FormData();
            this.type = undefined;
        });
    }

}
