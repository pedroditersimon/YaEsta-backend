import { dbHandler } from "../db/DatabaseHandler.mjs";
import { ChannelEvent } from "../models/models.mjs";

export default class EventScheduler {
    scheduling_interval_id;
    scheduling_interval_ms;

    scheduled_event_ids = [];

    constructor(interval_ms) {
        this.scheduling_interval_ms = interval_ms;
    }

    stopScheduling() {
        clearInterval(this.scheduling_interval_id);
    }

    startScheduling() {
        this.scheduling_interval_id = setInterval(async () => {
            await this.scheduleUpcomingEvents();
        }, this.scheduling_interval_ms);

        // re-schedule events that are not completed now, and scheduleUpcomingEvents
        setTimeout(async () => {
            await this.scheduleRegisteredEvents();
            await this.scheduleUpcomingEvents();
        }, 10);
    }

    /**
     * Schedules Upcoming events.
     */
    async scheduleUpcomingEvents() {
        // 30 min threshold
        const threshold_ms = 30 * 60 * 1000;
        const upcoming_events = await dbHandler.get_global_upcoming_events(threshold_ms);

        console.log(`(${upcoming_events.length}) events to schedule`);
        await this.scheduleEvents(upcoming_events);
    }

    /**
     * Schedules Registered (not completed) events.
     */
    async scheduleRegisteredEvents() {
        const registered_events = await dbHandler.get_global_registered_events();

        console.log(`(${registered_events.length}) events to re-schedule`);
        await this.scheduleEvents(registered_events);
    }

    /**
     * Schedules events.
     * @param {Array<ChannelEvent>} events - An array of ChannelEvent objects to schedule.
     */
    async scheduleEvents(events) {
        events.forEach(async event => await this.scheduleEvent(event));
    }

    /**
     * Schedules an action for a single event.
     * @param {ChannelEvent} event - The event to schedule.
     */
    async scheduleEvent(event) {
        // already has this event
        if (this.scheduled_event_ids.hasOwnProperty(event._id.toString())) {
            // already scheduled
            if (event.status !== "pending") {
                console.log(`Cannot schedule event (${event.title}), already scheduled`);
                return false;
            }

            // remove timeout and re-schedule the event (maybe was edited)
            const event_timeout_id = this.scheduled_event_ids[event._id.toString()];
            clearTimeout(event_timeout_id);
            console.log(`Cleared timeout of event (${event.title}), maybe was edited (pending status)`);
        }
        
        if (event.status === "completed") {
            console.log(`Cannot schedule event (${event.title}), already has 'completed' status`);
            return false;
        }

        // define milliseconds timeout
        const now = new Date();
        const timeout = new Date(event.action_date) - now;

        if (timeout <= 0 || timeout == NaN) {
            console.log(`Cannot schedule event (${event.title}) is already past due, will be handled now`);
            await this.handleEvent(event);
            return false;
        }

        const timeout_id = setTimeout(async () => {
            await this.handleEvent(event);
        }, timeout);

        this.scheduled_event_ids[event._id.toString()] = timeout_id;

        console.log(`Scheduled event (${event.title}) to occur in ${timeout} milliseconds`);

        // Update event status
        event.status = "registered";
        const updated = await dbHandler.update_event(event);
        return updated;
    }

    /**
     * Handles the event when it occurs.
     * @param {ChannelEvent} event - The event to handle.
     */
    async handleEvent(event) {
        if (event.status === "completed") {
            console.log(`Cannot handle event (${event.title}), already has 'completed' status`);
            return false;
        }

        console.log(`Event (${event.title}) is occurring now!`);

        // Update event status
        event.status = "completed";
        const updated = await dbHandler.update_event(event);

        // TODO: Send notification
    }

}