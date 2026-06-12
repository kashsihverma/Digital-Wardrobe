/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly FIREBASE_PROJECT_ID?: string;
	readonly FIREBASE_CLIENT_EMAIL?: string;
	readonly FIREBASE_PRIVATE_KEY?: string;
	readonly PUBLIC_FIREBASE_API_KEY?: string;
	readonly PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
	readonly PUBLIC_FIREBASE_PROJECT_ID?: string;
	readonly PUBLIC_FIREBASE_APP_ID?: string;
	readonly PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
	readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
	readonly PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
