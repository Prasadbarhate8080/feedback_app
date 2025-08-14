import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

const connection: ConnectionObject = {}; 

async function dbConnect(): Promise<void> {
    if(connection.isConnected)
    {
        console.log("database is already connected");
        return
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '',{});
        // console.log(db)
        connection.isConnected = db.connections[0].readyState

        console.log("DB connected successfully");
    } catch (error) {
        console.log("FAILD to connect to th DATABASE",error)
        process.exit(1);
    }
}
export {dbConnect}