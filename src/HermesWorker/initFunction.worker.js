/* eslint-disable no-undef */
// eslint-disable-next-line no-global-assign
const hermes = new HermesMessenger();
self.hermes = hermes;
hermes.waitLoad().then(() => {
    importScripts(hermes.config._workerFunctionUrl);
});
