/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_WHATSAPP_NUMBER?: string;
  readonly PUBLIC_PHONE?: string;
  readonly PUBLIC_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
