import { chromium } from "playwright";
import cron from "node-cron";
import { 
    checkRoseville, 
    checkLindfield,
    checkWillisPark,
    checkAllanSmall
} from "./venues";



async function runCheck() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];
  const [roseville, lindfield, willisPark, allanSmall] = await Promise.all([
    checkRoseville(page),
    checkLindfield(page),
    checkWillisPark(page),
    checkAllanSmall(page)
  ])
  results.push(...roseville, ...lindfield, ...willisPark, ...allanSmall);

  await browser.close();

  if (results.length) {
    console.table(results);
  } else {
    console.log("No courts available right now");
  }
}

// Run immediately
runCheck();

// Run every 5 minutes
cron.schedule("*/5 * * * *", runCheck);
