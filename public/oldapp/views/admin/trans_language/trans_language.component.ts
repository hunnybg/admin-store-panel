import {Component, OnInit} from '@angular/core';
import {TranslateService} from './translate';

@Component({
    selector: 'app-trans_language',
    templateUrl: './trans_language.component.html'
})
export class TransLanguageComponent implements OnInit {
    public translatedText: string;
    public translatedText1: string;
    public translatedText2: string;

    public supportedLangs: any[];

    constructor(private _translate: TranslateService) {}

    ngOnInit() {
        // standing data
        this.supportedLangs = [
            {display: 'English', value: 'en'},
            {display: 'Español', value: 'es'},
            {display: '华语', value: 'zh'},
            {display: 'Arabic', value: 'ar'},
        ];

        this.selectLang('es');

    }

    isCurrentLang(lang: string) {
        return lang === this._translate.currentLang;
    }

    selectLang(lang: string) {
        // set default;
        this._translate.use(lang);
        this.refreshText();
    }

    refreshText() {
        this.translatedText = this._translate.instant('hello world');
        this.translatedText1 = this._translate.instant('dashboard');
        this.translatedText2 = this._translate.instant('hi');

    }



}
