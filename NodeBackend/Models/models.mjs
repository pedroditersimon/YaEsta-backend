
export class User {
    _id = "";
    username = "";
    password = "";

    // IDs list
    subscribed_channels = [];

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

    isPublic = false;

    // IDs list
    members = [];
    membersCount = 0;

    // IDs list
    admins = [];
    adminsCount = 0;

    // IDs list
    events = [];
    eventsCount = 0;

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
        return [
            { 
                $addFields: {
                    membersCount: { $size: "$members" },
                    adminsCount: { $size: "$admins" },
                    eventsCount: { $size: "$events" }
                }
            }
        ];
    }
}

export class ChannelEvent {
    _id = "";
    channel_id;

    title = "";
    description = "";

    action_date;
    notice_time;

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
