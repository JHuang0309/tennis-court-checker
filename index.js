import { chromium } from "playwright";
import cron from "node-cron";
import { checkRoseville } from "./venues/roseville.js";
import { checkLindfield } from "./venues/lindfield.js";
import { checkWillisPark } from "./venues/willisPark.js";
import { checkAllanSmall } from "./venues/allanSmall.js";



async function runCheck() {
  const browser = await chromium.launch({ headless: true, slowMo: 200 });
  // const page = await browser.newPage();

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
  });

  const page = await context.newPage()

  const results = [];
  // const [roseville, lindfield, willisPark, allanSmall] = await Promise.all([
  //   checkRoseville(page),
  //   checkLindfield(page),
  //   checkWillisPark(page),
  //   checkAllanSmall(page)
  // ])
  // results.push(...roseville, ...lindfield, ...willisPark, ...allanSmall);

  results.push(...await checkRoseville(page))
  results.push(...await checkLindfield(page))
  results.push(...await checkAllanSmall(page))

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
// cron.schedule("*/5 * * * *", runCheck);
