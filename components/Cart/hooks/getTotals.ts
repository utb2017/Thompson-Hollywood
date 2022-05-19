import React, { useEffect, useState, FC, ReactElement, useCallback, memo } from "react";
import firebase from "../../../firebase/clientApp";
import { useUser } from "../../../context/userContext";



type CartDiscount = {
  hasDiscount?: boolean;
  discountMethod?: "flatRate" | "percent" | "taxFree" | "bogo";
  discountRate?: any;
  discountID?: string;
  loading?: boolean;
};
interface TotalsCart extends CartDiscount {
  subtotal: number;
  localTax: number;
  exciseTax: number;
  stateTax: number;
  discountTotal?: number;
  minOrder?: number;
  freeDeliveryMin?: number;
  deliveryFee?: number;
  serviceFee?: number;
  taxTotal: number;
  wholesale?: number;
  priceTotal: number;
  productsSold: number;
  profit?: number;
  profitWithDelivery?: number;
  profitWithDeliveryMinusFee?: number;
  taxedSubtotal?: number;
  loading?: boolean;
}
type QueryError = {
  message?: string;
  code?: string;
};
// type QueryCartData = {
//   data?: TotalsCart;
//   status: string;
//   error?: QueryError;
// };
// type CartTotalsProps = {
//   fireCartTotals: QueryCartData;
// };
type DiscountTotals = {
  id: string;
  value: number;
};
type Selected = {
  label: string | number | Date;
  value: string | number | Date;
};
class DiscountClass {
  active: boolean;
  alert: boolean;
  alertSent: boolean;
  bogoQty?: number;
  code: string | null;
  collectionIDs: string[];
  collections: Selected[];
  dateEnd?: any;
  dateStart: any;
  days: string[];
  featured: boolean;
  filters: string[] | null;
  id: string | null;
  method: Selected;
  methodID: "flatRate" | "percent" | "taxFree" | "bogo";
  rate: number | null;
  recurring: boolean;
  recurringDays: Selected[] | undefined;
  sort: "coupon";
  stackable: boolean;
  title: string | null;
  type: { [k: string]: any } | undefined;
  uid: string | null;
  used: boolean;
  happyHour: boolean;
  startHour: Selected;
  endHour: Selected;
  //queryIDs: string[];

  constructor(
    active: boolean,
    alert: boolean,
    bogoQty: number,
    code: string | null,
    collectionIDs: string[],
    collections: Selected[],
    dateEnd: any | null,
    dateStart: any,
    days: string[],
    featured: boolean,
    id: string | null,
    method: Selected,
    methodID: "flatRate" | "percent" | "taxFree" | "bogo",
    rate: number,
    recurring: boolean,
    recurringDays: Selected[] | undefined,
    //sort: "coupon",
    stackable: boolean,
    title: string | null,
    //type: { [k: string]: any } | undefined,
    uid: string | null,
    used: boolean,
    happyHour: boolean,
    startHour: Selected,
    endHour: Selected
  ) {
    this.active = active || false;
    this.alert = alert || false;
    this.alertSent = false;
    this.bogoQty = bogoQty || 2;
    this.code = code || null;
    this.collectionIDs = collectionIDs || [];
    this.collections = collections || [];
    this.dateEnd = dateEnd || null;
    this.dateStart = dateStart || null;
    this.days = days || [];
    this.featured = featured || false;
    this.filters = [];
    this.id = id || null;
    this.method = method || { label: `Flat rate`, value: "flatRate" };
    this.methodID = methodID || `flatRate`;
    this.rate = rate || null;
    this.recurring = recurring || false;
    this.recurringDays = recurringDays || [];
    this.sort = "coupon";
    this.stackable = stackable || false;
    this.title = title || null;
    this.type = { label: "Coupon", value: "coupon" };
    this.uid = uid || null;
    this.used = used || false;
    this.happyHour = happyHour || false;
    this.startHour = startHour || null;
    this.endHour = endHour || null;
  }
}


type Credits = {
  amount: number;
  initialAmount: number;
  created: firebase.firestore.FieldValue;
  id: string;
  title: string;
  used: boolean;
  user: string;
};
type CartItems = {
  id: string;
  img: string[];
  genome: string;
  inventory: number;
  name: string;
  pid: string;
  uid: string;
  price: number;
  qty: number;
  size: string;
  type: string;
  //collection: string;
  discountRate: number;
  hasDiscount: boolean;
  discountTotal: number;
  wholesale: number;
  onSale: boolean | null;
  saleRate: number | null;
  couponID?: string;
  brand: Selected;
  brandID: string;
  queryIDs: string[];
  collections: Selected[];
  collectionIDs: string[];
  saleTitle: string | string[];
};
type Discounts = {
  active: boolean;
  alert: boolean;
  alertSent: boolean;
  bogoQty?: number;
  code: string;
  collectionIDs: string[];
  collections: Selected[];
  dateEnd?: firebase.firestore.FieldValue;
  dateStart: firebase.firestore.FieldValue;
  days: string[];
  featured: boolean;
  filters: string[] | null;
  id: string;
  method: Selected;
  methodID: "flatRate" | "percent" | "taxFree" | "bogo";
  rate: number;
  recurring: boolean;
  recurringDays: Selected[] | undefined;
  sort: "credit" | "coupon" | "refund";
  stackable: boolean;
  title: string | null;
  type: { [k: string]: any } | undefined;
  uid: string | null;
  used: boolean;
  //queryIDs: string[];
};
class CartTotals {
  subtotal: number;
  deliveryFee: number;
  deliveryTotal: number;
  stateTax: number;
  localTax: number;
  exciseTax: number;
  grandTotal: number;
  serviceFee: number;
  totalItemsSold: number;
  minOrder: number;
  freeDeliveryMin: number;
  productsTotal: number;
  //productsPrice: number;
  taxableSubtotal: number;
  stateTaxTotal: number;
  exciseTaxTotal: number;
  localTaxTotal: number;
  combinedTaxTotal: number;
  wholesaleTotal: number;
  profitTotal: number;
  freeDelivery: boolean;
  discountsApplied: number;
  discountsTotal: number;
  totalSaved: number;
  creditsApplied: number;
  creditTotal: number;
  creditRemainder: number;
  serviceFeeTotal: number;
  savedTaxTotal: number;
  initialCredit: number;
  //discount: number;

  constructor(
    subtotal: number,
    deliveryFee: number,
    deliveryTotal: number,
    stateTax: number,
    localTax: number,
    exciseTax: number,
    grandTotal: number,
    serviceFee: number,
    totalItemsSold: number,
    minOrder: number,
    freeDeliveryMin: number,
    productsTotal: number,
    //productsPrice: number,
    taxableSubtotal: number,
    stateTaxTotal: number,
    exciseTaxTotal: number,
    localTaxTotal: number,
    combinedTaxTotal: number,
    wholesaleTotal: number,
    profitTotal: number,
    discountsTotal: number,
    discountsApplied: number,
    freeDelivery: boolean,
    totalSaved: number,
    creditsApplied: number,
    creditTotal: number,
    creditRemainder: number,
    serviceFeeTotal: number,
    savedTaxTotal: number,
    initialCredit: number
    //discount: number
  ) {
    this.stateTax = stateTax || 0;
    this.exciseTax = exciseTax || 0;
    this.localTax = localTax || 0;
    this.subtotal = subtotal || 0;
    this.deliveryFee = deliveryFee || 0;
    this.deliveryTotal = deliveryTotal || 0;
    this.grandTotal = grandTotal || 0;
    this.serviceFee = serviceFee || 0;
    this.totalItemsSold = totalItemsSold || 0;
    this.minOrder = minOrder || 0;
    this.freeDeliveryMin = freeDeliveryMin || 0;
    this.productsTotal = productsTotal || 0;
    //this.productsPrice = productsPrice;
    this.taxableSubtotal = taxableSubtotal || 0;
    this.stateTaxTotal = stateTaxTotal || 0;
    this.exciseTaxTotal = exciseTaxTotal || 0;
    this.localTaxTotal = localTaxTotal || 0;
    this.combinedTaxTotal = combinedTaxTotal || 0;
    this.wholesaleTotal = wholesaleTotal || 0;
    this.profitTotal = profitTotal || 0;
    this.discountsApplied = discountsApplied || 0;
    this.discountsTotal = discountsTotal || 0;
    this.freeDelivery = freeDelivery || false;
    this.totalSaved = totalSaved || 0;
    this.creditsApplied = creditsApplied || 0;
    this.creditTotal = creditTotal || 0;
    this.creditRemainder = creditRemainder || 0;
    this.serviceFeeTotal = serviceFeeTotal || 0;
    this.savedTaxTotal = savedTaxTotal || 0;
    this.initialCredit = initialCredit || 0;
    //this.discount = discount;
  }
}
interface Customer {
  name: string;
  uid: string;
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  phoneNumber: string;
  disabled: boolean;
  metadata: { creationTime: Date };
  role: "manager" | "customer" | "dispatcher" | "driver";
  status: "accepted" | "pending" | "denied";
  address: string;
  coords: number[];
  inRange: boolean;
}
type Settings = {
  localTax: number;
  stateTax: number;
  exciseTax: number;
  localTaxRate: number;
  stateTaxRate: number;
  exciseTaxRate: number;
  deliveryFee: number;
  serviceFee: number;
  freeDeliveryMin: number;
  minOrder: number;
};
class ProductClass {
  id: string | null;
  genome: Selected;
  brandID: string;
  collectionIDs: string[];
  sold: number;
  genomeID: string;
  wholesale: number;
  active: boolean;
  price: number;
  comparePrice: number;
  //effects: object;
  //collection: string;
  thc: number;
  onSale: boolean;
  inventory: number;
  saleTitle: string;
  weight: string;
  queryIDs: string[];
  saleRate: null | number | string;
  //brandID: string;
  type: Selected;
  typeID: string;
  filePath: string;
  cbd: number | string;
  img: string;
  collections: Selected[];
  key: string;
  description: string;
  brand: Selected;
  saleCode: string;
  size: string;
  name: string;
  qty?: number;
  uid?: string;

  constructor(
    id: string | null,
    genome: Selected,
    //brandID: string,
    collectionIDs: string[],
    sold: number,
    genomeID: string,
    wholesale: number,
    active: boolean,
    price: number,
    comparePrice: number,
    //effects: object,
    //collection: string,
    thc: number,
    onSale: boolean,
    inventory: number,
    saleTitle: string,
    weight: string,
    queryIDs: string[],
    saleRate: null | number | string,
    brandID: string,
    type: Selected,
    typeID: string,
    filePath: string,
    cbd: number | string,
    img: string,
    collections: Selected[],
    key: string,
    description: string,
    brand: Selected,
    saleCode: string,
    size: string,
    name: string,
    qty?: number,
    uid?: string,
  ) {
    this.id = id;
    this.genome = genome;
    //this.brandID = brandID;
    this.collectionIDs = collectionIDs;
    this.sold = sold;
    this.genomeID = genomeID;
    this.wholesale = wholesale;
    this.active = active;
    this.price = price;
    this.comparePrice = comparePrice;
    //this.effects = effects;
    //this.collection = collection;
    this.thc = thc;
    this.onSale = onSale;
    this.inventory = inventory;
    this.saleTitle = saleTitle;
    this.weight = weight;
    this.queryIDs = queryIDs;
    this.saleRate = saleRate;
    this.brandID = brandID;
    this.type = type;
    this.typeID = typeID;
    this.filePath = filePath;
    this.cbd = cbd;
    this.img = img;
    this.collections = collections;
    this.key = key;
    this.description = description;
    this.brand = brand;
    this.saleCode = saleCode;
    this.size = size;
    this.name = name;
    this.qty = qty;
    this.uid = uid;
  }
}
const roundTo = function (num: number, places: number) {
  const factor = 10 ** places;
  return Math.round(num * factor) / factor;
};






const defaultTotals = new CartTotals(
  0, // subtotal:number,
  0, // deliveryFee:number,
  0, //deliveryTotal
  0, // stateTax: number,
  0, // localTax: number,
  0, // exciseTax: number,
  0, // grandTotal: number,
  0, // serviceFee: number,
  0, // totalItemsSold: number,
  0, // minOrder: number,
  0, // freeDeliveryMin: number,
  //settingsData.freeDeliveryMin, // productsTotal: number,
  0, // productsPrice: number,
  0, // taxableSubtotal: number,
  0, // stateTaxTotal: number,
  0, // exciseTaxTotal: number,
  0, // localTaxTotal: number,
  0, // combinedTaxTotal: number,
  0, // wholesaleTotal: number,
  0, // profitTotal: number,
  0, // discountsTotal: number,
  0, // discountsApplied: number,
  false, // freeDelivery: boolean,
  0, // totalSaved: number,
  0, // creditsApplied: number,
  0, // creditTotal: number,
  0,
  0, // discount: number,
  0,
  0
);


type QueryCreditData = {
  data?: Credits[];
  status: string;
  error?: QueryError;
};
type QueryDiscountData = {
  data?: DiscountClass[];
  status: string;
  error?: QueryError;
};
type QuerySettingsData = {
  data?: Settings;
  status: string;
  error?: QueryError;
};
type QueryCartData = {
  data?: ProductClass[];
  status: string;
  error?: QueryError;
};



function getTotals() {

  //alert(JSON.stringify(props))


  const { fireCart, fireDiscounts, fireSettings, fireCredits } = useUser();
  const [cartTotals, setCartTotals] = useState<CartTotals>({ ...defaultTotals });

  useEffect(() => {

    const settingsData = fireSettings.data as Settings;
    //const customerData = fireCustomer.data as Customer;
    const cartData = fireCart.data;
    const discountData = fireDiscounts.data;
    const creditData = fireCredits.data;
    //alert(JSON.stringify(fireCart.data))
    ///CART
    if (creditData && discountData && cartData && cartData.length && settingsData) {
      let subTotal: number = 0;
      let taxedSubTotal: number = 0;
      let discountTotal: number = 0;
      let deliveryTotal: number = 0;
      let creditTotal: number = 0;
      let serviceFeeTotal: number = 0;
      let totalItemsSold: number = 0;
      let totalTaxSaved: number = 0;
      let wholesaleTotal: number = 0;
      let owedBeforeTax: number = 0;
      let youSaved: number = 0;
      let initialCredit: number = 0;

      cartData.forEach((cartItem: ProductClass) => {
        const itemPrice: number = Number(cartItem.price) * Number(cartItem.qty);
        taxedSubTotal += itemPrice;
        subTotal += itemPrice;
        owedBeforeTax += itemPrice;
        totalItemsSold += cartItem.qty;
        wholesaleTotal += cartItem.wholesale * cartItem.qty;
        if (cartItem.comparePrice) {
          youSaved += (Number(cartItem.comparePrice) - Number(cartItem.price));
        }
        // if (cartItem.onSale) {
        //   if (cartItem.saleRate && cartItem.saleRate >= 1) {
        //     flat rate
        //     discountTotal += cartItem.saleRate;
        //     taxedSubTotal -= cartItem.saleRate;
        //     owedBeforeTax -= cartItem.saleRate;
        //   } else if (cartItem.saleRate && cartItem.saleRate < 1) {
        //     //percent
        //     discountTotal += itemPrice * cartItem.saleRate;
        //     youSaved += cartItem.saleRate;
        //     taxedSubTotal -= itemPrice * cartItem.saleRate;
        //     owedBeforeTax -= itemPrice * cartItem.saleRate;
        //   }
        // }
      });
      const minOrder: number = settingsData.minOrder || 0;
      // if (subTotal < minOrder) {
      //   throw new functions.https.HttpsError("failed-precondition", `Minimum order value is $${minOrder}.`);
      // }

      console.log(`taxedSubTotal6 ${taxedSubTotal}`);
      ////DISCOUNTS

      if (discountData.length) {
        discountData.map((discount: Discounts) => {
          if (discount.collectionIDs.includes("ALL_PRODUCTS")) {
            if (discount.methodID === "taxFree") {
              const willSaveExcise = settingsData.exciseTax * +subTotal;
              const willSaveLocal = settingsData.localTax * +subTotal;
              const willSaveState = settingsData.stateTax * +subTotal;
              const willSaveTotal = willSaveExcise + willSaveLocal + willSaveState;
              totalTaxSaved += willSaveTotal;
              taxedSubTotal = 0;
              discountTotal += willSaveTotal;
              youSaved += willSaveTotal;
            }
            if (discount.methodID === "flatRate" && discount.rate) {
              taxedSubTotal -= +discount.rate;
              discountTotal += +discount.rate;
              owedBeforeTax -= +discount.rate;
              youSaved += +discount.rate;
            }
            if (discount.methodID === "percent" && discount.rate) {
              if (discount.rate >= 1) {
                const pct = discount.rate / 100;
                const dec = taxedSubTotal * pct;
                discountTotal += dec;
                taxedSubTotal -= dec;
                owedBeforeTax -= dec;
                youSaved += dec;
              } else if (discount.rate < 1) {
                const dec = taxedSubTotal * discount.rate;
                discountTotal += dec;
                taxedSubTotal -= dec;
                owedBeforeTax -= dec;
                youSaved += dec;
              }
            }
            if (discount.methodID === "bogo" && discount.rate && discount.bogoQty) {
              const neededBogo = Number(discount.bogoQty);
              if (totalItemsSold >= neededBogo) {
                discountTotal += +discount.rate;
                taxedSubTotal -= +discount.rate;
                owedBeforeTax -= +discount.rate;
                youSaved += +discount.rate;
              }
            }
          } else {
            if (discount.methodID === "taxFree") {
              cartData.map((cartItem: ProductClass) => {
                let applied = false;
                discount.collectionIDs.map((collectionID: string) => {
                  if (!applied) {
                    if (cartItem.queryIDs.includes(collectionID)) {
                      const itemTotal = Number(cartItem.price) * Number(cartItem.qty);
                      const willSaveExcise = settingsData.exciseTax * itemTotal;
                      const willSaveLocal = settingsData.localTax * itemTotal;
                      const willSaveState = settingsData.stateTax * itemTotal;
                      const willSaveTotal = willSaveExcise + willSaveLocal + willSaveState;
                      totalTaxSaved += willSaveTotal;
                      //savedTaxTotal += willSaveTotal;
                      taxedSubTotal -= itemTotal;
                      discountTotal += willSaveTotal;
                      youSaved += willSaveTotal;
                      applied = true;
                    }
                  }
                });
              });
            }
            if (discount.methodID === "flatRate" && discount.rate) {
              cartData.map((cartItem: ProductClass) => {
                let applied = false;
                discount.collectionIDs.map((collectionID: string) => {
                  if (cartItem.queryIDs.includes(collectionID)) {
                    if (!applied) {
                      const saved = Number(discount.rate) * Number(cartItem.qty);
                      taxedSubTotal -= saved;
                      discountTotal += saved;
                      youSaved += saved;
                      owedBeforeTax -= saved;
                      applied = true;
                    }
                  }
                });
              });
            }
            if (discount.methodID === "percent" && discount.rate) {
              cartData.map((cartItem: ProductClass) => {
                let applied = false;
                discount.collectionIDs.map((collectionID: string) => {
                  if (cartItem.queryIDs.includes(collectionID)) {
                    if (!applied) {
                      const itemTotal = Number(cartItem.price) * Number(cartItem.qty);
                      //percent
                      if (discount.rate >= 1) {
                        //flat rate
                        const pct = discount.rate / 100;
                        const dec = itemTotal * pct;
                        discountTotal += dec;
                        taxedSubTotal -= dec;
                        owedBeforeTax -= dec;
                        youSaved += dec;
                        applied = true;
                      } else if (discount.rate < 1) {
                        //percent
                        const dec = itemTotal * discount.rate;
                        discountTotal += dec;
                        taxedSubTotal -= dec;
                        owedBeforeTax -= dec;
                        youSaved += dec;
                        applied = true;
                      }
                    }
                  }
                });
              });
            }
            if (discount.methodID === "bogo" && discount.rate && discount.bogoQty) {
              let neededBogo = Number(discount.bogoQty);
              let foundQty = 0;
              cartData.map((cartItem: ProductClass) => {
                let applied = false;
                discount.collectionIDs.map((collectionID: string) => {
                  if (cartItem.queryIDs.includes(collectionID)) {
                    if(!applied){
                      foundQty += Number(cartItem.qty);
                      applied = true;
                    }
                    
                  }
                });
              });
              if (foundQty >= neededBogo) {
                discountTotal += +discount.rate;
                taxedSubTotal -= +discount.rate;
                owedBeforeTax -= +discount.rate;
                youSaved += +discount.rate;
              }
            }
          }
        });
      }

      taxedSubTotal = Math.max(0, taxedSubTotal);
      owedBeforeTax = Math.max(0, owedBeforeTax);



      console.log(`taxedSubTotal5 ${taxedSubTotal}`);
      ////CREDITS

      let creditRemainder = 0;
      if (creditData.length) {
        creditData.map((credit: Credits) => {
          if (credit.used === false) {
            creditTotal += Number(credit.amount);
            initialCredit += Number(credit.amount);
            if (typeof creditTotal === "number" && creditTotal > 0) {
              console.log(`owedBeforeTax ${owedBeforeTax}`);
              console.log(`creditTotal ${creditTotal}`);
              if (owedBeforeTax <= creditTotal) {
                console.log(`owedBeforeTax <= creditTotal`);
                creditRemainder += creditTotal - owedBeforeTax;
                youSaved += +owedBeforeTax;
                creditTotal = owedBeforeTax;
                owedBeforeTax = 0;
                taxedSubTotal = 0;
              } else if (owedBeforeTax > creditTotal) {
                console.log(`owedBeforeTax > creditTotal`);

                taxedSubTotal -= creditTotal;
                owedBeforeTax -= creditTotal;
                youSaved += +creditTotal;
                console.log(`owedBeforeTax2 ${owedBeforeTax}`);
                console.log(`taxedSubTotal2 ${taxedSubTotal}`);
              }
            }
          }
        });
      }

      console.log(`taxedSubTotal11 ${taxedSubTotal}`);
      //let grandTotal = owedBeforeTax + taxTotal;
      let grandTotal: number = owedBeforeTax || 0;
      ///FEES

      console.log(`creditRemainder ${creditRemainder}`);
      console.log(`totalTaxSaved ${totalTaxSaved}`);

      //let remainingBuyPower = creditRemainder + totalTaxSaved

      let serviceFee: number = Number(settingsData.serviceFee) || 0;
      serviceFeeTotal += serviceFee;
      const deliveryFee: number = Number(settingsData.deliveryFee) || 0;
      const freeDeliveryMin: number = Number(settingsData.freeDeliveryMin) || 0;

      if (typeof deliveryFee === "number" && deliveryFee > 0) {
        grandTotal += deliveryFee;
        //owedBeforeTax += deliveryFee;
        deliveryTotal += deliveryFee;
        if (subTotal >= freeDeliveryMin) {
          youSaved += deliveryFee;
          //owedBeforeTax -= deliveryFee;
          grandTotal -= deliveryFee;
          deliveryTotal -= deliveryFee;
        }
      }
      if (creditRemainder && deliveryTotal) {
        //remainingBuyPower -= (deliveryTotal - remainingBuyPower)
        if (creditRemainder >= deliveryTotal) {
          creditRemainder -= deliveryTotal;
          //owedBeforeTax -= deliveryTotal;
          grandTotal -= deliveryTotal;
          youSaved += deliveryTotal;
          creditTotal += deliveryTotal;
          deliveryTotal = 0;
        } else {
          deliveryTotal -= creditRemainder;
          //owedBeforeTax -= creditRemainder;
          grandTotal -= creditRemainder;
          youSaved += creditRemainder;
          creditTotal += creditRemainder;
          creditRemainder = 0;
        }
      }

      if (typeof serviceFee === "number" && serviceFee > 0) {
        //owedBeforeTax += +serviceFee;
        grandTotal += +serviceFee;
      }

      if (creditRemainder && serviceFeeTotal) {
        //remainingBuyPower -= (deliveryTotal - remainingBuyPower)
        if (creditRemainder >= serviceFeeTotal) {
          creditRemainder -= serviceFeeTotal;
          //owedBeforeTax -= serviceFeeTotal;
          grandTotal -= serviceFeeTotal;
          youSaved += serviceFeeTotal;
          creditTotal += serviceFeeTotal;
          serviceFeeTotal = 0;
        } else {
          serviceFeeTotal -= creditRemainder;
          //owedBeforeTax -= creditRemainder;
          grandTotal -= creditRemainder;
          youSaved += creditRemainder;
          creditTotal += creditRemainder;
          creditRemainder = 0;
        }
      }

      ////TAXES

      //taxedSubTotal = Math.max(0, taxedSubTotal);
      console.log(` creditRemainder - ${creditRemainder}`);
      console.log(` owedBeforeTax - ${owedBeforeTax}`);
      console.log(` taxedSubTotal after 3 - ${taxedSubTotal}`);
      const exciseTax: number = settingsData.exciseTax || 0;
      const localTax: number = settingsData.localTax || 0;
      const stateTax: number = settingsData.stateTax || 0;
      let exciseTaxTotal = exciseTax * taxedSubTotal;
      let localTaxTotal = localTax * taxedSubTotal;
      let stateTaxTotal = stateTax * taxedSubTotal;
      if (creditRemainder && exciseTaxTotal) {
        //remainingBuyPower -= (deliveryTotal - remainingBuyPower)
        if (creditRemainder >= exciseTaxTotal) {
          creditRemainder -= exciseTaxTotal;
          youSaved += exciseTaxTotal;
          creditTotal += exciseTaxTotal;
          totalTaxSaved += exciseTaxTotal;
          exciseTaxTotal = 0;
        } else {
          serviceFeeTotal -= creditRemainder;
          owedBeforeTax -= creditRemainder;
          creditTotal += creditRemainder;
          totalTaxSaved += creditRemainder;
          creditRemainder = 0;
        }
      }

      if (creditRemainder && localTaxTotal) {
        //remainingBuyPower -= (deliveryTotal - remainingBuyPower)
        if (creditRemainder >= localTaxTotal) {
          creditRemainder -= localTaxTotal;
          youSaved += localTaxTotal;
          creditTotal += localTaxTotal;
          totalTaxSaved += localTaxTotal;
          localTaxTotal = 0;
        } else {
          serviceFeeTotal -= creditRemainder;
          owedBeforeTax -= creditRemainder;
          creditTotal += creditRemainder;
          totalTaxSaved += creditRemainder;
          creditRemainder = 0;
        }
      }

      if (creditRemainder && stateTaxTotal) {
        //remainingBuyPower -= (deliveryTotal - remainingBuyPower)
        if (creditRemainder >= stateTaxTotal) {
          creditRemainder -= stateTaxTotal;
          youSaved += stateTaxTotal;
          creditTotal += stateTaxTotal;
          totalTaxSaved += stateTaxTotal;
          stateTaxTotal = 0;
        } else {
          serviceFeeTotal -= creditRemainder;
          owedBeforeTax -= creditRemainder;
          creditTotal += creditRemainder;
          totalTaxSaved += creditRemainder;
          creditRemainder = 0;
        }
      }

      const taxTotal = stateTaxTotal + localTaxTotal + exciseTaxTotal;
      console.log(` taxTotal - ${taxTotal}`);
      //const grandTotal = owedBeforeTax + taxTotal;
      grandTotal += taxTotal;
      const cartTotals = new CartTotals(
        subTotal, // subtotal:number,
        deliveryFee, // deliveryFee:number,
        deliveryTotal, //deliveryTotal
        stateTax, // stateTax: number,
        localTax, // localTax: number,
        exciseTax, // exciseTax: number,
        roundTo(grandTotal, 2), // grandTotal: number,
        serviceFee, // serviceFee: number,
        totalItemsSold, // totalItemsSold: number,
        minOrder, // minOrder: number,
        freeDeliveryMin, // freeDeliveryMin: number,
        //settingsData.freeDeliveryMin, // productsTotal: number,
        subTotal, // productsPrice: number,
        roundTo(taxedSubTotal, 2), // taxableSubtotal: number,
        roundTo(stateTaxTotal, 2), // stateTaxTotal: number,
        roundTo(exciseTaxTotal, 2), // exciseTaxTotal: number,
        roundTo(localTaxTotal, 2), // localTaxTotal: number,
        roundTo(taxTotal, 2), // combinedTaxTotal: number,
        roundTo(wholesaleTotal, 2), // wholesaleTotal: number,
        roundTo(subTotal - wholesaleTotal, 2), // profitTotal: number,
        roundTo(discountTotal, 2), // discountsTotal: number,
        discountData.length, // discountsApplied: number,
        Boolean(deliveryTotal), // freeDelivery: boolean,
        youSaved, // totalSaved: number,
        creditData.length, // creditsApplied: number,
        creditTotal, // creditTotal: number,
        creditRemainder,
        serviceFeeTotal, // discount: number,
        totalTaxSaved, //tax saved total
        initialCredit //initial credit
      );
      setCartTotals({ ...cartTotals });
    }
    return () => {
      setCartTotals({ ...defaultTotals });
    };
  }, [fireSettings, fireCart, fireCredits, fireDiscounts]);

  return cartTotals;
}
export default getTotals