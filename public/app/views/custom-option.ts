import {ToastModule, ToastOptions} from 'ng2-toastr/ng2-toastr';

    export class CustomOption extends ToastOptions {
        animate = 'flyRight';
        showCloseButton = true;
        positionClass = 'toast-top-center';
    }