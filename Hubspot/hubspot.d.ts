declare module "hubspot" {
  interface HubspotConfig {
    accessToken?: string;
    apiKey?: string;
    hapikey?: string;
  }

  interface ContactSearchResponse {
    contacts?: Array<{
      vid?: number;
      properties?: { [key: string]: any };
      [key: string]: any;
    }>;
    [key: string]: any;
  }

  interface ContactsAPI {
    search(query: string): Promise<ContactSearchResponse>;
    [key: string]: any;
  }

  class Hubspot {
    constructor(config: HubspotConfig);
    contacts: ContactsAPI;
    qs?: { [key: string]: any };
    [key: string]: any;
  }

  export = Hubspot;
}