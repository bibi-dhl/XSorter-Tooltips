// ==UserScript==
// @name         XSorter - RAS RXF | Botón de Imprimir
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Script para añadir un botón que imprima la lista de referencias pendientes en un RAS de radiofrecuencia (03, 05, 07, 50) y mostrar un mensaje si la página del iframe está vacía, además de incluir un logotipo en la esquina superior izquierda. También permite imprimir con Ctrl+P.
// @author       Ahmed Bibi
// @match        http://2.14.233.15:8088/XS/VMSGRAD?RAS=*
// @downloadURL  https://github.com/bibi-dhl/XSorter-Tooltips/raw/refs/heads/main/xsorter_rxf.js
// @updateURL    https://github.com/bibi-dhl/XSorter-Tooltips/raw/refs/heads/main/xsorter_rxf.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function printIframeContent() {
        var iframe = document.querySelector('iframe[name="familias"]');
        if (iframe) {
            var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            var iframeSrc = iframe.src;

            if (!iframeDoc.body || iframeDoc.body.innerHTML.trim() === "") {
                console.error("La página del iframe está vacía.");
                return;
            }

            if (iframeDoc.body.textContent.includes("User ID not found or not available.")) {
                console.error("No se encontró el User ID o no está disponible.");
                return;
            }

            if (!iframeDoc.getElementById('enlace-impreso')) {
                var lastTwoChars = iframeSrc.slice(-3);
                var linkContainer = iframeDoc.createElement('div');
                linkContainer.id = 'enlace-impreso';
                linkContainer.style.marginTop = '20px';
                linkContainer.style.textAlign = 'center';
                linkContainer.style.fontSize = '14px';
                var highlightedLink = lastTwoChars + '</span> <hr>';
                linkContainer.innerHTML = '<span style="font-family: Helvetica; font-weight: bold;"> RAS: ' + highlightedLink;
                iframeDoc.body.insertBefore(linkContainer, iframeDoc.body.firstChild);

                var logo = iframeDoc.createElement('img');
                logo.src = 'http://2.14.233.15:8088/images/carrefour.gif';
                logo.style.position = 'absolute';
                logo.style.top = '10px';
                logo.style.left = '10px';
                logo.style.width = '100px';
                iframeDoc.body.insertBefore(logo, iframeDoc.body.firstChild);

                var style = iframeDoc.createElement('style');
                style.type = 'text/css';
                style.media = 'print';
                style.appendChild(iframeDoc.createTextNode('@page { size: landscape; }'));
                iframeDoc.head.appendChild(style);
            }

            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } else {
            console.error("No se encontró el iframe con el nombre 'familias'.");
        }
    }

    function addPrintButton() {
        var printButton = document.createElement('button');
        printButton.innerText = "Imprimir";
        printButton.classList.add('Boton');
        printButton.style.margin = '0 10px';

        printButton.addEventListener('click', printIframeContent);

        var rayaRow = document.querySelector('tr > td[colspan="3"] > img[src="../images/raya.gif"]').parentNode.parentNode;

        if (rayaRow) {
            var newRow = document.createElement('tr');
            var newCell = document.createElement('td');
            newCell.colSpan = "3";
            newCell.style.textAlign = "center";
            newCell.appendChild(printButton);
            newRow.appendChild(newCell);

            var brRow = document.createElement('tr');
            var brCell = document.createElement('td');
            brCell.colSpan = "3";
            brCell.innerHTML = '<br>';
            brRow.appendChild(brCell);

            rayaRow.parentNode.insertBefore(newRow, rayaRow);
            rayaRow.parentNode.insertBefore(brRow, rayaRow);
        } else {
            console.error("No se encontró la fila que contiene la imagen raya.gif.");
        }
    }

    // Utilizar MutationObserver para detectar cambios en el DOM
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                var rayaRow = document.querySelector('tr > td[colspan="3"] > img[src="../images/raya.gif"]').parentNode.parentNode;
                if (rayaRow) {
                    addPrintButton();
                    observer.disconnect(); // Dejar de observar una vez que se ha añadido el botón
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Añadir evento para detectar Ctrl+P
    window.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'p') {
            event.preventDefault();
            printIframeContent();
        }
    });
})();
