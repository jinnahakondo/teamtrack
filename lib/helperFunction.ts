import { ApiErrorResponse, ApiSuccessResponse } from '@/types/api.response.type';
import { NextResponse } from 'next/server';

export const sendSuccess = ({ data, message, status }: ApiSuccessResponse) => {
    return NextResponse.json({ success: true, message, data }, { status });
}

export const sendError = ({ message, status, errormessage }: ApiErrorResponse) => {
    return NextResponse.json({
        success: false,
        message, errormessage
    },
        { status });
}   
