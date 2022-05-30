import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();


//firebase deploy --only functions:textCustomer
exports.textCustomer = functions.https.onCall((data) =>{ 
  return new Promise(async (resolve) => {     
    resolve({response:"sent"})
    return;    
  })
});








