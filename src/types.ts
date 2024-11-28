import * as mtyp from "./utils/types"

export interface chat {
    message:string
}

export interface GeneralResponse {
    id:string,
    message:string,
    status?:mtyp.Status
}


  