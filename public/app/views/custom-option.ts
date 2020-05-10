import {ToastModule, ToastOptions} from 'ng2-toastr/ng2-toastr';
import { Injectable } from "@angular/core";

    @Injectable()
export class CustomOption extends ToastOptions {
        animate = 'flyRight';
        showCloseButton = true;
        positionClass = 'toast-top-center';
    }