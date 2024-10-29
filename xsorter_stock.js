// ==UserScript==
// @name         XSorter | Descarga de lotes de Stock
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Selecciona y descarga lotes de stock de manera individual o múltiple
// @author       Ahmed Bibi | DHL SC
// @match        http://2.14.233.15:8088/XS/VPANLOT?*
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Funciones para gestionar cookies
    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    let debugMode = getCookie('debugMode') === 'true';
    let testMode = getCookie('testMode') === 'true';

    window.debugSTOCK = function(state) {
        if (state === 1) {
            debugMode = true;
            setCookie('debugMode', true, 7);
            console.log('%c🔧 ¡Debug activado!', 'color: green;');
        } else if (state === 0) {
            debugMode = false;
            setCookie('debugMode', false, 7);
            console.log('%c🔧 ¡Debug desactivado!', 'color: red;');
        } else {
            console.error('%c⚠️ Uso incorrecto del comando. Use debugSTOCK(1) para activar y debugSTOCK(0) para desactivar.', 'color: orange;');
        }
    };

    window.lotesSTOCKTest = function(state) {
        if (state === 1) {
            testMode = true;
            setCookie('testMode', true, 7);
            console.log('%c🧪 ¡Modo de prueba activado!', 'color: green;');
        } else if (state === 0) {
            testMode = false;
            setCookie('testMode', false, 7);
            console.log('%c🧪 ¡Modo de prueba desactivado!', 'color: red;');
        } else {
            console.error('%c⚠️ Uso incorrecto del comando. Use lotesSTOCKTest(1) para activar y lotesSTOCKTest(0) para desactivar.', 'color: orange;');
        }
    };

    function debugLog(...messages) {
        if (debugMode) {
            console.log('%c[DEBUG]', 'color: blue;', ...messages);
        }
    }

    $(document).ready(function() {
        $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />');
        $('head').append('<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>');

        $('head').append(`
            <style>
                @font-face {
                    font-family: 'Delivery';
                    src: url('https://fonts.dpdhl-brands.com/046d15885a335026526f.woff2') format('woff2');
                    font-weight: normal;
                    font-style: normal;
                }
                body {
                    font-family: 'Delivery', Helvetica, sans-serif;
                    font-size: 12pt;
                }
                #buscarLotes {
                    font-size: 12pt;
                    display: block;
                    margin: 10px auto;
                }
                .select-all-container {
                    text-align: left;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                }
                .select-all-container input {
                    margin-right: 10px;
                    transform: scale(1);
                }
                .select-all-container label {
                    font-weight: normal;
                    color: black;
                    margin-left: 5px;
                }
                .list-group-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .form-check-input {
                    margin-right: 10px;
                    transform: scale(1);
                }
                .form-check-label {
                    font-size: 12pt;
                    display: flex;
                    align-items: center;
                    margin-left: 5px;
                }
                .modal-body {
                    text-align: left;
                    font-size: 12pt;
                }
                .modal-footer {
                    justify-content: space-between;
                }
                .btn-danger {
                    background-color: #dc3545;
                    border-color: #dc3545;
                }
                iframe {
                    border: 2px solid #000; /* Añadir borde al iframe */
                }
            </style>
        `);

        // Mostrar el estado de los comandos en la consola al cargar el script
        console.log(`%c🔧 Debug Mode: ${debugMode ? 'ACTIVADO' : 'DESACTIVADO'}`, `color: ${debugMode ? 'green' : 'red'};`);
        console.log(`%c🧪 Test Mode: ${testMode ? 'ACTIVADO' : 'DESACTIVADO'}`, `color: ${testMode ? 'green' : 'red'};`);

        insertButton($(document));

        function checkIframeReady() {
            debugLog('Verificando si el iframe está listo.');
            var iframe = $('iframe[name="LOTES"]');
            if (iframe.length && iframe.contents().find('body').length) {
                debugLog('Iframe encontrado y listo.');
                insertButton(iframe.contents());
            } else {
                debugLog('Iframe no encontrado o no listo, reintentando en 500ms.');
                setTimeout(checkIframeReady, 500);
            }
        }

        checkIframeReady();
    });

    function insertButton(context) {
        debugLog('Intentando insertar el botón en el contexto:', context);
        var buttonHTML = '<button id="buscarLotes" class="btn btn-danger">Descargar lotes de Stock</button>';
        context.find('body').append(buttonHTML);

        context.find('#buscarLotes').on('click', function() {
            debugLog('Botón "Descargar lotes de Stock" clicado.');
            buscarLotes(context);
        });

        debugLog('Botón insertado correctamente.');
    }

    function buscarLotes(context) {
        debugLog('Iniciando búsqueda de lotes de STOCK');
        var iframe = context.find('iframe[name="LOTES"]');
        if (iframe.length) {
            var iframeContent = iframe.contents();
            var lotes = iframeContent.find('td').filter(function() {
                var text = $(this).text().trim();
                debugLog('Evaluando texto del elemento:', text);
                return /^S\d{8}$/.test(text);
            });

            debugLog('Número de lotes encontrados que cumplen el criterio:', lotes.length);

            if (lotes.length > 0 || testMode) {
                var lotesConCajas = lotes.map(function() {
                    var loteText = $(this).text().trim();
                    var cajasPendientes = $(this).siblings().eq(8).text().trim();
                    return { lote: loteText, cajas: parseInt(cajasPendientes, 10) || 0 };
                }).get();

                if (testMode && lotesConCajas.length === 0) {
                    lotesConCajas = generarLotesDePrueba(5);
                }

                mostrarPopup(lotesConCajas);
            } else {
                alert('No se han encontrado lotes de stock activos.');
            }
        } else {
            debugLog('Iframe no encontrado.');
            alert('Iframe con la tabla de lotes no encontrado.');
        }
    }

    function generarLotesDePrueba(cantidad) {
        let lotesDePrueba = [];
        for (let i = 0; i < cantidad; i++) {
            let lote = `S${Math.floor(Math.random() * 90000000 + 10000000)}`;
            let cajas = Math.floor(Math.random() * 100);
            lotesDePrueba.push({ lote: lote, cajas: cajas });
        }
        return lotesDePrueba;
    }

    function mostrarPopup(lotesConCajas) {
        debugLog('Mostrando popup con los lotes encontrados.');

        const totalCajasPendientes = lotesConCajas.reduce((sum, lote) => sum + lote.cajas, 0);

        var popupHTML = `
            <div class="modal fade" id="lotesModal" tabindex="-1" aria-labelledby="lotesModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="lotesModalLabel">Descarga de lotes de Stock</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <div class="alert alert-info" role="alert">
                      Total: ${totalCajasPendientes} cajas pendientes.
                    </div>
                    <p>Seleccione uno o más lotes y descargue un documento Excel con el contenido de los mismos.</p>
                    <form id="lotesForm">
                      <div class="form-check select-all-container">
                        <input class="form-check-input" type="checkbox" id="selectAllLotes">
                        <label class="form-check-label" for="selectAllLotes">Seleccionar todos</label>
                      </div>
                      <div class="list-group lotes-container">
                        ${lotesConCajas.map((loteConCajas, index) => {
                            debugLog(`Añadiendo lote al formulario: ${loteConCajas.lote} (${loteConCajas.cajas} cajas pendientes)`);
                            return `
                                <div class="list-group-item">
                                  <div class="form-check">
                                    <input class="form-check-input lote-checkbox" type="checkbox" value="${loteConCajas.lote}" id="lote${index}">
                                    <label class="form-check-label" for="lote${index}">
                                      ${loteConCajas.lote}
                                    </label>
                                  </div>
                                  <span class="badge bg-warning text-dark rounded-pill">${loteConCajas.cajas} cajas pendientes</span>
                                </div>`;
                        }).join('')}
                      </div>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger" id="generarDocumento">Descargar</button>
                  </div>
                </div>
              </div>
            </div>
        `;

        $('body').append(popupHTML);
        $('#lotesModal').modal('show');

        $('#selectAllLotes').on('change', function() {
            var checked = $(this).is(':checked');
            $('.lote-checkbox').prop('checked', checked);
        });

        $('#generarDocumento').on('click', function() {
            debugLog('Botón "Descargar" clicado.');
            generarDocumento();
        });

        debugLog('Popup mostrado correctamente.');
    }

    async function generarDocumento() {
        debugLog('Iniciando generación de documentos.');
        var selectedLotes = $('#lotesForm input:checked').not('#selectAllLotes').map((index, checkbox) => $(checkbox).val()).get();

        debugLog('Lotes seleccionados:', selectedLotes);

        if (selectedLotes.length > 0) {
            let workbook = XLSX.utils.book_new();
            workbook.Props = {
                Title: "Lotes Stock",
                Author: "Ahmed Bibi | DHL SC",
                CreatedDate: new Date()
            };

            for (const lote of selectedLotes) {
                const documentUrl = `http://2.14.233.15:8088/XS/VLISPEN2?lprpar=${lote}`;
                debugLog('Fetching document:', documentUrl);
                try {
                    const response = await fetch(documentUrl);
                    if (!response.ok) {
                        debugLog('Error en la respuesta de fetch:', response.statusText);
                        continue;
                    }
                    const arrayBuffer = await response.arrayBuffer();
                    const decoder = new TextDecoder('utf-8');
                    let text = decoder.decode(arrayBuffer);

                    // Reemplazar imágenes con texto alternativo vacío
                    text = text.replace(/<img[^>]*>/g, '');

                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');

                    // Restaurar el estilo original de la tabla si fue afectado
                    const originalTables = doc.querySelectorAll('table');
                    originalTables.forEach(table => {
                        table.style = ''; // Eliminar estilos en línea
                        table.className = ''; // Eliminar clases
                    });

                    doc.querySelectorAll('table').forEach(table => {
                        const colIndex = Array.from(table.rows[0].cells).findIndex(cell => cell.textContent.trim() === 'Clasificadas');
                        if (colIndex > -1) {
                            table.querySelectorAll('tr').forEach(row => row.deleteCell(colIndex));
                        }
                    });

                    let tables = doc.querySelectorAll('table[width="730"], table[width="720"], table[width="710"]');
                    if (tables.length > 0) {
                        let combinedData = [];
                        tables.forEach((table) => {
                            debugLog('Tabla relevante encontrada:', table.outerHTML);
                            let tableData = XLSX.utils.sheet_to_json(XLSX.utils.table_to_sheet(table), { header: 1 });
                            combinedData = combinedData.concat(tableData);
                        });

                        let ws = XLSX.utils.aoa_to_sheet(combinedData);

                        ws['!cols'] = [
                            { wpx: 400 },
                            { wpx: 220 }
                        ];

                        estilizarHoja(ws);

                        XLSX.utils.book_append_sheet(workbook, ws, `Lote_${lote}`);
                    } else {
                        debugLog('No se encontraron tablas relevantes en el documento:', documentUrl);
                    }
                } catch (error) {
                    debugLog('Error al procesar el documento:', error);
                }
            }

            const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
            const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

            const fileName = `lotes_stock_${selectedLotes.join('_')}.xlsx`;

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            $('#lotesForm input:checked').prop('checked', false);
        } else {
            alert('No se seleccionaron lotes.');
        }

        $('#lotesModal').modal('hide');
        debugLog('Popup cerrado.');
    }

    function estilizarHoja(ws) {
        const headerCell = ws['A1'];
        if (headerCell) {
            headerCell.s = {
                font: {
                    bold: true,
                    sz: 14,
                    color: { rgb: "FFFFFF" }
                },
                fill: {
                    fgColor: { rgb: "007BFF" }
                },
                alignment: {
                    horizontal: 'center',
                    vertical: 'center'
                }
            };
        }

        for (let col = 0; col < ws['!cols'].length; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 5, c: col });
            if (ws[cellAddress]) {
                ws[cellAddress].s = {
                    font: {
                        name: 'Arial',
                        bold: true
                    }
                };
            }
        }

        const cellA5 = ws['A5'];
        if (cellA5) {
            cellA5.s = {
                font: {
                    name: 'Arial',
                    sz: 18
                }
            };
        }

        const cellB5 = ws['B5'];
        if (cellB5) {
            cellB5.s = {
                font: {
                    name: 'Arial',
                    sz: 10
                },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                },
                fill: {
                    fgColor: { rgb: "D3D3D3" }
                }
            };
        }

        for (const cell in ws) {
            if (ws.hasOwnProperty(cell) && cell[0] === 'A' && /^S\d{8}$/.test(ws[cell].v)) {
                ws[cell].s = {
                    font: {
                        bold: true,
                        sz: 12,
                        color: { rgb: "FF0000" }
                    },
                    alignment: {
                        horizontal: 'center',
                        vertical: 'center'
                    }
                };
            }
        }
    }

    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    }
})();
