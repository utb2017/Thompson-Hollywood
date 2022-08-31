const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const twilio = require('twilio');
const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const client = new twilio(accountSid, authToken);
const twilioNumber = '+13236153398';
const phoneNumber = '+17066152562';


function sendText(PhoneNumber, Message){    
        if ( !validE164(PhoneNumber) ) {
            throw new Error('number must be E164 format!')
        }
        const textMessage = {
            body: Message,
            to: PhoneNumber,  // Text to this number
            from: twilioNumber // From a valid Twilio number
        }
        client.messages.create(textMessage);
}
function validE164(num) {
    return /^\+?[1-9]\d{1,14}$/.test(num)
}

exports.dispatchApplication = functions.https.onCall((data, context) => {
    const { photoURL } = data;
    const uid = context.auth.uid;
    const name = context.auth.token.name || null;
    const picture = context.auth.token.picture || null;
    const email = context.auth.token.email || null;
    let error = null;
    if (!context.auth) {
        error = 'The function must be called while authenticated.'
        return { error }
    }
    sendText( phoneNumber, "📞Twilio📞: Applicant - " + photoURL  )
    return { uid, email, name, error, picture, photoURL };
});


exports.openStore = functions.pubsub.schedule('0 15 * * *')
  .timeZone('America/Los_Angeles') 
  .onRun((context) => {
    admin.database().ref('/ControlPanel').update({open: true});
    console.log('Open the Store!');
});


exports.closetStore = functions.pubsub.schedule('0 21 * * *')
  .timeZone('America/Los_Angeles') 
  .onRun((context) => {
    admin.database().ref('/ControlPanel').update({open: false});
    console.log('Close the Store!');
});


exports.placeOrder = functions.https.onCall((data, context) => {
    let err = "none";
    if (!context.auth) {
        err = 'not-logged-in'
        return err 
    }
    const db = admin.database();
    const ref = db.ref("/");    
    var ordersRef = ref.child("Orders");
    const newOrderRef = ordersRef.push( data, (error) => {
        if (error) {
            console.log("Data could not be saved." + error);
        } else {
            console.log("Data saved.");
        }
      } )
    const orderNumber = newOrderRef.key;
    sendText( phoneNumber, "📞Twilio📞 & 🔥Functions🔥 - New Order :"+ orderNumber   )
    return { error:err, orderNumber };
});


