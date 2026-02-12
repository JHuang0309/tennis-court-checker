import { isWithinNextTwoHours } from "../utils/time.js";

export async function checkKuringGaiCourts(page, venue, date) {
  console.log(`⏳ Checking ${venue.name}...`);

  await page.goto( `${venue.url}${date}`, { waitUntil: "load" });

  await page.waitForSelector("venue-bookable-schedule ul.schedule-bar.daybar li.li-timebar", { timeout: 60000 });

  const courtContainers = await page.$$("div.schedule-group");
  const availableSlots = [];

  for (const courtDiv of courtContainers) {
    const courtNameHandle = await courtDiv.$("a.h5-base-15-txt"); // e.g., "Synthetic grass court 4"
    const courtName = courtNameHandle ? await courtNameHandle.innerText() : "Unknown Court";
    // console.log("🏟 Court found:", courtName);

    // Obtain all timebars inside this court container
    const slots = await courtDiv.$$eval("li.li-timebar", nodes =>
      nodes.map(n => {
        const statusBar = n.querySelector(".status-bar");
        const available =
          statusBar &&
          !statusBar.className.includes("status-past") &&
          !statusBar.className.includes("status-lead-time") && 
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

      // Uncomment the above and use this if you want '9:45pm' format
      // const timeText = `${hour12}:${minuteStr}${ampm}`; 
      const minuteStr = slot.minute.toString().padStart(2, "0");
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

  //     const slotDate = new Date(slot.time); // adjust time formt per site

  //     if (isWithinNextTwoHours(slotDate)) {
  //       results.push(slot);
  //     }
  //   }

  // return results;
  return availableSlots;
}
