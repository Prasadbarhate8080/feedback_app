import { NextResponse } from "next/server";

export async function POST(){

    console.log("email webhook cllled and email send successfully and ");
    return NextResponse.json("data: ths is the json response");
}