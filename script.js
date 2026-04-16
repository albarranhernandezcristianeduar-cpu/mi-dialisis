const { jsPDF } = window.jspdf;
let historialSesiones = [];

// 1. CARGAR DATOS AL INICIAR
window.addEventListener('load', () => {
    const datosEnMemoria = localStorage.getItem('mis_sesiones_dialisis');
    if (datosEnMemoria) {
        historialSesiones = JSON.parse(datosEnMemoria);
        actualizarTabla();
    }
});

// 2. FUNCIÓN PARA GUARDAR
window.guardarDatos = function() {
    // Obtenemos los valores. Asegúrate que los IDs coincidan con el HTML
    const sesion = {
        id: Date.now(),
        fecha: document.getElementById('fecha').value,
        horaInicio: document.getElementById('horaInicio').value,
        horaTermino: document.getElementById('horaTermino').value,
        bolsa: document.getElementById('bolsas').value,
        ufTotal: document.getElementById('ufTotal').value,
        drenaje: document.getElementById('drenaje').value,
        liquidos: document.getElementById('liquidos').value,
        presion: document.getElementById('presion').value,
        glucosa: document.getElementById('glucosa').value,
        notas: document.getElementById('notas').value
    };

    if (!sesion.fecha) {
        alert("⚠️ Por favor selecciona una fecha.");
        return;
    }

    // Guardar
    historialSesiones.push(sesion);
    localStorage.setItem('mis_sesiones_dialisis', JSON.stringify(historialSesiones));

    // LIMPIAR FORMULARIO (Esto evita que se queden los datos viejos)
    document.getElementById('dialisisForm').reset();

    // ACTUALIZAR LA VISTA AL INSTANTE
    actualizarTabla();
    
    alert("✅ Sesión registrada correctamente");
};

// 3. ACTUALIZAR EL HISTORIAL EN PANTALLA
function actualizarTabla() {
    const contenedor = document.getElementById('listaHistorial');
    if (!contenedor) return; // Seguridad por si no encuentra el div
    
    contenedor.innerHTML = ""; 

    // Usamos reverse() para que lo más nuevo salga arriba
    historialSesiones.slice().reverse().forEach((s) => {
        const item = document.createElement('div');
        item.className = "historial-item"; // Para que use el diseño del CSS
        
        // Estilo interno de la tarjeta para que se vea azul y limpio
        item.innerHTML = `
            <div style="background: #f0f7ff; padding: 15px; border-radius: 12px; border-left: 5px solid #1565c0; margin-bottom: 10px; position: relative;">
                <button onclick="eliminarRegistro(${s.id})" style="position: absolute; top: 10px; right: 10px; width:auto; background:none; color:#ba1a1a; border:none; font-size:1.2rem; cursor:pointer;">✕</button>
                <div style="color: #1565c0; font-weight: bold; margin-bottom: 5px;">📅 ${s.fecha}</div>
                <div style="font-size: 0.9rem; color: #333;">
                    <strong>💧 UF:</strong> ${s.ufTotal}ml | <strong>🟢 Bolsa:</strong> ${s.bolsa}<br>
                    <strong>🩺 T.A:</strong> ${s.presion} | <strong>🕒</strong> ${s.horaInicio} - ${s.horaTermino}<br>
                    <strong>🍬 Glu:</strong> ${s.glucosa} mg/dL
                    ${s.notas ? `<br><div style="margin-top:5px; font-style: italic; color: #666;">📝 ${s.notas}</div>` : ""}
                </div>
            </div>
        `;
        contenedor.appendChild(item);
    });
}

// 4. BORRAR REGISTRO
window.eliminarRegistro = function(id) {
    if(confirm("¿Eliminar este registro?")) {
        historialSesiones = historialSesiones.filter(s => s.id !== id);
        localStorage.setItem('mis_sesiones_dialisis', JSON.stringify(historialSesiones));
        actualizarTabla();
    }
};

window.borrarTodo = function() {
    if(confirm("¿Borrar TODO el historial?")) {
        historialSesiones = [];
        localStorage.removeItem('mis_sesiones_dialisis');
        actualizarTabla();
    }
};

// 5. PDF (Mantenemos tu lógica que está muy bien)
document.getElementById('btnPdf').addEventListener('click', () => {
    if (historialSesiones.length === 0) return alert("No hay datos para exportar");

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(21, 101, 192); // Color azul
    doc.text("Reporte de Diálisis Peritoneal", 14, 20);
    
    const columnas = ["Fecha", "Inicio", "Fin", "Bolsa", "UF", "Drenaje", "Glu", "P.A."];
    const filas = historialSesiones.map(s => [
        s.fecha, s.horaInicio, s.horaTermino, s.bolsa, 
        s.ufTotal + "ml", s.drenaje + "ml", s.glucosa, s.presion
    ]);

    doc.autoTable({
        startY: 30,
        head: [columnas],
        body: filas,
        theme: 'striped',
        headStyles: { fillColor: [21, 101, 192] }
    });

    doc.save(`Reporte_Dialisis.pdf`);
});
