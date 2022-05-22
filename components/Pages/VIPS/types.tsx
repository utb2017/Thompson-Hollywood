import firebase from "../../../firebase/clientApp";
export interface Ref {
  current:HTMLDivElement|null
}
export interface EventTarget {
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
  dispatchEvent(evt: Event): boolean;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, useCapture?: boolean): void;
  checked?: boolean;
  name?: string;
}
export interface SyntheticEvent {
  bubbles: boolean;
  cancelable: boolean;
  currentTarget: EventTarget;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  nativeEvent: Event;
  preventDefault(): void;
  stopPropagation(): void;
  target: EventTarget;
  timeStamp: Date;
  type: string;
}
export interface Collection {
  active: boolean | null;
  cartLimit: number | null;
  description: string | null;
  featured: boolean | null;
  flower: boolean | null;
  genome: boolean | null;
  id?: string | null;
  img: string | null;
  filePath: string | null;
  key: string | null;
  menuOrder?: number | null;
  onSale: boolean | null;
  saleCode: string | null;
  saleTitle: string | null;
  saleRate: number | null;
  sales?: number | null;
  sold?: number | null;
  title: string | null;
  total?: number | null;
  weight: boolean | null;
}
export interface Brand {
  active: boolean | null;
  title: string | null;
  description: string | null;
  total?: number | null;
  cartLimit: number | null;
  onSale: boolean | null;
  saleRate: number | null;
  menuOrder?: number | null;
  featured: boolean | null;
  sold?: number | null;
  sales?: number | null;
  id?: string | null;
  img: string | null;
  filePath: string | null;
}
export interface Errors {
  title:string
}
export type Selected = {
  label: string | number;
  value: string | Date;
};
export class DiscountClass {
  active: boolean;
  alert: boolean;
  alertSent: boolean;
  bogoQty?: number;
  code: string;
  collectionIDs: string[];
  collections: Selected[];
  dateEnd?: firebase.firestore.FieldValue | Date;
  dateStart: firebase.firestore.FieldValue | Date;
  days: string[];
  featured: boolean;
  filters: string[] | null;
  id: string;
  method: Selected;
  methodID: "flatRate" | "percent" | "taxFree" | "bogo";
  rate: number;
  recurring: boolean;
  recurringDays: Selected[] | undefined;
  sort: "coupon";
  stackable: boolean;
  title: string | null;
  type: { [k: string]: any } | undefined;
  uid: string | null;
  used: boolean;
  happyHour: boolean;
  startHour: number | null | Date | Selected;
  endHour: number | null | Date | Selected;
  //queryIDs: string[];

  constructor(
    active: boolean,
    alert: boolean,
    bogoQty: number,
    code: string | null,
    collectionIDs: string[],
    collections: Selected[],
    dateEnd: firebase.firestore.FieldValue | Date | null,
    dateStart: firebase.firestore.FieldValue | Date,
    days: string[],
    featured: boolean,
    id: string | null,
    method: Selected,
    methodID: "flatRate" | "percent" | "taxFree" | "bogo",
    rate: number,
    recurring: boolean,
    recurringDays: Selected[] | undefined,
    sort: "coupon",
    stackable: boolean,
    title: string | null,
    type: { [k: string]: any } | undefined,
    uid: string | null,
    used: boolean,
    happyHour: boolean,
    startHour: number | null | Date | Selected,
    endHour: number | null | Date | Selected
  ) {
    this.active = active;
    this.alert = alert;
    this.alertSent = false;
    this.bogoQty = bogoQty;
    this.code = code;
    this.collectionIDs = collectionIDs;
    this.collections = collections;
    this.dateEnd = dateEnd;
    this.dateStart = dateStart;
    this.days = days;
    this.featured = featured;
    this.filters = [];
    this.id = id;
    this.method = method;
    this.methodID = methodID;
    this.rate = rate;
    this.recurring = recurring;
    this.recurringDays = recurringDays;
    this.sort = sort;
    this.stackable = stackable;
    this.title = title;
    this.type = type;
    this.uid = uid;
    this.used = used;
    this.happyHour = happyHour;
    this.startHour = startHour;
    this.endHour = endHour;
  }
}
