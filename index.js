import { chromium } from "playwright";
import cron from "node-cron";
import { checkRoseville } from "./venues/roseville.js";
import { checkLindfield } from "./venues/lindfield.js";
import { checkWillisPark } from "./venues/willisPark.js";
import { checkAllanSmall } from "./venues/allanSmall.js";

// function summarizeSlots(results) {
//   // Sort by venue, court, then time
//   results.sort((a, b) => {
//     if (a.venue !== b.venue) return a.venue.localeCompare(b.venue);
//     if (a.court !== b.court) return a.court.localeCompare(b.court);
//     const [hA, mA] = a.time.split(":").map(Number);
//     const [hB, mB] = b.time.split(":").map(Number);
//     return hA !== hB ? hA - hB : mA - mB;
//   });

//   const summary = [];

//   for (let i = 0; i < results.length; i++) {
//     const current = results[i];
//     let startTime = current.time;
//     let endTime = current.time;

//     // Collapse consecutive 15-min slots
//     while (
//       i + 1 < results.length &&
//       results[i + 1].venue === current.venue &&
//       results[i + 1].court === current.court
//     ) {
//       // check if next slot is consecutive (+15 min)
//       const [h1, m1] = endTime.split(":").map(Number);
//       const [h2, m2] = results[i + 1].time.split(":").map(Number);

//       let nextMinutes = h1 * 60 + m1 + 15;
//       if (nextMinutes === h2 * 60 + m2) {
//         endTime = results[i + 1].time;
//         i++; // move to next slot
//       } else break;
//     }

//     summary.push({
//       venue: current.venue,
//       court: current.court,
//       timeRange: `${formatTime(startTime)} - ${formatTime(endTime)}`
//     });
//   }

//   return summary;
// }

// // Convert 24-hour format to 12-hour AM/PM
// function formatTime(time24) {
//   if (!time24 || !time24.includes(":")) return "Invalid";

//   let [h, m] = time24.split(":").map(Number);
//   if (isNaN(h) || isNaN(m)) return "Invalid";

//   const period = h >= 12 ? "pm" : "am";
//   if (h === 0) h = 12;
//   else if (h > 12) h -= 12;
//   return `${h}:${m.toString().padStart(2, "0")}${period}`;
// }

async function runCheck() {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  // const page = await browser.newPage();

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
  });

  const results = [];
  const [roseville, lindfield, willisPark, allanSmall] = await Promise.all([
    checkRoseville(await context.newPage()),
    checkLindfield(await context.newPage()),
    checkWillisPark(await context.newPage()),
    checkAllanSmall(await context.newPage())
  ])
  results.push(...roseville, ...lindfield, ...willisPark, ...allanSmall);

  // Debugging line:  individual push
  // results.push(...await checkWillisPark(await context.newPage()))

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
