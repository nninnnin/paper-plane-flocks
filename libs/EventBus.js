class EventBus {
  constructor() {
    if (EventBus.instance) return EventBus.instance;

    this.events = {};
    EventBus.instance = this;
  }

  subscribe(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);
  }

  publish(eventName) {
    const eventCallbacks = this.events[eventName]

    eventCallbacks.forEach(callback => {
      callback();
    })
  }
}
