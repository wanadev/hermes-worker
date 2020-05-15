/* eslint-disable no-undef */
// eslint-disable-next-line no-global-assign
const hermes = new HermesMessenger();
self.hermes = hermes;
hermes.onload().then(() => {
    importScripts("$$WORKER_FUNTION_URL$$");
});
