import { NextResponse } from "next/server";

export async function POST(){
    return NextResponse.json("data: ths is the json response");
}