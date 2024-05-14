import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

class MongoDBClient {
    mongoClient;
    database;

    constructor({URI = process.env.MONGODB_URI, databaseName}) {
        // MongoDB
        this.mongoClient = new MongoClient(URI,  {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                }
            }
        );

        // connect database
        this.mongoClient.connect();
        this.database = this.mongoClient.db(databaseName);

        console.log("MongoDBClient connected!");
    }

    dbIsConnected() {
        return this.mongoClient != null;
    }

    getObjectId(objID) {
        // prevent wrong id
        if (objID.length != 24)
            return {};

        return new ObjectId(objID);
    }

    getObjectIdList(objIDs) {
        // invalid list
        if (objIDs == null || objIDs.length == 0)
            return [];

        var ids = objIDs.map(objID => this.getObjectId(objID));
        return ids;
    }

    async findOneFrom(collectionName, query) {
        const collection = this.database.collection(collectionName);
        const dbResult = await collection.findOne( query );
        return dbResult;
    }

    async findOneIDFrom(collectionName, objID) {
        // prevent wrong id
        if (objID.length != 24)
            return {};

        const collection = this.database.collection(collectionName);
        const dbResult = await collection.findOne( {"_id": new ObjectId(objID)} );
        return dbResult;
    }


    async getManyFrom(collectionName, query, options = {}, sort = {}) {
        const collection = this.database.collection(collectionName);
        const dbResult = await collection
            .find( query , options )
            .sort(sort);

        return dbResult;
    }

    async insertOne(collectionName, jsonObj) {
        const collection = this.database.collection(collectionName);
        const dbResult = await collection.insertOne( jsonObj );
        return dbResult;
    }

    async deleteOne(collectionName, objID) {
        // prevent wrong id
        if (objID.length != 24)
            return {};

        const collection = this.database.collection(collectionName);
        const dbResult = await collection.deleteOne(  {"_id": new ObjectId(objID)}  );
        return dbResult;
    }

    async updateOne(collectionName, filter, jsonObj, createNew=false) {
        if (createNew) {
            filter = { _id: new ObjectId() };
        }
        // convert string id to mongo ObjectId
        if (typeof filter._id === 'string') {
            filter._id = new ObjectId(filter._id);
        }

        const collection = this.database.collection(collectionName);
        const dbResult = await collection.updateOne(filter, jsonObj, {upsert: createNew} );
        return dbResult;
    }
}

export { MongoDBClient };