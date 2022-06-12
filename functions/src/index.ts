import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as playwright from "playwright";
import { VIPClass, CallableContext } from "./interface";

//const playwright = require('playwright');

admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
const increment = FieldValue.increment(1);
const decrement = FieldValue.increment(-1);

const isValidString = (x: any): boolean => {
  return Boolean(x && typeof x === "string" && x.length > 0);
};
const isValidNumber = (x: any): boolean => {
  return Boolean(typeof x === "number" && x > -1);
};

//firebase deploy --only functions:getExpedia
exports.getExpedia = functions.https.onCall(() => {
  const vgmUrl = "https://www.vgmusic.com/music/console/nintendo/nes";
  async () => {
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    await page.goto(vgmUrl);
    const links = await page.$$eval("a", (elements) =>
      elements
        .filter((element: any) => {
          const parensRegex = /^((?!\().)*$/;
          return (
            element.href.includes(".mid") &&
            parensRegex.test(element.textContent)
          );
        })
        .map((element) => element.href)
    );
    links.forEach((link) => console.log(link));
    await browser.close();
  };
});



//firebase deploy --only functions:createArrivalVIP
exports.createArrivalVIP = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const updateData: VIPClass = {};
    let x:
      | `firstName`
      | `lastName`
      | `rateCode`
      | `arrival`
      | `departure`
      | `image`
      | `fileName`
      | `vipStatus`
      | `roomStatus`
      | "roomNumber"
      | `notes`
      | `details`
      | `stays`
      | `reservationStatus`
      | `id`;
    const y: string = `VIP`;

    // firstName
    x = `firstName`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // lastName
    x = `lastName`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // rateCode
    x = `rateCode`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // arrival
    x = `arrival`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // departure
    x = `departure`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // image
    x = `image`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[
        x
      ] = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`;
    }
    // fileName
    x = `fileName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = `810-8105444_male-placeholder.png`;
    }
    // vipStatus
    x = `vipStatus`;
    if (!Array.isArray(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // roomStatus
    x = `roomStatus`;
    if (clientData[x] != undefined) {
      if (Array.isArray(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = [];
    }
    // roomNumber
    x = `roomNumber`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // notes
    x = `notes`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // details
    x = `details`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // stays
    x = `stays`;
    if (clientData[x] != undefined) {
      if (isValidNumber(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = 0;
    }

    const _vip = new VIPClass(
      updateData.arrival, // arrival?: string,
      updateData.departure, // departure?: string,
      updateData.details, // details?: string,
      updateData.fileName, // fileName?: string
      updateData.firstName, // firstName?: string,
      null, // id?: string,
      updateData.image, // image?: string,
      updateData.lastName, // lastName?: string,
      updateData.notes, // notes?: string,
      updateData.rateCode, // rateCode?: string,
      null, // reservationStatus?:'DUEIN'|'DUEOUT'|'CHECKEDIN'|'CHECKEDOUT'|'RESERVED'|'NOSHOW'|'CANCEL',
      updateData.roomNumber || null, // roomNumber?: string,
      updateData.roomStatus || null, // roomStatus?: [],
      updateData.vipStatus, // vipStatus?: [],
      updateData.stays || 0 // stays?:number,
    );

    const completeVIP = { ..._vip };
    try {
      const ref = db.collection("ArrivalVIPs").doc();
      const id = ref.id;
      completeVIP.id = id;
      await ref.set({ ...completeVIP });
      return {
        form: completeVIP,
        success: true,
        id,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || " error "}`
      );
    }
  }
);
//firebase deploy --only functions:updateArrivalVIP
exports.updateArrivalVIP = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const updateData: VIPClass = {};
    let x:
      | `firstName`
      | `lastName`
      | `rateCode`
      | `arrival`
      | `departure`
      | `image`
      | `fileName`
      | `vipStatus`
      | `roomStatus`
      | "roomNumber"
      | `notes`
      | `details`
      | `stays`
      | `reservationStatus`
      | `id`;
    const y: string = `VIP`;

    // firstName
    x = `firstName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // lastName
    x = `lastName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // rateCode
    x = `rateCode`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // arrival
    x = `arrival`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // departure
    x = `departure`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // image
    x = `image`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // fileName
    x = `fileName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // vipStatus
    x = `vipStatus`;
    if (clientData[x] != undefined) {
      if (!Array.isArray(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // roomStatus
    x = `roomStatus`;
    if (clientData[x] != undefined) {
      if (Array.isArray(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // roomNumber
    x = `roomNumber`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // notes
    x = `notes`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // details
    x = `details`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // stays
    x = `stays`;
    if (clientData[x] != undefined) {
      if (isValidNumber(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // id
    x = `id`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }

    const updatedVIP = { ...updateData };
    try {
      const ref = db.collection("ArrivalVIPs").doc(`${updatedVIP.id}`);
      await ref.set({ ...updatedVIP }, { merge: true });
      return {
        form: updatedVIP,
        success: true,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || ""}`
      );
    }
  }
);
//firebase deploy --only functions:deleteArrivalVIP
exports.deleteArrivalVIP = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const x = `id`;
    const y: string = `VIP`;
    const updateData: VIPClass = {};

    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    const filteredVIP: VIPClass = { ...updateData };

    const ref = db.collection("ArrivalVIPs").doc(`${filteredVIP.id}`);
    const res = await ref.get();
    if (!res.exists) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "I couldn't find this VIP"
      );
    }
    try {
      await ref.delete();
      return {
        success: true,
        id: filteredVIP.id,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || ""}`
      );
    }
  }
);
//firebase deploy --only functions:onCreateArrivalVIP
exports.onCreateArrivalVIP = functions.firestore
  .document("ArrivalVIPs/{id}")
  .onCreate(async () => {
    const totalsUpdate: any = {};
    totalsUpdate["total"] = increment;
    const totalRef = db.collection("Totals").doc("ArrivalVIPs");
    try {
      await totalRef.set(totalsUpdate, { merge: true });
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || ""}`
      );
    }
    return;
  });
//firebase deploy --only functions:onUpdateArrivalVIP
exports.onUpdateArrivalVIP = functions.firestore
  .document("ArrivalVIPs/{id}")
  .onUpdate(async () => {
    return;
  });
//firebase deploy --only functions:onDeleteArrivalVIP
exports.onDeleteArrivalVIP = functions.firestore
  .document("ArrivalVIPs/{id}")
  .onDelete(async () => {
    const totalsUpdate: any = {};
    totalsUpdate["total"] = decrement;
    const totalRef = db.collection("Totals").doc("ArrivalVIPs");

    //archive the vip
    //to keep up with stays and id


    try {
      await totalRef.set(totalsUpdate, { merge: true });
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || ""}`
      );
    }
    return;
  });



//firebase deploy --only functions:createVIP
exports.createVIP = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const updateData: VIPClass = {};
    let x:
      | `firstName`
      | `lastName`
      | `rateCode`
      | `arrival`
      | `departure`
      | `image`
      | `fileName`
      | `vipStatus`
      | `roomStatus`
      | "roomNumber"
      | `notes`
      | `details`
      | `stays`
      | `reservationStatus`
      | `id`;
    const y: string = `VIP`;

    // firstName
    x = `firstName`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // lastName
    x = `lastName`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // rateCode
    x = `rateCode`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // arrival
    x = `arrival`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // departure
    x = `departure`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // image
    x = `image`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[
        x
      ] = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`;
    }
    // fileName
    x = `fileName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = `810-8105444_male-placeholder.png`;
    }
    // vipStatus
    x = `vipStatus`;
    if (!Array.isArray(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // roomStatus
    x = `roomStatus`;
    if (clientData[x] != undefined) {
      if (Array.isArray(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = [];
    }
    // roomNumber
    x = `roomNumber`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // notes
    x = `notes`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // details
    x = `details`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // stays
    x = `stays`;
    if (clientData[x] != undefined) {
      if (isValidNumber(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = 0;
    }

    const _vip = new VIPClass(
      updateData.arrival, // arrival?: string,
      updateData.departure, // departure?: string,
      updateData.details, // details?: string,
      updateData.fileName, // fileName?: string
      updateData.firstName, // firstName?: string,
      null, // id?: string,
      updateData.image, // image?: string,
      updateData.lastName, // lastName?: string,
      updateData.notes, // notes?: string,
      updateData.rateCode, // rateCode?: string,
      null, // reservationStatus?:'DUEIN'|'DUEOUT'|'CHECKEDIN'|'CHECKEDOUT'|'RESERVED'|'NOSHOW'|'CANCEL',
      updateData.roomNumber || null, // roomNumber?: string,
      updateData.roomStatus || null, // roomStatus?: [],
      updateData.vipStatus, // vipStatus?: [],
      updateData.stays || 0 // stays?:number,
    );

    const completeVIP = { ..._vip };
    try {
      const ref = db.collection("ArrivalVIPs").doc();
      const id = ref.id;
      completeVIP.id = id;
      await ref.set({ ...completeVIP });
      return {
        form: completeVIP,
        success: true,
        id,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || " error "}`
      );
    }
  }
);
