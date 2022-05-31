import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as playwright from "playwright";
//const playwright = require('playwright');

admin.initializeApp();


//firebase deploy --only functions:getExpedia
exports.getExpedia = functions.https.onCall(() =>{ 
  const vgmUrl = 'https://www.vgmusic.com/music/console/nintendo/nes';
  (async () => {
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.goto(vgmUrl);
    const links = await page.$$eval('a', elements => elements.filter((element:any) => {
      const parensRegex = /^((?!\().)*$/;
      return element.href.includes('.mid') && parensRegex.test(element.textContent);
    }).map(element => element.href));
    links.forEach(link => console.log(link));
    await browser.close();
  })
})