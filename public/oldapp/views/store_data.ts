import { Injectable } from '@angular/core';
 
@Injectable()
export interface StoreData{
    
    name: String,
    email: String,
    password: String,
    website_url: String,
    slogan: String,
    country_name: String,
    city_name: String,
    address: String,
    country_phone_code: String,
    phone: Number,
    fax_number: String,
    store_delivery_name: String,
    latitude: Number,
    longitude: Number,
    famous_for: String,
    image_url: String
	
}
export class StoreData {
 
    
    private store_data: StoreData;

    public constructor() { 
    	
    }
 
}