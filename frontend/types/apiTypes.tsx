export class APIParameter {
  name: string;
  value: string;
  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}

export class API {
  method: string;
  baseUrl: string;
  apiName: string;
  apiKey?: string;

  constructor(
    method: string,
    baseUrl: string,
    apiName: string,
    apiKey?: string
  ) {
    this.method = method.toUpperCase();
    this.baseUrl = baseUrl;
    this.apiName = apiName;
    this.apiKey = apiKey ?? undefined;
  }
  fetch(params: APIParameter[]) {
    if (this.method === "GET") {
      let formData = this.apiKey !== undefined ? "api_key=" + this.apiKey : "";
      params.forEach((p) => {
        formData += "&";
        formData += p.name;
        formData += "=";
        formData += p.value;
      });
      return fetch(this.baseUrl + "/" + this.apiName + "?" + formData, {
        method: this.method,
      });
    } else if (this.method) {
      let formData = new FormData();
      params.forEach((p) => {
        formData.append(p.name, p.value);
      });

      return fetch(this.baseUrl + "/" + this.apiName, {
        method: this.method,
      });
    }
  }
}
