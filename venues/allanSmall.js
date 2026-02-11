import { isWithinNextTwoHours } from "../utils/time.js";
import { VENUES } from "../config/venues.js";

const venue = VENUES.find(v => v.handler === "allanSmall");

export async function checkAllanSmall(page) {

  console.log("⏳ Alan Small Park...");

  const results = []
  
  await page.goto( venue.url, { waitUntil: "load" });

  await page.waitForSelector("ul.schedule-bar.daybar li.li-timebar", { timeout: 60000 });


  const courtContainers = await page.$$("div.bookable-box.pt-4.pl-3.pr-3");
  const availableSlots = [];

  for (const courtDiv of courtContainers) {
    const courtNameHandle = await courtDiv.$("div.h5-semi-12-txt.mt-2.mb-3"); // e.g., "Synthetic grass court 4"
    const courtName = courtNameHandle ? await courtNameHandle.innerText() : "Unknown Court";
    // console.log("🏟 Court found:", courtName);

    // Obtain all timebars inside this court container
    const slots = await courtDiv.$$eval("li.li-timebar", nodes =>
      nodes.map(n => {
        const statusBar = n.querySelector(".status-bar");
        const available =
          statusBar &&
          !statusBar.className.includes("status-past") &&
          !statusBar.className.includes("status-closed") && 
          !statusBar.className.includes("status-booked");
        // const tooltip = statusBar?.getAttribute("uib-tooltip-html") || "No tooltip";

        // Extract start time from timebar class
        const classMatch = n.className.match(/h(\d+)m(\d+)/);
        let hour = 0, minute = 0;
        if (classMatch) {
          hour = parseInt(classMatch[1], 10); // 24h format
          minute = parseInt(classMatch[2], 10);
        }
        return {
          hour,
          minute,
          available,
        };
      })
    );

    // Filter out slots from 10pm to 5am
    const filteredSlots = slots.filter(s => s.available && s.hour >= 5 && s.hour < 22);

    // Keep only available slots
    const availableOnly = filteredSlots.filter(s => s.available);

    // Add court name to each slot
    for (const slot of availableOnly) {
      // const hour12 = slot.hour % 12 === 0 ? 12 : slot.hour % 12;
      // const ampm = slot.hour < 12 ? "am" : "pm";
      const minuteStr = slot.minute.toString().padStart(2, "0");
      // const timeText = `${hour12}:${minuteStr}${ampm}`; // changes to '9:45pm' format
      const timeText = `${slot.hour}:${minuteStr}`;

      availableSlots.push({
        venue: venue.name,
        court: courtName,
        time: timeText,
      });
    }
  }

  // Only show available slots within the next 2 hours
  // for (const slot of availableSlots) {

  //   const slotDate = new Date(slot.time); // adjust time formt per site

  //   if (isWithinNextTwoHours(slotDate)) {
  //     results.push(slot);
  //   }
  // }

  // return results;
  return availableSlots
}
