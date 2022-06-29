export class VIPClass {
    arrival?: string | Date;
    departure?: string | Date;
    details?: string;
    fileName?: string;
    firstName?: string;
    id?: string;
    image?: string;
    lastName?: string;
    notes?: string;
    rateCode?: string;
    reservationStatus?:
      | "DUEIN"
      | "DUEOUT"
      | "CHECKEDIN"
      | "CHECKEDOUT"
      | "RESERVED"
      | "NOSHOW"
      | "CANCEL"
      | "ERROR";
    roomNumber?: string;
    roomStatus?: [{label:string,id:`DIRTY`|`CLEAN`|`INSPECTED`|`OO`|`OS`|`PICKUP`}] ;
    vipStatus?: [{label:string,id:string}];
    stays?: number;
    constructor(
      arrival?: string | Date,
      departure?: string | Date,
      details?: string,
      fileName?: string,
      firstName?: string,
      id?: string,
      image?: string,
      lastName?: string,
      notes?: string,
      rateCode?: string,
      reservationStatus?:
        | "DUEIN"
        | "DUEOUT"
        | "CHECKEDIN"
        | "CHECKEDOUT"
        | "RESERVED"
        | "NOSHOW"
        | "CANCEL"
        | "ERROR",
      roomNumber?: string,
      roomStatus?:[{label:string,id:`DIRTY`|`CLEAN`|`INSPECTED`|`OO`|`OS`|`PICKUP`}],
      vipStatus?:[{label:string,id:string}],
      stays?: number
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