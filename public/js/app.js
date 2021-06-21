/* import '@dmuy/toast/dist/mdtoast.css'
import mdtoast from '@dmuy/toast' */
var btnActivadas = $('.btn-noti-activadas');
var btnDesactivadas = $('.btn-noti-desactivadas');
var swReg;

var url = window.location.href;
var swLocation = '/twittor/sw.js';


if (navigator.serviceWorker) {


    if (url.includes('localhost')) {
        swLocation = '/sw.js';
    }

    window.addEventListener('load', function () {
        navigator.serviceWorker.register(swLocation).then(function (reg) {
            swReg = reg;
            swReg.pushManager.getSubscription().then(verificaSuscripcion);
        });
    });

}

// Referencias de jQuery

var titulo = $('#titulo');
var nuevoBtn = $('#nuevo-btn');
var salirBtn = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn = $('#post-btn');
var avatarSel = $('#seleccion');
var timeline = $('#timeline');

var modal = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns = $('.seleccion-avatar');
var txtMensaje = $('#txtMensaje');

// El usuario, contiene el ID del hÃ©roe seleccionado
var usuario;




// ===== Codigo de la aplicaciÃ³n

function crearMensajeHTML(mensaje, personaje) {

    var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;
    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn(ingreso) {

    if (ingreso) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');

    }

}


// Seleccion de personaje
avatarBtns.on('click', function () {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function () {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function () {

    modal.removeClass('oculto');
    modal.animate({
        marginTop: '-=1000px',
        opacity: 1
    }, 200);

});

// Boton de cancelar mensaje
cancelarBtn.on('click', function () {
    if (!modal.hasClass('oculto')) {
        modal.animate({
            marginTop: '+=1000px',
            opacity: 0
        }, 200, function () {
            modal.addClass('oculto');
            txtMensaje.val('');
        });
    }
});

// Boton de enviar mensaje
postBtn.on('click', function () {

    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    var data = {
        mensaje: mensaje,
        user: usuario
    }

    fetch('api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(res => console.log('app.js', res)).catch(err => console.log('app.js error: ' + err));

    crearMensajeHTML(mensaje, usuario);

});

//Obtener mensajes del servidor
function getMensajes() {

    fetch('api')
        .then(res => res.json())
        .then(posts => {

            console.log(posts);
            posts.forEach(post =>
                crearMensajeHTML(post.mensaje, post.user));


        });


}


getMensajes();

//Detectar cambios de conexion
function isOnline() {
    if (navigator.onLine) {
        //tenemos conexion
        mdtoast('Online', {
            interaction: true,
            interactionTimeout: 1000,
            actionText: 'OK'
        });
        console.log('Online');
    } else {
        //No tenemos conexion
        mdtoast('Offline', {
            interaction: true,
            actionText: 'OK',
            type: 'warning'
        });
        console.log('Offline');
    }
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);

isOnline();

// Notificaciones
function verificaSuscripcion(activadas) {
    console.log(activadas);
    if (activadas) {
        btnActivadas.removeClass('oculto');
        btnDesactivadas.addClass('oculto');
    } else {
        btnActivadas.addClass('oculto');
        btnDesactivadas.removeClass('oculto');
    }
}

function enviarNotificacion() {
    const notificationOpts = {
        body: 'Este es el cuerpo de la notificacion',
        icon: 'img/icons/icon-72x72.png'
    }

    const n = new Notification('Hola mundo!', notificationOpts);
    n.onclick = () => {
        console.log('Click');
    }
}

function notificame() {
    if (!window.Notification) {
        console.log('Este navegador no soporta notificaciones');
        return;
    }
    if (Notification.permission === 'granted') {
        enviarNotificacion();
    } else if (Notification.permission === 'default' || Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            console.log(permission);
            if (permission === 'granted') {
                enviarNotificacion();
            }
        });
    }
}

//notificame();

//Get Key
function getPublicKey() {
    //fetch('api/key').then(res => res.text()).then(console.log).catch(err => console.log(err));

    return fetch('api/key').then(res => res.arrayBuffer()).then(key => new Uint8Array(key));
}

//getPublicKey().then(console.log);
btnDesactivadas.on('click', function () {
    if (!swReg) return console.log('No hay registro de SW');

    getPublicKey().then(function (key) {
        swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key
        }).then(res => res.toJSON()).then(suscripcion => {
            //console.log(suscripcion);
            fetch('api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suscripcion)
            }).then(verificaSuscripcion).catch(cancelarSuscripcion)
        });
    });
});

function cancelarSuscripcion() {
    swReg.pushManager.getSubscription().then(subs => {
        subs.unsubscribe().then(() => {
            verificaSuscripcion(false);
        });
    });
}

btnActivadas.on('click', function () {
    cancelarSuscripcion();
});