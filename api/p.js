export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send("Missing channel ID");

  const url = `https://www.yupptv.com/channels/${id}/live`;

  const cookieHeader = `showads=false; isAdsEnabled=False; isPremium=True; BoxId=910af50571694c9b; devicetype=5; isemlvrfdsbl=True; ismblvrfdsbl=False; YuppflixToken=YT-ea3dd839-0e72-4a6e-a0a9-a34feb7493b2; isHplayerenable=1; FreeTVEnabledDevices=False; FastTVEnabledDevices=True; GTPCountries=false; RedirectFromForgotpwd=channels/${id}/live; languages=TAM,ENG; fullLocation=MY-Malaysia; country=Malaysia`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Cookie": cookieHeader
      }
    });

    const html = await response.text();

    // Insert for debugging: show first 5k characters, plus snippet around .m3u8
    const snippet = html.substr(0, 5000);
    console.log("HTML snippet:", snippet);
    const match = html.match(/https:\/\/[^\s'"]+\.m3u8\?hdnts=[^'"]+/i);
    console.log("m3u8 match:", match);

    if (match && match[0]) {
      res.setHeader("Content-Type", "text/plain");
      res.send(match[0]);
    } else {
      res.status(404).send("Stream URL not found. Check logs – html does not contain expected URL.");
    }
  } catch (err) {
    res.status(500).send("Fetch failed: " + err.message);
  }
}
