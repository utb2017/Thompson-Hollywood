import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as playwright from "playwright";
import { VIPClass, CallableContext } from "./interface";
import * as PDFDocument from 'pdfkit';
const fs = require('fs');
//import * as uuid from 'uuid';

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





//firebase deploy --only functions:getPdfUrlReq
exports.getPdfUrlReq = functions.https.onRequest((req, res) => {
  const doc = new PDFDocument();
  //let filename = req.body.filename;
  let filename = 'testPDF';
  // Stripping special characters
  filename = encodeURIComponent(filename) + ".pdf";
  // Setting response to 'attachment' (download).
  // If you use 'inline' here it will automatically open the PDF
  res.setHeader(
    "Content-disposition",
    'attachment; filename="' + filename + '"'
  );
  res.setHeader("Content-type", "application/pdf");
  //const content = req.body.content;
  doc.y = 300;
  doc.text('Test PDF', 50, 50);
  doc.pipe(res);
  doc.end();

    const storage = admin.storage()
  

// The path to your file to upload
 const filePath = 'detailedVIPs/';

// The new ID for your GCS file
const destFileName = 'your-new-file-name';
async function uploadFile() {
  await storage.bucket().upload(filePath, {
    destination: destFileName,
  });

  console.log(`${filePath} uploaded to ${destFileName}`);
}
uploadFile().catch(console.error);
return res.end()
});

    //return res.status(200).send();    
    
    // const doc = new PdfKit();
    
    // let receiptId = uuid.v4();
    // const file = admin
    //   .storage()
    //   .bucket()
    //   .file(`detailedVIPs/receipt-${receiptId}.pdf`);

      

    // await new Promise<void>((resolve, reject) => {
    //   const writeStream = file.createWriteStream({
    //     resumable: false,
    //     contentType: "application/pdf",
    //   });
    //   writeStream.on("finish", () => resolve());
    //   writeStream.on("error", (error) => {
    //     reject(error)
    //     throw new functions.https.HttpsError(
    //       "failed-precondition",
    //       `${error?.message || error || " error "}`
    //     );
    //   });
      
    //   doc.pipe(writeStream);
      
    //   doc
    //     .fontSize(24)
    //     .text("Receipt")
    //     .fontSize(16)
    //     .moveDown(2)
    //     .text("This is your receipt!")
        
    //   doc.end()
    //  });
     
    // const url = await file.getSignedUrl({
    //   version: "v4",
    //   action: "read",
    //   expires: Date.now() + 24 * 60 * 60 * 1000,
    // });
    //   console.log(url)
    // return { url };
  //});





//firebase deploy --only functions:exportAdobeDetailedVip
exports.exportAdobeDetailedVip = functions
  .https.onCall(async () => {
    

      const PDFServicesSdk = require('@adobe/pdfservices-node-sdk');

      /**
       * This sample illustrates how to create a PDF file from a HTML file with inline CSS.
       * <p>
       * Refer to README.md for instructions on how to run the samples.
       */
      
      /**
       * Sets any custom options for the operation.
       *
       * @param htmlToPDFOperation operation instance for which the options are provided.
       */
      const setCustomOptions = (htmlToPDFOperation:any) => {
          // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
          const pageLayout = new PDFServicesSdk.CreatePDF.options.html.PageLayout();
          pageLayout.setPageSize(20, 25);
      
          // Set the desired HTML-to-PDF conversion options.
          const htmlToPdfOptions = new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
              .includesHeaderFooter(true)
              .withPageLayout(pageLayout)
              .build();
          htmlToPDFOperation.setOptions(htmlToPdfOptions);
      };
      
      try {
          // Initial setup, create credentials instance.
          const credentials =  PDFServicesSdk.Credentials
              .serviceAccountCredentialsBuilder()
              .fromFile("pdfservices-api-credentials.json")
              .build();
      
          // Create an ExecutionContext using credentials and create a new operation instance.
          const executionContext = PDFServicesSdk.ExecutionContext.create(credentials),
              htmlToPDFOperation = PDFServicesSdk.CreatePDF.Operation.createNew();
      
          // Set operation input from a source file.
          const input = PDFServicesSdk.FileRef.createFromLocalFile('resources/createPDFFromHTMLWithInlineCSSInput.html');
          htmlToPDFOperation.setInput(input);
      
          // Provide any custom configuration options for the operation.
          setCustomOptions(htmlToPDFOperation);


          // Execute the operation and Save the result to the specified location.
          htmlToPDFOperation.execute(executionContext)
              .then((result:any) => {
                //result.saveAsFile('output/createPDFFromHTMLWithInlineCSSOutput.pdf')

                const file = admin
                .storage()
                .bucket()
                .file(`detailedVIPs/receipt-adobe.pdf`);

                fs.createReadStream(result)
                  .pipe(file.createWriteStream({
                    resumable: false,
                    contentType: "application/pdf",
                  }))
                  .on('error', function(err:any) {console.log('errer')})
                  .on('finish', function() {
                    // The file upload is complete.
                    console.log('complete')
                  });

                return
              })
              .catch((err:any) => {
                  if(err instanceof PDFServicesSdk.Error.ServiceApiError
                      || err instanceof PDFServicesSdk.Error.ServiceUsageError) {
                      console.log('Exception encountered while executing operation 1', err);
                  } else {
                      console.log('Exception encountered while executing operation 2', err);
                  }
              });
      } catch (err) {
          console.log('Exception encountered while executing operation 3', err);
      }

  });
















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









