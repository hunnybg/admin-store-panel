import { Routes, RouterModule } from "@angular/router";

/////////////admin basic route
import { admin_blankComponent } from "./common/admin/layouts/admin_blank.component";
import { admin_basicComponent } from "./common/admin/layouts/admin_basic.component";


////////// admin panel route

import { admin_loginComponent } from "./views/admin/admin_login/admin_login.component";

import { AdminForgotPasswordComponent } from "./views/admin/admin_forgot_password/admin_forgot_password.component";
import { UserNewPasswordComponent } from "./views/admin/user_new_password/user_new_password.component";
import { ProviderNewPasswordComponent } from "./views/admin/provider_new_password/provider_new_password.component";
import { AdminNewPasswordComponent } from "./views/admin/admin_new_password/admin_new_password.component";

import { CancellationReasonComponent } from "./views/admin/cancellation_reason/cancellation_reason.component";
import { MassNotificationComponent } from "./views/admin/mass_notification/mass_notification.component";
import { EditProviderVehicleComponent } from "./views/admin/edit_provider_vehicle/edit_provider_vehicle.component";
import { settingComponent } from "./views/admin/setting/setting.component";
import { HistoryComponent } from "./views/admin/history/history.component";
import { DeliveriesComponent } from "./views/admin/deliveries/deliveries.component";
import { OrderComponent } from "./views/admin/order/order.component";
import { AdminViewCartComponent } from "./views/admin/admin_view_cart/admin_view_cart.component";

import { WalletRequestBankDetailComponent } from "./views/admin/wallet_request_bank_detail/wallet_request_bank_detail.component";

import { TransLanguageComponent } from "./views/admin/trans_language/trans_language.component";

import { AddDetailComponent } from "./views/admin/add_detail/add_detail.component";
import { EarningComponent } from "./views/admin/earning/earning.component";

import { AdminComponent } from "./views/admin/admin/admin.component";
import { DatabaseBackupComponent } from "./views/admin/database_backup/database_backup.component";
import { AddAdminComponent } from "./views/admin/add_admin/add_admin.component";
import { SmsComponent } from "./views/admin/sms/sms.component";
import { EmailComponent } from "./views/admin/email/email.component";
import { OrderEarningComponent } from "./views/admin/order_earning/order_earning.component";

import { WalletRequestComponent } from "./views/admin/wallet_request/wallet_request.component";
import { AddAdvertiseComponent } from "./views/admin/add_advertise/add_advertise.component";



import { RequestCancelReasonComponent } from "./views/admin/request_cancel_reason/request_cancel_reason.component";


import { VehicleDocumentComponent } from "./views/admin/vehicle_document/vehicle_document.component";


import { AdvertiseComponent } from "./views/admin/advertise/advertise.component";
import { countryComponent } from "./views/admin/country/country.component";
import { ProviderVehicleComponent } from "./views/admin/provider_vehicle/provider_vehicle.component";
import { ProviderComponent } from "./views/admin/provider/provider.component";
import { ViewBankDetailComponent } from "./views/admin/view_bank_detail/view_bank_detail.component";

import { LocationTrackComponent } from "./views/admin/location_track/location_track.component";

import { StoreWeeklyEarningComponent } from "./views/admin/store_weekly_earning/store_weekly_earning.component";
import { ProviderWeeklyEarningComponent } from "./views/admin/provider_weekly_earning/provider_weekly_earning.component";


import { ViewInvoiceComponent } from "./views/admin/view_invoice/view_invoice.component";
import { ViewHistoryComponent } from "./views/admin/view_history/view_history.component";
import { ViewProviderHistoryComponent } from "./views/admin/view_provider_history/view_provider_history.component";



import { ViewDocumentComponent } from "./views/admin/view_document/view_document.component";
import { UserComponent } from "./views/admin/user/user.component";
import { ViewReferralDetailComponent } from "./views/admin/view_referral_detail/view_referral_detail.component";
import { WalletHistoryComponent } from "./views/admin/wallet_history/wallet_history.component";

import { AddDocumentComponent } from "./views/admin/add_document/add_document.component";
import { PromoCodeComponent } from "./views/admin/promo_code/promo_code.component";
import { AddPromoCodeComponent } from "./views/admin/add_promo_code/add_promo_code.component";

import { ViewPromoUsesComponent } from "./views/admin/view_promo_uses/view_promo_uses.component";
import { ReviewComponent } from "./views/admin/review/review.component";
import { ViewReviewDetailComponent } from "./views/admin/view_review_detail/view_review_detail.component";

import { UploadDocumentComponent } from "./views/admin/upload_document/upload_document.component";
import { DocumentComponent } from "./views/admin/document/document.component";
import { StoresComponent } from "./views/admin/stores/stores.component";

import { AddCountryComponent } from "./views/admin/add_country/add_country.component";
import { AddCityComponent } from "./views/admin/add_city/add_city.component";
import { cityComponent } from "./views/admin/city/city.component";
import { VehicleComponent } from "./views/admin/vehicle/vehicle.component";
import { AddVehicleComponent } from "./views/admin/add_vehicle/add_vehicle.component";
import { DeliveryComponent } from "./views/admin/delivery/delivery.component";
import { AddDeliveryComponent } from "./views/admin/add_delivery/add_delivery.component";
import { ServiceComponent } from "./views/admin/service/service.component";
import { AddServiceComponent } from "./views/admin/add_service/add_service.component";
import { ProviderMapComponent } from "./views/admin/provider_map/provider_map.component";
import { StoreMapComponent } from "./views/admin/store_map/store_map.component";
import { ViewServiceDetailComponent } from "./views/admin/view_service_detail/view_service_detail.component";
import { BasicSettingComponent } from "./views/admin/basic_setting/basic_setting.component";
import { InstallationSettingComponent } from "./views/admin/installation_setting/installation_setting.component";
import { OtherSettingComponent } from "./views/admin/other_setting/other_setting.component";
import { GoogleKeySettingComponent } from "./views/admin/google_key_setting/google_key_setting.component";
import { AppUpdateSettingComponent } from "./views/admin/app_update_setting/app_update_setting.component";
import { IosPushNotificationSettingComponent } from "./views/admin/ios_push_notification_setting/ios_push_notification_setting.component";
import { AppSettingComponent } from "./views/admin/app_setting/app_setting.component";

import { PaymentGatewayComponent } from "./views/admin/payment_gateway/payment_gateway.component";
import { DashboardComponent } from "./views/admin/dashboard/dashboard.component";

import { ImageSettingComponent } from "./views/admin/image_setting/image_setting.component";

/////////////// store basic route
import { store_blankComponent } from "./common/store/layouts/store_blank.component";
import { store_basicComponent } from "./common/store/layouts/store_basic.component";
///////// store panel route
import { StoreCreateOrderWithoutItemOrderComponent } from "./views/store/create_order_without_item/create_order_without_item.component";
import { store_loginComponent } from "./views/store/store_login/store_login.component";
import { store_registerComponent } from "./views/store/store_register/store_register.component";
import { StoreForgotPasswordComponent } from "./views/store/store_forgot_password/store_forgot_password.component";
import { StoreLogoutComponent } from "./views/store/store_logout/store_logout.component";
import { StoreNewPasswordComponent } from "./views/store/store_new_password/store_new_password.component";
import { ProfileComponent } from "./views/store/profile/profile.component";
import { OrderEarningDetailComponent } from "./views/store/order_earning_detail/order_earning_detail.component";

import { StoreCreateOrderComponent } from "./views/store/store_create_order/store_create_order.component";
import { StoreCheckoutOrderComponent } from "./views/store/checkout_order/checkout_order.component";



import { StoreDailyEarningComponent } from "./views/store/daily_earning/daily_earning.component";
import { StorWeeklyEarningComponent } from "./views/store/weekly_earning/weekly_earning.component";

import { ProductsComponent } from "./views/store/products/products.component";
import { EditProductComponent } from "./views/store/edit_product/edit_product.component";
import { SpecificationComponent } from "./views/store/specification/specification.component";
import { ItemComponent } from "./views/store/item/item.component";
import { AddItemComponent } from "./views/store/add_item/add_item.component";
import { EditItemComponent } from "./views/store/edit_item/edit_item.component";
import { StoreDeliveryComponent } from "./views/store/delivery/delivery.component";
import { StoreEarningComponent } from "./views/store/earning/earning.component";
import { StoreHistoryComponent } from "./views/store/history/history.component";
import { StoreOrderComponent } from "./views/store/order/order.component";
import { SettingComponent } from "./views/store/setting/setting.component";
import { StoreViewOrderComponent } from "./views/store/view_order/view_order.component";
import { StoreViewOrderDetailComponent } from "./views/store/view_order_detail/view_order_detail.component";
import { StoreViewOrderActivityComponent } from "./views/store/view_order_activity/view_order_activity.component";
import { StoreTrackDeliveryManComponent } from "./views/store/track_delivery_man/track_delivery_man.component";
import { StoreUploadDocumentComponent } from "./views/store/upload_document/upload_document.component";

import { StoreViewCartComponent } from "./views/store/view_cart/view_cart.component";

import { StorePromoCodeComponent } from "./views/store/promo_code/promo_code.component";
import { StoreAddPromoCodeComponent } from "./views/store/add_promo_code/add_promo_code.component";

import { StoreEditOrderComponent } from "./views/store/edit_order/edit_order.component";

/////frenchaise route
import { franchise_loginComponent } from "./views/franchise/franchise_login/franchise_login.component";
import { franchise_registerComponent } from "./views/franchise/franchise_register/franchise_register.component";
import { FranchiseForgotPasswordComponent } from "./views/franchise/franchise_forgot_password/franchise_forgot_password.component";
import { FranchiseLogoutComponent } from "./views/franchise/franchise_logout/franchise_logout.component";
import { FranchiseNewPasswordComponent } from "./views/franchise/franchise_new_password/franchise_new_password.component";
import { franchise_blankComponent } from "./common/franchise/layouts/franchise_blank.component";
import { franchise_basicComponent } from "./common/franchise/layouts/franchise_basic.component";
import { FranchiseProductsComponent } from "./views/franchise/products/products.component";
import { FranchiseStoresComponent } from "./views/franchise/stores/stores.component";
import { EditFranchiseStoreComponent } from "./views/franchise/edit_store/edit_store.component";
import { AddFranchiseStoreComponent } from "./views/franchise/add_store/add_store.component";
import { EditFranchiseProductComponent } from "./views/franchise/edit_product/edit_product.component";
import { FranchiseSpecificationComponent } from "./views/franchise/specification/specification.component";
import { FranchiseItemComponent } from "./views/franchise/item/item.component";
import { FranchiseStoreItemComponent } from "./views/franchise/store_item/store_item.component";
import { EditFranchiseItemComponent } from "./views/franchise/edit_item/edit_item.component";
import { AddFranchiseItemComponent } from "./views/franchise/add_item/add_item.component";
import { FranchiseStoreOrderComponent } from "./views/franchise/order/order.component";
import { FranchiseStoreHistoryComponent } from "./views/franchise/history/history.component";
import { FranchiseStoreDeliveryComponent } from "./views/franchise/delivery/delivery.component";
import { FranchiseStoreViewOrderComponent } from "./views/franchise/view_order/view_order.component";
import { FranchiseStoreViewCartComponent } from "./views/franchise/view_cart/view_cart.component";
import { FranchiseOrderEarningDetailComponent } from "./views/franchise/order_earning_detail/order_earning_detail.component";
import { FranchiseStoreTrackDeliveryManComponent } from "./views/franchise/track_delivery_man/track_delivery_man.component";
import { FranchiseProfileComponent } from "./views/franchise/profile/profile.component";
import { ViewFranchiseStoreDetailComponent } from "./views/franchise/view_store_detail/view_store_detail.component";
import { FranchisesComponent } from "./views/admin/franchises/franchises.component";
import { AllCityComponent } from "./views/admin/all-city/all-city.component";
import { StoreOrderComponents } from "./views/store/order_new/order.component";
import { AdminSettingComponent } from "./views/admin/store_setting/setting.component";
import { AdminProductsComponent } from "./views/admin/store_products/products.component";
import { TransactionHistoryComponent } from "./views/admin/transaction_history/transaction_history.component";
import { ImportDataComponent } from "./views/store/import-data/import-data.component";
import { StoreProviderComponent } from "./views/store/provider/provider.component";
import { StoreServiceComponent } from "./views/store/service/service.component";
import { StoreAddServiceComponent } from "./views/store/add_service/add_service.component";
import { VaiterComponent } from "./views/store/vaiter/vaiter.component";
import { RequestAssistanceComponent } from "./views/store/request_assistance/request_assistance.component";
import { VaitersComponent } from "./views/admin/vaiters/vaiters.component";
import { AdminRequestAssistanceComponent } from "./views/admin/request_assistance/request_assistance.component";
import { PaymentsComponent } from "./views/store/payments/payments.component";
import { VaiterEarningComponent } from "./views/store/vaiter_earning/vaiter_earning.component";
import { WorkCalendarComponent } from "./views/store/work_calendar/work_calendar.component";
import { TableRequestsComponent } from "./views/store/table_requests/table_requests.component";
import { TicketComponent } from "./views/admin/ticket/ticket.component";
import { ContactAdminComponent } from "./views/store/contact_admin/contact_admin.component";
import { StoreOwnerRegisterComponent } from "./views/store/store_owner_register/store_owner_register.component";
import { StoreOwnerDashboardComponent } from "./views/store/store_owner_dashboard/store_owner_dashboard.component";
// import {HistoryCalenderComponent} from "./views/store/history_calender/history_calender.component";
export const ROUTES: Routes = [
    // Main redirect
    { path: '', redirectTo: 'admin/login', pathMatch: 'full' },

    // Handle all other routes


    // App views
    {
        path: '', component: admin_basicComponent,
        children: [
            { path: 'admin/country', component: countryComponent },
            { path: 'admin/providers', component: ProviderComponent },
            { path: 'admin/wallet_detail', component: WalletHistoryComponent },
            { path: 'admin/transaction_history', component: TransactionHistoryComponent },
            { path: 'admin/review', component: ReviewComponent },
            { path: 'admin/view_review_detail', component: ViewReviewDetailComponent },
            { path: 'admin/upload_document', component: UploadDocumentComponent },
            { path: 'admin/edit_vehicle', component: EditProviderVehicleComponent },
            { path: 'admin/provider/view_document', component: ViewDocumentComponent },
            { path: 'admin/provider/view_bank_detail', component: ViewBankDetailComponent },
            { path: 'admin/cancellation_reason', component: CancellationReasonComponent },
            { path: 'admin/request_cancel_reason', component: RequestCancelReasonComponent },
            { path: 'admin/add_advertise', component: AddAdvertiseComponent },
            { path: 'admin/advertise', component: AdvertiseComponent },
            { path: 'admin/advertise/edit', component: AddAdvertiseComponent },
            { path: 'admin/wallet_request', component: WalletRequestComponent },
            { path: 'admin/add_detail', component: AddDetailComponent },
            { path: 'admin/provider_location', component: ProviderMapComponent },
            { path: 'admin/store_location', component: StoreMapComponent },
            { path: 'admin/earnings', component: EarningComponent },
            { path: 'admin/view_cart', component: AdminViewCartComponent },
            { path: 'admin/referral_detail', component: ViewReferralDetailComponent },
            { path: 'admin/language', component: TransLanguageComponent },
            { path: 'admin/view_promo_uses', component: ViewPromoUsesComponent },
            { path: 'admin/sms', component: SmsComponent },
            { path: 'admin/email', component: EmailComponent },
            { path: 'admin/provider_vehicles', component: ProviderVehicleComponent },
            { path: 'admin/provider_vehicle_documents', component: VehicleDocumentComponent },
            { path: 'admin/service/view_detail', component: ViewServiceDetailComponent },
            { path: 'admin/provider/view_history', component: ViewProviderHistoryComponent },
            { path: 'admin/store/view_history', component: ViewHistoryComponent },
            { path: 'admin/user/view_history', component: ViewHistoryComponent },
            { path: 'admin/view_bank_detail', component: WalletRequestBankDetailComponent },
            { path: 'admin/order_earning', component: OrderEarningComponent },
            { path: 'admin/store_weekly_earning', component: StoreWeeklyEarningComponent },
            { path: 'admin/provider_weekly_earning', component: ProviderWeeklyEarningComponent },
            { path: 'admin/dashboard', component: DashboardComponent },
            { path: 'admin/view_invoice', component: ViewInvoiceComponent },
            { path: 'admin/user/view_document', component: ViewDocumentComponent },
            { path: 'admin/store/view_document', component: ViewDocumentComponent },
            { path: 'admin/users', component: UserComponent },
            { path: 'admin/document', component: DocumentComponent },
            { path: 'admin/promotions', component: PromoCodeComponent },
            { path: 'admin/promo/edit', component: AddPromoCodeComponent },
            { path: 'admin/add_promo_code', component: AddPromoCodeComponent },
            { path: 'admin/add_document', component: AddDocumentComponent },
            { path: 'admin/document/edit', component: AddDocumentComponent },
            { path: 'admin/stores', component: StoresComponent },
            { path: 'admin/store/setting', component: AdminSettingComponent },
            { path: 'admin/store/products', component: AdminProductsComponent },
            { path: 'admin/history', component: HistoryComponent },
            { path: 'admin/deliveries', component: DeliveriesComponent },
            { path: 'admin/orders', component: OrderComponent },
            { path: 'admin/list', component: AdminComponent },
            { path: 'admin/database_backup', component: DatabaseBackupComponent },
            { path: 'admin/location_track', component: LocationTrackComponent },
            { path: 'admin/add', component: AddAdminComponent },
            { path: 'admin/edit', component: AddAdminComponent },
            { path: 'admin/add_country', component: AddCountryComponent },
            { path: 'admin/city', component: cityComponent },
            { path: 'admin/add_city', component: AddCityComponent },
            { path: 'admin/delivery', component: DeliveryComponent },
            { path: 'admin/add_delivery', component: AddDeliveryComponent },
            { path: 'admin/vehicle', component: VehicleComponent },
            { path: 'admin/add_vehicle', component: AddVehicleComponent },
            { path: 'admin/service', component: ServiceComponent },
            { path: 'admin/add_service', component: AddServiceComponent },
            { path: 'admin/service/edit', component: AddServiceComponent },
            { path: 'admin/delivery/edit', component: AddDeliveryComponent },
            { path: 'admin/vehicle/edit', component: AddVehicleComponent },
            { path: 'admin/country/edit', component: AddCountryComponent },
            { path: 'admin/city/edit', component: AddCityComponent },
            { path: 'admin/payment_gateway', component: PaymentGatewayComponent },
            { path: 'admin/all-city', component: AllCityComponent },
            { path: 'admin/mass_notification', component: MassNotificationComponent },
            { path: 'admin/franchises', component: FranchisesComponent },
            { path: 'admin/declined_franchises', component: FranchisesComponent },
            { path: 'admin/business_off_franchises', component: FranchisesComponent },
            { path: 'admin/vaiters', component: VaitersComponent },
            { path: 'admin/request_assistance', component: AdminRequestAssistanceComponent },
            { path: 'admin/tickets', component: TicketComponent }
        ]


    },
    {
        path: '', component: admin_basicComponent,
        children: [
            {
                path: 'setting', component: settingComponent,
                children: [
                    { path: 'basic_setting', component: BasicSettingComponent },
                    { path: 'installation_setting', component: InstallationSettingComponent },
                    { path: 'other_setting', component: OtherSettingComponent },
                    { path: 'google_key_setting', component: GoogleKeySettingComponent },
                    { path: 'app_update_setting', component: AppUpdateSettingComponent },
                    { path: 'ios_push_notification_setting', component: IosPushNotificationSettingComponent },
                    { path: 'app_setting', component: AppSettingComponent },
                    { path: 'image_setting', component: ImageSettingComponent }

                ]
            }
        ]
    },
    {
        path: '', component: admin_blankComponent,
        children: [

            { path: 'admin/login', component: admin_loginComponent },

            { path: 'admin/forgot_password', component: AdminForgotPasswordComponent },

            { path: 'admin/new_password/:email_token', component: AdminNewPasswordComponent },
            { path: 'user/new_password/:email_token', component: UserNewPasswordComponent },
            { path: 'provider/new_password/:email_token', component: ProviderNewPasswordComponent }


        ]
    },
    {
        path: '', component: store_blankComponent,
        children: [
            { path: 'store/login', component: store_loginComponent },
            { path: 'store/register', component: store_registerComponent },
            { path: 'store/forgot_password', component: StoreForgotPasswordComponent },
            { path: 'store/new_password/:email_token', component: StoreNewPasswordComponent },
            { path: 'store/logout', component: StoreLogoutComponent },
            { path: 'store/owner_register', component: StoreOwnerRegisterComponent },
            { path: 'store/owner_dashboard', component: StoreOwnerDashboardComponent }

        ]
    },
    {
        path: '', component: franchise_blankComponent,
        children: [
            { path: 'franchise/login', component: franchise_loginComponent },
            { path: 'franchise/register', component: franchise_registerComponent },
            { path: 'franchise/forgot_password', component: FranchiseForgotPasswordComponent },
            { path: 'franchise/new_password/:email_token', component: FranchiseNewPasswordComponent },
            { path: 'franchise/logout', component: FranchiseLogoutComponent }
        ]
    },
    {
        path: '', component: franchise_basicComponent,
        children: [

            { path: 'franchise/profile', component: FranchiseProfileComponent },
            { path: 'franchise/product', component: FranchiseProductsComponent },

            { path: 'franchise/stores', component: FranchiseStoresComponent },
            { path: 'franchise/add_store', component: AddFranchiseStoreComponent },
            { path: 'franchise/store/view_detail', component: ViewFranchiseStoreDetailComponent },
            { path: 'franchise/declined_store', component: FranchiseStoresComponent },
            { path: 'franchise/business_off_store', component: FranchiseStoresComponent },
            { path: 'franchise/store/edit', component: EditFranchiseStoreComponent },
            { path: 'franchise/product/edit', component: EditFranchiseProductComponent },
            { path: 'franchise/product/specification', component: FranchiseSpecificationComponent },
            { path: 'franchise/item', component: FranchiseItemComponent },
            { path: 'franchise/store_item', component: FranchiseStoreItemComponent },
            { path: 'franchise/item/edit', component: EditFranchiseItemComponent },
            { path: 'franchise/add_item', component: AddFranchiseItemComponent },
            { path: 'franchise/order', component: FranchiseStoreOrderComponent, data: { myData: "TEST" } },
            { path: 'franchise/history', component: FranchiseStoreHistoryComponent },
            { path: 'franchise/deliveries', component: FranchiseStoreDeliveryComponent },
            { path: 'franchise/order/detail', component: FranchiseStoreViewOrderComponent },
            { path: 'franchise/cart/detail', component: FranchiseStoreViewCartComponent },
            { path: 'franchise/order_earning_detail', component: FranchiseOrderEarningDetailComponent },
            { path: 'franchise/track_delivery_man', component: FranchiseStoreTrackDeliveryManComponent },
        ]
    },
    {
        path: '', component: store_basicComponent,
        children: [

            { path: 'store/profile', component: ProfileComponent },
            { path: 'store/product', component: ProductsComponent },
            { path: 'store/import_data', component: ImportDataComponent },
            // {path: 'store/product/edit', component: EditProductComponent},
            // {path: 'store/product/specification', component: SpecificationComponent},

            // {path: 'store/item', component: ItemComponent},
            { path: 'store/create_order_without_item', component: StoreCreateOrderWithoutItemOrderComponent },
            // {path: 'store/item/edit', component: EditItemComponent},
            // {path: 'store/add_item', component: AddItemComponent},
            { path: 'store/order', component: StoreOrderComponents },
            { path: 'store/deliveries', component: StoreDeliveryComponent },
            { path: 'store/history', component: StoreHistoryComponent },
            { path: 'store/earning', component: StoreEarningComponent },
            { path: 'store/providers', component: StoreProviderComponent },
            { path: 'store/service', component: StoreServiceComponent },
            { path: 'store/add_service', component: StoreAddServiceComponent },
            { path: 'store/service/edit', component: StoreAddServiceComponent },
            { path: 'store/daily_earning', component: StoreDailyEarningComponent },
            { path: 'store/weekly_earning', component: StorWeeklyEarningComponent },
            { path: 'store/upload_document', component: StoreUploadDocumentComponent },
            { path: 'store/cart/detail', component: StoreViewCartComponent },

            { path: 'store/edit/order', component: StoreEditOrderComponent },

            { path: 'store/create_order', component: StoreCreateOrderComponent },
            { path: 'store/invoice', component: StoreCheckoutOrderComponent },

            { path: 'store/promocode', component: StorePromoCodeComponent },
            { path: 'store/add_promocode', component: StoreAddPromoCodeComponent },
            { path: 'store/promo/edit', component: StoreAddPromoCodeComponent },

            { path: 'store/setting', component: SettingComponent },
            { path: 'store/order/track_delivery_man', component: StoreTrackDeliveryManComponent },

            //BM
            { path: 'store/vaiter', component: VaiterComponent },
            { path: 'store/request_assistances', component: RequestAssistanceComponent },
            { path: 'store/payments', component: PaymentsComponent },
            { path: 'store/vaiter_earning', component: VaiterEarningComponent },
            { path: 'store/work_calender', component: WorkCalendarComponent },
            { path: 'store/table_requests', component: TableRequestsComponent },
            { path: 'store/contact_admin', component: ContactAdminComponent },


        ]
    },
    {
        path: '', component: store_basicComponent,

    },
    // Handle all other routes
    { path: '**', component: admin_loginComponent }


];
