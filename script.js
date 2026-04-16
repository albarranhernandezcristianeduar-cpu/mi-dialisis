const { jsPDF } = window.jspdf;
let historialSesiones = [];

// 1. CARGAR DATOS AL INICIAR LA APP
// Esta función recupera lo guardado en el teléfono apenas abres la página
window.addEventListener('load', () => {
    const datosEnMemoria = localStorage.getItem('mis_sesiones_dialisis');
    if (datosEnMemoria) {
        historialSesiones = JSON.parse(datosEnMemoria);
        actualizarTabla();
    }
});

// 2. FUNCIÓN PARA GUARDAR UNA SESIÓN
window.guardarDatos = function() {
    const sesion = {
        id: Date.now(), // ID único para poder borrar registros específicos
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

    // Guardar en el arreglo y en la memoria del teléfono (localStorage)
    historialSesiones.push(sesion);
    localStorage.setItem('mis_sesiones_dialisis', JSON.stringify(historialSesiones));

    // Limpiar campos y avisar
    document.getElementById('notas').value = "";
    document.getElementById('alerta').innerHTML = `<div style="color: #556b2f; text-align:center; margin-top:15px; font-weight:bold;">✅ Guardado correctamente</div>`;

    actualizarTabla();
};

// 3. ACTUALIZAR EL HISTORIAL EN PANTALLA
function actualizarTabla() {
    const contenedor = document.getElementById('listaHistorial');
    contenedor.innerHTML = ""; 

    historialSesiones.slice().reverse().forEach((s) => {
        const item = document.createElement('div');
        // El estilo se hereda de tu CSS, aquí solo armamos el contenido
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>📅 ${s.fecha}</strong>
                <button onclick="eliminarRegistro(${s.id})" style="width:auto; background:none; box-shadow:none; color:#e74c3c; padding:0; margin:0; font-size:1.2rem;">✕</button>
            </div>
            💧 UF: ${s.ufTotal}ml | 🍬 Glu: ${s.glucosa}<br>
            🩺 T.A: ${s.presion} | 🕒 ${s.horaInicio} - ${s.horaTermino}
            ${s.notas ? `<br><small>📝 <em>${s.notas}</em></small>` : ""}
        `;
        // Agregamos el estilo de tarjeta que ya tenías en CSS
        item.className = "historial-item"; 
        contenedor.appendChild(item);
    });
}

// 4. FUNCIONES PARA BORRAR
window.eliminarRegistro = function(id) {
    if(confirm("¿Eliminar este registro específico?")) {
        historialSesiones = historialSesiones.filter(s => s.id !== id);
        localStorage.setItem('mis_sesiones_dialisis', JSON.stringify(historialSesiones));
        actualizarTabla();
    }
};

window.borrarTodo = function() {
    if(confirm("¿Estás seguro de borrar TODO el historial? Esta acción no se puede deshacer.")) {
        historialSesiones = [];
        localStorage.removeItem('mis_sesiones_dialisis');
        actualizarTabla();
    }
};

// 5. GENERAR REPORTE PDF
document.getElementById('btnPdf').addEventListener('click', () => {
    if (historialSesiones.length === 0) return alert("No hay datos para exportar");

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(85, 107, 47);
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
        headStyles: { fillColor: [163, 193, 173] }
    });

    let finalY = doc.lastAutoTable.finalY + 15;
    let notasTexto = historialSesiones
        .filter(s => s.notas && s.notas.trim() !== "")
        .map(s => `${s.fecha}: ${s.notas}`)
        .join("\n");

    if (notasTexto) {
        doc.setFontSize(12);
        doc.text("Observaciones:", 14, finalY);
        doc.setFontSize(10);
        doc.text(notasTexto, 14, finalY + 7, { maxWidth: 180 });
    }

    doc.save(`Reporte_Dialisis_${new Date().toLocaleDateString()}.pdf`);
});