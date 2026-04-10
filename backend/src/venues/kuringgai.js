import { isWithinNextTwoHours } from "../utils/time.js";

function formatToHHMM(iso) {
  const d = new Date(iso);
  const hh = d.getUTCHours().toString().padStart(2, "0");
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function isWithinOperatingHours(time) {
  const [h, m] = time.split(":").map(Number);
  const minutes = h * 60 + m;

  const start = 6 * 60;   // 06:00
  const end = 22 * 60;    // 22:00

  return minutes >= start && minutes <= end;
}

function columnToTime(col) {
  const minutes = (col - 1) * 15;
  const hh = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mm = (minutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export async function checkKuringGaiCourts(page, venue, date) {
  console.log(`⏳ Checking ${venue.name}...`);

  await page.goto( `${venue.url}${date}`, { waitUntil: "domcontentloaded" });

  await page.waitForSelector('[data-testid="schedule-bar-slot"]', {
    timeout: 60000
  });
  const courtGroups = await page.$$('.schedule-group');
  const availableSlots = [];

  for (const group of courtGroups) {
    // 1. Get court name
    const courtNameHandle = await group.$("a.h5-base-15-txt"); // e.g., "Synthetic grass court 4"
    const courtName = courtNameHandle ? await courtNameHandle.innerText() : "Unknown Court";
    // console.log("🏟 Court found:", courtName);

    // 2. Get all slots within this court
    const slots = await group.$$('[data-testid="schedule-bar-slot"]');

    for (const slot of slots) {
      const isBlocked = await slot.$(
        '.bk-schedule-bar__blocked-block, .bk-schedule-bar__unavailable-block'
      );
      if (isBlocked) continue;

      const gridColumn = await slot.evaluate(el => {
        const style = el.getAttribute("style") || "";
        const match = style.match(/grid-area:\s*\d+\s*\/\s*(\d+)/);
        return match ? parseInt(match[1], 10) : null;
      });

      if (!gridColumn) continue;

      const timeText = columnToTime(gridColumn);

      if (!isWithinOperatingHours(timeText)) continue;

      availableSlots.push({
        venue: venue.name,
        court: courtName,
        time: timeText,
        link: `${venue.url}${date}`,
      });
    }
  }
  return availableSlots;
}