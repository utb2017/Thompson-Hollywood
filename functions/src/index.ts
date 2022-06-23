import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as playwright from "playwright";
import { VIPClass, CallableContext } from "./interface";
import * as PDFDocument from "pdfkit";



//https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/detailedVIPs/VIP's%20Detailed%20-%203ca42ff5-22af-4556-bb4e-78691f315aec.pdf?alt=media&token=3ca42ff5-22af-4556-bb4e-78691f315aec
//inlink
//https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/detailedVIPs%2FVIP's%20Detailed%20-%203ca42ff5-22af-4556-bb4e-78691f315aec.pdf?alt=media&token=3ca42ff5-22af-4556-bb4e-78691f315aec

//const bucketName = `thompson-hollywood.appspot.com`;
//import { getStorage, ref, uploadBytes } from "firebase/storage";
const fs = require("fs");
import * as uuid from "uuid";

//const playwright = require('playwright');

const monthNames:string[] = [
  "January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"
];
const dayOfWeekNames:string[] = [
  "Sunday", "Monday", "Tuesday",
  "Wednesday", "Thursday", "Friday", "Saturday"
];
const formatDate = (date:Date, patternStr?:any) => {
    if (!patternStr) {
        patternStr = 'M/d/yyyy';
    }
    const day = date.getDate(),
        month = date.getMonth(),
        year = date.getFullYear(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        miliseconds = date.getMilliseconds(),
        h = hour % 12,
        hh = twoDigitPad(h),
        HH = twoDigitPad(hour),
        mm = twoDigitPad(minute),
        ss = twoDigitPad(second),
        aaa = hour < 12 ? 'AM' : 'PM',
        EEEE = dayOfWeekNames[date.getDay()],
        EEE = EEEE.substring(0, 3),
        dd = twoDigitPad(day),
        M = month + 1,
        MM = twoDigitPad(M),
        MMMM = monthNames[month],
        MMM = MMMM.substring(0, 3),
        yyyy = year + "",
        yy = yyyy.substring(2, 2)
    ;
    // checks to see if month name will be used
    patternStr = patternStr
      .replace('hh', hh).replace('h', h)
      .replace('HH', HH).replace('H', hour)
      .replace('mm', mm).replace('m', minute)
      .replace('ss', ss).replace('s', second)
      .replace('S', miliseconds)
      .replace('dd', dd).replace('d', day)
      
      .replace('EEEE', EEEE).replace('EEE', EEE)
      .replace('yyyy', yyyy)
      .replace('yy', yy)
      .replace('aaa', aaa);
      
    if (patternStr.indexOf('MMM') > -1) {
        patternStr = patternStr
          .replace('MMMM', MMMM)
          .replace('MMM', MMM);
    }
    else {
        patternStr = patternStr
          .replace('MM', MM)
          .replace('M', M);
    }
    return patternStr;
}
const twoDigitPad = (num:number) => {
    return num < 10 ? "0" + num : num;
}
const replaceWhitespace = (str = '') => {
  let res = '';
  const { length } = str;
  for(let i = 0; i < length; i++){
     const char = str[i];
     if(!(char === ' ' || char === '/')){
        res += char;
     }else if(char === '/'){
        res += '%2F';
     }else{
        res += '%20';
     };
  };
  return res;
};
// const unformatDate = (formattedDate: string | Date): Date => {
//   const thisYear: number = new Date().getFullYear(),
//     numericDate: number = new Date(formattedDate).setFullYear(thisYear),
//     unformattedDate: Date = new Date(numericDate);
//   return unformattedDate;
// };

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
  let filename = "testPDF";
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
  doc.text("Test PDF", 50, 50);
  doc.pipe(res);
  doc.end();

  const storage = admin.storage();

  // The path to your file to upload
  const filePath = "detailedVIPs/";

  // The new ID for your GCS file
  const destFileName = "your-new-file-name";
  async function uploadFile() {
    await storage.bucket().upload(filePath, {
      destination: destFileName,
    });

    console.log(`${filePath} uploaded to ${destFileName}`);
  }
  uploadFile().catch(console.error);
  return res.end();
});

// https://us-central1-thompson-hollywood.cloudfunctions.net/PDFTest
//firebase deploy --only functions:PDFTest
exports.PDFTest = functions.https.onRequest((req, res) => {
  var doc = new PDFDocument();

  // draw some text
  doc.fontSize(25).text("Here is some vector graphics...", 100, 80);

  // some vector graphics
  doc.save().moveTo(100, 150).lineTo(100, 250).lineTo(200, 250).fill("#FF3300");

  doc.circle(280, 200, 50).fill("#6600FF");

  // an SVG path
  doc
    .scale(0.6)
    .translate(470, 130)
    .path("M 250,75 L 323,301 131,161 369,161 177,301 z")
    .fill("red", "even-odd")
    .restore();

  // and some justified text wrapped into columns
  doc
    .text("And here is some wrapped text...", 100, 300)
    .font("Times-Roman", 13)
    .moveDown()
    .text("... lorem ipsum would go here...", {
      width: 412,
      align: "justify",
      indent: 20,
      columns: 2,
      height: 300,
      ellipsis: true,
    });

  doc.pipe(res.status(200));

  doc.end();
});

// <img className="vip-image-${nIndex}" alt="vip" src="${vip?.image || "https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1"}" />
// </div>





//firebase deploy --only functions:exportAdobeDetailedVip
exports.exportAdobeDetailedVip = functions.https.onCall(async () => {

  const _url = await new Promise<{url:any, success:boolean, error:any}>( async (resolve, reject) => {
  const accessToken = uuid.v4();
  const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
  /**
   * Get VIP Arrivals.
   */
  const db = admin.firestore();
  const vipRef = db.collection("ArrivalVIPs");  
  const vipSnapshot = await vipRef.get();
  const vipData: VIPClass[] = [];
  if (!vipSnapshot.empty) {
    vipSnapshot.forEach((doc) => {
      vipData.push(doc.data() as VIPClass);
    });
  }
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
  const setCustomOptions = (htmlToPDFOperation: any) => {
    // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
    const pageLayout = new PDFServicesSdk.CreatePDF.options.html.PageLayout();
    pageLayout.setPageSize(20, 25);

    // Set the desired HTML-to-PDF conversion options.
    const htmlToPdfOptions =
      new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
        .includesHeaderFooter(true)
        .withPageLayout(pageLayout)
        .build();
    htmlToPDFOperation.setOptions(htmlToPdfOptions);
  };
  try {
    // Initial setup, create credentials instance.
    const credentials =
      await PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
        .fromFile("pdfservices-api-credentials.json")
        .build();
    // Create an ExecutionContext using credentials and create a new operation instance.
    const executionContext =
        PDFServicesSdk.ExecutionContext.create(credentials),
      htmlToPDFOperation = PDFServicesSdk.CreatePDF.Operation.createNew();
    // Set operation input from a source file.

    const pageLoop = (_vipData: VIPClass[]): string => {
      const A4pages: string[] = [];
      const totalVips: number = _vipData.length;
      let pageNumber = 1;
      _vipData.forEach((vip: VIPClass, index) => {
        let nIndex = index + 1;

        if (!(nIndex % 2 == 0)) {
          A4pages.push(`<page size="A4">`);
          A4pages.push(`
                <div class="header">
                  <div class="header-center">
                    <span class="header-page-number">${`${pageNumber}`}</span>
                    <span class="header-page-title"> VIP Arrivals - ${formatDate(new Date(), ' EEE dd MMM')}</span>           
                  </div> 
                </div>`);
          pageNumber++;     
        }
        

        A4pages.push(`
                <div class="vip-card">
                         <style>
                    .vip-image-${nIndex} {
                      background-image: url(${
                        vip?.image ||
                        `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`
                      });
                      background-repeat:no-repeat;
                      background-position: center center;
                      background-size: cover;
                    }
                  </style>            
                    <div class="image vip-image-${nIndex}"></div>
                    <div class="vip-label">
                      <span class="vip-name">${`${vip?.lastName}, ${vip?.firstName}`}</span>
                      <span class="name-dash"> - </span>
                      <span class="vip-status${
                        Boolean(vip?.vipStatus && vip?.vipStatus.length)
                          ? ` ${vip?.vipStatus ? vip?.vipStatus[0].label : ``}`
                          : ``
                      }">${`${vip?.vipStatus ? vip?.vipStatus[0].label : ``}`}</span>
                    </div>  
                    <div class="top-line"></div>
                    <div class="vip-details"> 
                      <div class="vip-notes">${vip?.notes || "No Notes"}</div>
                      <div class="vip-location">${
                        vip?.details || "No Location"
                      }</div>
                    </div>
                    <div class="bottom-line"></div>
                    <div class="arrival-departure">
                      <span class="vip-arrival">${vip?.arrival}</span>
                      <span> - </span>
                      <span class="vip-departure">${vip?.departure}</span>
                    </div>
                    <div class="vip-room">RM: ${vip.roomNumber || `TBD`}</div>
                  </div>
              `);

        if (!(nIndex % 2 == 0) && totalVips === nIndex) {
          //number is not even but last page
          A4pages.push(`</page>`);
        }
        if (nIndex % 2 == 0) {
          //number is even
          A4pages.push(`</page>`);
        }
      });
      return A4pages.join(" ");
    };

    const HTML = `
    <!DOCTYPE html>

    <head>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <style>
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          html,
          body {
            width: 210mm;
            height: 297mm;
          }
        }
    
        body {
          background: white;
          font-family:  Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif;
        }
        page[size="A4"] {
          background: white;
          width: 21cm;
          height: 29.7cm;
          display: block;
          margin: 0 auto;
          margin-bottom: 0.5cm;
          box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
        }
        @media print {
          body,
          page[size="A4"] {
            margin: 0;
            box-shadow: 0;
          }
        }
        .vip-card {
          width: 100%;
          display: flex;
          justify-content: center;
          align-content: center;
          align-items: center;
          height: 10cm;
          flex-direction: column;
          margin-top: 1cm;
          text-align: center;
        }
        .image {
          height: 200px;
          width: 200px;
          border: solid 10px #16365c;
          overflow: hidden;
          border-radius: 100%;
          margin-bottom: 12px;
          box-shadow: 0 0 0.4cm rgba(0, 0, 0, 0.3);
        }
        .top-line {
          height: 1px;
          background-color: #16365c;
          width: 65%;
          margin-bottom: 6px;
        }
        .bottom-line {
          height: 1px;
          background-color: #16365c;
          width: 65%;
          margin-top: 6px;
          margin-bottom: 6px;
        }
        .vip-label {
          color: black;
          text-align: center;
          margin-bottom: 6px;
        }
        .vip-notes {
          color: #16365c;
          font-size: 14px;
          text-align: center;
          font-style: italic;
        }
        .vip-details {
          color: #16365c;
          width: 50%; 
          text-align: center;
        }
        .vip-location {
          color: #16365c;
          font-size: 14px;
          text-align: center;
          font-weight: bold;
          font-style: italic;
          text-align: center;
        }
        .arrival-departure {
          font-size: 12px;
          text-align: center;
          margin-bottom: 2px;
        }
        .arrival-departure {
          font-size: 12px;
          text-align: center;
        }
        .vip-room {
          font-size: 11px;
          text-transform: uppercase;
          text-align: center;
        }
        .arrival-departure {
          font-size: 12px;
          text-align: center;
        }
        .vip-status {
          font-weight: bold;
          text-transform: uppercase;
          font-size: 14px;
        }
        .GLOB {
          color: #2f75b5;
        }
        .header-page-title {
          color: black;
        }
        .vip-name {
          color: black;
          font-weight: bold;
          font-size: 14px;
        }
        .header-page-number {
          color: white;
          font-weight: bold;
          background-color: #16365c;
          height: 32px;
          width: 64px;
          display: flex;
          justify-content: center;
          text-align: center;
          align-content: center;
          align-items: center;
          margin-right: 8px;
          padding-left: 8px;
        }
        .header {
          font-size: 22px;
          height: 2cm;
          width: 100%;
          display: flex;
          justify-content: left;
          text-align: center;
          align-content: center;
          align-items: center;
          padding-top: 24px;
        }
        .header-center {
          width: 100%;
          display: flex;
          justify-content: left;
          text-align: center;
          align-content: center;
          align-items: center;
        }
      </style>
    </head>
    
    <html>
      <body>
        ${pageLoop(vipData)}
      </body>
    </html>
          
          `;

    await fs.appendFile(
      `/tmp/html-${accessToken}.html`,
      HTML,
      function (err: any) {
        if (err) throw reject({url:null,success:false,error:err});
        console.log("Saved! HTML");
      }
    );

    const input = await PDFServicesSdk.FileRef.createFromLocalFile(
      `/tmp/html-${accessToken}.html`
    );
    htmlToPDFOperation.setInput(input);
    // Provide any custom configuration options for the operation.
    setCustomOptions(htmlToPDFOperation);

    // Execute the operation and Save the result to the specified location.
    await htmlToPDFOperation
      .execute(executionContext)
      .then(async (result: any) => {
        //await result.saveAsFile('createPDFFromHTMLWithInlineCSSOutput.pdf')
        //fs.createReadStream('createPDFFromHTMLWithInlineCSSOutput.pdf')
        await result.saveAsFile(
          `/tmp/VIP's Detailed - ${accessToken}.pdf`
        );

        const bucket = admin.storage().bucket();

        const options = {
          destination: `detailedVIPs/VIP's Detailed - ${accessToken}.pdf`,
          public: true,
          metadata: {
            contentType: "application/pdf",
            metadata: {
              firebaseStorageDownloadTokens: accessToken,
            },
          },
        };
        await bucket
          .upload(
            `/tmp/VIP's Detailed - ${accessToken}.pdf`,
            options
          )
          .then( async (data: any) => {
            //const file = data[0];
            //console.log('upload', file);
            console.log("uploaded");
            //resolve({success: true})
            //let file_name = `detailedVIPs/VIP's Detailed - ${accessToken}.pdf`;
            // const file = bucket.file(file_name);
            // const url = await file.getSignedUrl({
            //   version: "v4",
            //   action: "read",
            //   expires: Date.now() + 24 * 60 * 60 * 1000,
            // });
            const url = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/${replaceWhitespace(options.destination)}?alt=media&token=${accessToken}`

//         return { url };
            return resolve({url,success:true,error:null})
          })
          .catch((err: any) => {
            console.log("Error uploading to storage", err);
            reject(err)
            throw new functions.https.HttpsError(
              "failed-precondition",
              `Error uploading to storage: ${err}`
            )
            

          });
      })
      .catch((err: any) => {
        if (
          err instanceof PDFServicesSdk.Error.ServiceApiError ||
          err instanceof PDFServicesSdk.Error.ServiceUsageError
        ) {
          console.log("Exception encountered while executing operation 1", err);
          return reject({url:null,success:false,error:err})
        } else {
          console.log("Exception encountered while executing operation 2", err);
          return reject({url:null,success:false,error:err})
        }
      });
  } catch (err) {
    console.log("Exception encountered while executing operation 3", err);
    return reject({url:null,success:false,error:err})
  }
})


return _url;


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

    // if(isValidString(updateData['arrival']) && isValidString(updateData['departure'])){
    //   const arrDate:Date = unformatDate(`${updateData['arrival']}`),
    //   depDate:Date = unformatDate(`${updateData['departure']}`),
    //   todDate:Date = new Date();

    //   if(arrDate < todDate){
    //     updateData[`reservationStatus`] = `RESERVED`
    //   }else if(arrDate === todDate){
    //     updateData[`reservationStatus`] = `DUEIN`
    //   }else if(arrDate > todDate && depDate < todDate){
    //     updateData[`reservationStatus`] = `CHECKEDIN`
    //   }else if(arrDate > todDate && depDate === todDate){
    //     updateData[`reservationStatus`] = `DUEOUT`
    //   }else if(arrDate > todDate && depDate > todDate){
    //     updateData[`reservationStatus`] = `CHECKEDOUT`
    //   }else{
    //     updateData[`reservationStatus`] = null
    //   }
    // }

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
      updateData[x] = [{ label: ``, id: `` }];
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
    // reservationStatus
    x = `reservationStatus`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
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
      updateData.reservationStatus, // reservationStatus?:'DUEIN'|'DUEOUT'|'CHECKEDIN'|'CHECKEDOUT'|'RESERVED'|'NOSHOW'|'CANCEL',
      updateData.roomNumber || null, // roomNumber?: string,
      updateData.roomStatus || [{ id: ``, label: `` }], // roomStatus?: [],
      updateData.vipStatus || [{ id: ``, label: `` }], // vipStatus?: [],
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


    // reservationStatus
    x = `reservationStatus`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
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
    // reservationStatus
    x = `reservationStatus`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
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
  .onCreate(async (snap: FirebaseFirestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const _vip = snap.data() as VIPClass
    const totalsUpdate: any = {};
    totalsUpdate["total"] = increment;
    totalsUpdate[`${_vip.reservationStatus}`] = increment;
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
  .onUpdate(async (change: functions.Change<FirebaseFirestore.QueryDocumentSnapshot>, context: functions.EventContext) => {
    const beforeCollection = change.before.data() as VIPClass;
    const afterCollection = change.after.data() as VIPClass;
    const totalsUpdate:any = {}
    if (beforeCollection.reservationStatus !== afterCollection.reservationStatus) {
      totalsUpdate[`${beforeCollection.reservationStatus}`] = decrement
      totalsUpdate[`${afterCollection.reservationStatus}`] = increment
    }
    const totalRef = db.collection("Totals").doc("ArrivalVIPs");
    try {
      await totalRef.set(totalsUpdate, { merge: true });
    } catch (e) {
      console.log('Error updating totals')
      console.log(e)
    }
    return
  });
//firebase deploy --only functions:onDeleteArrivalVIP
exports.onDeleteArrivalVIP = functions.firestore
  .document("ArrivalVIPs/{id}")
  .onDelete(async (snap: FirebaseFirestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const totalsUpdate: any = {};
    totalsUpdate["total"] = decrement;
    const totalRef = db.collection("Totals").doc("ArrivalVIPs");
    const _vip = snap.data() as VIPClass

    totalsUpdate[`${_vip.reservationStatus}`] = decrement;

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
      updateData[x] = [{ id: ``, label: `` }];
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
      updateData.roomStatus || [{ id: ``, label: `` }], // roomStatus?: [],
      updateData.vipStatus || [{ id: ``, label: `` }], // vipStatus?: [],
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





// //firebase deploy --only functions:exportAdobeDetailedVipX
// exports.exportAdobeDetailedVipX = functions.https.onCall(async () => {
//   /**
//    * Get vip data
//    */

//   const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");

//   /**
//    * This sample illustrates how to create a PDF file from a HTML file with inline CSS.
//    * <p>
//    * Refer to README.md for instructions on how to run the samples.
//    */

//   /**
//    * Sets any custom options for the operation.
//    *
//    * @param htmlToPDFOperation operation instance for which the options are provided.
//    */
//   const setCustomOptions = (htmlToPDFOperation: any) => {
//     // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
//     const pageLayout = new PDFServicesSdk.CreatePDF.options.html.PageLayout();
//     pageLayout.setPageSize(20, 25);

//     // Set the desired HTML-to-PDF conversion options.
//     const htmlToPdfOptions =
//       new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
//         .includesHeaderFooter(true)
//         .withPageLayout(pageLayout)
//         .build();
//     htmlToPDFOperation.setOptions(htmlToPdfOptions);
//   };
//   try {
//     // Initial setup, create credentials instance.
//     const credentials =
//       await PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
//         .fromFile("pdfservices-api-credentials.json")
//         .build();
//     // Create an ExecutionContext using credentials and create a new operation instance.
//     const executionContext = await PDFServicesSdk.ExecutionContext.create(
//         credentials
//       ),
//       htmlToPDFOperation = PDFServicesSdk.CreatePDF.Operation.createNew();
//     // Set operation input from a source file.
//     const input = await PDFServicesSdk.FileRef.createFromLocalFile(
//       "resources/createPDFFromHTMLWithInlineCSSInput.html"
//     );
//     await htmlToPDFOperation.setInput(input);
//     // Provide any custom configuration options for the operation.
//     setCustomOptions(htmlToPDFOperation);

//     // Execute the operation and Save the result to the specified location.
//     await htmlToPDFOperation
//       .execute(executionContext)
//       .then(async (result: any) => {
//         await result.saveAsFile(
//           "/tmp/createPDFFromHTMLWithInlineCSSOutput4.pdf"
//         );

//         const bucket = admin.storage().bucket();
//         const accessToken = uuid.v4();

//         let file_name = `detailedVIPs/test-adobe.pdf`;
//         const file = bucket.file(file_name);

//         await new Promise<void>((resolve, reject) => {
//           fs.createReadStream("/tmp/createPDFFromHTMLWithInlineCSSOutput4.pdf")
//             .pipe(
//               file.createWriteStream({
//                 metadata: {
//                   contentType: "application/pdf",
//                   firebaseStorageDownloadTokens: accessToken,
//                 },
//               })
//             )
//             .on("error", function (err: any) {
//               console.log("stream error");
//               console.log(err);
//               reject(err);
//             })
//             .on("finish", function () {
//               console.log("stream complete");
//               resolve();
//               // The file upload is complete.
//             });
//         });
//         let file_name = `detailedVIPs/test-adobe.pdf`;
//         const file = bucket.file(file_name);
//         const url = await file.getSignedUrl({
//           version: "v4",
//           action: "read",
//           expires: Date.now() + 24 * 60 * 60 * 1000,
//         });

//         return { url };
//       })
//       .catch((err: any) => {
//         if (
//           err instanceof PDFServicesSdk.Error.ServiceApiError ||
//           err instanceof PDFServicesSdk.Error.ServiceUsageError
//         ) {
//           console.log("Exception encountered while executing operation 1", err);
//           throw new functions.https.HttpsError(
//             "failed-precondition",
//             `Exception encountered while executing operation 1 - ${err}`
//           );
//         } else {
//           console.log("Exception encountered while executing operation 2", err);
//           throw new functions.https.HttpsError(
//             "failed-precondition",
//             `Exception encountered while executing operation 2 - ${err}`
//           );
//         }
//       });
//   } catch (err) {
//     console.log("Exception encountered while executing operation 3", err);
//     throw new functions.https.HttpsError(
//       "failed-precondition",
//       `Exception encountered while executing operation 3 - ${err}`
//     );
//   }
// });