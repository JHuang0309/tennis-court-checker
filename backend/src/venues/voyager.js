import { isWithinNextTwoHours } from "../utils/time.js";
import { VENUES } from "../config/venues.js";

export async function checkVoyagerCourts(venue, page, targetDate) {
  console.log("⏳ Checking Voyager Courts...");

  await page.goto(venue.url, { waitUntil: "domcontentloaded" });

  // Wait for calendar to exist 
  await page.waitForSelector("#datepicker");

  const target = new Date(targetDate);
  const targetMonth = target.getMonth(); // 0-11
  const targetYear = target.getFullYear();
  const targetDay = target.getDate();

  // Check if already on the correct date
  const alreadySelected = await page.evaluate(
    ({ day, month, year }) => {
      const active = document.querySelector(
        ".ui-datepicker-calendar td.ui-datepicker-current-day"
      );

      if (!active) return false;

      const activeDay = active.textContent.trim();
      const activeMonth = parseInt(active.getAttribute("data-month"), 10);
      const activeYear = parseInt(active.getAttribute("data-year"), 10);

      return (
        Number(activeDay) === day &&
        activeMonth === month &&
        activeYear === year
      );
    },
    { day: targetDay, month: targetMonth, year: targetYear }
  );

  // Load booking table for the correct date
  if (!alreadySelected) {
    // Helper to read current visible calendar month/year
    async function getVisibleMonthYear() {
      return await page.evaluate(() => {
        const monthText = document.querySelector(".ui-datepicker-month")?.textContent;
        const yearText = document.querySelector(".ui-datepicker-year")?.textContent;

        const monthIndex = new Date(`${monthText} 1, 2000`).getMonth();
        return {
          month: monthIndex,
          year: parseInt(yearText, 10),
        };
      });
    }

    // Navigate months until correct one is shown
    while (true) {
      const { month, year } = await getVisibleMonthYear();

      if (month === targetMonth && year === targetYear) break;
      // navigate forward until date is found
      await page.click(".ui-datepicker-next");
      await page.waitForTimeout(250);
    }

    // Click correct day
    const dayFound = await page.evaluate((day) => {
      const days = Array.from(
        document.querySelectorAll(".ui-datepicker-calendar td[data-handler='selectDay']")
      );

      const match = days.find(td =>
        td.textContent.trim() === String(day)
      );

      if (match) {
        match.querySelector("a")?.click();
        return true;
      }

      return false;
    }, targetDay);

    if (!dayFound) {
      throw new Error(
        `Target date not found in calendar: ${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(targetDay).padStart(2, "0")}`
      );
    }
  }
  
  // Wait for booking table to exist
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
