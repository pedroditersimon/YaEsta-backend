
// ------------ Response models ------------>
// used to remove internal information from response objects, contains only necessary data

export class ResponseChannel {
    _id = "";
    title = "";

    isPublic = false;

    membersCount = 0;

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
}


export class ResponseChannelEvent {
    _id = "";
    channel_id = "";

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



