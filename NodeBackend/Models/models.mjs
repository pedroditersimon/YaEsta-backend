

export class User {
    _id = "";
    username = "";
    password = "";

    constructor(data=null) {
        if (data)
            this.updateProperties(data);
    }
    updateProperties(data) {
        for (let key in this) {
            if (data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
    isValid() {
        return this._id !== undefined && this._id !== null && this._id !== "";
    }
}

export class Channel {
    _id = "";
    title = "";

    creation_date = "";

    isPublic = false;

    // IDs list
    members = [];
    membersCount = 0;

    // IDs list
    admins = [];
    adminsCount = 0;

    constructor(data=null) {
        if (data)
            this.updateProperties(data);
    }
    updateProperties(data) {
        for (let key in this) {
            if (data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
    isValid() {
        return this._id !== undefined && this._id !== null && this._id !== "";
    }

    // mongo agregations pipeline
    static getPipeline() {
        return [ // you can add more stages here
            { 
                $addFields: {
                    membersCount: { $size: "$members" },
                    adminsCount: { $size: "$admins" }
                }
            }
        ];
    }

    // remove properties before insert into db
    removeCalculatedProps() {
        var newChannel = new Channel(this);
        delete newChannel.membersCount;
        delete newChannel.adminsCount;
        return newChannel;
    }

}

export class ChannelEvent {
    _id = "";
    channel_id;

    creation_date = "";

    // pending, registered, completed
    status = "";
    action_date = "";

    // pending, registered, completed
    remidner_status = "";
    reminder_time = "";

    title = "";
    description = "";

    map_location;

    constructor(data=null) {
        if (data)
            this.updateProperties(data);
    }
    updateProperties(data) {
        for (let key in this) {
            if (data.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
    isValid() {
        return this._id !== undefined && this._id !== null && this._id !== "";
    }
}
