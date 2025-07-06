export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send("Missing channel ID");

  const url = `https://www.yupptv.com/channels/${id}/live`;

  const cookieHeader = `showads=false; isAdsEnabled=False; isPremium=True; BoxId=910af50571694c9b; devicetype=5; isemlvrfdsbl=True; ismblvrfdsbl=False; YuppflixToken=YT-ea3dd839-0e72-4a6e-a0a9-a34feb7493b2; isHplayerenable=1; FreeTVEnabledDevices=False; FastTVEnabledDevices=True; GTPCountries=false; languages=TAM,ENG; country=Malaysia`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Cookie": cookieHeader
      }
    });

    const html = await response.text();

    // Try to extract streamUrl JSON block manually
    const jsonMatch = html.match(/streamUrl\s*=\s*(\[[^\]]+\])/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1].replace(/'/g, '"'); // replace single quotes if needed
      const streamArr = JSON.parse(jsonStr);
      const streamUrl = streamArr[0]?.src;
      if (streamUrl) {
        res.setHeader("Content-Type", "text/plain");
        res.send(streamUrl);
        return;
      }
    }

    res.status(404).send("Stream URL not found in streamUrl block.");
  } catch (err) {
    res.status(500).send("Fetch failed: " + err.message);
  }
}
