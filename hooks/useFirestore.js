import firebase from "../firebase/clientApp"

export function useFirestore(){
    
    const getDocument = (documentPath, onUpdate) => {
      firebase.firestore()
        .doc(documentPath)
        .onSnapshot(onUpdate);
    }
  
    const saveDocument = (documentPath, document) => {
      firebase.firestore()
        .doc(documentPath)
        .set(document);
    }
  
    const getCollection = (collectionPath, onUpdate) => {
      firebase.firestore()
        .collection(collectionPath)
        .onSnapshot(onUpdate);
    }
  
    const saveCollection = (collectionPath, collection) => {
      firebase.firestore()
        .collection(collectionPath)
        .set(collection)
    }
  
    return { getDocument, saveDocument, getCollection, saveCollection }
  }
  