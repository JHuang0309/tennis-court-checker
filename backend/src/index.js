import { chromium } from "playwright";
import cron from "node-cron";
import { checkVoyagerCourts } from "./venues/voyager.js";
import { checkKuringGaiCourts } from "./venues/kuringgai.js"
import { VENUES } from "./config/venues.js";

export async function runCheck(date) {
  const browser = await chromium.launch({ headless: true, slowMo: 200, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
  });

  const results = [];

  if (!(date instanceof Date)) {
    throw new Error("runCheck expected a Date object");
  }
  const formattedDate = date.toLocaleDateString('en-CA');

  for (const venue of VENUES) {
  try {
    const page = await context.newPage();
    let venueResults = [];
    if (venue.owner === "kuringGai") {
      venueResults = await checkKuringGaiCourts(page, venue, formattedDate);
    } else if (venue.owner === "voyager") {
      venueResults = await checkVoyagerCourts(venue, page, date);
    }
    results.push(...venueResults);
    await page.close();
  } catch (err) {
    console.error(`❌ Error scraping ${venue.name}:`, err);
  }
}

  await browser.close();

  if (results.length) {
    console.log("🎾 All available courts retrieved");
    // console.table(results);
    // const summarizedTable = summarizeSlots(results);
    // console.table(summarizedTable);
  } else {
    console.log("No courts available right now");
  }

  return results;
}

// Run immediately
// runCheck();

// Run every 5 minutes
// cron.schedule("*/5 * * * *", runCheck);
