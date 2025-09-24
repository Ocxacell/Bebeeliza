const fondo = document.getElementById("fondo");

// Lista de imágenes
const imagenes = [
  "img/foto1.jpg",
  "img/foto2.jpg",
  "img/foto3.jpg",
  "img/foto4.jpg",
  "img/foto5.jpg",
  "img/foto6.jpg",
  "img/foto7.jpg",
  "img/foto8.jpg",
  "img/foto9.jpg",
  "img/foto10.jpg",
  "img/foto11.jpg",
  "img/foto12.jpg",
];

const burbujas = [];
let ancho = window.innerWidth;
let alto = window.innerHeight;

// Función para crear una burbuja
function crearBurbuja(src) {
  // Validar que src sea una cadena y no undefined
  if (typeof src !== "string" || !src.trim()) {
    // No crear burbuja si la imagen no es válida
    return null;
  }
  const burbuja = document.createElement("div");
  burbuja.classList.add("burbuja");

  const size = 100 + Math.random() * 80;
  burbuja.style.width = size + "px";
  burbuja.style.height = size + "px";
  burbuja.style.backgroundImage = `url(${src})`;
  burbuja.style.backgroundSize = "cover";
  burbuja.style.backgroundPosition = "center";

  let x = Math.random() * (ancho - size);
  let y = Math.random() * (alto - size);
  let dx = (Math.random() - 0.5) * 2;
  let dy = (Math.random() - 0.5) * 2;

  // Aplicar posición inicial inmediatamente
  burbuja.style.transform = `translate(${x}px, ${y}px)`;
  
  fondo.appendChild(burbuja);
  return {el: burbuja, x, y, dx, dy, size, radius: size/2};
}


// Limitar cantidad de burbujas
const burbujasMaximas = 5;
for (let i = 0; i < burbujasMaximas; i++) {
  const src = imagenes[i % imagenes.length];
  const nuevaBurbuja = crearBurbuja(src);
  if (nuevaBurbuja) burbujas.push(nuevaBurbuja);
}

// Nueva función de detección de colisiones mejorada
function detectarColisiones() {
  for (let i = 0; i < burbujas.length; i++) {
    for (let j = i + 1; j < burbujas.length; j++) {
      let b1 = burbujas[i];
      let b2 = burbujas[j];
      
      // Calcular distancia entre centros
      let dx = (b1.x + b1.radius) - (b2.x + b2.radius);
      let dy = (b1.y + b1.radius) - (b2.y + b2.radius);
      let distancia = Math.sqrt(dx*dx + dy*dy);
      
      // Verificar si hay colisión (distancias menores que la suma de radios)
      if (distancia < b1.radius + b2.radius) {
        // Calcular ángulo de colisión
        let angulo = Math.atan2(dy, dx);
        
        // Calcular componentes de velocidad
        let velocidad1 = Math.sqrt(b1.dx*b1.dx + b1.dy*b1.dy);
        let velocidad2 = Math.sqrt(b2.dx*b2.dx + b2.dy*b2.dy);
        
        // Calcular direcciones iniciales
        let direccion1 = Math.atan2(b1.dy, b1.dx);
        let direccion2 = Math.atan2(b2.dy, b2.dx);
        
        // Nuevas velocidades después de la colisión (física elástica)
        let nuevaVelX1 = velocidad1 * Math.cos(direccion1 - angulo);
        let nuevaVelY1 = velocidad1 * Math.sin(direccion1 - angulo);
        let nuevaVelX2 = velocidad2 * Math.cos(direccion2 - angulo);
        let nuevaVelY2 = velocidad2 * Math.sin(direccion2 - angulo);
        
        // Velocidades finales después de la colisión (conservación del momento)
        let velFinalX1 = ((b1.radius - b2.radius) * nuevaVelX1 + (2 * b2.radius) * nuevaVelX2) / (b1.radius + b2.radius);
        let velFinalX2 = ((2 * b1.radius) * nuevaVelX1 + (b2.radius - b1.radius) * nuevaVelX2) / (b1.radius + b2.radius);
        
        // Las velocidades en Y permanecen iguales (colisión elástica 1D)
        let velFinalY1 = nuevaVelY1;
        let velFinalY2 = nuevaVelY2;
        
        // Convertir de vuelta a coordenadas originales
        b1.dx = Math.cos(angulo) * velFinalX1 + Math.cos(angulo + Math.PI/2) * velFinalY1;
        b1.dy = Math.sin(angulo) * velFinalX1 + Math.sin(angulo + Math.PI/2) * velFinalY1;
        b2.dx = Math.cos(angulo) * velFinalX2 + Math.cos(angulo + Math.PI/2) * velFinalY2;
        b2.dy = Math.sin(angulo) * velFinalX2 + Math.sin(angulo + Math.PI/2) * velFinalY2;
        
        // Separar las burbujas para evitar que se queden pegadas
        let overlap = (b1.radius + b2.radius) - distancia;
        let shiftX = (overlap / 2) * (dx / distancia);
        let shiftY = (overlap / 2) * (dy / distancia);
        
        b1.x += shiftX;
        b1.y += shiftY;
        b2.x -= shiftX;
        b2.y -= shiftY;
      }
    }
  }
}

function animar() {
  // Mover burbujas
  burbujas.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;

    // Rebote con bordes (mejorado)
    if (b.x <= 0) {
      b.x = 0;
      b.dx = Math.abs(b.dx);
    } else if (b.x + b.size >= ancho) {
      b.x = ancho - b.size;
      b.dx = -Math.abs(b.dx);
    }
    
    if (b.y <= 0) {
      b.y = 0;
      b.dy = Math.abs(b.dy);
    } else if (b.y + b.size >= alto) {
      b.y = alto - b.size;
      b.dy = -Math.abs(b.dy);
    }

    b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
  });

  // Detectar y resolver colisiones
  detectarColisiones();

  requestAnimationFrame(animar);
}
animar();

// Función para estallar y renacer (CORREGIDA)
function estallarYRenacer(b) {
  // Animación de estallar
  b.el.style.transition = "transform 0.5s ease, opacity 0.5s ease";
  b.el.style.opacity = "0";
  b.el.style.transform += " scale(1.5)";

  setTimeout(() => {
    // Guardar referencia a la burbuja antes de eliminarla
    const index = burbujas.indexOf(b);
    
    // Eliminar del DOM y del array
    fondo.removeChild(b.el);
    if (index > -1) burbujas.splice(index, 1);

    // Crear nueva burbuja en posición aleatoria
    const nuevaSrc = imagenes[Math.floor(Math.random() * imagenes.length)];
    const nueva = crearBurbuja(nuevaSrc);
    
    // Configurar estado inicial para animación de aparición
    nueva.el.style.opacity = "0";
    nueva.el.style.transform = `translate(${nueva.x}px, ${nueva.y}px) scale(0.1)`;
    
    // Agregar al array de burbujas
    burbujas.push(nueva);

    // Animar aparición después de un breve delay
    setTimeout(() => {
      nueva.el.style.transition = "transform 0.8s ease, opacity 0.8s ease";
      nueva.el.style.opacity = "1";
      nueva.el.style.transform = `translate(${nueva.x}px, ${nueva.y}px) scale(1)`;
      
      // Limpiar la transición después de la animación
      setTimeout(() => {
        nueva.el.style.transition = "";
      }, 800);
    }, 50);
  }, 500);
}

// Cada 5 segundos, hacer estallar una burbuja aleatoria
setInterval(() => {
  if (burbujas.length > 0) {
    const b = burbujas[Math.floor(Math.random() * burbujas.length)];
    estallarYRenacer(b);
  }
}, 5000);

// Redimensionar ventana
window.addEventListener('resize', () => {
  ancho = window.innerWidth;
  alto = window.innerHeight;
});