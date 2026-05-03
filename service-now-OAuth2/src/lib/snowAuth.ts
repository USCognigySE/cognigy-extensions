import axios from "axios";

export interface ISnowConnection {
	instance: string;
	clientId: string;
	clientSecret: string;
	username: string;
	password: string;
}

export interface ISnowAuth {
	baseUrl: string;
	accessToken: string;
}

export function normaliseInstanceUrl(instance: string): string {
	const trimmed = (instance || "").trim().replace(/\/+$/, "");
	if (!trimmed) {
		throw new Error("ServiceNow instance URL is required");
	}
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

export async function getSnowAuth(connection: ISnowConnection): Promise<ISnowAuth> {
	const baseUrl = normaliseInstanceUrl(connection.instance);
	const url = `${baseUrl}/oauth_token.do`;

	const body = new URLSearchParams({
		grant_type: "password",
		client_id: connection.clientId,
		client_secret: connection.clientSecret,
		username: connection.username,
		password: connection.password
	}).toString();

	try {
		const res = await axios.post(url, body, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Accept": "*/*",
				"User-Agent": "Cognigy.AI"
			},
			timeout: 30000
		});
		const data = res.data || {};
		if (!data.access_token) {
			throw new Error(`OAuth response missing access_token: ${JSON.stringify(data)}`);
		}
		return { baseUrl, accessToken: data.access_token };
	} catch (err) {
		const status = err && err.response && err.response.status;
		const payload = err && err.response && err.response.data;
		const detail = payload ? ` body=${JSON.stringify(payload)}` : "";
		throw new Error(`ServiceNow OAuth token request failed (status=${status || "n/a"})${detail}: ${err && err.message ? err.message : err}`);
	}
}

export function authHeaders(auth: ISnowAuth, extra?: Record<string, string>): Record<string, string> {
	return {
		Accept: "application/json",
		Authorization: `Bearer ${auth.accessToken}`,
		...(extra || {})
	};
}
