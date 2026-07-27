import { Injectable } from "@nestjs/common";

type RequestConfig = {
    headers?: HeadersInit;
};

@Injectable()
export class HttpService {
    private async request<T>(method: string, url: string, body?: unknown, conf?: RequestConfig): Promise<T> {
        const headers = new Headers(conf?.headers);

        let reqBody: string | undefined;
        if (typeof body === "object" && body !== null) {
            headers.set("Content-Type", "application/json");
            reqBody = JSON.stringify(body);
        }

        const res = await fetch(url, {
            method: method.toUpperCase(),
            headers,
            body: reqBody,
        });
        const ct = res.headers.get("Content-Type");
        if (ct && /^application\/json/.test(ct)) {
            return res.json() as Promise<T>;
        }
        return undefined as T;
    }

    async get<T>(url: string, conf?: RequestConfig): Promise<T> {
        return this.request("get", url, undefined, conf);
    }

    async post<T>(url: string, body: unknown, conf?: RequestConfig): Promise<T> {
        return this.request("post", url, body, conf);
    }

    async patch<T>(url: string, body: unknown, conf?: RequestConfig): Promise<T> {
        return this.request("patch", url, body, conf);
    }

    async delete<T>(url: string, body?: unknown, conf?: RequestConfig): Promise<T> {
        return this.request("delete", url, body, conf);
    }
}
