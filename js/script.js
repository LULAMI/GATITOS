// ===== Miau Couture - script.js =====
// Maneja: fetch de productos, render de tarjetas, carrito con localStorage,
// contador dinámico, edición de cantidades, eliminación y validación del
// formulario de contacto.

const API_URL = "./data/productos.json";
const CART_KEY = "miauCouture_carrito";

let productos = [];
let carrito = cargarCarrito();

// ---------- Utilidades de carrito (localStorage) ----------
function cargarCarrito() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("No se pudo leer el carrito guardado:", error);
    return [];
  }
}

function guardarCarrito() {
  localStorage.setItem(CART_KEY, JSON.stringify(carrito));
}

function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  const item = carrito.find((p) => p.id === id);
  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito();
  actualizarContador();
  renderCarrito();
  mostrarMensaje(`${producto.nombre} se agregó al carrito 🐾`);
}

function cambiarCantidad(id, delta) {
  const item = carrito.find((p) => p.id === id);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter((p) => p.id !== id);
  }

  guardarCarrito();
  actualizarContador();
  renderCarrito();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter((p) => p.id !== id);
  guardarCarrito();
  actualizarContador();
  renderCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  actualizarContador();
  renderCarrito();
}

function totalCarrito() {
  return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
}

function cantidadTotalCarrito() {
  return carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

// ---------- Render de productos (Fetch API) ----------
async function cargarProductos() {
  const contenedor = document.querySelector(".contenedor-tarjetas");
  if (!contenedor) return;

  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error("No se pudo obtener el catálogo");
    productos = await respuesta.json();
    renderProductos(productos);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `<p class="error-carga">No pudimos cargar los productos. Intentá nuevamente más tarde.</p>`;
  }
}

function renderProductos(lista) {
  const contenedor = document.querySelector(".contenedor-tarjetas");
  if (!contenedor) return;

  contenedor.innerHTML = lista
    .map(
      (producto) => `
      <article class="card text-dark">
        <img src="${producto.imagen}" alt="${producto.nombre}" />
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <p>Precio: $${producto.precio.toLocaleString("es-AR")}</p>
        <button class="btn bg-secondary text-dark btn-agregar" data-id="${producto.id}">
          Agregar al carrito
        </button>
      </article>
    `
    )
    .join("");

  contenedor.querySelectorAll(".btn-agregar").forEach((btn) => {
    btn.addEventListener("click", () => {
      agregarAlCarrito(Number(btn.dataset.id));
    });
  });
}

// ---------- Render del carrito ----------
function renderCarrito() {
  const lista = document.getElementById("lista-carrito");
  const totalEl = document.getElementById("carrito-total");
  if (!lista || !totalEl) return;

  if (carrito.length === 0) {
    lista.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío.</p>`;
  } else {
    lista.innerHTML = carrito
      .map(
        (item) => `
        <div class="item-carrito" data-id="${item.id}">
          <img src="${item.imagen}" alt="${item.nombre}" />
          <div class="item-info">
            <h4>${item.nombre}</h4>
            <p>$${item.precio.toLocaleString("es-AR")} c/u</p>
            <div class="item-cantidad">
              <button class="btn-restar" aria-label="Quitar una unidad">−</button>
              <span>${item.cantidad}</span>
              <button class="btn-sumar" aria-label="Agregar una unidad">+</button>
            </div>
          </div>
          <div class="item-subtotal">
            <p>$${(item.precio * item.cantidad).toLocaleString("es-AR")}</p>
            <button class="btn-eliminar" aria-label="Eliminar producto">🗑️</button>
          </div>
        </div>
      `
      )
      .join("");
  }

  totalEl.textContent = `$${totalCarrito().toLocaleString("es-AR")}`;

  lista.querySelectorAll(".item-carrito").forEach((el) => {
    const id = Number(el.dataset.id);
    el.querySelector(".btn-sumar")?.addEventListener("click", () => cambiarCantidad(id, 1));
    el.querySelector(".btn-restar")?.addEventListener("click", () => cambiarCantidad(id, -1));
    el.querySelector(".btn-eliminar")?.addEventListener("click", () => eliminarDelCarrito(id));
  });
}

function actualizarContador() {
  const contador = document.getElementById("carrito-contador");
  if (contador) contador.textContent = cantidadTotalCarrito();
}

// ---------- UI: abrir/cerrar panel del carrito ----------
function inicializarUICarrito() {
  const abrirBtn = document.getElementById("btn-abrir-carrito");
  const cerrarBtn = document.getElementById("btn-cerrar-carrito");
  const panel = document.getElementById("panel-carrito");
  const vaciarBtn = document.getElementById("btn-vaciar-carrito");
  const finalizarBtn = document.getElementById("btn-finalizar-compra");

  abrirBtn?.addEventListener("click", () => panel?.classList.add("abierto"));
  cerrarBtn?.addEventListener("click", () => panel?.classList.remove("abierto"));
  vaciarBtn?.addEventListener("click", vaciarCarrito);

  finalizarBtn?.addEventListener("click", () => {
    if (carrito.length === 0) {
      mostrarMensaje("Tu carrito está vacío 🐱");
      return;
    }
    mostrarMensaje("¡Compra simulada con éxito! Gracias por elegir Miau Couture 🐾");
    vaciarCarrito();
    panel?.classList.remove("abierto");
  });
}

// ---------- Mensajes al usuario ----------
function mostrarMensaje(texto) {
  let toast = document.getElementById("toast-mensaje");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-mensaje";
    document.body.appendChild(toast);
  }
  toast.textContent = texto;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2500);
}

// ---------- Validación del formulario de contacto ----------
function inicializarFormularioContacto() {
  const form = document.querySelector("#form-contacto, form[action*='formspree']");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    const nombre = form.querySelector("[name='nombre']");
    const email = form.querySelector("[name='email'], [name='_replyto'], [name='correo']");
    const mensaje = form.querySelector("[name='mensaje']");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let valido = true;
    let error = "";

    if (!nombre || nombre.value.trim() === "") {
      valido = false;
      error = "Por favor completá tu nombre.";
    } else if (!email || !emailRegex.test(email.value.trim())) {
      valido = false;
      error = "Ingresá un correo electrónico válido.";
    } else if (!mensaje || mensaje.value.trim() === "") {
      valido = false;
      error = "Escribí un mensaje antes de enviar.";
    }

    if (!valido) {
      e.preventDefault();
      mostrarMensaje(error);
    }
  });
}

// ---------- Inicio ----------
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  inicializarUICarrito();
  inicializarFormularioContacto();
  actualizarContador();
  renderCarrito();
});
