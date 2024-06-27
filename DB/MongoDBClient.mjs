import 'dotenv/config';
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

class MongoDBClient {
    mongoClient;
    database;

    constructor({URI = process.env.MONGODB_URI, databaseName}) {
        console.log("Connecting to MongoDBClient...");
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

    async getAggregate(collectionName, pipeline) {
        return await this.database.collection(collectionName).aggregate(pipeline).toArray();
    }

    async getManyFrom(collectionName, match, limit=20, aggStages=[]) {
        const pipeline = [
            { $match: match },
            { $limit: limit },
            ...aggStages
        ];

        return await this.getAggregate(collectionName, pipeline);
    }

    async findOneFrom(collectionName, match, aggStages=[]) {
        const pipeline = [
            { $match: match },
            { $limit: 1 },
            ...aggStages
        ];

        const docs = await this.getAggregate(collectionName, pipeline);
        return docs.length > 0 ? docs[0] : {};
    }

    async findOneIDFrom(collectionName, objID, aggStages=[]) {
        // prevent wrong id
        if (objID.length != 24)
            return {};

        const match = { _id: new ObjectId(objID) };
        return await this.findOneFrom(collectionName, match, aggStages);
    }


    async insertOne(collectionName, jsonObj) {
        if (jsonObj._id !== undefined)
            delete jsonObj._id;

        const collection = this.database.collection(collectionName);
        const dbResult = await collection.insertOne( jsonObj );
        return dbResult;
    }

    async deleteOne(collectionName, filter) {
        // Convertir string _id a ObjectId de MongoDB
        if (typeof filter._id === 'string') {
            filter._id = new ObjectId(filter._id);
        }

        const collection = this.database.collection(collectionName);
        const dbResult = await collection.deleteOne(filter);
        return dbResult;
    }

    async deleteOneID(collectionName, objID) {
        // prevent wrong id
        if (objID.length != 24)
            return {};

        return await this.deleteOne(collectionName, { "_id": objID });
    }

    async deleteMany(collectionName, filter) {
        // Convertir string _id a ObjectId de MongoDB
        if (typeof filter._id === 'string') {
            filter._id = new ObjectId(filter._id);
        }

        const collection = this.database.collection(collectionName);
        const dbResult = await collection.deleteMany(filter);
        return dbResult;
    }

    async deleteManyIDs(collectionName, objIDs) {
        if (objIDs.length <= 0 || objIDs == undefined)
            return false;

        return await this.deleteMany(collectionName, { "_id": {$in: objIDs} });
    }

    async updateOne(collectionName, filter, jsonObj) {
        // Convertir string _id a ObjectId de MongoDB
        if (typeof filter._id === 'string') {
            filter._id = new ObjectId(filter._id);
        }

        // remove _id property to prevent update it
        if (jsonObj._id !== undefined)
            delete jsonObj._id;

        const collection = this.database.collection(collectionName);
        return await collection.updateOne(filter, { $set: jsonObj });
    }

    async updateOneID(collectionName, objID, jsonObj) {
        return await this.updateOne(collectionName, { _id: objID }, jsonObj);
    }

}

export { MongoDBClient };