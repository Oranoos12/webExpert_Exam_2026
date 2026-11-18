import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Start de Angular-app met App als hoofdcomponent.
bootstrapApplication(App, appConfig).catch(function (err) {
  console.error(err);
});
