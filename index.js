import { chromium } from "playwright";
import cron from "node-cron";
import { checkVoyagerCourts } from "./venues/voyager.js";
import { checkKuringGaiCourts } from "./venues/kuringgai.js"
import { VENUES } from "./config/venues.js";

async function runCheck() {
  const browser = await chromium.launch({ headless: true, slowMo: 200 });

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
  });

  const results = [];
  for (const venue of VENUES) {
    let venueResults = [];
    if (venue.owner === "kuringGai") {
      venueResults = await checkKuringGaiCourts(await context.newPage(), venue);
    } else if (venue.owner === "voyager") {
      venueResults = await checkVoyagerCourts(venue, await context.newPage());
    }
    results.push(...venueResults);
  }

  await browser.close();

  if (results.length) {
    console.log("🎾 All available courts retrieved");
    console.table(results);
    // const summarizedTable = summarizeSlots(results);
    // console.table(summarizedTable);
  } else {
    console.log("No courts available right now");
  }
}

// Run immediately
runCheck();

// Run every 5 minutes
// cron.schedule("*/5 * * * *", runCheck);
