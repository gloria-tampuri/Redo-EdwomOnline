import {MongoClient} from "mongodb"

if(!process.env.MongoURL){
    throw new Error("Mongo URI not found!")
}

const client = new MongoClient(process.env.MongoURL)

async function getDB(dbName:any) {
    try{
        await client.connect();
        console.log(">>>>Connected to DB<<<<")
        return client.db(dbName)
    }catch(err){
        console.log(err);
        
    }
}

export async function getCollection(collectionName:any){
const db = await getDB('next_blog_db')
if(db) return db.collection(collectionName)

}