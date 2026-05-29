const botones = document.querySelectorAll(".boton-pregunta");

botones.forEach((boton) => {
    boton.addEventListener("click", () => {
        const respuesta = boton.nextElementSibling;

        if(respuesta.style.display === "block"){
            respuesta.style.display = "none";
        }else{
            respuesta.style.display = "block";
        }
    });
});

let textoResultado = "";
let chartNewton = null;
let chartMinimos = null;


function calcularNewton(){
    let formula = document.getElementById("formula").value;
    let x0 = parseFloat(document.getElementById("valorInicial").value);
    let iteracionesDeseadas = parseInt(document.getElementById("numIteraciones").value);
    let resultado = document.getElementById("resultado");
    let contenedorFormulas = document.getElementById("formulasEvaluadas");

    if(isNaN(x0)){
        resultado.innerHTML = "<span style='color:#ef4444;'>Error: Ingrese un valor inicial válido.</span>";
        return;
    }
    if(isNaN(iteracionesDeseadas) || iteracionesDeseadas < 1){
        resultado.innerHTML = "<span style='color:#ef4444;'>Error: Ingrese un número de iteraciones válido (mínimo 1).</span>";
        return;
    }

    let f;
    let df;
    let labelFuncion = "";
    let labelDerivada = "";

    
    if(formula == "1"){
        f = x => x*x*x - x - 2;
        df = x => 3*x*x - 1;
        labelFuncion = "f(x) = x³ - x - 2";
        labelDerivada = "f'(x) = 3x² - 1";
    }
    if(formula == "2"){
        f = x => x*x - 4;
        df = x => 2*x;
        labelFuncion = "f(x) = x² - 4";
        labelDerivada = "f'(x) = 2x";
    }
    if(formula == "3"){
        f = x => Math.cos(x) - x;
        df = x => -Math.sin(x) - 1;
        labelFuncion = "f(x) = cos(x) - x";
        labelDerivada = "f'(x) = -sin(x) - 1";
    }

    
    contenedorFormulas.innerHTML = `<strong>Función evaluada:</strong> ${labelFuncion} <br> <strong>Derivada utilizada:</strong> ${labelDerivada}`;

    let texto = "<h3>Procedimiento de Newton-Raphson</h3>";
    texto += `Calculando con aproximación inicial x₀ = ${x0} durante ${iteracionesDeseadas} iteraciones:<br><br>`;
    
    let iteracionesX = [x0];

    for(let i = 1; i <= iteracionesDeseadas; i++){
        let dVal = df(x0);
        if(dVal == 0){
            resultado.innerHTML = "<span style='color:#ef4444;'>Error matemático: La derivada es igual a 0 en esta iteración. No se puede continuar.</span>";
            return;
        }

        let x1 = x0 - (f(x0) / dVal);
        texto += "Iteración " + i + ": x = " + x1.toFixed(6) + "<br>";
        x0 = x1;
        iteracionesX.push(x0);
    }

    texto += "<br><strong>Raíz aproximada final:</strong> " + x0.toFixed(6);
    resultado.innerHTML = texto;

    textoResultado = texto.replace(/<br>/g,"\n").replace(/<[^>]*>/g,"");

    graficarNewton(f, x0, labelFuncion);
}
function graficarNewton(f, raiz, labelFuncion) {
    if (chartNewton) chartNewton.destroy();

    let dataX = [];
    let dataY = [];
    let rangoMin = raiz - 2;
    let rangoMax = raiz + 2;

    for (let x = rangoMin; x <= rangoMax; x += 0.1) {
        dataX.push(x.toFixed(2));
        dataY.push(f(x));
    }

    const ctx = document.getElementById('graficaNewton').getContext('2d');

    chartNewton = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataX,
            datasets: [
                {
                    label: labelFuncion,
                    data: dataY,
                    borderColor: '#60a5fa',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'Raíz Aproximada',
                    data: dataX.map(x => (Math.abs(x - raiz) < 0.1 ? f(raiz) : null)),
                    backgroundColor: '#ef4444',
                    borderColor: '#ef4444',
                    pointRadius: 6,
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { 
                    grid: { color: '#1e293b' }, 
                    ticks: { color: '#94a3b8' } 
                },
                y: { 
                    grid: { color: '#1e293b' }, 
                    ticks: { color: '#94a3b8' } 
                }
            }
        }
    });
}

function descargarResultado(){
    if(textoResultado == ""){
        alert("Primero calcule un resultado");
        return;
    }

    const archivo = new Blob([textoResultado], {type:"text/plain"});
    const enlace = document.createElement("a");

    enlace.href = URL.createObjectURL(archivo);
    enlace.download = "resultado_newton.txt";
    enlace.click();
}


function calcularMinimos(){
    let rawX = document.getElementById("datosX").value.split(",");
    let rawY = document.getElementById("datosY").value.split(",");
    let resultado = document.getElementById("resultadoMinimos");

    if(rawX.length != rawY.length || rawX.length < 2){
        resultado.innerHTML = "<span style='color:#ef4444;'>Error: La cantidad de datos en X e Y debe ser igual y contener al menos 2 puntos.</span>";
        return;
    }

    let n = rawX.length;
    let sumaX = 0;
    let sumaY = 0;
    let sumaXY = 0;
    let sumaX2 = 0;

    let x = [];
    let y = [];

    for(let i = 0; i < n; i++){
        x[i] = parseFloat(rawX[i]);
        y[i] = parseFloat(rawY[i]);

        if(isNaN(x[i]) || isNaN(y[i])){
            resultado.innerHTML = "<span style='color:#ef4444;'>Error: Ingrese valores numéricos válidos.</span>";
            return;
        }

        sumaX += x[i];
        sumaY += y[i];
        sumaXY += x[i] * y[i];
        sumaX2 += x[i] * x[i];
    }

    let denominador = (n * sumaX2) - (sumaX * sumaX);

    if(denominador == 0){
        resultado.innerHTML = "<span style='color:#ef4444;'>Error: No se puede calcular porque el denominador da 0.</span>";
        return;
    }

    let m = ((n * sumaXY) - (sumaX * sumaY)) / denominador;
    let b = ((sumaY * sumaX2) - (sumaX * sumaXY)) / denominador;

    let htmlProceso = "<h3>Procedimiento del Ajuste de Curva</h3>";

    htmlProceso += "<table class='tabla-proceso'>";
    htmlProceso += "<tr><th>i</th><th>X</th><th>Y</th><th>X²</th><th>X · Y</th></tr>";

    for(let i = 0; i < n; i++){
        htmlProceso += `<tr>
            <td>${i + 1}</td>
            <td>${x[i]}</td>
            <td>${y[i]}</td>
            <td>${(x[i] * x[i]).toFixed(4)}</td>
            <td>${(x[i] * y[i]).toFixed(4)}</td>
        </tr>`;
    }

    htmlProceso += `<tr style='background: #1e293b; font-weight: bold; color: #60a5fa;'>
        <td>∑ Suma</td>
        <td>${sumaX.toFixed(4)}</td>
        <td>${sumaY.toFixed(4)}</td>
        <td>${sumaX2.toFixed(4)}</td>
        <td>${sumaXY.toFixed(4)}</td>
    </tr>`;

    htmlProceso += "</table><br>";

    htmlProceso += "<strong>1. Parámetros calculados:</strong><br>";
    htmlProceso += `n = ${n}<br><br>`;

    htmlProceso += "<strong>2. Cálculo de la Pendiente m:</strong><br>";
    htmlProceso += "Fórmula: m = (n · ∑XY - ∑X · ∑Y) / (n · ∑X² - (∑X)²)<br>";
    htmlProceso += `m = (${n} · ${sumaXY.toFixed(4)} - ${sumaX.toFixed(4)} · ${sumaY.toFixed(4)}) / (${n} · ${sumaX2.toFixed(4)} - (${sumaX.toFixed(4)})²)<br>`;
    htmlProceso += `m = ${((n * sumaXY) - (sumaX * sumaY)).toFixed(4)} / ${denominador.toFixed(4)}<br>`;
    htmlProceso += `<strong>m = ${m.toFixed(4)}</strong><br><br>`;

    htmlProceso += "<strong>3. Cálculo del Intercepto b:</strong><br>";
    htmlProceso += "Fórmula: b = (∑Y · ∑X² - ∑X · ∑XY) / (n · ∑X² - (∑X)²)<br>";
    htmlProceso += `b = (${sumaY.toFixed(4)} · ${sumaX2.toFixed(4)} - ${sumaX.toFixed(4)} · ${sumaXY.toFixed(4)}) / (${n} · ${sumaX2.toFixed(4)} - (${sumaX.toFixed(4)})²)<br>`;
    htmlProceso += `b = ${((sumaY * sumaX2) - (sumaX * sumaXY)).toFixed(4)} / ${denominador.toFixed(4)}<br>`;
    htmlProceso += `<strong>b = ${b.toFixed(4)}</strong><br><br>`;

    htmlProceso += "<strong>4. Ecuación Final Obtenida:</strong><br>";
    htmlProceso += `<span style='font-size: 1.2rem; color: #34d399; font-weight: bold;'>y = ${m.toFixed(4)}x + (${b.toFixed(4)})</span>`;

    resultado.innerHTML = htmlProceso;

    graficarMinimos(x, y, m, b);
}

function graficarMinimos(numX, numY, m, b) {
    if (chartMinimos) chartMinimos.destroy();

    let minX = Math.min(...numX);
    let maxX = Math.max(...numX);

    let puntosDispersos = numX.map((val, index) => ({ 
        x: val, 
        y: numY[index] 
    }));

    let lineaTendencia = [
        { x: minX, y: m * minX + b },
        { x: maxX, y: m * maxX + b }
    ];

    const ctx = document.getElementById('graficaMinimos').getContext('2d');

    chartMinimos = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Datos Reales',
                    data: puntosDispersos,
                    backgroundColor: '#34d399',
                    pointRadius: 6
                },
                {
                    label: 'Línea de Ajuste y = mx + b',
                    data: lineaTendencia,
                    type: 'line',
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { 
                    type: 'linear', 
                    position: 'bottom', 
                    grid: { color: '#1e293b' }, 
                    ticks: { color: '#94a3b8' } 
                },
                y: { 
                    grid: { color: '#1e293b' }, 
                    ticks: { color: '#94a3b8' } 
                }
            }
        }
    });
}