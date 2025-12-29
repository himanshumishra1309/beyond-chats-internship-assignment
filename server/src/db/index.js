import mongoose from 'mongoose';
import { connectDBname } from '../constant';

const connectDB = async ()=>{
    try{
        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${connectDBname}`,{ maxPoolSize: 100 });
        console.log(`MongoDB connected !! DB HOST: ${connectInstance.connection.host}`);
    } catch {
        console.log("MONGODB connection error: ", error);
        process.exit(1)
    }
}

export default connectDB;