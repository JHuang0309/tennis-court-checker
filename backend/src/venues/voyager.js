import { isWithinNextTwoHours } from "../utils/time.js";
import { VENUES } from "../config/venues.js";

const venue = VENUES.find(v => v.handler === "willisPark");

export async function checkVoyagerCourts(venue, page) {
  console.log("⏳ Checking Voyager Courts...");

  await page.goto(venue.url, { waitUntil: "load" });

  // Wait for booking table to exist once
  await page.waitForSelector("table.BookingSheet thead td.BookingSheetCategoryLabel", { timeout: 60000 });


  const results = [];

  // For both pages (PAGE 1: courts 1 - 6, PAGE 2: courts 7 - 10)
  for (const pageIndex of [0, 1]) {
    const pageLink = `#page_${pageIndex}`;

    // Case: another page might not exist
    if (!(await page.$(pageLink))) continue;

    // Click page tab (JS re-renders table for second page of courts)
    await page.click(pageLink);

    // Wait for table content to refresh 
    await page.waitForFunction(() => {
      const headers = document.querySelectorAll(
        "table.BookingSheet thead td.BookingSheetCategoryLabel"
      );
      return headers.length > 0;
    });

    // Read court names
    const courtNames = await page.$$eval(
      "table.BookingSheet thead td.BookingSheetCategoryLabel",
      nodes => nodes.map(n => n.innerText.trim())
    );

    const rows = await page.$$("table.BookingSheet tbody tr");

    let currentHour = null;

    for (const row of rows) {
      let timeLabel = await row
        .$eval("td.BookingSheetTimeLabel", td => td.innerText.trim())
        .catch(() => "");

      let minutes = 0;

      if (timeLabel && timeLabel !== "&nbsp;") {
        const match = timeLabel.match(/(\d+)(am|pm)/i);
        if (!match) continue;

        currentHour = parseInt(match[1], 10);
        const period = match[2].toLowerCase();

        if (period === "pm" && currentHour !== 12) currentHour += 12;
        if (period === "am" && currentHour === 12) currentHour = 0;

        minutes = 0;
      } else {
        // second row of same hour
        if (currentHour === null) continue;
        minutes = 30;
      }

      const timeString = `${currentHour
        .toString()
        .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

      const cells = await row.$$("td.TimeCell");

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const courtName = courtNames[i];
        if (!courtName) continue;

        const available = await cell.evaluate(td =>
          td.classList.contains("Available")
        );

        if (!available) continue;

        results.push({
          venue: venue.name,
          court: courtName,
          time: timeString,
          link: `${venue.url}`,
        });
      }
    }
  }

  // Sort by court number, then by time
  results.sort((a, b) => {
    const courtA = parseInt(a.court.match(/\d+/)?.[0] || 0, 10);
    const courtB = parseInt(b.court.match(/\d+/)?.[0] || 0, 10);

    if (courtA !== courtB) return courtA - courtB;

    const [hA, mA] = a.time.split(":").map(Number);
    const [hB, mB] = b.time.split(":").map(Number);

    return hA !== hB ? hA - hB : mA - mB;
  });

  return results;
}
