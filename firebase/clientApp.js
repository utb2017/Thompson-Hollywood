import firebase from 'firebase/app'
import 'firebase/auth' // If you need it
import 'firebase/firestore' // If you need it
import 'firebase/storage' // If you need it
import 'firebase/analytics' // If you need it
import 'firebase/database' // If you need it
import 'firebase/functions' // If you need it

const clientCredentials = {
  apiKey: "AIzaSyDnpHMjUokbafQQCNIrjIHb3y72m1SogTM",
  authDomain: "thompson-hollywood.firebaseapp.com",
  projectId: "thompson-hollywood",
  storageBucket: "thompson-hollywood.appspot.com",
  messagingSenderId: "721374836916",
  appId: "1:721374836916:web:cd761c3880d665c5eb7fe1"
}

const PROGRESS = [ "received", "pending", "assigned", "pickup", "warning", "arrived", "complete", "cancel", 'settled']

// Check that `window` is in scope for the analytics module!
if (typeof window !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp(clientCredentials)
  // To enable analytics. https://firebase.google.com/docs/analytics/get-started
  if ('measurementId' in clientCredentials) (firebase.analytics())
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}


export const assignOrders = ({
  current = 'error', 
  latitude = false, 
  longitude = false, 
  id = [],
}) => {
  return new Promise((resolve, reject) => {

    let orderUpdates = {};
      for (let i = 0; i < id.length; i++) {
        orderUpdates[`/${id[i]}/progress`] = {
          current: current,
          time: new Date().toLocaleString('en-US'),
          lat: latitude,
          lng: longitude,
        };
      }
      if(!isEmpty(orderUpdates)){
        firebase.database()
          .ref(`Orders/`)
          .update(orderUpdates)
          .then(() =>  resolve({id, current, latitude, longitude}))
          .catch((e) => reject(e)); 
      }else{
        reject({message:"No updates"})
      }

  });
}
export const fireCloud = (x) => {
  return firebase.functions().httpsCallable(x);
};

export const triggerSync = () => {
    const sync = firebase.functions().httpsCallable("triggerVehicleSync");
    sync();
};


// export const getMapboxDirectionsX = ({lat1, lon1, lat2, lon2}) => {
//   return new Promise((resolve, reject) => {
//     const getAddress = firebase.functions().httpsCallable("getMapboxDirectionsX");
//     getAddress({lat1, lon1, lat2, lon2})
//     .then(r => resolve(r))
//     .catch(e => reject(e));
//   });
// };

export const getReverseGeocode = ({lat, lon}) => {
  return new Promise((resolve, reject) => {
    const getAddress = firebase.functions().httpsCallable("reverseGeocodeGoogle");
    getAddress({ lat, lon })
    .then(r => resolve(r))
    .catch(e => reject(e));
  });
};
export const getDistanceMatrix = async({lat, lng, dLat, dLng}) => {
  const getDistance = firebase.functions().httpsCallable("getDistance");
  const dist = await getDistance({ lat, lng, dLat, dLng });
  return dist;
}
export const getMatrix = async({origins, destinations}) => {
  const getDistance = firebase.functions().httpsCallable("getDistanceMatrix");
 // const dist = await getDistance({origins, destinations});
 // return dist;

  return new Promise((resolve, reject) => {
      getDistance({origins, destinations})
      .then(r => resolve(r))
      .catch(e => reject(e));
  });
}


export const loginWithEmail = ({email, password}) => {
  return new Promise((resolve, reject) => {
    firebase.auth()
      .signInWithEmailAndPassword(email, password)
      .then(r => resolve(r))
      .catch(e => reject(e));
  });
};
export const logout = () => {
  return firebase.auth().signOut();
};

export const updateAuth = ( update ) => {
  return new Promise((resolve, reject) => {
    const user = firebase.auth().currentUser;
    user.updateProfile( update )
    .then(() => resolve(update))
    .catch(e => reject(e));
  });
};
export const updateDatabase = ({ref, update}) => {
  return new Promise((resolve, reject) => {
      firebase.database()
      .ref(ref)
      .update(update)
      .then(() =>  resolve(update))
      .catch((e) => reject(e));
  });
}
export const updateFirestoreX = ( collection, doc, update ) => {
  return new Promise((resolve, reject) => {
    firebase.firestore()
      .collection(collection)
      .doc(doc)
      .update(update)
      .then(() =>  resolve(update))
      .catch((e) => reject(e));
  });
}
export const updateFirestore = async ( collection, doc, update ) => {
  return await firebase.firestore().collection(collection).doc(doc).update(update)
}
export const mergeFirestore = async ( collection, doc, update ) => {
  return await firebase.firestore().collection(collection).doc(doc).set(update, {merge:true})
}
export const updateFirestoreGroup = async ( collection, doc, subCollection, subDoc,  update ) => {
  return await firebase.firestore().collection(collection).doc(doc).collection(subCollection).doc(subDoc).update(update)
}
export const placeAnOrderX = (order) => {
  return new Promise((resolve, reject) => {
    firebase.firestore()
      .collection('orders')
      .add(order)
      .then((r) =>  resolve(r))
      .catch((e) => reject(e));
  });
}
export const placeAnOrder = async (order) => {
    const db = firebase.firestore();
    const ref = db.collection('orders').doc();
    const id = ref.id;   
    await ref.set({...order,...{id}})
    return ref; 
}



export const addCart_v2 = async (inputs) => {
    const call = firebase.functions().httpsCallable("cartAdd_v2");
    const result = await call(inputs)
    return result
}
export const cartRemove_v2 = async (inputs) => {
  const call = firebase.functions().httpsCallable("cartRemove_v2");
  const result = await call(inputs)
  return result
}
export const cartIncrement_v2 = async (inputs) => {
  const call = firebase.functions().httpsCallable("cartIncrement_v2");
  const result = await call(inputs)
  return result
}
export const updateProduct = async (form) => {
  const call = firebase.functions().httpsCallable("updateProduct");
  const result = await call(form)
  return result
}
//form{
  //user:string
  //amount:number
  //title:string    
//}
export const addCredit = async (form) => {
  const call = firebase.functions().httpsCallable("addCredit");
  const result = await call(form)
  return result
}
export const deleteCredit = async (form) => {
  const call = firebase.functions().httpsCallable("removeCredit");
  const result = await call(form)
  return result
}
export const deleteBlacklisting = async (form) => {
  const call = firebase.functions().httpsCallable("deleteBlacklisting");
  const result = await call(form)
  return result
}



export const addToFirestoreCart = ( doc, update ) => {
  return new Promise((resolve, reject) => {
    firebase.firestore()
      .collection('cart')
      .doc(doc)
      .set({[update.pid]: update}, { merge: true })
      .then(() =>  resolve(update))
      .catch((e) => reject(e));
  });
}
export const incrementFirestoreCart = ( inc, doc, key ) => {
  return new Promise((resolve, reject) => {
    const increment = firebase.firestore.FieldValue.increment(inc);
    const update = {};
    update[`${key}.qty`] = increment
    firebase.firestore()
      .collection('cart')
      .doc(doc)
      .update(update)
      .then(() =>  resolve(update))
      .catch((e) => reject(e));
  });
}
export const removeFromFirestoreCart = ( doc, key ) => {
  return new Promise((resolve, reject) => {
    const FieldValue = firebase.firestore.FieldValue;
    firebase.firestore()
      .collection('cart')
      .doc(doc)
      .update({
        [key]: FieldValue.delete()
      })
      .then(() =>  resolve(key))
      .catch((e) => reject(e));
  });
}
export const deleteFirestoreCart = ( doc ) => {
  return new Promise((resolve, reject) => {
    firebase.firestore()
      .collection('cart')
      .doc(doc)
      .delete()
      .then(() =>  resolve(doc))
      .catch((e) => reject(e));
  });
}

export const createFirestoreRecord = (collection, record) => {
  return new Promise((resolve, reject) => {
    firebase
      .firestore()
      .collection(collection)
      .add(record)
      .then(() => resolve(record))
      .catch((e) => reject(e))
  })
}

export const deleteFirestoreRecord = async (collection, id) => {
    const res = await firebase
      .firestore()
      .collection(collection)
      .doc(id)
      .delete()
     return res
}


export const createFirestoreUser = (user) => {
  return new Promise((resolve, reject) => {
    firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .set(user)
      .then(() => resolve(user))
      .catch((e) => reject(e))
  })
}
export const deleteFirestoreUser = (user) => {
  return new Promise((resolve, reject) => {
    firebase
      .firestore()
      .collection('users')
      .doc(user.uid)
      .delete()
      .then(() => resolve(user))
      .catch((e) => reject(e))
  })
}



export const createAuthUser = async (data) => {
    const createUser = firebase.functions().httpsCallable("createAuthUser");
    const result = await createUser(data)
    console.log('result createAuthUser');
    console.log(result);
    return result
}
export const updateAuthUser = async (data) => {
  const updateUser = firebase.functions().httpsCallable("updateAuthUser");
  const result = await updateUser(data)
  return result
}
export const deleteAuthUser = async (data) => {
  const deleteUser = firebase.functions().httpsCallable("deleteAuthUser");
  const result = await deleteUser(data)
  return result
}
export const findAddCustomer = async (data) => {
  const _findAddCustomer = firebase.functions().httpsCallable("findAddCustomer");
  const result = await _findAddCustomer(data)
  return result
}






export const getUserByPhone = async (phone) => {
    const getByPhone = firebase.functions().httpsCallable("getUserByPhone");
    console.log('http getUserByPhone data');
    console.log(phone);
    const {data} = await getByPhone(phone)
    console.log('result');
    console.log(data);
    return data
}
export const getFireUserByPhone = async ({uid}) => {
   console.log('getFireUserByPhone uid');
   console.log(uid);
  const result = await firebase.firestore().collection('users').doc(uid).get()
 
  console.log('getFireUserByPhone result');
  console.log(result.data());
  return result.data()
}
export const getFirestoreDocument = async (collection, doc) => {
 const result = await firebase.firestore().collection(collection).doc(doc).get()
 return result.data()
}


export const signUpWithEmail = ({email, password, displayName}) => {
  return new Promise((resolve, reject) => {
    firebase.auth()
      .createUserWithEmailAndPassword(email, password)
      .then(({user}) => createFirestoreUser({...user,...{displayName},...{role:"driver"}}))
      .then(()=> updateAuth({displayName}))
      .then(() => resolve({email, password, displayName}))
      .catch(e => reject(e))

  });
};


export const sendCode = (phoneNumber, appVerifier) => {
  return new Promise((resolve, reject) => {
    firebase.auth()
      .signInWithPhoneNumber(phoneNumber, appVerifier)
      .then(confirmationResult =>
        resolve((window.confirmationResult = confirmationResult)),
      )
      .catch(e => reject(e));
  });
};


export const linkPhone = code => {
  return new Promise((resolve, reject) => {
    const credentials = firebase.auth.PhoneAuthProvider.credential(
      window.confirmationResult.verificationId,
      code,
    );
    firebase.auth().currentUser
    //.linkAndRetrieveDataWithCredential(credentials)
    .linkWithCredential(credentials)
      .then((usercred) => resolve(usercred.user))
      .catch(e => reject(e));
  });
};


export const reAuthenticateAuth = ({email, password}) => {
  return new Promise((resolve, reject) => {
    const credentials = firebase.auth.EmailAuthProvider.credential(
      email,
      password,
    );
    firebase.auth().currentUser
      .reauthenticateWithCredential(credentials)
      .then(({user}) => resolve(user))
      .catch(e => reject(e));
  });
}


export const updateAuthEmail = (user) => {
  return new Promise((resolve, reject) => {
    const { email } = user
    firebase.auth().currentUser
      .updateEmail(email)
      .then(() => resolve(user))
      .catch(e => reject(e));
  });
}

export const updateAuthPassword = ({newPassword}) => {
  return new Promise((resolve, reject) => {
    firebase.auth().currentUser
      .updatePassword(newPassword)
      .then(() => resolve(newPassword))
      .catch(e => reject(e));
  });
}
export const updateAuthPhone = code => {
  return new Promise((resolve, reject) => {
    const credentials = firebase.auth.PhoneAuthProvider.credential(
      window.confirmationResult.verificationId,
      code,
    );
    firebase.auth().currentUser
      .updatePhoneNumber(credentials)
      .then(() => resolve(firebase.auth().currentUser))
      .catch(e => reject(e));
  });
};

export const resetPasswordEmail = email => {
  const actionCodeSettings = {
    url: 'https://www.example.com/?email=user@example.com',
  };
  return new Promise((resolve, reject) => {
    firebase.auth()
      .sendPasswordResetEmail(email)
      .then(() => resolve(email))
      .catch(e => reject(e));
  });
};

export const resetPassword = (code, newPassword) => {
  return new Promise((resolve, reject) => {
    firebase.auth()
      .confirmPasswordReset(code, newPassword)
      .then(r => resolve(r))
      .catch(e => reject(e))
  });
};


export const timeStamp = firebase.firestore.FieldValue.serverTimestamp()

export const reCaptcha = firebase.auth.RecaptchaVerifier;


export const GeoPoint = firebase.firestore.GeoPoint;

export default firebase
