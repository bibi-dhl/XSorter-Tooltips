// ==UserScript==
// @name         XSorter | Comandos de Sobrantes Gestionados
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Añade comandos para obtener estadísticas de sobrantes gestionados.
// @autor        Ahmed Bibi
// @match        http://2.14.233.15:8088/XS/*
// @updateURL    file:///P:/XSORTER/02.%20ADMINISTRACION/TM/Scripts/prod/sobrantes_gestionados.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Verificar si las funciones del primer script están disponibles
    function areFunctionsAvailable() {
        return typeof getCookie === 'function';
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

    // Función para obtener cookies
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Funciones para obtener estadísticas de sobrantes gestionados
    window.sobrantesToday = function() {
        const userId = getUserId();
        if (userId) {
            const count = getSobrantesCount(userId);
            console.log(`Sobrantes gestionados hoy: ${count}`);
            return count;
        } else {
            console.error('User ID not found or not available.');
        }
    };

    window.sobrantesWeek = function() {
        const userId = getUserId();
        if (userId) {
            const count = getSobrantesCount(userId, 'week');
            console.log(`Sobrantes gestionados esta semana: ${count}`);
            return count;
        } else {
            console.error('User ID not found or not available.');
        }
    };

    window.sobrantesMonth = function() {
        const userId = getUserId();
        if (userId) {
            const count = getSobrantesCount(userId, 'month');
            console.log(`Sobrantes gestionados este mes: ${count}`);
            return count;
        } else {
            console.error('User ID not found or not available.');
        }
    };

    function getSobrantesCount(userId, period = 'day') {
        let count = 0;
        const now = new Date();
        const today = now.toDateString();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toDateString();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toDateString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toDateString();

        for (const cookie of document.cookie.split('; ')) {
            const [name, value] = cookie.split('=');
            if (name.startsWith(`enterCount_${userId}_`)) {
                const date = name.split('_').pop();
                if (period === 'day' && date === today) {
                    count += parseInt(value, 10);
                } else if (period === 'week' && date >= startOfWeek && date <= today) {
                    count += parseInt(value, 10);
                } else if (period === 'month' && date >= startOfMonth && date <= endOfMonth) {
                    count += parseInt(value, 10);
                }
            }
        }
        return count;
    }

    function getMostSobrantesDay(userId) {
        let maxCount = 0;
        let maxDay = 'N/A';
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toDateString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toDateString();

        for (const cookie of document.cookie.split('; ')) {
            const [name, value] = cookie.split('=');
            if (name.startsWith(`enterCount_${userId}_`)) {
                const date = name.split('_').pop();
                if (date >= startOfMonth && date <= endOfMonth) {
                    const count = parseInt(value, 10);
                    if (count > maxCount) {
                        maxCount = count;
                        maxDay = date;
                    }
                }
            }
        }
        return maxDay;
    }
})();
