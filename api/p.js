export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    res.status(400).send("Missing channel ID");
    return;
  }

  const url = `https://www.yupptv.com/channels/${id}/live`;
  
  const cookieHeader = "showads=false; isAdsEnabled=False; isPremium=True; BoxId=910af50571694c9b; devicetype=5; isemlvrfdsbl=True; ismblvrfdsbl=False; YuppflixToken=YT-ea3dd839-0e72-4a6e-a0a9-a34feb7493b2; isHplayerenable=1; FreeTVEnabledDevices=False; FastTVEnabledDevices=True; GTPCountries=false; RedirectFromForgotpwd=channels/star-vijay-us-hd/live; partnerUserName=; languages=TAM,ENG; partnerId=-1; partnerName=-1; state=; userRegistrationDate=27/11/2013 11:48:30; subscriptionStatus=true; mobileVerified=true; promotionalStatus=Yes; subscribedPacks=, Yupp Scope Video Tamil Basic_EUR, Yupp ScopeISP Video Tamil Basic_EUR, YuppFlix Free Movie Pack, Firstshows Free Movie Pack; purchaseDate=2024-06-19 10:27:04.957; cancelledDate=2025-07-13 10:16:33.0; customerStatus=Subscribed; isAdsEnabled=False; fullorderIP=111.90.141.223; orderIP=111.90.141.223; ucid=MQA2ADYAOAA4ADcAMgA=; ucn=TgBhAHQAYQBuAGEAcwBhAGIAYQBwAGEAdABoAGkA; uce=cABuAGsAcAByAGEAawBhAHMAaABAAGcAbQBhAGkAbAAuAGMAbwBtAA==; ucm=NAA2AC0ANwAyADcAOAAzADQANAAyADAA; userAcceptanceCookie=1; fullLocation=MY-Malaysia; defaultLanguage=ENG; country=Malaysia";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Cookie": cookieHeader,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    
    // Try multiple regex patterns to find the m3u8 URL
    const patterns = [
      /https:\/\/[^\s'"]+\.m3u8\?hdnts=[^'"&\s]+/gi,
      /https:\/\/[^\s'"]+\.m3u8[^'"&\s]*/gi,
      /"(https:\/\/[^"]*\.m3u8[^"]*)"/gi,
      /'(https:\/\/[^']*\.m3u8[^']*)'/gi
    ];

    let streamUrl = null;
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[0]) {
        streamUrl = match[0].replace(/['"]/g, ''); // Remove quotes if present
        break;
      }
    }

    if (streamUrl) {
      // Set CORS headers for cross-origin requests
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Content-Type", "text/plain");
      res.status(200).send(streamUrl);
    } else {
      console.log("HTML content (first 500 chars):", html.substring(0, 500));
      res.status(404).send("Stream URL not found");
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Fetch failed: " + err.message);
  }
}
