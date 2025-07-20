// ==UserScript==
// @name			TransferLog balance
// @author			Neleus
// @namespace		Neleus
// @description	HWM TransferLog Balance
// @version			1.1
// @include			/^https?:\/\/(www|mirror|my)?\.?(heroeswm|lordswm)\.(ru|com)\/pl_transfers\.php.*/
// @grant			none
// @run-at			document-end
// @license			GNU GPLv3
// ==/UserScript==

(function () {
  "use strict";

  // Helper functions
  const qSelect = (selector, parent = document) =>
    parent.querySelector(selector);

  const parsePage = (text, regex) => {
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  };

  const testURL = (regex) => regex.test(window.location.href);

  // Функция форматирования строки
  const makeLine = (line, gold, color) =>
    `<span style='background:rgba(${
      color == "green" ? "100,255,100,.1" : "255,100,100,.1"
    })'>${line}&nbsp; <b style='color:${color}'>${gold}</b></span>`;

  // Основная функция парсера протокола передач
  const protocolParser = () => {
    const div = qSelect('[class="global_a_hover"]');
    if (!div) return;

    const DATA = document.body.innerHTML;
    const lines = parsePage(DATA, /(&nbsp;&nbsp;.+)<br>/g);

    let sum = 0,
      gold = 0,
      newline,
      com,
      html = "";

    for (let line of lines) {
      newline = line;
      // Обмен бриллиантов на золото:
      //  "2 бриллианта обменяно на 10000 золота"
      if (/обменян/.test(line)) {
        gold = +/на <b>(\d+)/.exec(line)[1];
        newline = makeLine(line, "+" + gold, "green");
        sum += gold;
      }

      // Передача золота игроку\клану:
      //  "Передано 100000 Золото для bratishkinoff, доп. комиссия 1000: В долг"
      //  "Передано 65000 золота на счет клана #9704"
      if (/nbsp;[\d- :]+ Передано \d+ (?:Золото|золота)/.test(line)) {
        com = /комиссия (\d+)/.exec(line);
        gold = -/(\d+) (?:Золото|золота)/.exec(line)[1] - (com ? com[1] : 0);
        newline = makeLine(line, gold, "red");
        sum += gold;
      }

      // Получение предмета\элемента за золото:
      //  "Получен предмет 'Амулет вора' [60/60] от Что_то_с_чем_то за 7 Золото"
      //  "Получен элемент 'цветок ветров' 1 шт. от naTcaHx за 2400 золота"
      if (/Получен .+?за \d+ (?:Золото|золота)/.test(line)) {
        gold = -/за (\d+)/.exec(line)[1];
        newline = makeLine(line, gold, "red");
        sum += gold;
      }

      // Передача предмета\элемента за золото:
      //  "Передан предмет 'Великий меч полководца' [81/89] c возвратом до 25-01-20 22:20 на 81 боев для Nexik за 1 Золото, комиссия 1"
      //  "Передан элемент 'абразив' 1 шт. для Algor за 950 золота, комиссия 10"
      // Продажа лота на рынке:
      //  "Продан предмет "Клевер фортуны" [57/68] за 63999 золота для Astronics - лот #101698940, комиссия: 640"
      if (
        /nbsp;[\d- :]+ (?:Передан .+?\d+ (?:Золото|золота)|Продан)/.test(line)
      ) {
        com = /комиссия:* (\d+)/.exec(line);
        gold = +/за (\d+)/.exec(line)[1] - (com ? com[1] : 0);
        newline = makeLine(line, "+" + gold, "green");
        sum += gold;
      }

      // Получение предмета и золота за ремонт:
      //  "Получен предмет 'Клинок феникса' [0/73] на ремонт от Крюгерс. Получено за ремонт: 9212 (101%)"
      if (/Получен .+?на ремонт/.test(line)) {
        const g = /ремонт: (\d+)/.exec(line)[1];
        const p = /(\d+)%/.exec(line)[1];
        gold = Math.ceil(g / p) * (p - 100); // вычисляем фактический доход кузнеца
        if (gold >= 0) {
          newline = makeLine(line, "+" + gold, "green");
        } else {
          newline = makeLine(line, gold, "red");
        }
        sum += gold;
      }

      // Передача арта кузнецу и плата за ремонт арта:
      //  "Передан предмет 'Меч холода' [0/53] на ремонт для Евфлантовичок. Оплачено за ремонт: 17600 (100%), доп. комиссия: 17"
      if (/Оплачено за/.test(line)) {
        gold = -/ремонт: (\d+)/.exec(line)[1] - /комиссия: (\d+)/.exec(line)[1];
        newline = makeLine(line, gold, "red");
        sum += gold;
      }

      // Аренда арта:
      //  "Арендован артефакт 'Кольцо солнца' [52/66] у "Склада" #38 (Клан #1519) на 5 боев до 2020.03.22 11:01. Стоимость: 1060, комиссия: 11"
      if (/Арендован/.test(line)) {
        gold =
          -/Стоимость: (\d+)/.exec(line)[1] - /комиссия: (\d+)/.exec(line)[1];
        newline = makeLine(line, gold, "red");
        sum += gold;
      }

      // Получение золота от игрока или Империи:
      //  "Получено 101000 Золото от bratishkinoff"
      //  "Получено 12755 золота от Империя: Победа в 277-м турнире на выживание среди 7 уровней, Маги! Первый результат. +10 очков ГО."
      // Взятие денег с клана\дома:
      //  "Взято 75000 золота со счета клана #2304: закупка элементов"
      //  "Взято 150000 золота со счета "Дома" #1448"
      // Заработок кузнеца с ремонта складского арта:
      //  "Взят в ремонт артефакт 'Кинжал пламени' [0/57] у "Склада" #2 (Клан #276) до 2020.03.07 19:47. Заработано: 208 золота"
      if (/Получено \d+ (?:Золото|золота)|Взято|Заработано/.test(line)) {
        gold = +/(\d+) (?:Золото|золота)/.exec(line)[1];
        newline = makeLine(line, "+" + gold, "green");
        sum += gold;
      }

      // Возвращение неиспользованного арта с возвратом денег:
      //  "Вернул 'Лук света' [28/74] на "Склад" #38 (Клан #1519). Неиспользовано боев: 1. Возврат золота: 236"
      if (/Неиспользовано/.test(line)) {
        gold = +/золота: (\d+)/.exec(line)[1];
        newline = makeLine(line, "+" + gold, "green");
        sum += gold;
      }

      // Штраф игрока:                     "Игрок оштрафован на 60000 золота. // от Kentas-"
      // Оплата комнаты:                   "Оплачено 700 золота (100/д) за аренду комнаты #1 до 12:38 02-04, дом #101 (владелец: Ка-51к)"
      // Покупка лота с рынка:             "Куплен "лунный камень" за 2530 золота у UR1Y - лот #101770461"
      // Внесение золота на счёт дома:     "Внесено 60000 золота на счет "Дома" #1448"
      if (
        /Игрок оштрафован|Оплачено \d+|nbsp;[\d- :]+ Куплен|Внесено/.test(line)
      ) {
        gold = -/(\d+) золота/.exec(line)[1];
        newline = makeLine(line, gold, "red");
        sum += gold;
      }

      html += newline + "<br>";
    }

    div.innerHTML = html;

    // Баланс золота
    div.insertAdjacentHTML(
      "beforeend",
      `<br><b style='padding:20'>Баланс золота: <span style='color:${
        sum < 0 ? "red" : "green"
      }'>${sum > 0 ? "+" : ""}${sum.toLocaleString("en-US")}</span></b>`
    );
  };

  // Проверяем, что мы на странице протокола передач
  if (testURL(/pl_transfers/)) {
    // Запускаем парсер после загрузки страницы
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", protocolParser);
    } else {
      protocolParser();
    }
  }
})();
