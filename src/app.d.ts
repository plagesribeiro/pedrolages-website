/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace App {
    interface Platform {
      env?: {
        SCORES?: KVNamespace;
        CONTENT_CACHE?: KVNamespace;
      };
      cf?: CfProperties;
      ctx?: ExecutionContext;
    }
  }
}

export {};
