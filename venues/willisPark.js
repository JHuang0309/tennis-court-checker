import { isWithinNextTwoHours } from "../utils/time.js";

export async function checkWillisPark(page) {
  const results = [];

  await page.goto(
    "https://www.tennisvenues.com.au/booking/willis-park-tennis",
    { waitUntil: "networkidle" }
  );

  await page.click("text=Today");
  await page.waitForTimeout(2000);

  const slots = await page.$$eval(".timeslot", nodes =>
    nodes.map(n => ({
      text: n.innerText,
      available: !n.classList.contains("unavailable"),
      link: n.querySelector("a")?.href || null
    }))
  );

  for (const slot of slots) {
    if (!slot.available) continue;

    const slotDate = new Date(slot.text); // adjust per site

    if (isWithinNextTwoHours(slotDate)) {
      results.push({
        venue: "Willis Park",
        time: slot.text,
        bookingLink: slot.link
      });
    }
  }

  return results;
}
