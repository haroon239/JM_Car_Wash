import { isDatabaseConnected } from "../config/database.js";
export async function healthCheck(_request, response) {
    let database = false;
    try {
        database = await isDatabaseConnected();
    }
    catch {
        database = false;
    }
    response.json({ ok: true, service: "jm-car-wash-api", database });
}
