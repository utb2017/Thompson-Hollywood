import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as playwright from "playwright";
import { VIPClass, CallableContext } from "./interface";
//const playwright = require('playwright');

admin.initializeApp();
const db = admin.firestore();

const isValidString = (x: any) => {
  return Boolean(x && typeof x === "string" && x.length > 0);
};

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

//firebase deploy --only functions:createVIP
exports.createVIP = functions.https.onCall(async (_form: VIPClass, context: CallableContext) => {

  const clientData = { ..._form }

  // FirstName
  if (!isValidString(clientData.firstName)) {
    throw new functions.https.HttpsError("failed-precondition", "Invalid/Missing: VIP 'firstName' data.");
  }
  // LastName
  if (!isValidString(clientData.lastName)) {
    throw new functions.https.HttpsError("failed-precondition", "Invalid/Missing: VIP 'lastName' data.");
  }
  // Rate
  if (!isValidString(clientData.rateCode)) {
    throw new functions.https.HttpsError("failed-precondition", "Invalid/Missing: VIP 'rateCode' data.");
  }
  // Arrival
  if (!isValidString(clientData.arrival)) {
    throw new functions.https.HttpsError("failed-precondition", "Invalid/Missing: VIP 'arrival' data.");
  }
  // Departure
  if (!isValidString(clientData.departure)) {
    throw new functions.https.HttpsError("failed-precondition", "Invalid/Missing: VIP 'departure' data.");
  }
  // Image
  if (!isValidString(clientData.image)) {
    throw new functions.https.HttpsError("failed-precondition", "Invalid/Missing: VIP 'image' data.");
  }
  // FileName
  if (!isValidString(clientData.fileName)) {
    throw new functions.https.HttpsError("failed-precondition", "Invalid/Missing: VIP 'fileName' data.");
  }
  // VIPStatus
  if (!Array.isArray(clientData.vipStatus)) {
    throw new functions.https.HttpsError("failed-precondition", "Invalid/Missing: VIP 'fileName' data.");
  }
  

  const _vip = new VIPClass(
    clientData.arrival, // arrival?: string,
    clientData.departure, // departure?: string,
    clientData.details, // details?: string,
    clientData.fileName, // fileName?: string
    clientData.firstName, // firstName?: string,
    null, // id?: string,
    clientData.image, // image?: string,
    clientData.lastName, // lastName?: string,
    clientData.notes, // notes?: string,
    clientData.rateCode, // rateCode?: string,
    null, // reservationStatus?:'DUEIN'|'DUEOUT'|'CHECKEDIN'|'CHECKEDOUT'|'RESERVED'|'NOSHOW'|'CANCEL',
    (clientData.roomNumber || null), // roomNumber?: string,
    (clientData.roomStatus || null), // roomStatus?: [],
    clientData.vipStatus,  // vipStatus?: [],
    0, // stays?:number,
  );

  const completeVIP = { ..._vip };
  try {
    const ref = db.collection("VIPS").doc();
    const id = ref.id;
    completeVIP.id = id;
    // if(context.auth){
    //   completeCollection.createdBy = context.auth.uid;
    // }
    await ref.set({ ...completeVIP });
    return {
      form: completeVIP,
      success: true,
      id,
    };
  } catch (error:any) {
    throw new functions.https.HttpsError("failed-precondition", `${error?.message || error || " error "}`);
  }

});

