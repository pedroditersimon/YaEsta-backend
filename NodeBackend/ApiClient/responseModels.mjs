
// ------------ Response models ------------>
// used to remove internal information from response objects, contains only necessary data


export class ResponseChannel {
    _id = "";
    title = "";

    creation_date = "";

    isPublic = false;

    membersCount = 0;

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

    creation_date = "";

    // 'pending', 'registered', 'completed'
    status = "";
    action_date = "";

    // 'pending', 'registered', 'completed'
    reminder_status = "";
    reminder_date = "";

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


export class ResponseAccessDocument {
    _id = "";

    creation_date = "";

    enabled = false;

    requires_approval = false;

    // 'subscribe' or 'create'
    action_type = "";

    target_channel_id = "";

    channel_title_template = "New Channel {index}";

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