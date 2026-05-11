import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Imports do Firebase + AngularFire
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

// Configuração do Firebase (vem do environment)
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Inicializa o Firebase com a config do environment
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // Habilita o Firebase Authentication
    provideAuth(() => getAuth()),

    // Habilita o Firestore (banco de dados)
    provideFirestore(() => getFirestore())
  ]
};