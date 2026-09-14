/* =========================================================
   SESIÓN — cuenta de usuario y partida (Firebase)
   Compartido por la página de inicio (index.html) y las herramientas
   (mapa, ficha, gm-tools). Se carga con <script src> después de los SDK
   compat de Firebase.

   - Cuenta: Google, o email y contraseña con el email confirmado. Sin
     cuenta confirmada no se entra a ninguna partida (lo imponen las
     reglas: request.auth.token.email_verified).
   - Partida: campanas/<id>. Viene en la dirección (?partida=<id>); si
     falta, se usa la última abierta en este navegador.
   - Miembro: campanas/<id>/miembros/<uid> = {nombre, gm, creado}. El
     nombre (apodo) se elige al entrar a cada partida; gm = quien la creó.

   Ver docs/workflow-firebase.md.
   ========================================================= */

const FB_CONFIG = {
  apiKey: 'AIzaSyAqvIuDU4IkIn548wwGPLtM_KSI5zjIP4s',
  authDomain: 'rol-pintoista.firebaseapp.com',
  projectId: 'rol-pintoista',
  storageBucket: 'rol-pintoista.appspot.com',
  messagingSenderId: '110064054820',
  appId: '1:110064054820:web:03d21067e2f831be2a1eb1',
};

// Dirección de la página de inicio, relativa a este archivo (comun/ está
// en la raíz del sitio), para volver desde cualquier herramienta.
const FB_INICIO = new URL('../index.html', document.currentScript.src).href;

function fbLeerPartidaElegida(){
  const id = new URLSearchParams(location.search).get('partida');
  if(id) return id;
  try{ return localStorage.getItem('partida-actual') || ''; }catch(e){ return ''; }
}
function fbRecordarPartida(id){
  try{ localStorage.setItem('partida-actual', id || ''); }catch(e){}
}

// La partida con la que trabaja esta pestaña. En las herramientas no cambia
// sin recargar; en el inicio se reasigna al elegir otra.
let FB_CAMPANA = fbLeerPartidaElegida();

let fbDb = null;
let fbUsuario = null;
let fbMiembro = null;   // {nombre, gm} en la partida actual
let fbPartida = null;   // {nombre, gmUid, gmNombre}

function fbRutaCampana(sub){
  return `campanas/${FB_CAMPANA}` + (sub ? '/' + sub : '');
}

function fbIniciar(){
  if(!window.firebase) return false;
  if(!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
  fbDb = firebase.firestore();
  firebase.auth().languageCode = 'es';  // mails de confirmación en castellano
  return true;
}

// Espera a que Firebase diga si hay alguien con la sesión iniciada.
function fbEsperarUsuario(){
  return new Promise(res => {
    const cortar = firebase.auth().onAuthStateChanged(u => {
      cortar();
      fbUsuario = u || null;
      res(fbUsuario);
    });
  });
}

// Cuenta lista para jugar: con Google (siempre confirmada) o con el email
// ya confirmado desde el link.
function fbCuentaConfirmada(u){
  return !!(u && !u.isAnonymous && u.emailVerified);
}

function fbUrlInicio(partida){
  return FB_INICIO + (partida ? '?partida=' + encodeURIComponent(partida) : '');
}

async function fbLeerMiembro(){
  try{
    const doc = await fbDb.doc(fbRutaCampana(`miembros/${fbUsuario.uid}`)).get();
    return doc.exists ? doc.data() : null;
  }catch(err){
    return null;
  }
}

async function fbLeerPartida(){
  try{
    const doc = await fbDb.doc(fbRutaCampana()).get();
    return doc.exists ? doc.data() : null;
  }catch(err){
    return null;
  }
}

// Para las herramientas: deja todo listo para trabajar en la partida, o
// manda al inicio si falta iniciar sesión, elegir partida o unirse.
// Devuelve 'ok', 'sin-firebase' (sin internet) o 'redirigiendo'.
async function fbEntrarAPartida(){
  if(!fbIniciar()) return 'sin-firebase';
  const u = await fbEsperarUsuario();
  if(!fbCuentaConfirmada(u) || !FB_CAMPANA){
    location.replace(fbUrlInicio(FB_CAMPANA));
    return 'redirigiendo';
  }
  // Credencial renovada si todavía no refleja el email confirmado.
  try{
    const cred = await u.getIdTokenResult();
    if(!cred.claims.email_verified) await u.getIdToken(true);
  }catch(e){}
  const [miembro, partida] = await Promise.all([fbLeerMiembro(), fbLeerPartida()]);
  if(!miembro || !partida){
    location.replace(fbUrlInicio(FB_CAMPANA));
    return 'redirigiendo';
  }
  fbMiembro = miembro;
  fbPartida = partida;
  fbRecordarPartida(FB_CAMPANA);
  return 'ok';
}

// Link "volver a la partida" para poner en cada herramienta.
function fbLinkInicioHtml(texto){
  const t = String(texto || '⌂ Partida').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  return `<a class="fb-inicio" href="${fbUrlInicio(FB_CAMPANA)}" title="Volver al inicio de la partida">${t}</a>`;
}
