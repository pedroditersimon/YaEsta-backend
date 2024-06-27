
export function isValidID(_id) {
    return _id !== undefined && _id !== null && _id !== "";
}


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
    isValid() { return isValidID(this._id); }
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
    isValid() { return isValidID(this._id); }

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
        delete this.membersCount;
        delete this.adminsCount;
    }

}

export class ChannelEvent {
    _id = "";
    channel_id;

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
    isValid() { return isValidID(this._id); }
}


export class AccessDocument {
    _id = "";

    creator_user_id = "";
    creation_date = "";

    enabled = true;

    requires_approval = false;
    pending_approval = {}; // { user_id: '', requestDate: '' }

    // 'subscribe' or 'create'
    action_type = "subscribe";

    target_channel_id = "";

    channel_title_template = "New Channel {index}";
    created_channels = []; // { user_id: channel_id }

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
    isValid() { return isValidID(this._id); }

    generate_title() {
        return this.formatDate(this.channel_title_template)
            // index 
            .replace("{index}", this.created_channels.length)
    }

    formatDate(template) {
        const date = new Date();

        const minutes = date.getMinutes();
        const hours = date.getHours();

        const day = date.getDate();
        const month = date.getMonth() + 1; // months in JavaScript are 0-11
        const year = date.getFullYear();

        return template
            .replace("{minutes}", minutes)
            .replace("{hours}", hours)
            .replace("{day}", day)
            .replace("{month}", month)
            .replace("{year}", year);
    }
}