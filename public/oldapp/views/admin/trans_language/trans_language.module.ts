import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransLanguageComponent } from './trans_language.component';
import { TRANSLATION_PROVIDERS, TranslatePipe, TranslateService }   from './translate';
@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [TransLanguageComponent],
  providers:    [ TRANSLATION_PROVIDERS, TranslateService ]
})
export class TransLanguageModule { }


