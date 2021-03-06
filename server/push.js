const fs = require('fs');

const vapid = require('./vapid.json');
const webpush = require('web-push');
const urlsafeBase64 = require('urlsafe-base64');

const suscripciones = require('./subs-db.json');

webpush.setVapidDetails(
    'mailto:gorlekk@gmail.com',
    vapid.publicKey,
    vapid.privateKey
);

module.exports.getKey = () => {
    return urlsafeBase64.decode(vapid.publicKey);
}

module.exports.addSubscription = (suscripcion) => {
    suscripciones.push(suscripcion);

    fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(suscripciones));
};

module.exports.sendPush = (post) => {
    try {
        suscripciones.forEach((suscripcion, i) => {
            webpush.sendNotification(suscripcion, JSON.stringify(post), []);
        })
    } catch (error) {
        console.log("No se pudo");
    }

};