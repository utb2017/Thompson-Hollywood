type Selected = {
    label:string,
    value:string
}
export interface Settings {
    deliveryFee: number,
    serviceFee: number,
    localTax: number,
    stateTax: number,
    freeDeliveryMin: number,
    minOrder: number,
    exciseTax: number,
    salesTax: number,
}
export interface CartItem {
    img:string[],
    genome:string,
    inventory:number,
    name:string,
    pid:string,
    price:number,
    qty:number,
    size:string,
    type:string,
    collection:string,
    discountRate:number,
    hasDiscount:boolean,
    discountTotal:number,
    wholesale:number,
    onSale:boolean | null,
    saleRate:number | null,
}
export interface Totals {
    minOrder:number,
    freeDeliveryMin:number,
    productsTotal: number,
    productsPrice: number,
    subtotal: number,
    salesTaxRate: number,
    exciseTaxRate: number,
    localTaxRate: number,
    salesTaxTotal: number,
    exciseTaxTotal: number,
    localTaxTotal: number,
    combinedTaxTotal: number,
    wholesaleTotal: number,
    deliveryFee: number,
    deliveryTotal: number,
    serviceFee: number,
    grandTotal: number,
    profitTotal: number,
    hasCoupon: boolean,
    freeDelivery: boolean,
    couponsApplied: number,
    couponsTotal: number,
    totalSaved:number,
    taxFree:boolean,
    couponId:string[],
    couponCode:string,
    creditId:string[],
    creditsApplied:number,
    hasCredit:boolean,
    creditTotal:number,
    creditRemainder:number,
    refundId:string[],
    refundsApplied:number,
    hasRefund:boolean,
    refundTotal:number,
    refundRemainder:number,
    couponRemainder:number,
} 
export class TotalsClass {
    minOrder:number;
    freeDeliveryMin:number;
    productsTotal: number;
    productsPrice: number;
    subtotal: number;
    taxableSubtotal: number;
    salesTaxRate: number;
    exciseTaxRate: number;
    localTaxRate: number;
    salesTaxTotal: number;
    exciseTaxTotal: number;
    localTaxTotal: number;
    combinedTaxTotal: number;
    wholesaleTotal: number;
    deliveryFee: number;
    deliveryTotal: number;
    serviceFee: number;
    grandTotal: number;
    profitTotal: number;
    hasCoupon: boolean;
    freeDelivery: boolean;
    couponsApplied: number;
    couponsTotal: number;
    totalSaved:number;
    taxFree:boolean;
    couponId:string[];
    couponCode:string;
    creditId:string[];
    creditsApplied:number;
    hasCredit:boolean;
    creditTotal:number;
    creditRemainder:number;
    refundId:string[];
    refundsApplied:number;
    hasRefund:boolean;
    refundTotal:number;
    refundRemainder:number;
    couponRemainder:number;  


    constructor() {
        this.minOrder= 0;
        this.freeDeliveryMin= 0;
        this.productsTotal= 0;
        this.productsPrice= 0;
        this.subtotal=0;
        this.taxableSubtotal=0;
        this.salesTaxRate= 0;
        this.exciseTaxRate= 0;
        this.localTaxRate= 0;
        this.salesTaxTotal= 0;
        this.exciseTaxTotal= 0;
        this.localTaxTotal= 0;
        this.combinedTaxTotal= 0;
        this.wholesaleTotal= 0;
        this.deliveryFee= 0;
        this.deliveryTotal= 0;
        this.serviceFee= 0;
        this.grandTotal= 0;
        this.profitTotal= 0;
        this.hasCoupon= false;
        this.couponsApplied= 0;
        this.couponsTotal= 0;
        this.freeDelivery= false;
        this.totalSaved= 0;
        this.taxFree= false;
        this.couponCode= "";
        this.couponId= [] as string[];
        this.creditId= [] as string[];
        this.creditsApplied= 0;
        this.hasCredit= false;
        this.creditTotal= 0;
        this.creditRemainder= 0;
        this.refundId= [] as string[];
        this.refundsApplied= 0;
        this.hasRefund= false;
        this.refundTotal= 0;
        this.refundRemainder= 0;
        this.couponRemainder= 0;
    }
} 
export interface Discount {
    active: boolean,
    featured: boolean,
    alert: boolean,
    alertSent: boolean,
    code?: string | null,
    dateEnd: Date | boolean | null,
    dateStart: Date | boolean | null,
    filters?: string[] | null,
    collection?: { label:string, value:string } | undefined,
    collectionID?: string | null,
    id: string | null,
    uid: string | null,
    kind: 'flatRate' | 'percent' | 'taxFree',
    method: {label:string, value:'flatRate' | 'percent' | 'taxFree'} | undefined,
    rate: number | null,
    sort: 'credit' | 'coupon' | 'refund' | 'sale',
    title: string | null,
    type: {label:string, value:'credit' | 'coupon' | 'refund' | 'sale'} | undefined,
    used: boolean | null,
    recurring?: boolean | null,
    day?:number | null,
    usedTotal?: any,
    recurringDay?: { label:string, value:string } | undefined,
}  
export class Coupon {
    active?: boolean;
    featured?: boolean;
    alert?: boolean;
    alertSent?: boolean;
    code?: string | null;
    dateEnd?: Date | boolean | null;
    dateStart?: Date | boolean | null;
    filters?: string[] | null;
    collections?: [{label:'Cart Total', value:'ALL_PRODUCTS'}];
    collectionIDs?: string | null;
    id?: string | null;
    uid?: string | null;
    kind?:'flatRate';
    method?: undefined;
    rate?:null;
    sort?:'coupon';
    title?:null;
    type?: {label:"Coupon"; value:'coupon'};
    used?:false;
    recurring?:false;
    recurringDay?:{label:"Sundays", value:'0'};
    day?:null;
    usedTotal?:null;
}
export class CouponClass {
    active: boolean;
    featured: boolean;
    alert: boolean;
    alertSent: boolean;
    code?: string | null;
    dateEnd: string | any | null;
    dateStart: string | any | null;
    filters: string[] | null;   
    collections: Selected[]; 
    collectionIDs: string[]; 
    id: string | null;
    uid: string | null;
    methodID:'flatRate' | 'percent' | 'taxFree' | 'bogo' | null ;
    method: {[k:string]:any} | undefined;
    rate:number | null;
    bogoQty?:number | null;
    sort:'credit' | 'coupon' | 'refund' | null;
    title:string | null;
    type: {[k:string]:any} | undefined;
    used:boolean;
    recurring:boolean;
    recurringDays: Selected[] | undefined;
    days:string[];
  
    constructor() {
       this.active=false;
       this.bogoQty=null;
       this.featured=false;
       this.alert=false;
       this.alertSent=false;
       this.code=null;
       this.dateEnd=null;
       this.dateStart=new Date().toJSON().slice(0, 10);
       this.filters=[];
       this.collections=[{label:'Cart Total', value:'ALL_PRODUCTS'}];
       this.collectionIDs=['ALL_PRODUCTS'];
       this.id=null;
       this.uid=null;
       this.methodID='flatRate';
       this.method = {label:'Flat Rate', value:'flatRate'};
       this.rate=null;
       this.sort='coupon';
       this.type= {label:"Coupon", value:'coupon'};
       this.title=null;
       this.used=false;
       this.recurring=false;
       this.recurringDays=[{label:"Sundays", value:'0'}];
       this.days=['0']; 
    }
  }
  export class CreditClass {
    active: boolean;
    featured: boolean;
    alert: boolean;
    alertSent: boolean;
    code: string | null;
    dateEnd: string | any | null;
    dateStart: string | any | null;
    filters: string[] | null;
    collection: {[k:string]:any} | undefined;
    collectionID: string | null;
    id: string | null;
    uid: string | null;
    methodID:'flatRate' | 'percent' | 'taxFree' | null ;
    method: {[k:string]:any} | undefined;
    rate:number | null;
    sort:'credit' | 'coupon' | 'refund' | null;
    title:string | null;
    type: {[k:string]:any} | undefined;
    used:boolean;
    recurring:boolean;
    recurringDay:{[k:string]:any} | undefined;
    day:number | null;
  
    constructor() {
       this.active=false;
       this.featured=false;
       this.alert=false;
       this.alertSent=false;
       this.code=null;
       this.dateEnd=null;
       this.dateStart=new Date().toJSON().slice(0, 10);
       this.filters=[];
       this.collection={label:'Cart Total', value:'ALL_PRODUCTS'};
       this.collectionID='ALL_PRODUCTS';
       this.id=null;
       this.uid=null;
       this.methodID='flatRate';
       this.method = {label:'Flat Rate', value:'flatRate'};
       this.rate=null;
       this.sort='coupon';
       this.type= {label:"Coupon", value:'coupon'};
       this.title=null;
       this.used=false;
       this.recurring=false;
       this.recurringDay={label:"Sundays", value:'0'};
       this.day=null; 
    }
  }
export interface User {
    name:string,
    uid:string,
    id:string,
    email:string,
    displayName:string,
    photoURL:string,
    phoneNumber:string,
    disabled:boolean,
    metadata:{creationTime:Date},
    role:'manager' | 'customer' | 'dispatcher' | 'driver',
    status:'accepted' | 'pending' | 'denied',
} 
export interface MenuTotals {
    brands?:number | any,
    collections?:number | any,
    products?:number | any,
    sativa?:number | any,
    indica?:number | any,
    hybrid?:number | any,
    [k:string]:any
}      
export interface Collection {
    active:boolean | null,
    cartLimit:number | null,
    description:string | null,
    featured:boolean | null,
    flower:boolean | null,
    genome:boolean | null,
    id?:string | null,
    img:string | null,
    filePath:string | null,
    key:string | null,
    menuOrder?:number | null,
    onSale:boolean | null,
    saleCode:string | null,
    saleTitle:string | null,
    saleRate:number | null,
    sales?:number | null,
    sold?:number | null,
    title:string | null,
    total?:number | null,
    weight:boolean | null,
} 
export interface Brand {
    //key?:string,
    active:boolean| null,
    title:string | null,
    description:string | null,
    total?:number | null,
    cartLimit:number | null,
    onSale:boolean | null,
    saleRate:number | null,
    menuOrder?:number | null,
    featured:boolean | null,
    sold?:number | null,
    sales?:number | null,
    id?:string | null,
    img:string | null,
    filePath:string | null,
}
type Genome = {
    label:string,
    value:'indica' | 'sativa' | 'hybrid' | 'cbd'
}
export interface Product {
    active:boolean | null,
    brand:Selected | null,
    brandID:string | null,
    cbd?: number | null,
    collections: Selected[],
    collectionIDs: string[],
    description: string | null,
    genome: Genome | null,
    genomeID: string | null,
    id: string | null,
    img: string | null,
    filePath: string | null,
    inventory: number | null,
    key:string | null,
    name: string | null,
    onSale:boolean | null,
    price: number | null,
    saleCode?:string | null,
    saleRate:number | null,
    saleTitle?:string | null,
    saleMethod?:'flatRate' | 'percent' | 'taxFree' | 'bogo',
    sold?:number | null,
    sales?:number | null,
    thc: number | null,
    weight: string | null,
    wholesale: number | null,
    saved?:number|null,
    salePrice?:number|null,
    qty?:number | null,
    uid?: string | null,
}
