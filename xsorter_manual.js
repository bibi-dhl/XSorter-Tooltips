// ==UserScript==
// @name         XSorter | Reparto manual
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Añade funcionalidad de popup que muestra reparto manual y envía notificaciones a Microsoft Teams al pulsar F2, requiriendo el script de webhook de Teams instalado.
// @autor        Ahmed Bibi
// @match        http://2.14.233.15:8088/XS/*
// @exclude      http://2.14.233.15:8088/XS/MANUALC*
// @exclude      http://2.14.233.15:8088/XS/VREFPEN*
// @exclude      http://2.14.233.15:8088/XS/VPANELB?USERID=*
// @updateURL    file:///P:/XSORTER/02.%20ADMINISTRACION/TM/Scripts/prod/reparto_manual.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Verificar si las funciones del primer script están disponibles
    function areFunctionsAvailable() {
        return typeof sendTeamsMessage === 'function' && typeof updateUsageStats === 'function';
    }

    if (!areFunctionsAvailable()) {
        console.error('El script de Webhook de Teams y Gestión de Cookies no está instalado o no está funcionando correctamente.');
        return;
    }

    // Obtener el userID del formulario
    function getUserId() {
        const userIdElement = document.querySelector('input[name="userid"]');
        if (userIdElement) {
            return userIdElement.value;
        }
        return null;
    }

    // Crear el contenedor del popup
    const popupContainer = document.createElement('div');
    popupContainer.id = 'popupContainer';
    document.body.appendChild(popupContainer);

    // Crear el shadow root
    const shadow = popupContainer.attachShadow({ mode: 'open' });

    // Incluir Bootstrap CSS dentro del shadow DOM
    const bootstrapCSS = document.createElement('link');
    bootstrapCSS.rel = 'stylesheet';
    bootstrapCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css';
    shadow.appendChild(bootstrapCSS);

    // Crear el estilo adicional para el popup dentro del shadow DOM
    const style = document.createElement('style');
    style.innerHTML = `
        #popupIframe {
            position: fixed;
            width: 700px; /* Ancho fijo */
            height: 500px; /* Alto fijo */
            border: 2px solid #000;
            border-radius: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 2147483647; /* Prioridad absoluta */
            background-color: white;
            display: none;
            overflow: hidden;
            top: 10px; /* Posición por defecto en la esquina superior izquierda */
            left: 10px; /* Posición por defecto en la esquina superior izquierda */
            transition: top 0.5s ease-in-out, left 0.5s ease-in-out; /* Transición suave */
        }
        #popupIframe iframe {
            width: 700px;
            height: 500px;
            border: none;
            transform-origin: 0 0; /* Asegurar que el contenido se escale desde la esquina superior izquierda */
        }
        #popupIframeClose {
            position: absolute;
            bottom: 5px;
            left: 50%;
            transform: translateX(-50%);
            cursor: pointer;
            padding: 8px 16px;
            background-color: #dc3545; /* Color de botón de Bootstrap */
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-family: Helvetica, sans-serif; /* Aplicar la fuente Helvetica */
            font-weight: bold; /* Hacer el texto bold */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Sombra para que no sea transparente */
        }
        .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            font-family: Helvetica, sans-serif; /* Aplicar la fuente Helvetica */
            background-color: #dc3545; /* Fondo rojo */
            color: #fff; /* Texto blanco */
            padding: 10px;
            border-radius: 15px 15px 0 0;
            border-bottom: 1px solid #dee2e6; /* Línea inferior del header */
        }
        .popup-header span {
            margin-right: 10px;
            font-weight: bold;
        }
        .cornerButton {
            width: 30px;
            height: 30px;
            background-color: #ffc107; /* Color amarillo de DHL Group */
            color: #000; /* Texto negro */
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            cursor: pointer;
            margin-right: 5px;
        }
        .cornerButton:hover {
            background-color: #e0a800; /* Color de hover del botón amarillo */
        }
        .draggable {
            cursor: move;
        }
    `;
    shadow.appendChild(style);

    // Crear el contenido del popup dentro del shadow DOM
    const popup = document.createElement('div');
    popup.id = 'popupIframe';
    popup.className = 'card';  // Clase de Bootstrap para estilo de tarjeta
    popup.innerHTML = `
        <div class="popup-header draggable">
            <span style="font: 10px;">Selecciona una posición</span>
            <div class="d-flex align-items-center">
                <div class="cornerButton" id="topLeftBtn">⬁</div>
                <div class="cornerButton" id="topRightBtn">⬀</div>
                <div class="cornerButton" id="bottomLeftBtn">⬃</div>
                <div class="cornerButton" id="bottomRightBtn">⬂</div>
            </div>
        </div>
        <div class="card-body p-0">
            <iframe src="http://2.14.233.15:8088/XS/MANUALC" id="popupIframeContent"></iframe>
        </div>
        <button id="popupIframeClose" class="btn btn-danger">Cerrar</button>
    `;
    shadow.appendChild(popup);

    // Añadir el evento para cerrar el popup
    const popupCloseBtn = shadow.getElementById('popupIframeClose');
    if (popupCloseBtn) {
        popupCloseBtn.addEventListener('click', () => {
            popup.style.display = 'none';
        });
    }

    // Añadir el evento para abrir o cerrar el popup al pulsar F2
    document.addEventListener('keydown', (event) => {
        if (event.key === 'F2' && event.target === document.body) {
            if (popup.style.display === 'none' || popup.style.display === '') {
                const userId = getUserId();
                const currentTime = new Date().toLocaleString();
                if (userId) {
                    const {
                        usageCount,
                        firstUse,
                        dailyReportMessage,
                        weeklyReportMessage,
                        monthlyReportMessage
                    } = updateUsageStats(userId);

                    let message = `User ID: ${userId}\n\nUser ${userId} has used the tool at ${currentTime}.`;
                    message += ` 🎉 This is their ${usageCount}th time using the tool.`;
                    message += ` 🕒 First use was on ${firstUse}.`;

                    if (dailyReportMessage) {
                        message += `\n\n${dailyReportMessage}`;
                    }
                    if (weeklyReportMessage) {
                        message += `\n\n${weeklyReportMessage}`;
                    }
                    if (monthlyReportMessage) {
                        message += `\n\n${monthlyReportMessage}`;
                    }

                    console.log(`Sending message to Teams: ${message}`); // Log del mensaje en la consola
                    sendTeamsMessage(message);
                } else {
                    const errorMessage = 'User ID not found or not available.';
                    console.error(errorMessage);
                }

                popup.style.display = 'block';
            } else {
                popup.style.display = 'none';
            }
            event.preventDefault(); // Previene el comportamiento predeterminado de F2
        }
    });

    // Funcionalidad de mover a las esquinas con padding de 10px
    const topLeftBtn = shadow.getElementById('topLeftBtn');
    const topRightBtn = shadow.getElementById('topRightBtn');
    const bottomLeftBtn = shadow.getElementById('bottomLeftBtn');
    const bottomRightBtn = shadow.getElementById('bottomRightBtn');

    if (topLeftBtn) {
        topLeftBtn.addEventListener('click', () => {
            moveToCorner(10, 10);
        });
    }

    if (topRightBtn) {
        topRightBtn.addEventListener('click', () => {
            moveToCorner(window.innerWidth - popup.offsetWidth - 10, 10);
        });
    }

    if (bottomLeftBtn) {
        bottomLeftBtn.addEventListener('click', () => {
            moveToCorner(10, window.innerHeight - popup.offsetHeight - 10);
        });
    }

    if (bottomRightBtn) {
        bottomRightBtn.addEventListener('click', () => {
            moveToCorner(window.innerWidth - popup.offsetWidth - 10, window.innerHeight - popup.offsetHeight - 10);
        });
    }

    function moveToCorner(left, top) {
        popup.style.left = left + 'px';
        popup.style.top = top + 'px';
    }

    // Funcionalidad para contar pulsaciones de tecla Enter dentro del iframe
    const iframe = shadow.getElementById('popupIframeContent');
    let enterCount = 0;
    const enterMilestones = [5, 10, 20, 30];

    iframe.addEventListener('load', () => {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        iframeDocument.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                enterCount++;
                const userId = getUserId();
                if (userId) {
                    setCookie(`enterCount_${userId}_${new Date().toDateString()}`, enterCount, 1);
                    checkMilestones(userId, enterCount);
                }
            }
        });
    });

    function checkMilestones(userId, count) {
        if (enterMilestones.includes(count)) {
            const message = `User ID: ${userId}\n\n🎮 Congratulations! You've reached ${count} managed items today! Keep going!`;
            console.log(`Sending milestone message to Teams: ${message}`);
            sendTeamsMessage(message);
        }
    }

    // Función para establecer cookies
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }
})();
