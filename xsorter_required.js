// ==UserScript==
// @name         XSorter | Webhook de Teams y Gestión de Cookies
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Gestiona el envío de mensajes al webhook de Teams y la gestión de cookies para estadísticas de uso.
// @autor        Ahmed Bibi
// @match        http://2.14.233.15:8088/XS/*
// @downloadURL  https://raw.githubusercontent.com/bibi-dhl/XSorter-Tooltips/refs/heads/main/xsorter_required.js
// @updateURL    https://raw.githubusercontent.com/bibi-dhl/XSorter-Tooltips/refs/heads/main/xsorter_required.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Webhook de Teams
    const webhookUrl = 'https://dpdhl.webhook.office.com/webhookb2/82d25860-0d35-44c0-b6cb-4a0364fa09ae@cd99fef8-1cd3-4a2a-9bdf-15531181d65e/IncomingWebhook/be304151eb524eeda3cd57f97ad674fb/9340ebf3-3ee4-4b9b-bc9d-288afc44d276/V2IV_lJk4JCqplPero14ullLIsojPYsrfhEfs1_Mz4fMc1';

    // Enviar mensaje al webhook de Teams
    function sendTeamsMessage(message) {
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: message }),
            mode: 'no-cors' // Deshabilitar CORS para evitar problemas de política de CORS
        }).then(response => {
            if (!response.ok) {
                console.error('Error sending message to Teams:', response.statusText);
            }
        }).catch(error => {
            console.error('Error sending message to Teams:', error);
        });
    }

    // Obtener valor de una cookie
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // Establecer valor de una cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    // Actualizar estadísticas de uso en cookies
    function updateUsageStats(userId, forTest = false) {
        const usageCountKey = `usageCount_${userId}`;
        const usageDaysKey = `usageDays_${userId}`;
        const firstUseKey = `firstUse_${userId}`;
        const dailyReportKey = `dailyReport_${userId}`;
        const weeklyReportKey = `weeklyReport_${userId}`;
        const monthlyReportKey = `monthlyReport_${userId}`;

        let usageCount = parseInt(getCookie(usageCountKey)) || 0;
        let usageDays = getCookie(usageDaysKey);
        let firstUse = getCookie(firstUseKey);
        let dailyReport = getCookie(dailyReportKey);
        let weeklyReport = getCookie(weeklyReportKey);
        let monthlyReport = getCookie(monthlyReportKey);

        const now = new Date();
        const today = now.getDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString().split('T')[0]; // Lunes de la semana actual

        // Verificar si la cookie de usageDays está definida antes de parsear
        if (usageDays) {
            usageDays = JSON.parse(usageDays);
        } else {
            usageDays = {};
        }

        // Establecer la primera vez que el usuario utilizó la herramienta
        if (!firstUse) {
            firstUse = new Date().toLocaleString();
            setCookie(firstUseKey, firstUse, 365);
        }

        if (!forTest) {
            usageCount++;
            const currentHour = new Date().getHours();
            if (!usageDays[today]) {
                usageDays[today] = {};
            }
            if (typeof usageDays[today] !== 'object') {
                usageDays[today] = {};
            }
            usageDays[today][currentHour] = (usageDays[today][currentHour] || 0) + 1;

            setCookie(usageCountKey, usageCount, 30);
            setCookie(usageDaysKey, JSON.stringify(usageDays), 30);
        }

        // Encontrar la hora con más y menos usos del día anterior
        let maxHour = null;
        let maxCount = 0;
        let minHour = null;
        let minCount = Infinity;
        const yesterday = new Date();
        yesterday.setDate(today - 1);
        const yesterdayUsage = usageDays[yesterday.getDate()] || {};

        for (const [hour, count] of Object.entries(yesterdayUsage)) {
            if (count > maxCount) {
                maxHour = hour;
                maxCount = count;
            }
            if (count < minCount) {
                minHour = hour;
                minCount = count;
            }
        }

        // Reporte diario
        const dailyReportMessage = `📅 Daily Report for ${yesterday.getDate()}:
- ⏰ Hour with most usage: ${maxHour}:00 (${maxCount} times)
- ⏳ Hour with least usage: ${minHour}:00 (${minCount} times)`;

        // Reporte semanal
        let weeklyUsage = {};
        for (let day = today - 6; day <= today; day++) {
            const dayUsage = usageDays[day] || {};
            for (const [hour, count] of Object.entries(dayUsage)) {
                weeklyUsage[hour] = (weeklyUsage[hour] || 0) + count;
            }
        }
        const weeklyAverage = Object.values(weeklyUsage).reduce((a, b) => a + b, 0) / 7;

        // Encontrar la hora con más usos de la semana
        let weeklyMaxHour = null;
        let weeklyMaxCount = 0;
        for (const [hour, count] of Object.entries(weeklyUsage)) {
            if (count > weeklyMaxCount) {
                weeklyMaxHour = hour;
                weeklyMaxCount = count;
            }
        }

        const weeklyReportMessage = `📅 Weekly Report for Week Starting ${weekStart}:
- 📊 Average usage per day: ${weeklyAverage.toFixed(2)}
- ⏰ Hour with most usage: ${weeklyMaxHour}:00 (${weeklyMaxCount} times)`;

        // Reporte mensual
        let monthlyUsage = {};
        for (let day = 1; day <= today; day++) {
            const dayUsage = usageDays[day] || {};
            for (const [hour, count] of Object.entries(dayUsage)) {
                monthlyUsage[hour] = (monthlyUsage[hour] || 0) + count;
            }
        }
        const monthlyAverage = Object.values(monthlyUsage).reduce((a, b) => a + b, 0) / today;

        // Encontrar la hora con más usos del mes
        let monthlyMaxHour = null;
        let monthlyMaxCount = 0;
        for (const [hour, count] of Object.entries(monthlyUsage)) {
            if (count > monthlyMaxCount) {
                monthlyMaxHour = hour;
                monthlyMaxCount = count;
            }
        }

        const monthlyReportMessage = `📅 Monthly Report for ${now.toLocaleString('default', { month: 'long' })}:
- 📊 Average usage per day: ${monthlyAverage.toFixed(2)}
- ⏰ Hour with most usage: ${monthlyMaxHour}:00 (${monthlyMaxCount} times)`;

        // Determinar si se debe enviar reporte diario, semanal o mensual
        const isNewDay = !dailyReport || new Date(dailyReport).getDate() !== today;
        const isNewWeek = !weeklyReport || new Date(weeklyReport) < new Date(weekStart);
        const isNewMonth = !monthlyReport || new Date(monthlyReport).getMonth() !== currentMonth;

        if (!forTest || true) { // Forzar la creación de reportes en modo de prueba
            if (isNewDay || forTest) {
                setCookie(dailyReportKey, new Date().toISOString(), 1);
            }
            if (isNewWeek || forTest) {
                setCookie(weeklyReportKey, new Date().toISOString(), 7);
            }
            if (isNewMonth || forTest) {
                setCookie(monthlyReportKey, new Date().toISOString(), 30);
            }
        }

        return {
            usageCount,
            firstUse,
            dailyReportMessage: isNewDay || forTest ? dailyReportMessage : null,
            weeklyReportMessage: isNewWeek || forTest ? weeklyReportMessage : null,
            monthlyReportMessage: isNewMonth || forTest ? monthlyReportMessage : null
        };
    }

    // Crear comandos accesibles globalmente para ejecutar desde la consola
    window.reportDay = function() {
        const userId = document.querySelector('input[name="userid"]').value;
        const { dailyReportMessage } = updateUsageStats(userId, true);
        if (dailyReportMessage) {
            const message = `User ID: ${userId}\n\nDaily Report Test:\n\n${dailyReportMessage}`;
            console.log(`Sending message to Teams: ${message}`);
            sendTeamsMessage(message);
        } else {
            console.log('No daily report to send.');
        }
    };

    window.reportWeek = function() {
        const userId = document.querySelector('input[name="userid"]').value;
        const { weeklyReportMessage } = updateUsageStats(userId, true);
        if (weeklyReportMessage) {
            const message = `User ID: ${userId}\n\nWeekly Report Test:\n\n${weeklyReportMessage}`;
            console.log(`Sending message to Teams: ${message}`);
            sendTeamsMessage(message);
        } else {
            console.log('No weekly report to send.');
        }
    };

    window.reportMonth = function() {
        const userId = document.querySelector('input[name="userid"]').value;
        const { monthlyReportMessage } = updateUsageStats(userId, true);
        if (monthlyReportMessage) {
            const message = `User ID: ${userId}\n\nMonthly Report Test:\n\n${monthlyReportMessage}`;
            console.log(`Sending message to Teams: ${message}`);
            sendTeamsMessage(message);
        } else {
            console.log('No monthly report to send.');
        }
    };

    // Hacer funciones accesibles globalmente para el segundo script
    window.sendTeamsMessage = sendTeamsMessage;
    window.updateUsageStats = updateUsageStats;
})();
