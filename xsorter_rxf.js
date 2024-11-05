// ==UserScript==
// @name         XSorter - RAS RXF |  Botón de Imprimir
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Script para añadir un botón que imprima la lista de referencias pendientes en un RAS de radiofrecuencia (03, 05, 07, 50) y mostrar un mensaje si la página del iframe está vacía, además de incluir un logotipo en la esquina superior izquierda
// @author       Ahmed Bibi
// @match        http://2.14.233.15:8088/XS/VMSGRAD?RAS=*
// @downloadURL  https://github.com/bibi-dhl/XSorter-Tooltips/raw/refs/heads/main/xsorter_rxf
// @updateURL    https://github.com/bibi-dhl/XSorter-Tooltips/raw/refs/heads/main/xsorter_rxf
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Espera a que el DOM esté completamente cargado
    window.addEventListener('load', function() {
        // Crear el botón para imprimir el iframe
        var printButton = document.createElement('button');
        printButton.innerText = "Imprimir";
        printButton.classList.add('Boton'); // Añadir la clase para mantener el estilo
        printButton.style.margin = '0 10px'; // Añadir algo de margen para separar los botones

        // Añadir el evento de clic al botón
        printButton.addEventListener('click', function() {
            var iframe = document.querySelector('iframe[name="familias"]');
            if (iframe) {
                // Acceder al contenido del iframe y modificarlo antes de imprimir
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                var iframeSrc = iframe.src;

                // Verificar si el contenido del iframe está vacío
                if (!iframeDoc.body || iframeDoc.body.innerHTML.trim() === "") {
                    alert("La página del iframe está vacía.");
                    return;
                }

                // Verificar si el contenido del iframe contiene el mensaje "User ID not found or not available."
                if (iframeDoc.body.textContent.includes("User ID not found or not available.")) {
                    alert("No se encontró el User ID o no está disponible.");
                    return;
                }

                // Verificar si el contenedor del enlace ya existe
                if (!iframeDoc.getElementById('enlace-impreso')) {
                    // Obtener los últimos dos caracteres del enlace
                    var lastTwoChars = iframeSrc.slice(-3);

                    // Crear un contenedor para el texto del enlace
                    var linkContainer = iframeDoc.createElement('div');
                    linkContainer.id = 'enlace-impreso'; // Asignar un id para evitar duplicados
                    linkContainer.style.marginTop = '20px';
                    linkContainer.style.textAlign = 'center';
                    linkContainer.style.fontSize = '14px';

                    // Crear el texto con los últimos dos caracteres destacados seguido de "RAS"
                    var highlightedLink = lastTwoChars + '</span> <hr>';

                    // Añadir el texto del enlace al contenedor
                    linkContainer.innerHTML = '<span style="font-family: Helvetica; font-weight: bold;"> RAS: ' + highlightedLink;

                    // Añadir el contenedor al comienzo del cuerpo del iframe
                    iframeDoc.body.insertBefore(linkContainer, iframeDoc.body.firstChild);

                    // Añadir el logotipo en la esquina superior izquierda
                    var logo = iframeDoc.createElement('img');
                    logo.src = 'http://2.14.233.15:8088/images/carrefour.gif';
                    logo.style.position = 'absolute';
                    logo.style.top = '10px';
                    logo.style.left = '10px';
                    logo.style.width = '100px'; // Ajustar el tamaño del logotipo si es necesario
                    iframeDoc.body.insertBefore(logo, iframeDoc.body.firstChild);

                    // Añadir un estilo para imprimir en formato horizontal
                    var style = iframeDoc.createElement('style');
                    style.type = 'text/css';
                    style.media = 'print';
                    style.appendChild(iframeDoc.createTextNode('@page { size: landscape; }'));
                    iframeDoc.head.appendChild(style);
                }

                // Enviar la orden de impresión
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } else {
                alert("No se encontró el iframe con el nombre 'familias'.");
            }
        });

        // Encontrar el contenedor de los botones existentes
        var buttonsContainer = document.querySelector('tr > td[colspan="2"]').parentNode;

        if (buttonsContainer) {
            // Crear una celda para el nuevo botón
            var newCell = document.createElement('td');
            newCell.align = "center";
            newCell.width = "33%";
            newCell.colSpan = "2";
            newCell.appendChild(printButton);

            // Insertar la nueva celda entre los botones existentes
            buttonsContainer.insertBefore(newCell, buttonsContainer.children[2]);
        } else {
            console.error("No se encontró el contenedor de los botones.");
        }
    });
})();
