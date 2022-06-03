import * as admin from "firebase-admin";
  
export interface VIPTotals {
total: number;
}
export interface CallableContext {
auth?: {
    uid: string;
    token: admin.auth.DecodedIdToken;
};
instanceIdToken?: string;
//rawRequest: Request;
}
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
    | null;
roomNumber?: string | null;
roomStatus?: [] | null;
vipStatus?: [] | null;
stays?: number | null;
constructor(
    arrival?: string | null,
    departure?: string | null,
    details?: string | null,
    fileName?: string | null,
    firstName?: string | null,
    id?: string | null,
    image?: string | null,
    lastName?: string | null,
    notes?: string | null,
    rateCode?: string | null,
    reservationStatus?:
    | "DUEIN"
    | "DUEOUT"
    | "CHECKEDIN"
    | "CHECKEDOUT"
    | "RESERVED"
    | "NOSHOW"
    | "CANCEL"
    | null,
    roomNumber?: string | null,
    roomStatus?: [] | null,
    vipStatus?: [] | null,
    stays?: number | null
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
}
}
