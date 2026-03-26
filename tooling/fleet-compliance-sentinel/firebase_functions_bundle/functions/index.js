const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

exports.onNewDelivery = functions.database.ref('/deliveries/{id}')
    .onCreate((snap, context) => {
        const delivery = snap.val();
        console.log('New delivery added:', delivery);
        return null;
    });
