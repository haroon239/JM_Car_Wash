import {
  createInvoice,
  findCustomersMissingCurrentInvoice,
  markPastDueInvoicesOverdue,
} from "../models/invoice.model.js";

const DUBAI_OFFSET_MS = 4 * 60 * 60 * 1000;
const RUN_MINUTE_AFTER_MIDNIGHT = 5;

export async function runBillingMaintenance() {
  const overdueCount = await markPastDueInvoicesOverdue();
  const customers = await findCustomersMissingCurrentInvoice();

  let generatedCount = 0;
  for (const customer of customers) {
    const invoice = await createInvoice(Number(customer.id), {
      issueDate: customer.invoiceDate,
      source: "automatic",
    });
    if (!invoice.wasExisting) generatedCount += 1;
  }

  console.log(
    `Billing maintenance completed: ${generatedCount} invoice(s) generated, ${overdueCount ?? 0} marked overdue.`,
  );
}

function millisecondsUntilNextDubaiRun() {
  const now = Date.now();
  const dubaiNow = new Date(now + DUBAI_OFFSET_MS);
  const nextRunUtc =
    Date.UTC(
      dubaiNow.getUTCFullYear(),
      dubaiNow.getUTCMonth(),
      dubaiNow.getUTCDate() + 1,
      0,
      RUN_MINUTE_AFTER_MIDNIGHT,
    ) - DUBAI_OFFSET_MS;
  return Math.max(nextRunUtc - now, 1_000);
}

export function startBillingScheduler() {
  const scheduleNextRun = () => {
    const timer = setTimeout(async () => {
      try {
        await runBillingMaintenance();
      } catch (error) {
        console.error("Scheduled billing maintenance failed", error);
      } finally {
        scheduleNextRun();
      }
    }, millisecondsUntilNextDubaiRun());
    timer.unref();
  };

  void runBillingMaintenance().catch((error) =>
    console.error("Startup billing maintenance failed", error),
  );
  scheduleNextRun();
}
