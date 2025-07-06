export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    res.status(400).send("Missing channel ID");
    return;
  }

  const url = `https://www.yupptv.com/channels/${id}/live`;

  const cookieHeader = `showads=false; isAdsEnabled=False; isPremium=True; BoxId=910af50571694c9b; devicetype=5; isemlvrfdsbl=True; ismblvrfdsbl=False; YuppflixToken=YT-ea3dd839-0e72-4a6e-a0a9-a34feb7493b2; isHplayerenable=1; FreeTVEnabledDevices=False; FastTVEnabledDevices=True; GTPCountries=false; RedirectFromForgotpwd=channels/star-vijay-us-hd/live; partnerUserName=; languages=TAM,ENG; partnerId=-1; partnerName=-1; state=; userRegistrationDate=27/11/2013 11:48:30; subscriptionStatus=true; mobileVerified=true; promotionalStatus=Yes; subscribedPacks=, Yupp Scope Video Tamil Basic_EUR, Yupp ScopeISP Video Tamil Basic_EUR, YuppFlix Free Movie Pack, Firstshows Free Movie Pack; purchaseDate=2024-06-19 10:27:04.957; cancelledDate=2025-07-13 10:16:33.0; customerStatus=Subscribed; isAdsEnabled=False; fullorderIP=111.90.141.223; orderIP=111.90.141.223; ucid=MQA2ADYAOAA4ADcAMgA=; ucn=TgBhAHQAYQBuAGEAcwBhAGIAYQBwAGEAdABoAGkA; uce=cABuAGsAcAByAGEAawBhAHMAaABAAGcAbQBhAGkAbAAuAGMAbwBtAA==; ucm=NAA2AC0ANwAyADcAOAAzADQANAAyADAA; userAcceptanceCookie=1; fullLocation=MY-Malaysia; defaultLanguage=ENG; country=Malaysia`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Cookie": cookieHeader
      }
    });

    const html = await response.text();
    const match = html.match(/https:\/\/[^\s'"]+\.m3u8\?hdnts=[^'"]+/i);

    if (match && match[0]) {
      // Direct m3u8 response
      res.setHeader("Content-Type", "text/plain");
      res.send(match[0]);
    } else {
      res.status(404).send("Stream URL not found");
    }
  } catch (err) {
    res.status(500).send("Fetch failed: " + err.message);
  }
}
