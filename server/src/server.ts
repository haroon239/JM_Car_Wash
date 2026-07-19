import { app } from "./app.js";
import { env } from "./config/env.js";
import { startBillingScheduler } from "./services/billing.service.js";

app.listen(env.port, () => {
  console.log(`JM Car Wash API running at http://localhost:${env.port}`);
  startBillingScheduler();
});
