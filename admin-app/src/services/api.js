const baseUrl = window.WP_GS_DATA?.restUrl; // e.g. /wp-json/wp-gs/v1/
const nonce = window.WP_GS_DATA?.nonce;

async function request(path, options = {}) {
    const res = await fetch(baseUrl + path, {
        headers: {
            "Content-Type": "application/json",
            "X-WP-Nonce": nonce,
        },
        credentials: "same-origin",
        ...options,
    });

    const raw = await res.text();
    
    if (!res.ok) {
        throw new Error("Request failed: " + res.status);
    }

    return JSON.parse(raw || "{}");
}

export const api = {
    scanNow: () =>
        request("scan", {
            method: "POST",
            body: JSON.stringify({}),
        }),
    getSettings: () => request("settings"),
    getReports: () => request("reports"),
};
