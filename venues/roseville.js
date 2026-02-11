import { isWithinNextTwoHours } from "../utils/time.js";

export async function checkRoseville(page) {
  const results = [];

  await page.goto(
    "https://krg.bookable.net.au/venues/44/roseville-park-tennis-courts",
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
        venue: "Roseville Park",
        time: slot.text,
        bookingLink: slot.link
      });
    }
  }

  return results;
}
