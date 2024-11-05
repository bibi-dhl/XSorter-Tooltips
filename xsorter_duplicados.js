// ==UserScript==
// @name         XSorter | Proveedores en lotes
// @namespace    http://tampermonkey.net/
// @version      3.7
// @description  Añade la tabla de Proveedores a lanzamiento de lotes
// @author       Ahmed Bibi | DSC
// @match        http://2.14.233.15:8088/XS/VGENLPR2
// @icon         https://www.google.com/s2/favicons?domain=example.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @downloadURL  https://raw.githubusercontent.com/bibi-dhl/XSorter-Tooltips/refs/heads/main/xsorter_duplicados.js
// @updateURL    https://raw.githubusercontent.com/bibi-dhl/XSorter-Tooltips/refs/heads/main/xsorter_duplicados.js
// ==/UserScript==

(function() {
    'use strict';

    // Cargar Bootstrap CSS y JS solo para los elementos creados por el script
    $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
    $('head').append('<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>');

    // Añadir la tipografía "Delivery"
    $('head').append(`
        <style>
            @font-face {
                font-family: 'Delivery';
                src: url('https://fonts.dpdhl-brands.com/046d15885a335026526f.woff2') format('woff2');
                font-weight: normal;
                font-style: normal;
            }
            #tablaDuplicados, #duplicadosModal * {
                font-family: 'Delivery', sans-serif;
            }
        </style>
    `);

    $(document).ready(function() {
        // Obtener el valor del usuario del input oculto
        const userId = $('input[name="userid"]').val();

        // Crear el botón 'Tabla Duplicados'
        const button = $('<button>', {
            id: 'tablaDuplicados',
            class: 'btn btn-danger',
            text: 'Tabla Duplicados',
            css: {
                margin: '20px auto',
                display: 'block',
                fontSize: '16px'
            }
        });

        // Crear el modal de Bootstrap
        const modalHTML = `
            <div class="modal fade" id="duplicadosModal" tabindex="-1" aria-labelledby="duplicadosModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="duplicadosModalLabel" style="font-size: 16px;">Tabla Duplicados</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <iframe src="http://2.14.233.15:8088/XS/VPROVE?userid=${userId}" style="width: 100%; height: 500px; border: none;"></iframe>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" data-bs-dismiss="modal" style="font-size: 16px;">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insertar el modal en el body
        $('body').append(modalHTML);

        // Añadir el evento de clic al botón para mostrar el modal
        button.on('click', function(event) {
            event.preventDefault();  // Prevenir comportamiento predeterminado
            const modal = new bootstrap.Modal(document.getElementById('duplicadosModal'));
            modal.show();
        });

        // Insertar el botón en la parte inferior de la página
        $('iframe[name="Detalle"]').after(button);
    });
})();
