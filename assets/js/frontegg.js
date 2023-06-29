import { initialize } from "@frontegg/js";

const app = initialize(({
  contextOptions: {
    baseUrl: "https://app-y3ku8d7npxle.frontegg.com",
    clientId: 'fc38df76-60a7-428b-8a51-6edd86031103',
  },
  hostedLoginBox: true
}));

Alpine.store('frontegg', {
  app,

  check_login() {
    if (!this.isAuthenticated) {
      app.loginWithRedirect();
    }
  },

  get state() {
    return app.store.getState();
  },

  get user() {
    return this.state.auth.user;
  },

  get isAuthenticated() {
    return this.state.auth.isAuthenticated; 
  },
});

