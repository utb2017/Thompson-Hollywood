import * as admin from "firebase-admin";
  
export interface VIPTotals {
total: number;
}
export interface Select {
    id:string;
    label:string;
};
export interface CallableContext {
    auth?: {
        uid: string;
        token: admin.auth.DecodedIdToken;   
    }
};
export class VIPClass {
arrival?: string | null;
departure?: string | null;
details?: string | null;
fileName?: string | null;
firstName?: string | null;
id?: string | null;
image?: string | null;
lastName?: string | null;
notes?: string | null;
rateCode?: string | null;
reservationStatus?:
    | "DUEIN"
    | "DUEOUT"
    | "CHECKEDIN"
    | "CHECKEDOUT"
    | "RESERVED"
    | "NOSHOW"
    | "CANCEL"
    | "ERROR";
roomNumber?: string | null;
roomStatus?: [{label:string,id:string}];
vipStatus?:[{label:string,id:string}];
stays?: number | null;
resort?: "LAXTH" | "LAXTE";
constructor(
    arrival: string | null | undefined,
    departure: string | null | undefined,
    details: string | null | undefined,
    fileName: string | null | undefined,
    firstName: string | null | undefined,
    id: string | null | undefined,
    image: string | null | undefined,
    lastName: string | null | undefined,
    notes: string | null | undefined,
    rateCode: string | null | undefined,
    reservationStatus:
    | "DUEIN"
    | "DUEOUT"
    | "CHECKEDIN"
    | "CHECKEDOUT"
    | "RESERVED"
    | "NOSHOW"
    | "CANCEL"
    | "ERROR",
    roomNumber: string | null | undefined,
    roomStatus:[{label:string,id:string}],
    vipStatus:[{label:string,id:string}],
    stays: number | null | undefined,
    resort: 'LAXTH' | 'LAXTE'
) {
    this.arrival = arrival;
    this.departure = departure;
    this.details = details;
    this.firstName = firstName;
    this.fileName = fileName;
    this.id = id;
    this.image = image;
    this.lastName = lastName;
    this.notes = notes;
    this.rateCode = rateCode;
    this.reservationStatus = reservationStatus;
    this.roomNumber = roomNumber;
    this.roomStatus = roomStatus;
    this.vipStatus = vipStatus;
    this.stays = stays;
    this.resort = resort;
}
}
