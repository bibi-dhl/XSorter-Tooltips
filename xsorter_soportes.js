// ==UserScript==
// @name         XSorter | Impresión de soportes
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Impresión de soportes con mensajes personalizados y depuración
// @author       Ahmed Bibi
// @match        http://2.14.233.15:8088/XS/VPANEL*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Load Font Awesome 5
    function loadExternalLibraries() {
        // Load Font Awesome 5
        let fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }

    // Function to create and show the popup
    function showPopup() {
        // Create a container for the shadow DOM
        let shadowContainer = document.createElement('div');
        let shadow = shadowContainer.attachShadow({ mode: 'open' });

        // Add Bootstrap CSS inside the shadow DOM
        let bootstrapCSS = document.createElement('link');
        bootstrapCSS.rel = 'stylesheet';
        bootstrapCSS.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
        shadow.appendChild(bootstrapCSS);

        // Add custom font face for Delivery font
        let style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Delivery';
                src: url('https://fonts.dpdhl-brands.com/046d15885a335026526f.woff2') format('woff2');
                font-weight: normal;
                font-style: normal;
            }
            .delivery-font {
                font-family: 'Delivery', sans-serif;
            }
            .timestamp {
                color: #888;
                font-size: 0.9em;
                float: right; /* Align to the right */
            }
            .soporte-list-item:hover {
                cursor: pointer;
                background-color: #f0f0f0;
            }
            .copy-button, .view-button, .delete-button {
                background: none;
                border: none;
                color: #007bff;
                padding: 0;
                cursor: pointer;
                font-size: 1em;
                margin-left: 10px;
            }
            .copy-button:hover, .view-button:hover, .delete-button:hover {
                text-decoration: underline;
            }
        `;
        shadow.appendChild(style);

        // Create popup elements inside the shadow DOM
        let popupBackdrop = document.createElement('div');
        popupBackdrop.style.position = 'fixed';
        popupBackdrop.style.top = '0';
        popupBackdrop.style.left = '0';
        popupBackdrop.style.width = '100%';
        popupBackdrop.style.height = '100%';
        popupBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        popupBackdrop.style.zIndex = '999';

        let popup = document.createElement('div');
        popup.className = 'modal show delivery-font';
        popup.style.display = 'block';
        popup.style.position = 'fixed';
        popup.style.left = '50%';
        popup.style.top = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.zIndex = '1000';
        popup.style.width = '70%'; // Adjusted width to 70%
        popup.style.maxHeight = '90%';
        popup.style.overflowY = 'auto';

        let popupContent = document.createElement('div');
        popupContent.className = 'modal-content p-4';
        popupContent.style.borderRadius = '10px';

        let header = document.createElement('div');
        header.className = 'modal-header';

        let title = document.createElement('h5');
        title.className = 'modal-title';
        title.innerHTML = 'Impresión de soportes';
        header.appendChild(title);

        let closeButton = document.createElement('button');
        closeButton.className = 'close';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = function(event) {
            event.preventDefault();
            document.body.removeChild(shadowContainer);
            document.body.removeChild(popupBackdrop);
        };
        header.appendChild(closeButton);

        popupContent.appendChild(header);

        let body = document.createElement('div');
        body.className = 'modal-body row';

        let searchColumn = document.createElement('div');
        searchColumn.className = 'col-md-6';

        let printColumn = document.createElement('div');
        printColumn.className = 'col-md-6';

        let description = document.createElement('p');
        description.innerHTML = '&copy; 2024 - Ahmed Bibi';
        description.className = 'text-muted';
        searchColumn.appendChild(description);

        let inputSearchSoporte = document.createElement('input');
        inputSearchSoporte.type = 'text';
        inputSearchSoporte.placeholder = 'Buscar número de soporte';
        inputSearchSoporte.className = 'form-control mb-3';
        searchColumn.appendChild(inputSearchSoporte);

        let searchButton = document.createElement('button');
        searchButton.innerHTML = 'Buscar';
        searchButton.className = 'btn btn-info mb-3';
        searchButton.onclick = function(event) {
            event.preventDefault();
            let soporteToSearch = inputSearchSoporte.value;
            let searchUrl;

            if (soporteToSearch.startsWith('21')) {
                searchUrl = `http://2.14.233.15:8088/XS/VPALETETQ2?PALET=000000000${soporteToSearch}`;
            } else if (soporteToSearch.startsWith('9')) {
                searchUrl = `http://2.14.233.15:8088/XS/VPALETETQ2?PALET=00000000021${soporteToSearch}`;
            } else {
                showTemporaryMessage('error', 'Número de soporte no válido. Debe comenzar con 21 o 9.');
                return;
            }

            if (isDebugEnabled()) {
                console.debug(`Buscando Nº de soporte: ${soporteToSearch}`);
                console.debug(`URL de búsqueda: ${searchUrl}`);
            }

            fetch(searchUrl)
                .then(response => response.text())
                .then(data => {
                    if (isDebugEnabled()) {
                        console.debug('Respuesta recibida:', data);
                    }
                    let match = data.match(/0058\d+/);
                    if (match) {
                        let numeroEncontrado = match[0].substring(2); // Eliminar los dos primeros caracteres
                        let timestamp = new Date().toLocaleString();
                        if (isDebugEnabled()) {
                            console.debug(`Nº de soporte encontrado (modificado): ${numeroEncontrado}`);
                        }
                        if (storeSoporte(numeroEncontrado, soporteToSearch, timestamp, searchUrl)) {
                            showTemporaryMessage('success', `Nº de soporte encontrado: ${numeroEncontrado}`);
                        } else {
                            showTemporaryMessage('warning', `Nº de soporte duplicado: ${numeroEncontrado}`);
                        }
                        updateSoporteList(shadow);
                    } else {
                        if (isDebugEnabled()) {
                            console.debug('Nº de soporte no encontrado.');
                        }
                        showTemporaryMessage('alert', 'Nº de soporte no encontrado.');
                    }
                })
                .catch(error => {
                    if (isDebugEnabled()) {
                        console.error('Error al buscar el Nº de soporte:', error);
                    }
                    showTemporaryMessage('error', 'Error al buscar el Nº de soporte.');
                });
        };
        searchColumn.appendChild(searchButton);

        let soporteListContainer = document.createElement('div');
        soporteListContainer.style.maxHeight = '200px'; // Limit the height
        soporteListContainer.style.overflowY = 'auto'; // Add scroll

        let soporteListTitle = document.createElement('h4');
        soporteListTitle.innerHTML = 'Buscados recientemente';
        soporteListContainer.appendChild(soporteListTitle);

        let soporteList = document.createElement('ul');
        soporteList.id = 'soporte-list';
        soporteList.className = 'list-group';
        soporteListContainer.appendChild(soporteList);

        searchColumn.appendChild(soporteListContainer);

        let clearButton = document.createElement('button');
        clearButton.innerHTML = 'Eliminar todo el registro';
        clearButton.className = 'btn btn-danger mt-3';
        clearButton.onclick = function(event) {
            event.preventDefault();
            setCookie('soportes', '', { expires: -1 }); // Clear the cookie
            updateSoporteList(shadow);
            showTemporaryMessage('success', 'Registro de soportes eliminado.');
        };
        searchColumn.appendChild(clearButton);

        body.appendChild(searchColumn);

        let inputSoporte = document.createElement('input');
        inputSoporte.type = 'text';
        inputSoporte.placeholder = 'Introduzca el numero de soporte (2XXXXXXXX)';
        inputSoporte.className = 'form-control mb-3';
        printColumn.appendChild(inputSoporte);

        let inputPrinter = document.createElement('input');
        inputPrinter.type = 'text';
        inputPrinter.placeholder = 'Introduzca el nombre de la printer';
        inputPrinter.className = 'form-control mb-3';
        inputPrinter.style.textTransform = 'none'; // Ensure placeholder is not affected
        inputPrinter.oninput = function() {
            this.value = this.value.toUpperCase();
        };
        printColumn.appendChild(inputPrinter);

        let printButton = document.createElement('button');
        printButton.innerHTML = 'Imprimir';
        printButton.className = 'btn btn-danger';
        printButton.onclick = function(event) {
            event.preventDefault();
            let soporte = inputSoporte.value;
            let printer = inputPrinter.value;
            let enlace = `http://2.14.233.15:8088/XS/VPALETETQ2?cargado=I&palet=000000000${soporte}&impresora=${printer}&printer=${printer}`;

            if (isDebugEnabled()) {
                console.debug(`Imprimiendo soporte: ${soporte}`);
                console.debug(`Nombre de la impresora: ${printer}`);
                console.debug(`URL de impresión: ${enlace}`);
            }

            // Fetch the URL to simulate the printing process
            fetch(enlace)
                .then(response => {
                    if (response.ok) {
                        if (isDebugEnabled()) {
                            console.debug('Impresión realizada con éxito.');
                        }
                        showTemporaryMessage('success', 'Impresión realizada con éxito.');
                    } else {
                        throw new Error('Error al conectar con la impresora.');
                    }
                })
                .catch(error => {
                    if (isDebugEnabled()) {
                        console.error('No se pudo conectar con la impresora:', error);
                    }
                    showTemporaryMessage('error', 'No se pudo conectar con la impresora.');
                });
        };
        printColumn.appendChild(printButton);

        body.appendChild(printColumn);

        popupContent.appendChild(body);

        let footer = document.createElement('div');
        footer.className = 'modal-footer';

        let closeButtonFooter = document.createElement('button');
        closeButtonFooter.innerHTML = 'Cerrar';
        closeButtonFooter.className = 'btn btn-secondary';
        closeButtonFooter.onclick = function(event) {
            event.preventDefault();
            document.body.removeChild(shadowContainer);
            document.body.removeChild(popupBackdrop);
        };
        footer.appendChild(closeButtonFooter);

        popupContent.appendChild(footer);

        popup.appendChild(popupContent);
        shadow.appendChild(popup);

        document.body.appendChild(popupBackdrop);
        document.body.appendChild(shadowContainer);

        // Add keypress event listener for Enter key
        [inputSoporte, inputPrinter, inputSearchSoporte].forEach(input => {
            input.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (input === inputSearchSoporte) {
                        searchButton.click();
                    } else {
                        printButton.click();
                    }
                }
            });
        });

        // Update the soporte list on popup open
        updateSoporteList(shadow);
    }

    // Function to show temporary messages at the top of the page
    function showTemporaryMessage(type, message) {
        let messageContainer = document.createElement('div');
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '0';
        messageContainer.style.left = '50%';
        messageContainer.style.transform = 'translateX(-50%)';
        messageContainer.style.backgroundColor = type === 'success' ? 'green' : type === 'error' ? 'red' : 'orange';
        messageContainer.style.color = 'white';
        messageContainer.style.padding = '10px 20px';
        messageContainer.style.zIndex = '10000';
        messageContainer.style.borderRadius = '5px';
        messageContainer.style.fontFamily = 'Delivery, sans-serif';
        messageContainer.innerHTML = message;

        document.body.appendChild(messageContainer);

        setTimeout(() => {
            document.body.removeChild(messageContainer);
        }, 5000); // Show the message for 5 seconds
    }

    // Function to get a cookie by name
    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    // Function to set a cookie
    function setCookie(name, value, options = {}) {
        options = {
            path: '/',
            // Add other defaults here if necessary
            ...options
        };

        if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
        }

        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

        for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) {
                updatedCookie += "=" + optionValue;
            }
        }

        document.cookie = updatedCookie;
    }

    // Function to check if debug is enabled
    function isDebugEnabled() {
        return getCookie('debugSoporte') === '1';
    }

    // Function to enable or disable debug mode
    function debugSoporte(status) {
        if (status === 1) {
            setCookie('debugSoporte', '1', { expires: 365 });
            showTemporaryMessage('success', '🔧 Modo debug activado.');
        } else if (status === 0) {
            setCookie('debugSoporte', '0', { expires: 365 });
            showTemporaryMessage('error', '🔧 Modo debug desactivado.');
        } else {
            showTemporaryMessage('warning', '⚠️ Uso incorrecto de debugSoporte. Utilice debugSoporte(1) para activar o debugSoporte(0) para desactivar.');
        }
    }

    // Function to store soporte in a cookie
    function storeSoporte(numero, buscado, timestamp, enlace) {
        let soportes = JSON.parse(getCookie('soportes') || '[]');
        let soporteExists = soportes.some(soporte => soporte.numero === numero);

        if (!soporteExists) {
            soportes.push({ numero, buscado, timestamp, enlace });
            setCookie('soportes', JSON.stringify(soportes), { expires: 365 });
            return true; // New soporte stored
        } else {
            return false; // Soporte is a duplicate
        }
    }

    // Function to update the soporte list in the popup
    function updateSoporteList(shadow) {
        let soporteList = shadow.getElementById('soporte-list');
        if (soporteList) {
            soporteList.innerHTML = ''; // Clear existing list
            let soportes = JSON.parse(getCookie('soportes') || '[]');
            soportes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort from oldest to newest
            soportes.slice(0, 5).forEach((soporte, index) => { // Show only the first 5 soportes (oldest)
                let listItem = document.createElement('li');
                listItem.className = 'list-group-item soporte-list-item';
                listItem.innerHTML = `${soporte.numero} <span class="timestamp">(Buscado el: ${soporte.timestamp})</span> <button class="copy-button" data-soporte="${soporte.numero}">Copiar</button> <button class="view-button" data-enlace="${soporte.enlace}">Ver</button> <button class="delete-button" data-index="${index}">X</button>`;

                listItem.querySelector('.copy-button').onclick = function() {
                    navigator.clipboard.writeText(soporte.numero).then(() => {
                        showTemporaryMessage('success', `Nº de soporte ${soporte.numero} copiado al portapapeles.`);
                    }).catch(err => {
                        showTemporaryMessage('error', 'Error al copiar el Nº de soporte.');
                    });
                };

                listItem.querySelector('.view-button').onclick = function() {
                    // Abrir el enlace en una ventana emergente
                    window.open(soporte.enlace, 'popup', 'width=600,height=400');
                };

                listItem.querySelector('.delete-button').onclick = function() {
                    deleteSoporte(index);
                    updateSoporteList(shadow);
                };

                soporteList.appendChild(listItem);
            });
        }
    }

    // Function to delete a soporte from the cookie
    function deleteSoporte(index) {
        let soportes = JSON.parse(getCookie('soportes') || '[]');
        if (index > -1) {
            soportes.splice(index, 1);
            setCookie('soportes', JSON.stringify(soportes), { expires: 365 });
            showTemporaryMessage('success', 'Soporte eliminado.');
        }
    }

    // Check if the specific table cell exists and add the button
    function addButtonToTable() {
        let tableCell = document.querySelector('td[width="75%"] > table[align="left"][width="80%"] > tbody > tr > td.PanelNumVerde');
        if (tableCell) {
            let button = document.createElement('button');
            button.innerHTML = 'Soportes TOOL';
            button.className = 'btn btn-primary boton';
            button.style.paddingBottom = '5px'; // Add padding-bottom of 5px
            button.onclick = function(event) {
                event.preventDefault();
                showPopup();
            };
            tableCell.appendChild(button);
        }
    }

    // Run the function to add the button when the page loads
    window.addEventListener('load', function() {
        if (isDebugEnabled()) {
            console.debug('Página cargada. Iniciando script...');
        }
        loadExternalLibraries();
        addButtonToTable();
    });

    // Expose debugSoporte to the global scope
    window.debugSoporte = debugSoporte;
})();
