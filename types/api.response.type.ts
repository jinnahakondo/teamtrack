// types/api.ts
export type ApiSuccessResponse= {
    data?: any;
    message: string;
    status: number
}

export type ApiErrorResponse = {
    message: string;
    status: number;
    errormessage?: string
}

