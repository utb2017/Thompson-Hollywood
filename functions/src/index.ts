import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
//cdimport * as playwright from "playwright";
import { VIPClass, CallableContext } from "./interface";
import * as uuid from "uuid";
import express = require('express');
//import cors = require('cors');
import fs = require("fs");
import bodyParser = require("body-parser");
import { IncomingMail } from "cloudmailin";
//import { resolveStyle } from "styletron-react";

//const node_xj = require("xls-to-json")
const excelToJson = require('convert-excel-to-json');

admin.initializeApp();


const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true })
const FieldValue = admin.firestore.FieldValue;
const increment = FieldValue.increment(1);
const decrement = FieldValue.increment(-1);

const monthNames: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const dayOfWeekNames: string[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const formatDate = (date: Date, patternStr?: any) => {
  if (!patternStr) {
    patternStr = "M/d/yyyy";
  }
  const day = date.getDate(),
    month = date.getMonth(),
    year = date.getFullYear(),
    hour = date.getHours(),
    minute = date.getMinutes(),
    second = date.getSeconds(),
    miliseconds = date.getMilliseconds(),
    h = hour % 12,
    hh = twoDigitPad(h),
    HH = twoDigitPad(hour),
    mm = twoDigitPad(minute),
    ss = twoDigitPad(second),
    aaa = hour < 12 ? "AM" : "PM",
    EEEE = dayOfWeekNames[date.getDay()],
    EEE = EEEE.substring(0, 3),
    dd = twoDigitPad(day),
    M = month + 1,
    MM = twoDigitPad(M),
    MMMM = monthNames[month],
    MMM = MMMM.substring(0, 3),
    yyyy = year + "",
    yy = yyyy.substring(2);
  // checks to see if month name will be used
  patternStr = patternStr
    .replace("hh", hh)
    .replace("h", h)
    .replace("HH", HH)
    .replace("H", hour)
    .replace("mm", mm)
    .replace("m", minute)
    .replace("ss", ss)
    .replace("s", second)
    .replace("S", miliseconds)
    .replace("dd", dd)
    .replace("d", day)

    .replace("EEEE", EEEE)
    .replace("EEE", EEE)
    .replace("yyyy", yyyy)
    .replace("yy", yy)
    .replace("aaa", aaa);

  if (patternStr.indexOf("MMM") > -1) {
    patternStr = patternStr.replace("MMMM", MMMM).replace("MMM", MMM);
  } else {
    patternStr = patternStr.replace("MM", MM).replace("M", M);
  }
  return patternStr;
};
const twoDigitPad = (num: number) => {
  return num < 10 ? "0" + num : num;
};
const replaceWhitespace = (str = "") => {
  let res = "";
  const { length } = str;
  for (let i = 0; i < length; i++) {
    const char = str[i];
    if (!(char === " " || char === "/")) {
      res += char;
    } else if (char === "/") {
      res += "%2F";
    } else {
      res += "%20";
    }
  }
  return res;
};
const unformatDate = (formattedDate: string | Date): Date => {
  const thisYear: number = new Date().getFullYear(),
    numericDate: number = new Date(formattedDate).setFullYear(thisYear),
    unformattedDate: Date = new Date(numericDate);
  return unformattedDate;
};
const dayOfYear = (date: any): number => {
  const fullYear: any = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - fullYear) / 1000 / 60 / 60 / 24);
};
const isValidString = (x: any): boolean => {
  return Boolean(x && typeof x === "string" && x.length > 0);
};
const isValidNumber = (x: any): boolean => {
  return Boolean(typeof x === "number" && x > -1);
};
const getIcon = (status:any) => {
  let x = (status === "GLOB")
    ?`<svg height='25px' id="Layer_3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.81 41.69"><defs><style>.cls-1-1{fill:#fff;}.cls-2-2{fill:#448cca;}</style></defs><g id="GLOB"><rect class="cls-2-2" x="0" y="0" width="85.81" height="41.69" rx="20.85" ry="20.85"/><g><path class="cls-1-1" d="M28.22,15.19c0,.25-.01,.46-.03,.63s-.05,.32-.09,.43-.08,.18-.14,.22-.12,.06-.2,.06c-.11,0-.29-.08-.53-.23s-.57-.32-.98-.5-.89-.34-1.45-.5-1.22-.23-1.96-.23c-.8,0-1.52,.14-2.16,.41s-1.19,.66-1.65,1.17-.81,1.11-1.05,1.82-.37,1.49-.37,2.34c0,.94,.12,1.77,.37,2.48s.6,1.31,1.05,1.8,.99,.85,1.62,1.09,1.33,.37,2.09,.37c.37,0,.74-.04,1.1-.13s.7-.21,1.02-.38v-3.81h-3.11c-.15,0-.27-.1-.36-.29s-.13-.51-.13-.97c0-.24,.01-.44,.03-.6s.05-.29,.1-.39,.09-.17,.15-.22,.13-.07,.2-.07h5.55c.14,0,.26,.02,.36,.07s.2,.12,.28,.21,.14,.21,.18,.34,.06,.28,.06,.45v6.54c0,.25-.04,.48-.13,.67s-.27,.34-.55,.45-.62,.22-1.02,.34-.83,.22-1.26,.3-.88,.15-1.32,.19-.89,.06-1.34,.06c-1.31,0-2.49-.19-3.52-.56s-1.92-.92-2.63-1.64-1.27-1.59-1.65-2.62-.57-2.19-.57-3.5,.2-2.55,.61-3.62,.98-1.98,1.73-2.73,1.64-1.32,2.7-1.72,2.23-.6,3.52-.6c.71,0,1.36,.05,1.94,.15s1.09,.22,1.53,.36,.8,.29,1.09,.45,.49,.3,.6,.42,.2,.29,.25,.5,.08,.54,.08,.96Z"/><path class="cls-1-1" d="M40.64,27.66c0,.25-.01,.47-.03,.64s-.05,.32-.1,.43-.1,.2-.16,.25-.14,.08-.22,.08h-7.53c-.28,0-.51-.08-.7-.25s-.29-.43-.29-.81V13.09c0-.08,.03-.16,.08-.23s.15-.12,.27-.17,.3-.08,.51-.1,.48-.04,.81-.04,.6,.01,.81,.04,.38,.06,.51,.1,.22,.1,.27,.17,.08,.14,.08,.23v13.22h5.17c.08,0,.16,.02,.22,.07s.12,.12,.16,.23,.07,.25,.1,.42,.03,.39,.03,.64Z"/><path class="cls-1-1" d="M56.93,20.66c0,1.36-.17,2.58-.51,3.66s-.84,1.99-1.51,2.74-1.5,1.32-2.48,1.71-2.13,.59-3.42,.59-2.39-.17-3.35-.5-1.75-.84-2.38-1.53-1.11-1.56-1.43-2.62-.48-2.31-.48-3.76c0-1.33,.17-2.52,.51-3.59s.84-1.97,1.51-2.71,1.5-1.32,2.48-1.71,2.13-.6,3.43-.6,2.34,.17,3.29,.5,1.75,.84,2.39,1.52,1.12,1.55,1.45,2.6,.49,2.28,.49,3.7Zm-3.5,.18c0-.86-.07-1.65-.2-2.35s-.37-1.31-.69-1.82-.76-.89-1.3-1.17-1.22-.41-2.03-.41-1.51,.15-2.06,.46-.99,.72-1.33,1.24-.58,1.12-.72,1.81-.21,1.42-.21,2.19c0,.9,.07,1.7,.2,2.42s.36,1.33,.69,1.83,.75,.9,1.29,1.16,1.22,.4,2.04,.4,1.51-.15,2.06-.46,.99-.72,1.33-1.24,.58-1.14,.72-1.83,.21-1.44,.21-2.23Z"/><path class="cls-1-1" d="M71.63,24.14c0,.58-.08,1.11-.24,1.59s-.38,.89-.67,1.26-.62,.68-1.02,.94-.83,.48-1.3,.65-.98,.29-1.52,.37-1.14,.12-1.8,.12h-4.37c-.28,0-.51-.08-.7-.25s-.29-.43-.29-.81V13.69c0-.37,.1-.64,.29-.81s.43-.25,.7-.25h4.13c1.01,0,1.86,.08,2.56,.25s1.29,.43,1.76,.77,.84,.78,1.1,1.3,.38,1.14,.38,1.85c0,.4-.05,.77-.15,1.12s-.25,.67-.44,.96-.43,.54-.72,.76-.61,.4-.97,.53c.47,.08,.9,.23,1.29,.44s.74,.48,1.03,.82,.52,.73,.69,1.17,.25,.95,.25,1.51Zm-4.32-6.92c0-.33-.05-.63-.15-.89s-.25-.48-.46-.65-.46-.31-.77-.4-.72-.14-1.24-.14h-1.69v4.27h1.87c.48,0,.87-.06,1.16-.17s.53-.27,.72-.47,.33-.43,.43-.7,.14-.55,.14-.84Zm.85,7.03c0-.38-.06-.72-.19-1.02s-.31-.55-.56-.76-.56-.36-.94-.47-.88-.17-1.49-.17h-1.98v4.67h2.41c.47,0,.86-.05,1.17-.15s.59-.24,.83-.43,.41-.43,.55-.71,.2-.61,.2-.97Z"/></g></g></svg>`
    : (status === "LGLO")
    ?`<svg height='25px' id="Layer_4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 85.81 41.69"><defs><style>.cls-1-2{fill:#fff;}.cls-2-3{fill:#448cca;}</style></defs><g id="LGLO"><rect class="cls-2-3" x="0" y="0" width="85.81" height="41.69" rx="20.85" ry="20.85"/><g><path class="cls-1-2" d="M25.75,27.66c0,.25-.01,.47-.03,.64-.02,.17-.05,.32-.1,.43-.04,.11-.09,.2-.16,.25s-.14,.08-.22,.08h-7.53c-.28,0-.51-.08-.7-.25s-.29-.43-.29-.81V13.09c0-.08,.03-.16,.08-.23,.05-.07,.15-.12,.27-.17s.3-.08,.51-.1,.48-.04,.81-.04,.6,.01,.81,.04c.21,.03,.38,.06,.51,.1s.22,.1,.27,.17c.05,.07,.08,.14,.08,.23v13.22h5.17c.08,0,.16,.02,.22,.07s.12,.12,.16,.23c.04,.11,.07,.25,.1,.42,.02,.17,.03,.39,.03,.64Z"/><path class="cls-1-2" d="M40.38,15.18c0,.25-.01,.46-.03,.63-.02,.18-.05,.32-.09,.43s-.08,.18-.14,.22c-.06,.04-.12,.06-.2,.06-.11,0-.29-.08-.53-.23-.25-.15-.57-.32-.98-.5s-.89-.34-1.45-.5c-.56-.15-1.22-.23-1.96-.23-.79,0-1.51,.14-2.16,.41-.64,.27-1.19,.66-1.65,1.17s-.81,1.11-1.05,1.82c-.25,.71-.37,1.49-.37,2.34,0,.94,.12,1.77,.38,2.48,.25,.72,.6,1.31,1.05,1.8,.45,.48,.99,.85,1.62,1.09,.63,.25,1.33,.37,2.09,.37,.37,0,.74-.04,1.1-.13,.36-.08,.7-.21,1.02-.38v-3.81h-3.11c-.15,0-.27-.1-.36-.29-.08-.19-.13-.51-.13-.97,0-.24,.01-.44,.03-.6,.02-.16,.05-.29,.09-.39,.04-.1,.09-.17,.15-.22,.06-.05,.13-.07,.2-.07h5.55c.14,0,.26,.02,.36,.07,.11,.05,.2,.12,.28,.21,.08,.09,.14,.21,.18,.34,.04,.13,.06,.28,.06,.45v6.54c0,.25-.04,.48-.13,.67s-.27,.34-.55,.45c-.28,.11-.62,.22-1.02,.34s-.83,.22-1.26,.3c-.44,.08-.88,.15-1.32,.19s-.89,.06-1.34,.06c-1.31,0-2.49-.19-3.52-.56-1.04-.38-1.92-.92-2.63-1.64-.72-.72-1.27-1.59-1.65-2.62s-.57-2.19-.57-3.5,.2-2.55,.61-3.62,.98-1.98,1.73-2.73c.75-.75,1.64-1.32,2.7-1.72s2.23-.6,3.52-.6c.71,0,1.36,.05,1.94,.15s1.09,.22,1.53,.36c.44,.14,.8,.29,1.08,.45,.29,.16,.49,.3,.6,.42s.2,.29,.25,.5,.08,.54,.08,.96Z"/><path class="cls-1-2" d="M52.8,27.66c0,.25-.01,.47-.03,.64-.02,.17-.05,.32-.1,.43-.04,.11-.09,.2-.16,.25s-.14,.08-.22,.08h-7.53c-.28,0-.51-.08-.7-.25s-.29-.43-.29-.81V13.09c0-.08,.03-.16,.08-.23,.05-.07,.15-.12,.27-.17s.3-.08,.51-.1,.48-.04,.81-.04,.6,.01,.81,.04c.21,.03,.38,.06,.51,.1s.22,.1,.27,.17c.05,.07,.08,.14,.08,.23v13.22h5.17c.08,0,.16,.02,.22,.07s.12,.12,.16,.23c.04,.11,.07,.25,.1,.42,.02,.17,.03,.39,.03,.64Z"/><path class="cls-1-2" d="M69.09,20.65c0,1.36-.17,2.58-.51,3.66-.34,1.07-.84,1.99-1.51,2.74-.67,.75-1.5,1.32-2.48,1.71-.99,.39-2.13,.59-3.42,.59s-2.39-.17-3.34-.5-1.75-.84-2.38-1.53-1.11-1.56-1.43-2.62-.48-2.31-.48-3.76c0-1.33,.17-2.52,.51-3.59,.34-1.06,.84-1.97,1.51-2.71,.67-.74,1.5-1.32,2.48-1.71,.99-.4,2.13-.6,3.43-.6s2.34,.17,3.29,.5,1.75,.84,2.39,1.52c.64,.69,1.12,1.55,1.45,2.6,.33,1.05,.49,2.28,.49,3.7Zm-3.5,.18c0-.86-.07-1.65-.2-2.35-.13-.71-.37-1.31-.69-1.82-.33-.5-.76-.89-1.3-1.17-.54-.27-1.22-.41-2.03-.41s-1.51,.15-2.06,.46c-.55,.31-.99,.72-1.33,1.24-.34,.52-.58,1.12-.72,1.81s-.21,1.42-.21,2.19c0,.9,.07,1.7,.2,2.42,.14,.72,.36,1.33,.69,1.83,.32,.51,.75,.9,1.29,1.16,.54,.27,1.22,.4,2.04,.4s1.51-.15,2.06-.46c.55-.3,1-.72,1.33-1.24,.34-.52,.58-1.14,.72-1.83s.21-1.44,.21-2.23Z"/></g></g></svg>`
    : (status === "MP")
    ?`<svg height='25px' id="Layer_5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.25 41.25"><defs><style>.cls-1-3{fill:#fff;}.cls-2-4{fill:#90cb80;}</style></defs><g id="MP"><circle class="cls-2-4" cx="20.62" cy="20.62" r="20.62"/><g><path class="cls-1-3" d="M22.77,28.34c0,.08-.02,.16-.07,.23s-.13,.12-.25,.17-.29,.08-.49,.1-.46,.04-.77,.04-.56-.01-.76-.04-.36-.06-.48-.1-.2-.1-.25-.17-.08-.14-.08-.23V14.98h-.03l-4.76,13.36c-.03,.11-.09,.2-.17,.27s-.18,.13-.31,.17-.3,.07-.5,.08-.45,.02-.74,.02-.53-.01-.74-.03-.37-.06-.5-.1-.23-.1-.31-.17-.13-.15-.15-.24L6.82,14.98h-.03v13.37c0,.08-.02,.16-.07,.23s-.13,.12-.26,.17-.29,.08-.49,.1-.46,.04-.77,.04-.56-.01-.76-.04-.37-.06-.49-.1-.21-.1-.25-.17-.07-.14-.07-.23V13.71c0-.43,.11-.76,.34-.99s.53-.34,.91-.34h2.18c.39,0,.72,.03,1,.1s.52,.17,.72,.32,.37,.34,.51,.58,.25,.54,.36,.9l3.55,9.79h.05l3.68-9.76c.11-.36,.23-.66,.36-.9s.28-.44,.46-.6,.38-.26,.62-.32,.51-.1,.83-.1h2.25c.23,0,.43,.03,.59,.09s.3,.15,.41,.26,.19,.25,.24,.42,.08,.35,.08,.56v14.64Z"/><path class="cls-1-3" d="M37.6,17.36c0,.92-.14,1.74-.43,2.45-.29,.71-.71,1.31-1.26,1.8-.55,.49-1.22,.86-2.02,1.11s-1.74,.38-2.83,.38h-1.37v5.24c0,.08-.03,.16-.08,.23s-.15,.12-.27,.17-.3,.08-.51,.1-.48,.04-.81,.04-.59-.01-.81-.04-.39-.06-.51-.1-.22-.1-.27-.17-.08-.14-.08-.23V13.57c0-.4,.1-.7,.31-.9s.48-.3,.82-.3h3.87c.39,0,.76,.01,1.11,.04s.77,.09,1.26,.19c.49,.1,.99,.28,1.49,.54,.5,.26,.93,.59,1.29,1s.63,.87,.81,1.41c.19,.54,.28,1.14,.28,1.81Zm-3.49,.24c0-.58-.1-1.05-.3-1.42s-.45-.65-.75-.83c-.3-.18-.61-.29-.93-.34s-.66-.07-1.01-.07h-1.42v5.57h1.5c.53,0,.98-.07,1.34-.22s.65-.34,.88-.6,.4-.57,.52-.93c.12-.36,.18-.75,.18-1.17Z"/></g></g></svg>`
    : (status === "V1")
    ?`<svg height='25px' id="Layer_6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.25 41.25"><defs><style>.cls-1-4{fill:#fff;}.cls-2-5{fill:#5ac6d0;}</style></defs><g id="V1"><circle class="cls-2-5" cx="20.62" cy="20.62" r="20.62"/><g><path class="cls-1-4" d="M16.75,28.27c-.04,.14-.1,.26-.17,.35s-.18,.16-.33,.2-.36,.08-.62,.09-.6,.02-1.03,.02c-.34,0-.63,0-.87,0s-.45-.01-.62-.03-.31-.04-.41-.08-.19-.08-.27-.13-.13-.11-.17-.18-.07-.16-.11-.27L7.28,13.67c-.1-.3-.16-.55-.18-.72s.02-.31,.13-.4,.29-.14,.54-.17,.61-.03,1.07-.03c.39,0,.69,0,.91,.03s.39,.05,.51,.09,.2,.11,.25,.19,.09,.19,.13,.32l4,12.67h.01l3.92-12.61c.03-.14,.08-.26,.13-.35s.14-.16,.26-.21,.3-.08,.53-.1,.54-.03,.94-.03,.69,.01,.91,.04,.36,.09,.44,.18,.11,.23,.08,.41-.1,.41-.2,.71l-4.9,14.57Z"/><path class="cls-1-4" d="M34.14,27.58c0,.24-.01,.44-.04,.6s-.06,.3-.11,.39-.1,.17-.16,.21-.13,.06-.2,.06h-9.06c-.07,0-.13-.02-.19-.06s-.11-.11-.16-.21-.08-.23-.11-.39-.04-.37-.04-.6,.01-.45,.03-.62,.06-.3,.1-.4,.1-.18,.16-.22,.13-.07,.2-.07h3.06V15.59l-2.64,1.46c-.19,.09-.35,.15-.48,.17s-.22,0-.29-.08-.12-.2-.15-.37-.04-.43-.04-.75c0-.2,0-.37,.01-.5s.03-.24,.06-.34,.08-.17,.14-.23,.14-.12,.24-.19l3.53-2.29s.1-.06,.16-.08,.15-.04,.25-.05,.23-.02,.4-.03,.38,0,.64,0c.32,0,.58,0,.78,.02s.35,.03,.45,.06,.17,.07,.2,.12,.05,.11,.05,.19v13.57h2.68c.08,0,.15,.02,.21,.07s.12,.12,.17,.22,.08,.23,.1,.4,.03,.37,.03,.62Z"/></g></g></svg>`
    : (status === "V2")
    ? `<svg height='25px' id="Layer_7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.25 41.25"><defs><style>.cls-1-5{fill:#fff;}.cls-2-6{fill:#90cb80;}</style></defs><g id="V2"><circle class="cls-2-6" cx="20.62" cy="20.62" r="20.62"/><g><path class="cls-1-5" d="M16.67,28.36c-.04,.14-.1,.26-.17,.35s-.18,.16-.33,.2-.36,.08-.62,.09-.6,.02-1.03,.02c-.34,0-.63,0-.87,0s-.45-.01-.62-.03-.31-.04-.41-.08-.19-.08-.27-.13-.13-.11-.17-.18-.07-.16-.11-.27L7.2,13.76c-.1-.3-.16-.55-.18-.72s.02-.31,.13-.4,.29-.14,.54-.17,.61-.03,1.07-.03c.39,0,.69,0,.91,.03s.39,.05,.51,.09,.2,.11,.25,.19,.09,.19,.13,.32l4,12.67h.01l3.92-12.61c.03-.14,.08-.26,.13-.35s.14-.16,.26-.21,.3-.08,.53-.1,.54-.03,.94-.03,.69,.01,.91,.04,.36,.09,.44,.18,.11,.23,.08,.41-.1,.41-.2,.71l-4.9,14.57Z"/><path class="cls-1-5" d="M34.22,27.59c0,.25-.01,.46-.03,.63s-.05,.32-.1,.43-.1,.19-.17,.23-.14,.07-.23,.07h-9.45c-.19,0-.35-.02-.48-.05s-.25-.1-.33-.2-.15-.24-.18-.43-.06-.43-.06-.72c0-.28,.01-.52,.04-.72s.07-.38,.14-.53,.15-.31,.26-.46,.24-.31,.41-.49l2.84-3.05c.57-.59,1.02-1.13,1.37-1.62s.62-.93,.81-1.33,.33-.77,.4-1.11,.11-.66,.11-.96c0-.28-.04-.54-.13-.79s-.22-.47-.39-.65-.39-.33-.65-.44-.57-.16-.93-.16c-.5,0-.94,.06-1.33,.19s-.72,.27-1.02,.43-.54,.3-.73,.43-.35,.2-.46,.2c-.08,0-.14-.03-.2-.08s-.1-.14-.13-.25-.06-.28-.08-.48-.03-.44-.03-.73c0-.19,0-.36,.02-.49s.03-.25,.06-.34,.06-.18,.1-.25,.12-.16,.22-.26,.3-.23,.58-.39,.63-.31,1.05-.46,.87-.27,1.37-.37,1.02-.15,1.56-.15c.85,0,1.6,.11,2.24,.32s1.17,.52,1.59,.9,.74,.84,.95,1.37,.31,1.1,.31,1.71c0,.53-.05,1.06-.15,1.57s-.31,1.07-.63,1.67-.77,1.26-1.36,1.98-1.36,1.56-2.32,2.52l-1.92,1.97h6.47c.08,0,.16,.03,.23,.08s.13,.13,.18,.23,.09,.25,.11,.42,.04,.38,.04,.62Z"/></g></g></svg>`
    : (status === "V3")
    ? `<svg height='25px' id="Layer_8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.25 41.25"><defs><style>.cls-1-6{fill:#fff;}.cls-2-7{fill:#ffdf7f;}</style></defs><g id="V3"><circle class="cls-2-7" cx="20.62" cy="20.62" r="20.62"/><g><path class="cls-1-6" d="M16.71,28.26c-.04,.14-.1,.26-.17,.35s-.18,.16-.33,.2-.36,.08-.62,.09-.6,.02-1.03,.02c-.34,0-.63,0-.87,0s-.45-.01-.62-.03-.31-.04-.41-.08-.19-.08-.27-.13-.13-.11-.17-.18-.07-.16-.11-.27L7.24,13.66c-.1-.3-.16-.55-.18-.72s.02-.31,.13-.4,.29-.14,.54-.17,.61-.03,1.07-.03c.39,0,.69,0,.91,.03s.39,.05,.51,.09,.2,.11,.25,.19,.09,.19,.13,.32l4,12.67h.01l3.92-12.61c.03-.14,.08-.26,.13-.35s.14-.16,.26-.21,.3-.08,.53-.1,.54-.03,.94-.03,.69,.01,.91,.04,.36,.09,.44,.18,.11,.23,.08,.41-.1,.41-.2,.71l-4.9,14.57Z"/><path class="cls-1-6" d="M34.18,24.03c0,.82-.16,1.55-.47,2.18s-.75,1.17-1.31,1.6-1.23,.76-2.01,.98-1.63,.34-2.55,.34c-.56,0-1.08-.04-1.57-.12s-.92-.18-1.3-.3-.69-.24-.93-.37-.41-.22-.48-.29-.13-.14-.17-.23-.07-.18-.1-.3-.05-.26-.06-.43-.02-.38-.02-.63c0-.41,.03-.69,.1-.84s.17-.23,.3-.23c.08,0,.23,.06,.44,.17s.47,.24,.79,.37,.7,.25,1.13,.37,.92,.17,1.47,.17c.47,0,.88-.06,1.23-.17s.66-.26,.91-.46,.44-.44,.56-.72,.18-.6,.18-.95c0-.38-.07-.72-.22-1.03s-.37-.56-.66-.78-.66-.38-1.1-.5-.97-.18-1.57-.18h-1.42c-.11,0-.2-.01-.28-.04s-.14-.09-.19-.18-.09-.22-.11-.39-.03-.38-.03-.64c0-.25,.01-.45,.03-.6s.06-.28,.1-.36,.11-.14,.18-.18,.16-.05,.26-.05h1.43c.49,0,.93-.06,1.31-.17s.7-.28,.96-.49,.46-.47,.59-.77,.2-.63,.2-1c0-.28-.05-.54-.14-.79s-.23-.47-.41-.65-.42-.33-.7-.43-.63-.16-1.02-.16c-.44,0-.85,.07-1.24,.2s-.74,.27-1.05,.43-.57,.3-.79,.44-.37,.2-.48,.2c-.07,0-.13-.01-.18-.04s-.09-.09-.13-.17-.06-.21-.08-.37-.03-.37-.03-.62c0-.21,0-.39,.01-.53s.03-.26,.05-.35,.06-.17,.1-.24,.1-.14,.18-.22,.26-.2,.52-.36,.59-.32,.99-.47,.86-.28,1.38-.39,1.09-.16,1.69-.16c.8,0,1.5,.09,2.11,.28s1.13,.46,1.55,.81,.74,.78,.95,1.29,.32,1.09,.32,1.73c0,.5-.06,.96-.19,1.4s-.31,.82-.56,1.16-.55,.63-.92,.86-.79,.41-1.28,.53v.04c.58,.07,1.09,.21,1.55,.44s.84,.51,1.16,.84,.56,.72,.73,1.15,.25,.89,.25,1.38Z"/></g></g></svg>`
    : (status === "V4")
    ? `<svg height='25px' id="Layer_9" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.25 41.25"><defs><style>.cls-1-7{fill:#666766;}.cls-2-8{fill:#fff;font-family:Calibri-Bold, Calibri;font-size:26px;}</style></defs><g id="V4"><circle class="cls-1-7" cx="20.62" cy="20.62" r="20.62"/><text id="V4-2" class="cls-2-8" transform="translate(6.45 28.84)"><tspan x="0" y="0">V4</tspan></text></g></svg>`
    : (status === "V5")
    ? `<svg height='25px' id="Layer_10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.25 41.25"><defs><style>.cls-1-8{fill:#fff;}.cls-2-9{fill:#666766;}</style></defs><g id="V5"><circle class="cls-2-9" cx="20.62" cy="20.62" r="20.62"/><g><path class="cls-1-8" d="M16.75,28.15c-.04,.14-.1,.26-.17,.35s-.18,.16-.33,.2-.36,.08-.62,.09-.6,.02-1.03,.02c-.34,0-.63,0-.87,0s-.45-.01-.62-.03-.31-.04-.41-.08-.19-.08-.27-.13-.13-.11-.17-.18-.07-.16-.11-.27L7.28,13.55c-.1-.3-.16-.55-.18-.72s.02-.31,.13-.4,.29-.14,.54-.17,.61-.03,1.07-.03c.39,0,.69,0,.91,.03s.39,.05,.51,.09,.2,.11,.25,.19,.09,.19,.13,.32l4,12.67h.01l3.92-12.61c.03-.14,.08-.26,.13-.35s.14-.16,.26-.21,.3-.08,.53-.1,.54-.03,.94-.03,.69,.01,.91,.04,.36,.09,.44,.18,.11,.23,.08,.41-.1,.41-.2,.71l-4.9,14.57Z"/><path class="cls-1-8" d="M34.14,23.4c0,.89-.15,1.68-.46,2.38s-.74,1.29-1.31,1.76-1.24,.84-2.03,1.1-1.67,.38-2.63,.38c-.51,0-.99-.03-1.45-.1s-.87-.14-1.23-.24-.66-.19-.9-.29-.39-.18-.46-.24-.12-.13-.16-.21-.06-.17-.08-.27-.04-.24-.04-.4-.01-.35-.01-.57c0-.24,0-.44,.03-.6s.04-.3,.08-.4,.08-.17,.13-.22,.11-.06,.18-.06c.08,0,.21,.05,.39,.15s.4,.21,.69,.32,.63,.23,1.03,.32,.89,.15,1.46,.15c.49,0,.94-.05,1.34-.15s.74-.26,1.02-.49,.5-.51,.65-.84,.23-.74,.23-1.22c0-.41-.06-.77-.19-1.09s-.33-.59-.6-.81-.62-.39-1.05-.5-.96-.17-1.57-.17c-.49,0-.94,.03-1.34,.08s-.78,.08-1.14,.08c-.25,0-.42-.06-.53-.18s-.16-.35-.16-.68v-7.13c0-.34,.07-.58,.2-.73s.34-.22,.63-.22h7.78c.08,0,.15,.03,.22,.08s.12,.13,.17,.24,.08,.26,.1,.44,.03,.4,.03,.65c0,.51-.04,.88-.13,1.1s-.22,.34-.39,.34h-5.84v3.52c.3-.03,.59-.06,.88-.06s.6-.01,.92-.01c.89,0,1.68,.1,2.37,.31s1.27,.51,1.74,.91,.83,.9,1.07,1.5,.37,1.29,.37,2.08Z"/></g></g></svg>`
    : (status === "V6")
    ? `<svg height='25px' id="Layer_11" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.25 41.25"><defs><style>.cls-1-9{fill:#fff;}.cls-2-10{fill:#588dca;}</style></defs><g id="V6"><circle class="cls-2-10" cx="20.62" cy="20.62" r="20.62"/><g><path class="cls-1-9" d="M16.54,28.26c-.04,.14-.1,.26-.17,.35s-.18,.16-.33,.2-.36,.08-.62,.09-.6,.02-1.03,.02c-.34,0-.63,0-.87,0s-.45-.01-.62-.03-.31-.04-.41-.08-.19-.08-.27-.13-.13-.11-.17-.18-.07-.16-.11-.27L7.07,13.66c-.1-.3-.16-.55-.18-.72s.02-.31,.13-.4,.29-.14,.54-.17,.61-.03,1.07-.03c.39,0,.69,0,.91,.03s.39,.05,.51,.09,.2,.11,.25,.19,.09,.19,.13,.32l4,12.67h.01l3.92-12.61c.03-.14,.08-.26,.13-.35s.14-.16,.26-.21,.3-.08,.53-.1,.54-.03,.94-.03,.69,.01,.91,.04,.36,.09,.44,.18,.11,.23,.08,.41-.1,.41-.2,.71l-4.9,14.57Z"/><path class="cls-1-9" d="M34.34,23.36c0,.83-.13,1.6-.38,2.3s-.63,1.32-1.12,1.83-1.1,.91-1.82,1.21-1.55,.44-2.49,.44c-.76,0-1.43-.09-1.99-.26s-1.06-.42-1.47-.75-.75-.72-1.02-1.19-.47-.99-.63-1.57-.26-1.22-.32-1.9-.09-1.41-.09-2.18c0-.64,.03-1.32,.1-2.02s.19-1.39,.37-2.07,.44-1.32,.77-1.94,.76-1.15,1.28-1.61,1.15-.83,1.89-1.1,1.62-.41,2.63-.41c.32,0,.65,.02,.97,.06s.63,.09,.91,.15,.52,.13,.71,.2,.32,.14,.39,.2,.11,.12,.15,.18,.06,.14,.08,.22,.04,.18,.04,.3,.01,.26,.01,.43c0,.26,0,.48-.02,.65s-.04,.31-.07,.41-.08,.17-.14,.21-.13,.06-.22,.06c-.1,0-.23-.03-.39-.08s-.36-.12-.58-.18-.5-.13-.81-.18-.67-.08-1.07-.08c-.69,0-1.27,.13-1.74,.38s-.86,.6-1.16,1.03-.51,.94-.65,1.52-.21,1.19-.22,1.83c.19-.12,.4-.24,.64-.36s.5-.22,.79-.3,.59-.15,.92-.21,.68-.08,1.05-.08c.83,0,1.54,.11,2.13,.34s1.08,.55,1.45,.98,.65,.94,.83,1.54,.27,1.27,.27,2.01Zm-3.28,.32c0-.43-.04-.81-.11-1.14s-.2-.6-.37-.83-.39-.39-.67-.51-.62-.17-1.02-.17c-.24,0-.47,.02-.7,.06s-.45,.1-.67,.18-.43,.17-.63,.27-.39,.22-.57,.34c0,.91,.05,1.66,.15,2.27s.25,1.09,.45,1.44,.45,.61,.75,.76,.65,.22,1.05,.22,.73-.07,1.02-.22,.54-.35,.73-.61,.34-.57,.44-.92,.15-.73,.15-1.15Z"/></g></g></svg>`
    : (status === "V7")
    ? `<svg height='25px' id="Layer_12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.25 41.25"><defs><style>.cls-1-10{fill:#fff;}.cls-2-11{fill:#666766;}</style></defs><g id="V7"><circle class="cls-2-11" cx="20.62" cy="20.62" r="20.62"/><g><path class="cls-1-10" d="M16.67,28.26c-.04,.14-.1,.26-.17,.35-.07,.09-.18,.16-.33,.2s-.36,.08-.62,.09c-.26,.01-.6,.02-1.03,.02-.34,0-.63,0-.87,0s-.45-.01-.62-.03c-.17-.02-.31-.04-.41-.08-.11-.03-.2-.08-.27-.13-.07-.05-.13-.11-.17-.18s-.07-.16-.11-.27L7.2,13.66c-.1-.3-.16-.55-.18-.72-.02-.18,.02-.31,.13-.4,.11-.09,.29-.14,.54-.17s.61-.03,1.07-.03c.39,0,.69,0,.91,.03,.22,.02,.39,.05,.51,.09,.12,.04,.2,.11,.25,.19,.05,.08,.09,.19,.13,.32l4,12.67h.01l3.92-12.61c.03-.14,.08-.26,.13-.35s.14-.16,.26-.21c.12-.05,.3-.08,.53-.1s.54-.03,.94-.03,.69,.01,.91,.04,.36,.09,.44,.18c.08,.1,.11,.23,.08,.41-.03,.18-.1,.41-.2,.71l-4.9,14.57Z"/><path class="cls-1-10" d="M34.21,13.82c0,.25,0,.46-.03,.64-.02,.18-.04,.35-.07,.51-.03,.16-.07,.3-.12,.44s-.11,.29-.18,.45l-5.41,12.53c-.05,.11-.12,.2-.2,.27-.08,.07-.19,.12-.34,.16-.14,.04-.33,.06-.55,.08-.22,.01-.5,.02-.83,.02-.45,0-.8-.01-1.07-.04-.26-.03-.46-.08-.58-.14-.12-.06-.19-.14-.2-.24,0-.1,.02-.22,.09-.36l5.81-12.82h-6.91c-.18,0-.31-.12-.4-.35s-.13-.6-.13-1.11c0-.25,.01-.47,.04-.65s.06-.33,.11-.45c.05-.12,.1-.2,.17-.25s.14-.08,.22-.08h9.76c.15,0,.28,.01,.38,.04s.18,.1,.24,.2c.06,.1,.1,.25,.13,.43,.03,.19,.04,.43,.04,.74Z"/></g></g></svg>`
    : (status === "V8")
    ? `<svg height='25px' id="Layer_13" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 41.25 41.25"><defs><style>.cls-1-11{fill:#fff;}</style></defs><g id="V8"><circle cx="20.62" cy="20.62" r="20.62"/><g><path class="cls-1-11" d="M16.54,28.26c-.04,.14-.1,.26-.17,.35s-.18,.16-.33,.2-.36,.08-.62,.09-.6,.02-1.03,.02c-.34,0-.63,0-.87,0s-.45-.01-.62-.03-.31-.04-.41-.08-.19-.08-.27-.13-.13-.11-.17-.18-.07-.16-.11-.27L7.07,13.66c-.1-.3-.16-.55-.18-.72s.02-.31,.13-.4,.29-.14,.54-.17,.61-.03,1.07-.03c.39,0,.69,0,.91,.03s.39,.05,.51,.09,.2,.11,.25,.19,.09,.19,.13,.32l4,12.67h.01l3.92-12.61c.03-.14,.08-.26,.13-.35s.14-.16,.26-.21,.3-.08,.53-.1,.54-.03,.94-.03,.69,.01,.91,.04,.36,.09,.44,.18,.11,.23,.08,.41-.1,.41-.2,.71l-4.9,14.57Z"/><path class="cls-1-11" d="M34.34,24.44c0,.74-.13,1.41-.39,1.99s-.64,1.08-1.14,1.48-1.13,.71-1.87,.91-1.6,.31-2.58,.31-1.75-.09-2.45-.28-1.29-.46-1.76-.82-.83-.8-1.07-1.33-.36-1.14-.36-1.82c0-.47,.07-.9,.21-1.31s.35-.79,.62-1.14,.62-.68,1.03-.99,.88-.6,1.42-.88c-.43-.24-.82-.49-1.17-.77s-.64-.58-.89-.9-.43-.68-.56-1.07-.19-.81-.19-1.27c0-.66,.12-1.26,.35-1.8s.58-1,1.04-1.4,1.04-.7,1.73-.91,1.5-.32,2.41-.32,1.68,.1,2.33,.29,1.18,.47,1.59,.83,.72,.78,.92,1.28,.3,1.04,.3,1.64c0,.4-.07,.79-.2,1.16s-.32,.73-.55,1.07-.53,.66-.88,.96-.74,.57-1.18,.82c.52,.27,.98,.56,1.38,.86s.75,.63,1.03,.98,.49,.73,.64,1.12,.22,.83,.22,1.29Zm-3.3,.23c0-.31-.05-.6-.16-.86s-.27-.5-.5-.73-.51-.45-.84-.66-.73-.43-1.18-.65c-.39,.21-.73,.42-1.03,.63s-.54,.43-.74,.67-.34,.48-.44,.74-.15,.54-.15,.83c0,.66,.21,1.16,.64,1.51s1.06,.52,1.91,.52,1.45-.18,1.86-.53,.62-.85,.62-1.47Zm-.38-8.2c0-.3-.04-.56-.13-.8s-.22-.44-.4-.6-.41-.29-.67-.37-.58-.13-.95-.13c-.71,0-1.24,.16-1.59,.49s-.52,.78-.52,1.35c0,.27,.04,.52,.13,.75s.23,.44,.41,.65,.43,.4,.72,.6,.65,.4,1.05,.62c.62-.36,1.09-.75,1.43-1.17s.5-.88,.5-1.38Z"/></g></g></svg>`
    : status  
    return x
}
//firebase deploy --only functions:getExpedia
// exports.getExpedia = functions.https.onCall(() => {
//   const vgmUrl = "https://www.vgmusic.com/music/console/nintendo/nes";
//   async () => {
//     const browser = await playwright.chromium.launch();
//     const page = await browser.newPage();
//     await page.goto(vgmUrl);
//     const links = await page.$$eval("a", (elements) =>
//       elements
//         .filter((element: any) => {
//           const parensRegex = /^((?!\().)*$/;
//           return (
//             element.href.includes(".mid") &&
//             parensRegex.test(element.textContent)
//           );
//         })
//         .map((element) => element.href)
//     );
//     links.forEach((link) => console.log(link));
//     await browser.close();
//   };
// });
const app = express();
app.use(bodyParser.json());
app.post('/vips', (req:any, res:any) => {
  console.log("Received POST request!")
  console.log(req.body);
  res.end("Received POST request!");  
});
app.post('/reports', async (req:any, res:any) => {
  console.log("Received POST request!")
  console.log(req.body);
  res.end("Received POST request!");  
  console.log(req.body);

  const mail = <IncomingMail>req.body;
  const attachment = mail.attachments[0];


  if(attachment.content_type === `application/pdf`){

    const splitURL = `${attachment.url}`.split("/");

    const property =
    mail.headers.from === "NA.CustomerService@Hyatt.com"
      ? "LAXTE"
      : mail.headers.from ===
          "Thompson Hollywood <infohollywood@thompsonhotels.com>" ||
        mail.headers.from === "infohollywood@thompsonhotels.com"
      ? "LAXTH"
      : "TEST",
  fileType = attachment.content_type,
  fileName = attachment.file_name,
  fileURL = `${splitURL[4]}/${splitURL[5]}`,
  emailSubject = mail.headers.subject,
  emailFrom = mail.headers.from,
  fileSize = attachment.size;
let propertyDate: string | null = null;

    

    console.log(fileURL)
    console.log(property);
    console.log(propertyDate);
    console.log(fileType);
    console.log(fileName);
    console.log(fileURL);
    console.log(emailSubject);
    console.log(emailFrom);
    console.log(fileSize);

    const db = admin.firestore();
    const vipRef = db.collection(`PROPERTY`).doc("LAXTE")
    const doc = await vipRef.get();
    if (!doc.exists) {
      console.log('No such document!');
    } else {
      console.log('Document data:', doc.data());
      propertyDate = doc.data()?.date as string
    }


    const sortedURL = await new Promise<{ url: any; success: boolean; error: any }>(
      async (resolve, reject) => {
        const accessToken = uuid.v4();
        const bucket = admin.storage().bucket();


        await bucket
          .file(`${fileURL||``}`).download()
          .then(async (data: any) => {
            const file = data[0];
            console.log('downloaded', file);
            console.log("downloaded");

            const tmpSave = `/tmp/${emailSubject}-${accessToken}.pdf`
            fs.appendFile(
              tmpSave,
              file,
              function (err: any) {
                if (err) throw reject({ url: null, success: false, error: err });
                console.log("Saved! PDF");
              }
            );

            const options = {
              destination: `${property}/reports/${propertyDate || ``}/${emailSubject} ${propertyDate}.pdf`,
              public: true,
              metadata: {
                contentType: "application/pdf",
                metadata: {
                  firebaseStorageDownloadTokens: accessToken,
                },
              },
            };


            await bucket
              .upload(tmpSave, options)
              .then(async (data: any) => {
                //const file = data[0];
                //console.log('upload', file);
                console.log("uploaded");
                //resolve({success: true})
                //let file_name = `detailedVIPs/VIP's Detailed - ${accessToken}.pdf`;
                // const file = bucket.file(file_name);
                // const url = await file.getSignedUrl({
                //   version: "v4",
                //   action: "read",
                //   expires: Date.now() + 24 * 60 * 60 * 1000,
                // });
                const url = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/${replaceWhitespace(
                  options.destination
                )}?alt=media&token=${accessToken}`;

                db.collection(`${property}_Reports_${propertyDate}`).add({fileName:`${emailSubject} ${propertyDate}.pdf`, url, fileType, fileSize, property})

                //         return { url };
                return resolve({ url, success: true, error: null });
              })
              .catch((err: any) => {
                console.log("Error uploading to storage", err);
                // reject(err);
                // throw new functions.https.HttpsError(
                //   "failed-precondition",
                //   `Error uploading to storage: ${err}`
                // );
                throw reject({ url: null, success: false, error: err })
              });

          })
          .catch((err: any) => {
            console.log("Error uploading to storage", err);
            throw reject({ url: null, success: false, error: err })
            // reject(err);
            // throw new functions.https.HttpsError(
            //   "failed-precondition",
            //   `Error uploading to storage: ${err}`
            // );
          });
        
    })







    if(propertyDate){
      const { url, error } = sortedURL
      if(url){
        //save this to a new firebase
        console.log(url)
       // db.collection(`${property}_Reports_${propertyDate}`).add({fileName:`${emailSubject} ${propertyDate}.pdf`, url, fileType, fileSize, property})
        // db.collection(`${property}_Reports`).doc(propertyDate).update({
        //   reports: FieldValue.arrayUnion(`${emailSubject} ${propertyDate}.pdf`)
        // })
        //return ({ url, success: true, error: null })
      }else{
        console.log('no new URL')
        console.log(error)
        res.status(201).json(mail);
      }

    }else{
      res.status(201).json(mail);
    }


  }


  


});
app.post('/forecast', (req:any, res:any) => {
  console.log("Received POST request!")
  console.log(req.body);
  res.end("Received POST request!");  
  /// i want to arrange the reports in a folder
  /// email adress defines property
  /// update the dowloaded files
  /// make record in datatabase
});



//https://us-central1-thompson-hollywood.cloudfunctions.net/incoming
// Expose Express API as a single Cloud Function:
//firebase deploy --only functions:incoming
exports.incoming = functions.https.onRequest(app);

//firebase deploy --only functions:exportAdobeDetailedVip
exports.exportAdobeDetailedVip = functions.https.onCall(async () => {
  const _url = await new Promise<{ url: any; success: boolean; error: any }>(
    async (resolve, reject) => {
      const accessToken = uuid.v4();
      const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
      /**
       * Get VIP Arrivals.
       */
      const db = admin.firestore();
      const vipRef = db
        .collection("ArrivalVIPs")
        .where("reservationStatus", "in", ["DUEIN", "CHECKEDIN", "DUEOUT"]);
      const vipSnapshot = await vipRef.get();
      const vipData: VIPClass[] = [],
        vipArr: VIPClass[] = [],
        vipInh: VIPClass[] = [];
      if (!vipSnapshot.empty) {
        vipSnapshot.forEach((doc) => {
          const docData: VIPClass = doc.data();

          vipData.push(docData);

          if (docData.reservationStatus === "DUEIN") {
            vipArr.push(docData);
          }
          if (
            docData.reservationStatus === "CHECKEDIN" ||
            docData.reservationStatus === "DUEOUT"
          ) {
            vipInh.push(docData);
          }
        });
      }

      /**
       * This sample illustrates how to create a PDF file from a HTML file with inline CSS.
       * <p>
       * Refer to README.md for instructions on how to run the samples.
       */

      /**
       * Sets any custom options for the operation.
       *
       * @param htmlToPDFOperation operation instance for which the options are provided.
       */
      const setCustomOptions = (htmlToPDFOperation: any) => {
        // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
        const pageLayout =
          new PDFServicesSdk.CreatePDF.options.html.PageLayout();
        pageLayout.setPageSize(20, 25);

        // Set the desired HTML-to-PDF conversion options.
        const htmlToPdfOptions =
          new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
            .includesHeaderFooter(true)
            .withPageLayout(pageLayout)
            .build();
        htmlToPDFOperation.setOptions(htmlToPdfOptions);
      };
      try {
        // Initial setup, create credentials instance.
        const credentials =
          await PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
            .fromFile("pdfservices-api-credentials.json")
            .build();
        // Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext =
            PDFServicesSdk.ExecutionContext.create(credentials),
          htmlToPDFOperation = PDFServicesSdk.CreatePDF.Operation.createNew();
        // Set operation input from a source file.

        const pageLoop = (_vipData: VIPClass[]): string => {
          const A4pages: string[] = [];
          //const totalVips: number = _vipData.length;
          const totalArrVips: number = vipArr.length;
          const totalInhVips: number = vipInh.length;

          let pageNumber = 1;
          vipArr.forEach((vip, index) => {
            let nIndex = index + 1;

            if (!(nIndex % 2 == 0)) {
              A4pages.push(`<page size="A4">`);
              A4pages.push(`
                <div class="header">
                  <div class="header-center">
                    <span class="header-page-number">${`${pageNumber}`}</span>
                    <span class="header-page-title"> VIP Arrivals - ${formatDate(
                      new Date(),
                      " EEE dd MMM"
                    )}</span>           
                  </div> 
                </div>`);
              pageNumber++;
            }

            A4pages.push(`
                <div class="vip-card">
                         <style>
                    .vip-image-${vip?.id} {
                      background-image: url(${
                        vip?.image ||
                        `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`
                      });
                      background-repeat:no-repeat;
                      background-position: center center;
                      background-size: cover;
                    }
                  </style>            
                    <div class="image vip-image-${vip?.id}"></div>
                    <div class="vip-label">
                      <span class="vip-name">${`${vip?.lastName}, ${vip?.firstName}`}</span>
                      <span class="name-dash"> - </span>
                      <span class="vip-status${
                        Boolean(vip?.vipStatus && vip?.vipStatus.length)
                          ? ` ${vip?.vipStatus ? vip?.vipStatus[0].label : ``}`
                          : ``
                      }">${`${
              vip?.vipStatus ? vip?.vipStatus[0].label : ``
            }`}</span>
                    </div>  
                    <div class="top-line"></div>
                    <div class="vip-details"> 
                      <div class="vip-notes">${vip?.notes || "No Notes"}</div>
                      <div class="vip-location">${
                        vip?.details || "No Location"
                      }</div>
                    </div>
                    <div class="bottom-line"></div>
                    <div class="arrival-departure">
                      <span class="vip-arrival">${vip?.arrival}</span>
                      <span> - </span>
                      <span class="vip-departure">${vip?.departure}</span>
                    </div>
                    <div class="vip-room">RM: ${vip.roomNumber || `TBD`}</div>
                  </div>
              `);

            if (!(nIndex % 2 == 0) && totalArrVips === nIndex) {
              //number is not even but last page
              A4pages.push(`</page>`);
            }

            if (nIndex % 2 == 0) {
              //number is even
              A4pages.push(`</page>`);
            }
          });
          vipInh.forEach((vip, index) => {
            let nIndex = index + 1;

            if (!(nIndex % 2 == 0)) {
              A4pages.push(`<page size="A4">`);
              A4pages.push(`
                <div class="header">
                  <div class="header-center">
                    <span class="header-page-number">${`${pageNumber}`}</span>
                    <span class="header-page-title"> VIP In-House - ${formatDate(
                      new Date(),
                      " EEE dd MMM"
                    )}</span>           
                  </div> 
                </div>`);
              pageNumber++;
            }

            A4pages.push(`
                <div class="vip-card">
                         <style>
                    .vip-image-${nIndex} {
                      background-image: url(${
                        vip?.image ||
                        `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`
                      });
                      background-repeat:no-repeat;
                      background-position: center center;
                      background-size: cover;
                    }
                  </style>            
                    <div class="image vip-image-${nIndex}"></div>
                    <div class="vip-label">
                      <span class="vip-name">${`${vip?.lastName}, ${vip?.firstName}`}</span>
                      <span class="name-dash"> - </span>
                      <span class="vip-status${
                        Boolean(vip?.vipStatus && vip?.vipStatus.length)
                          ? ` ${vip?.vipStatus ? vip?.vipStatus[0].label : ``}`
                          : ``
                      }">${`${
              vip?.vipStatus ? vip?.vipStatus[0].label : ``
            }`}</span>
                    </div>  
                    <div class="top-line"></div>
                    <div class="vip-details"> 
                      <div class="vip-notes">${vip?.notes || "No Notes"}</div>
                      <div class="vip-location">${
                        vip?.details || "No Location"
                      }</div>
                    </div>
                    <div class="bottom-line"></div>
                    <div class="arrival-departure">
                      <span class="vip-arrival">${vip?.arrival}</span>
                      <span> - </span>
                      <span class="vip-departure">${vip?.departure}</span>
                    </div>
                    <div class="vip-room">RM: ${vip.roomNumber || `TBD`}</div>
                  </div>
              `);

            if (!(nIndex % 2 == 0) && totalInhVips === nIndex) {
              //number is not even but last page
              A4pages.push(`</page>`);
            }

            if (nIndex % 2 == 0) {
              //number is even
              A4pages.push(`</page>`);
            }
          });
          return A4pages.join(" ");
        };

        const HTML = `
    <!DOCTYPE html>

    <head>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <style>
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          html,
          body {
            width: 210mm;
            height: 297mm;
          }
        }
    
        body {
          background: white;
          font-family:  Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif;
        }
        page[size="A4"] {
          background: white;
          width: 21cm;
          height: 29.7cm;
          display: block;
          margin: 0 auto;
          margin-bottom: 0.5cm;
          box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
          webkit-box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
        }
        @media print {
          body,
          page[size="A4"] {
            margin: 0;
            box-shadow: 0;
          }
        }
        .vip-card {
          width: 100%;
          display: flex;
          justify-content: center;
          align-content: center;
          align-items: center;
          height: 10cm;
          flex-direction: column;
          margin-top: 1cm;
          text-align: center;
        }
        .image {
          height: 200px;
          width: 200px;
          border: solid 10px #16365c;
          overflow: hidden;
          border-radius: 100%;
          margin-bottom: 12px;
        }
        .top-line {
          height: 1px;
          background-color: #16365c;
          width: 65%;
          margin-bottom: 6px;
        }
        .bottom-line {
          height: 1px;
          background-color: #16365c;
          width: 65%;
          margin-top: 6px;
          margin-bottom: 6px;
        }
        .vip-label {
          color: black;
          text-align: center;
          margin-bottom: 6px;
        }
        .vip-notes {
          color: #16365c;
          font-size: 14px;
          text-align: center;
          font-style: italic;
        }
        .vip-details {
          color: #16365c;
          width: 50%; 
          text-align: center;
        }
        .vip-location {
          color: #16365c;
          font-size: 14px;
          text-align: center;
          font-weight: bold;
          font-style: italic;
          text-align: center;
        }
        .arrival-departure {
          font-size: 12px;
          text-align: center;
          margin-bottom: 2px;
        }
        .arrival-departure {
          font-size: 12px;
          text-align: center;
        }
        .vip-room {
          font-size: 11px;
          text-transform: uppercase;
          text-align: center;
        }
        .arrival-departure {
          font-size: 12px;
          text-align: center;
        }
        .vip-status {
          font-weight: bold;
          text-transform: uppercase;
          font-size: 14px;
        }
        .GLOB {
          color: #2f75b5;
        }
        .header-page-title {
          color: black;
        }
        .vip-name {
          color: black;
          font-weight: bold;
          font-size: 14px;
        }
        .header-page-number {
          color: white;
          font-weight: bold;
          background-color: #16365c;
          height: 32px;
          width: 64px;
          display: flex;
          justify-content: center;
          text-align: center;
          align-content: center;
          align-items: center;
          margin-right: 8px;
          padding-left: 8px;
        }
        .header {
          font-size: 22px;
          height: 2cm;
          width: 100%;
          display: flex;
          justify-content: left;
          text-align: center;
          align-content: center;
          align-items: center;
          padding-top: 24px;
        }
        .header-center {
          width: 100%;
          display: flex;
          justify-content: left;
          text-align: center;
          align-content: center;
          align-items: center;
        }
      </style>
    </head>
    
    <html>
      <body>
        ${pageLoop(vipData)}
      </body>
    </html>
          
          `;

        await fs.appendFile(
          `/tmp/html-${accessToken}.html`,
          HTML,
          function (err: any) {
            if (err) throw reject({ url: null, success: false, error: err });
            console.log("Saved! HTML");
          }
        );

        const input = await PDFServicesSdk.FileRef.createFromLocalFile(
          `/tmp/html-${accessToken}.html`
        );
        htmlToPDFOperation.setInput(input);
        // Provide any custom configuration options for the operation.
        setCustomOptions(htmlToPDFOperation);

        // Execute the operation and Save the result to the specified location.
        await htmlToPDFOperation
          .execute(executionContext)
          .then(async (result: any) => {
            //await result.saveAsFile('createPDFFromHTMLWithInlineCSSOutput.pdf')
            //fs.createReadStream('createPDFFromHTMLWithInlineCSSOutput.pdf')
            await result.saveAsFile(`/tmp/VIP's Detailed - ${accessToken}.pdf`);

            const bucket = admin.storage().bucket();

            const options = {
              destination: `detailedVIPs/VIP's Detailed - ${accessToken}.pdf`,
              public: true,
              metadata: {
                contentType: "application/pdf",
                metadata: {
                  firebaseStorageDownloadTokens: accessToken,
                },
              },
            };
            await bucket
              .upload(`/tmp/VIP's Detailed - ${accessToken}.pdf`, options)
              .then(async (data: any) => {
                //const file = data[0];
                //console.log('upload', file);
                console.log("uploaded");
                //resolve({success: true})
                //let file_name = `detailedVIPs/VIP's Detailed - ${accessToken}.pdf`;
                // const file = bucket.file(file_name);
                // const url = await file.getSignedUrl({
                //   version: "v4",
                //   action: "read",
                //   expires: Date.now() + 24 * 60 * 60 * 1000,
                // });
                const url = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/${replaceWhitespace(
                  options.destination
                )}?alt=media&token=${accessToken}`;

                //         return { url };
                return resolve({ url, success: true, error: null });
              })
              .catch((err: any) => {
                console.log("Error uploading to storage", err);
                reject(err);
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `Error uploading to storage: ${err}`
                );
              });
          })
          .catch((err: any) => {
            if (
              err instanceof PDFServicesSdk.Error.ServiceApiError ||
              err instanceof PDFServicesSdk.Error.ServiceUsageError
            ) {
              console.log(
                "Exception encountered while executing operation 1",
                err
              );
              return reject({ url: null, success: false, error: err });
            } else {
              console.log(
                "Exception encountered while executing operation 2",
                err
              );
              return reject({ url: null, success: false, error: err });
            }
          });
      } catch (err) {
        console.log("Exception encountered while executing operation 3", err);
        return reject({ url: null, success: false, error: err });
      }
    }
  );

  return _url;
});
//firebase deploy --only functions:updateVIPs
exports.updateVIPs = functions.https.onCall(async () => {
  //const accessTokenHTML = uuid.v4();
  const x = "reservationStatus";
  const y = ["DUEIN", "CHECKEDIN", "DUEOUT", "RESERVED"];
  const db = admin.firestore();
  const batch = db.batch();
  const vipRef = db.collection("ArrivalVIPs");
  const vipSnapshot = await vipRef.where(x, "in", y).get();
  const vipChanges: VIPClass[] = [];
  if (!vipSnapshot.empty) {
    vipSnapshot.forEach((doc) => {
      const vip: VIPClass = doc.data(),
        vipDuplicate = { ...vip },
        arrDate: Date = unformatDate(`${vip["arrival"]}`),
        depDate: Date = unformatDate(`${vip["departure"]}`),
        todDate: Date = new Date(),
        a = dayOfYear(arrDate),
        d = dayOfYear(depDate),
        t = dayOfYear(todDate);
      vipDuplicate[x] =
        t < a
          ? `RESERVED`
          : t === a
          ? `DUEIN`
          : t > a && t === d
          ? `DUEOUT`
          : t > a && t < d
          ? `CHECKEDIN`
          : t > a && t > d
          ? `CHECKEDOUT`
          : `ERROR`;
      //compare with orginal and see if change
      if (vipDuplicate[x] !== vip[x]) {
        vipChanges.push(vipDuplicate);
        batch.set(
          vipRef.doc(`${vipDuplicate.id}`),
          { [x]: vipDuplicate[x] },
          { merge: true }
        );
      }
    });
  }
  try {
    batch.commit();
    return {
      //form: completeVIP,
      success: true,
      //id,
    };
  } catch (error: any) {
    console.log(`${error.message || error || "Error: updating vips"}`);
    throw new functions.https.HttpsError(
      "unimplemented",
      `${error.message || error || "Error: updating vips"}`
    );
  }
});
//firebase deploy --only functions:exportAdobeRHVip
exports.exportAdobeRHVip = functions.https.onCall(async () => {
  const _url = await new Promise<{ url: any; success: boolean; error: any }>(
    async (resolve, reject) => {
      const accessToken = uuid.v4();
      const accessTokenHTML = uuid.v4();
      const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
      /**
       * Get VIP Arrivals.
       */
      const db = admin.firestore();
      const vipRef = db
        .collection("ArrivalVIPs")
        .where("reservationStatus", "in", ["DUEIN", "CHECKEDIN", "DUEOUT"]);
      const vipSnapshot = await vipRef.get();
      const vipData: VIPClass[] = [],
        vipArr: VIPClass[] = [],
        vipInh: VIPClass[] = [],
        vipOut: VIPClass[] = [];
      if (!vipSnapshot.empty) {
        vipSnapshot.forEach((doc) => {
          const docData: VIPClass = doc.data();

          vipData.push(docData);

          if (docData.reservationStatus === "DUEIN") {
            vipArr.push(docData);
          }
          if (
            docData.reservationStatus === "CHECKEDIN" ||
            docData.reservationStatus === "DUEOUT"
          ) {
            vipInh.push(docData);
          }
          if (docData.reservationStatus === "DUEOUT") {
            vipOut.push(docData);
          }
        });
      }

      /**
       * This sample illustrates how to create a PDF file from a HTML file with inline CSS.
       * <p>
       * Refer to README.md for instructions on how to run the samples.
       */

      /**
       * Sets any custom options for the operation.
       *
       * @param htmlToPDFOperation operation instance for which the options are provided.
       */
      const setCustomOptions = (htmlToPDFOperation: any) => {
        // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
        const pageLayout =
          new PDFServicesSdk.CreatePDF.options.html.PageLayout();
        pageLayout.setPageSize(20, 25);

        // Set the desired HTML-to-PDF conversion options.
        const htmlToPdfOptions =
          new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
            .includesHeaderFooter(true)
            .withPageLayout(pageLayout)
            .build();
        htmlToPDFOperation.setOptions(htmlToPdfOptions);
      };
      try {
        // Initial setup, create credentials instance.
        const credentials =
          await PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
            .fromFile("pdfservices-api-credentials.json")
            .build();
        // Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext =
            PDFServicesSdk.ExecutionContext.create(credentials),
          htmlToPDFOperation = PDFServicesSdk.CreatePDF.Operation.createNew();
        // Set operation input from a source file.

        const pageLoop = (_vipData: VIPClass[]): string => {
          const Table: string[] = [];
          //const totalVips: number = _vipData.length;
          _vipData.forEach((vip, index) => {
            Table.push(`
              <div class="rh-row">
                <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                <div class="rh-cell rh-room">${vip?.roomNumber || "TBD"}</div>
                <div class="rh-cell rh-arrival">${vip?.arrival || `N/A`}</div>
                <div class="rh-cell rh-departure">${
                  vip?.departure || `N/A`
                }</div>
                <div class="rh-cell rh-notes">${vip?.notes || `No Notes`}</div>
                <div class="rh-cell rh-rate-code">${
                  vip?.rateCode || `N/A`
                }</div>
                <div class="rh-cell rh-vip-status end${
                  Boolean(vip?.vipStatus && vip?.vipStatus.length)
                    ? ` ${vip?.vipStatus ? vip?.vipStatus[0].label : ``}`
                    : ``
                }">${`${
              vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`
            }`}</div>
              </div>
            `);
          });
          return Table.join(" ");
        };

        const HTML = `
    <!DOCTYPE html>

    <head>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <style>
      @page {
        size: A4;
        margin: 24px;
      }
      @media print {
        html,
        body {
          width: 210mm;
          height: 297mm;
        }
        /* ... the rest of the rules ... */
      }
    
        body {
          background: white;
          font-family:Arial, Helvetica, sans-serif
        }
        page[size="A4"] {
          background: white;
          width: 21cm;
          height: 29.7cm;
          display: block;
          margin: 24px auto;
          margin-bottom: 0.5cm;
          box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
        }
        @media print {
          body,
          page[size="A4"] {
            margin: 0;
            box-shadow: 0;
          }
        }
        body {
          background: white;
          font-family:Arial, Helvetica, sans-serif;
          display: flex;
          height: 100%;
          width: 100%;
          justify-content: center;
          align-items: center;
          align-content: center;
          /* margin: 20%; */
          flex-direction: column;
        }
        .rh-vip-margin{
          display: flex;
          height: 100%;
          width: 90%;
          /* margin: 20%; */
          flex-direction: column;
        }
        .header{
          width:100%;
          display:flex;
          height: 100%;
          justify-content:space-between;
          padding: 24px 2px;
          /* padding: 36px; */
        }
        .left-logo{
          height: 25px;
          /* background-color:#16365c; */
          /* color: white; */
          font-weight: bold;
          width:64px;
          padding: 6px 18px;
          justify-content: center;
          align-items: center;
          align-content: center;
          justify-content:center;
          display:flex;
          border-radius: 8px;
        }
        .right-date{
          height: 25px;
          background-color:#16365c;
          color: white;
          font-weight: bold;
          width:64px;
          padding: 6px 18px;
          justify-content: center;
          align-items: center;
          align-content: center;
          justify-content:center;
          display:flex;
          border-radius: 8px;
          /* flex:1; */
    
        }
        .rh-table-title{
          width:100%;
          display:flex;
          height: 100%;
          justify-content:center;
          /* margin: 36px; */
          min-height: 38px;
          background-color:#16365c;
          color: white;
          justify-content: center;
          align-items: center;
          align-content: center;
          border-right: solid 1px #16365c;
          border-left: solid 1px #16365c;
          font-weight: bold;
        }
        .rh-table-header{
          width:100%;
          display:flex;
          height: 100%;
          justify-content:center;
          /* margin: 36px; */
          min-height: 34px;
          background-color:#c5d9f1;
          color: black;
          justify-content: center;
          align-items: center;
          align-content: center;
          font-weight: bold;
          border-right: solid 1px #16365c;
          border-left: solid 1px #16365c;
        }
        .rh-table{
          border-right: solid 1px #16365c;
          width:100%;
          display: flex;
          /* border:solid 1px #16365c; */
          /* border-right: solid 1px #16365c; */
          border-left: solid 1px #16365c;
          border-top: solid 1px #16365c;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          align-content: center;
        }
        .rh-row{
          width:100%;
          display: flex;
          justify-content: center;
          align-items: center;
          align-content: center;
          /*border:solid 1px black*/
    
        }
        .rh-name{
          flex:2;
        }
        .rh-room{
          flex:1;
        }
        .rh-arrival{
          flex:1;
        }
        .rh-departure{
          flex:1;
        }
        .rh-notes{
          flex:3;
        }
        .rh-rate-code{
          flex:1;
        }
        .rh-vip-status{
          flex:1;
        }
        .rh-cell{
          border-bottom: solid 1px #16365c;
          border-right: solid 1px #16365c;
          justify-content: center;
          align-items: center;
          align-content: center;
          display: flex;
          padding: 14px 2px;
        }
        .end{
          border-right: none;
        }
    </style>
    </head>
<html>
<body>
  <div class="rh-vip-margin">
    <div class="header">
      <div class="left-logo">Thompson</div>
      <div class="right-date">06.23.22</div>           
    </div>
    <div class="rh-table">
      <div class="rh-table-title">VIP List</div>
      <div class="rh-table-header">Arrivals</div>
      <div class="rh-table">
        ${pageLoop(vipArr)}
      </div>
      <div class="rh-table-header">In House</div>
      <div class="rh-table">
        ${pageLoop(vipInh)}
      </div>
      <div class="rh-table-header">Departure</div>
      <div class="rh-table">
        ${pageLoop(vipOut)}
      </div>
    </div>
  </div>
</body>
</html>`;

        await fs.appendFile(
          `/tmp/html-${accessToken}.html`,
          HTML,
          function (err: any) {
            if (err) throw reject({ url: null, success: false, error: err });
            console.log("Saved! HTML");
          }
        );

        const input = await PDFServicesSdk.FileRef.createFromLocalFile(
          `/tmp/html-${accessToken}.html`
        );
        htmlToPDFOperation.setInput(input);
        // Provide any custom configuration options for the operation.
        setCustomOptions(htmlToPDFOperation);

        // Execute the operation and Save the result to the specified location.
        await htmlToPDFOperation
          .execute(executionContext)
          .then(async (result: any) => {
            //await result.saveAsFile('createPDFFromHTMLWithInlineCSSOutput.pdf')
            //fs.createReadStream('createPDFFromHTMLWithInlineCSSOutput.pdf')
            await result.saveAsFile(`/tmp/VIP's Detailed - ${accessToken}.pdf`);

            const bucket = admin.storage().bucket();

            const options = {
              destination: `detailedVIPs/VIP's Detailed - ${accessToken}.pdf`,
              public: true,
              metadata: {
                contentType: "application/pdf",
                metadata: {
                  firebaseStorageDownloadTokens: accessToken,
                },
              },
            };
            const options2 = {
              destination: `detailedVIPs/VIP's Detailed HTML - ${accessTokenHTML}.html`,
              public: true,
              metadata: {
                contentType: "html/txt",
                metadata: {
                  firebaseStorageDownloadTokens: accessTokenHTML,
                },
              },
            };
            await bucket.upload(`/tmp/html-${accessToken}.html`, options2);
            await bucket
              .upload(`/tmp/VIP's Detailed - ${accessToken}.pdf`, options)
              .then(async (data: any) => {
                //const file = data[0];
                //console.log('upload', file);
                console.log("uploaded");
                //resolve({success: true})
                //let file_name = `detailedVIPs/VIP's Detailed - ${accessToken}.pdf`;
                // const file = bucket.file(file_name);
                // const url = await file.getSignedUrl({
                //   version: "v4",
                //   action: "read",
                //   expires: Date.now() + 24 * 60 * 60 * 1000,
                // });
                const url = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/${replaceWhitespace(
                  options.destination
                )}?alt=media&token=${accessToken}`;

                //         return { url };
                return resolve({ url, success: true, error: null });
              })
              .catch((err: any) => {
                console.log("Error uploading to storage", err);
                reject(err);
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `Error uploading to storage: ${err}`
                );
              });
          })
          .catch((err: any) => {
            if (
              err instanceof PDFServicesSdk.Error.ServiceApiError ||
              err instanceof PDFServicesSdk.Error.ServiceUsageError
            ) {
              console.log(
                "Exception encountered while executing operation 1",
                err
              );
              return reject({ url: null, success: false, error: err });
            } else {
              console.log(
                "Exception encountered while executing operation 2",
                err
              );
              return reject({ url: null, success: false, error: err });
            }
          });
      } catch (err) {
        console.log("Exception encountered while executing operation 3", err);
        return reject({ url: null, success: false, error: err });
      }
    }
  );

  return _url;
});

//firebase deploy --only functions:createArrivalVIP
exports.createArrivalVIP = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const updateData: VIPClass = {};
    let x:
      | `firstName`
      | `lastName`
      | `rateCode`
      | `arrival`
      | `departure`
      | `image`
      | `fileName`
      | `vipStatus`
      | `roomStatus`
      | "roomNumber"
      | `notes`
      | `details`
      | `stays`
      | `reservationStatus`
      | `id`;
    const y: string = `VIP`;

    // firstName
    x = `firstName`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // lastName
    x = `lastName`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // rateCode
    x = `rateCode`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // arrival
    x = `arrival`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // departure
    x = `departure`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }

    x = `reservationStatus`;
    const arrDate: Date = unformatDate(`${updateData["arrival"]}`),
      depDate: Date = unformatDate(`${updateData["departure"]}`),
      todDate: Date = new Date(),
      a = dayOfYear(arrDate),
      d = dayOfYear(depDate),
      t = dayOfYear(todDate);
    updateData.reservationStatus =
      t < a
        ? `RESERVED`
        : t === a
        ? `DUEIN`
        : t > a && t === d
        ? `DUEOUT`
        : t > a && t < d
        ? `CHECKEDIN`
        : t > a && t > d
        ? `CHECKEDOUT`
        : `ERROR`;

    // image
    x = `image`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[
        x
      ] = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`;
    }
    // fileName
    x = `fileName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = `810-8105444_male-placeholder.png`;
    }
    // vipStatus
    x = `vipStatus`;
    if (!Array.isArray(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // roomStatus
    x = `roomStatus`;
    if (clientData[x] != undefined) {
      if (Array.isArray(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = [{ label: ``, id: `` }];
    }
    // roomNumber
    x = `roomNumber`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // notes
    x = `notes`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // details
    x = `details`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // stays
    x = `stays`;
    if (clientData[x] != undefined) {
      if (isValidNumber(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = 0;
    }
    // // reservationStatus
    // x = `reservationStatus`;
    // if (clientData[x] != undefined) {
    //   if (isValidString(clientData[x])) {
    //     updateData[x] = clientData[x];
    //   }
    // } else {
    //   updateData[x] = 'RESERVED';
    // }

    const _vip = new VIPClass(
      updateData.arrival, // arrival?: string,
      updateData.departure, // departure?: string,
      updateData.details, // details?: string,
      updateData.fileName, // fileName?: string
      updateData.firstName, // firstName?: string,
      null, // id?: string,
      updateData.image, // image?: string,
      updateData.lastName, // lastName?: string,
      updateData.notes, // notes?: string,
      updateData.rateCode, // rateCode?: string,
      updateData.reservationStatus, // reservationStatus?:'DUEIN'|'DUEOUT'|'CHECKEDIN'|'CHECKEDOUT'|'RESERVED'|'NOSHOW'|'CANCEL',
      updateData.roomNumber || null, // roomNumber?: string,
      updateData.roomStatus || [{ id: ``, label: `` }], // roomStatus?: [],
      updateData.vipStatus || [{ id: ``, label: `` }], // vipStatus?: [],
      updateData.stays || 0, // stays?:number,,
      "LAXTE"
    );

    const completeVIP = { ..._vip };
    try {
      const ref = db.collection("ArrivalVIPs").doc();
      const id = ref.id;
      completeVIP.id = id;
      await ref.set({ ...completeVIP });
      return {
        form: completeVIP,
        success: true,
        id,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || " error "}`
      );
    }
  }
);
//firebase deploy --only functions:updateArrivalVIP
exports.updateArrivalVIP = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const updateData: VIPClass = {};
    let x:
      | `firstName`
      | `lastName`
      | `rateCode`
      | `arrival`
      | `departure`
      | `image`
      | `fileName`
      | `vipStatus`
      | `roomStatus`
      | "roomNumber"
      | `notes`
      | `details`
      | `stays`
      | `reservationStatus`
      | `id`;
    const y: string = `VIP`;

    // firstName
    x = `firstName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // lastName
    x = `lastName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // rateCode
    x = `rateCode`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // arrival
    x = `arrival`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // departure
    x = `departure`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }

    // reservationStatus
    x = `reservationStatus`;
    if (
      clientData[`departure`] != undefined &&
      clientData[`arrival`] != undefined
    ) {
      const arrDate: Date = unformatDate(`${updateData["arrival"]}`),
        depDate: Date = unformatDate(`${updateData["departure"]}`),
        todDate: Date = new Date(),
        a = dayOfYear(arrDate),
        d = dayOfYear(depDate),
        t = dayOfYear(todDate);
      updateData.reservationStatus =
        t < a
          ? `RESERVED`
          : t === a
          ? `DUEIN`
          : t > a && t === d
          ? `DUEOUT`
          : t > a && t < d
          ? `CHECKEDIN`
          : t > a && t > d
          ? `CHECKEDOUT`
          : `ERROR`;
    }

    // image
    x = `image`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // fileName
    x = `fileName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // vipStatus
    x = `vipStatus`;
    if (clientData[x] != undefined) {
      if (!Array.isArray(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // roomStatus
    x = `roomStatus`;
    if (clientData[x] != undefined) {
      if (Array.isArray(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // roomNumber
    x = `roomNumber`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // notes
    x = `notes`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // details
    x = `details`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // stays
    x = `stays`;
    if (clientData[x] != undefined) {
      if (isValidNumber(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }

    // id
    x = `id`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }

    const updatedVIP = { ...updateData };
    try {
      const ref = db.collection("ArrivalVIPs").doc(`${updatedVIP.id}`);
      await ref.set({ ...updatedVIP }, { merge: true });
      return {
        form: updatedVIP,
        success: true,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || ""}`
      );
    }
  }
);
//firebase deploy --only functions:deleteArrivalVIP
exports.deleteArrivalVIP = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const x = `id`;
    const y: string = `VIP`;
    const updateData: VIPClass = {};

    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    const filteredVIP: VIPClass = { ...updateData };

    const ref = db.collection("ArrivalVIPs").doc(`${filteredVIP.id}`);
    const res = await ref.get();
    if (!res.exists) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "I couldn't find this VIP"
      );
    }
    try {
      await ref.delete();
      return {
        success: true,
        id: filteredVIP.id,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || ""}`
      );
    }
  }
);

//firebase deploy --only functions:onCreateArrivalVIP
exports.onCreateArrivalVIP = functions.firestore
  .document("ArrivalVIPs/{id}")
  .onCreate(
    async (
      snap: FirebaseFirestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const _vip = snap.data() as VIPClass;
      const totalsUpdate: any = {};
      totalsUpdate["total"] = increment;
      totalsUpdate[`${_vip.reservationStatus}`] = increment;
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`inhouse`] = increment;
      }
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`arrivals+inhouse`] = increment;
      }

      const totalRef = db.collection("Totals").doc("ArrivalVIPs");
      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (error: any) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${error?.message || error || ""}`
        );
      }
      return;
    }
  );
//firebase deploy --only functions:onUpdateArrivalVIP
exports.onUpdateArrivalVIP = functions.firestore
  .document("ArrivalVIPs/{id}")
  .onUpdate(
    async (
      change: functions.Change<FirebaseFirestore.QueryDocumentSnapshot>,
      context: functions.EventContext
    ) => {
      const beforeCollection = change.before.data() as VIPClass;
      const afterCollection = change.after.data() as VIPClass;
      const totalsUpdate: any = {};
      if (
        beforeCollection.reservationStatus !== afterCollection.reservationStatus
      ) {
        totalsUpdate[`${beforeCollection.reservationStatus}`] = decrement;
        totalsUpdate[`${afterCollection.reservationStatus}`] = increment;
        const b4status = beforeCollection.reservationStatus;
        const afstatus = afterCollection.reservationStatus;
        if (
          b4status &&
          ["DUEOUT", "CHECKEDIN"].includes(b4status) &&
          afstatus &&
          !["DUEOUT", "CHECKEDIN"].includes(afstatus)
        ) {
          totalsUpdate[`inhouse`] = decrement;
        }
        if (
          afstatus &&
          ["DUEOUT", "CHECKEDIN"].includes(afstatus) &&
          b4status &&
          !["DUEOUT", "CHECKEDIN"].includes(b4status)
        ) {
          totalsUpdate[`inhouse`] = increment;
        }
        if (
          b4status &&
          ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(b4status) &&
          afstatus &&
          !["DUEOUT", "CHECKEDIN", "DUEIN"].includes(afstatus)
        ) {
          totalsUpdate[`arrivals+inhouse`] = decrement;
        }
        if (
          afstatus &&
          ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(afstatus) &&
          b4status &&
          !["DUEOUT", "CHECKEDIN", "DUEIN"].includes(b4status)
        ) {
          totalsUpdate[`arrivals+inhouse`] = increment;
        }
      }
      const totalRef = db.collection("Totals").doc("ArrivalVIPs");
      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (e) {
        console.log("Error updating totals");
        console.log(e);
      }
      return;
    }
  );
//firebase deploy --only functions:onDeleteArrivalVIP
exports.onDeleteArrivalVIP = functions.firestore
  .document("ArrivalVIPs/{id}")
  .onDelete(
    async (
      snap: FirebaseFirestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const totalsUpdate: any = {};
      totalsUpdate["total"] = decrement;
      const totalRef = db.collection("Totals").doc("ArrivalVIPs");
      const _vip = snap.data() as VIPClass;

      totalsUpdate[`${_vip.reservationStatus}`] = decrement;
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`inhouse`] = decrement;
      }
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`arrivals+inhouse`] = decrement;
      }
      //archive the vip
      //to keep up with stays and id

      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (error: any) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${error?.message || error || ""}`
        );
      }
      return;
    }
  );



//**    LAXTH     **//
//firebase deploy --only functions:exportAdobeDetailedVip_LAXTH
exports.exportAdobeDetailedVip_LAXTH = functions.https.onCall(async () => {
  const _url = await new Promise<{ url: any; success: boolean; error: any }>(
    async (resolve, reject) => {
      const accessToken = uuid.v4();
      const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
      /* Get VIP Arrivals. */
      const db = admin.firestore();
      const vipRef = db
        .collection(`LAXTH_VIPs`)
        .where("reservationStatus", "in", ["DUEIN", "CHECKEDIN", "DUEOUT"]);
      const vipSnapshot = await vipRef.get();
      const vipData: VIPClass[] = [],
        vipArr: VIPClass[] = [],
        vipInh: VIPClass[] = [];
      !vipSnapshot.empty &&
        vipSnapshot.forEach((doc) => {
          const docData: VIPClass = doc.data();
          vipData.push(docData),
            docData.reservationStatus === "DUEIN" && vipArr.push(docData),
            (docData.reservationStatus === "CHECKEDIN" ||
              docData.reservationStatus === "DUEOUT") &&
              vipInh.push(docData);
        });
      /**
       * Sets any custom options for the operation.
       *
       * @param htmlToPDFOperation operation instance for which the options are provided.
       */
      const setCustomOptions = (htmlToPDFOperation: any) => {
        // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
        const pageLayout =
          new PDFServicesSdk.CreatePDF.options.html.PageLayout();
        pageLayout.setPageSize(20, 25);

        // Set the desired HTML-to-PDF conversion options.
        const htmlToPdfOptions =
          new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
            .includesHeaderFooter(true)
            .withPageLayout(pageLayout)
            .build();
        htmlToPDFOperation.setOptions(htmlToPdfOptions);
      };
      try {
        // Initial setup, create credentials instance.
        const credentials =
          await PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
            .fromFile("pdfservices-api-credentials.json")
            .build();
        // Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext =
            PDFServicesSdk.ExecutionContext.create(credentials),
          htmlToPDFOperation = PDFServicesSdk.CreatePDF.Operation.createNew();
        // Set operation input from a source file.
        const _header = (pageNumber: number, title:string) => `<div class="header">
        <div class="header-center">
          <span class="header-page-number">${`${pageNumber}`}</span>
            <span class="header-page-title"> ${title} - ${formatDate(
              new Date(),
              " EEE dd MMM"
            )}</span>           
          </div> 
        </div>`;
        const _card = (vip: VIPClass) => `<div class="vip-card">
        <style>
          .vip-image-${vip?.id} {
            background-image: url(${
              vip?.image ||
              `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`
            });
            background-repeat:no-repeat;
            background-position: center center;
            background-size: cover;
          }
        </style>            
        <div class="image vip-image-${vip?.id}"></div>
          <div class="vip-label">
            <span class="vip-name">${`${vip?.lastName}, ${vip?.firstName}`}</span>
            <span class="name-dash"> - </span>
            <span class="vip-status${
              Boolean(vip?.vipStatus && vip?.vipStatus.length)
                ? ` ${vip?.vipStatus ? vip?.vipStatus[0].label : ``}`
                : ``
            }">${`${vip?.vipStatus ? vip?.vipStatus[0].label : ``}`}</span>
          </div>  
          <div class="top-line"></div>
          <div class="vip-details"> 
            <div class="vip-notes">${vip?.notes || "No Notes"}</div>
          </div>
          <div class="bottom-line"></div>
          <div class="arrival-departure">
            <span class="vip-arrival">${vip?.arrival}</span>
            <span> - </span>
            <span class="vip-departure">${vip?.departure}</span>
          </div>
          <div class="vip-stays">Stays: ${(vip.stays===0)?`0`:(vip.stays||`N/A`)}</div>
          <div class="vip-room">RM: ${vip.roomNumber || `TBD`}</div>
        </div>`;
        const pageLoop = (_vipData: VIPClass[]): string => {
          const A4pages: string[] = [],
            totalArrVips: number = vipArr.length,
            totalInhVips: number = vipInh.length;
          let pageNumber = 1;
          vipArr.forEach((vip, index) => {
            let nIndex = index + 1;
            !(nIndex % 2 == 0) &&
              (A4pages.push(`<page size="A4">`),
              A4pages.push(_header(pageNumber, 'VIP Arrivals')),
              pageNumber++);
            A4pages.push(_card(vip));
            !(nIndex % 2 == 0) &&
              totalArrVips === nIndex &&
              A4pages.push(`</page>`);
            nIndex % 2 == 0 && A4pages.push(`</page>`);
          });
          vipInh.forEach((vip, index) => {
            let nIndex = index + 1;
            !(nIndex % 2 == 0) &&
              (A4pages.push(`<page size="A4">`),
              A4pages.push(_header(pageNumber, 'VIP In-house')),
              pageNumber++);
            A4pages.push(_card(vip));
            !(nIndex % 2 == 0) &&
              totalInhVips === nIndex &&
              A4pages.push(`</page>`);
            nIndex % 2 == 0 && A4pages.push(`</page>`);
          });
          return A4pages.join(" ");
        };
        const color = `#16365c`;
        const HTML = `<!DOCTYPE html>
          <head>
            <meta httpEquiv="x-ua-compatible" content="ie=edge" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              @media print {
                html,
                body {
                  width: 210mm;
                  height: 297mm;
                }
              }
              body {
                background: white;
                font-family: Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif;
              }
              page[size="A4"] {
                background: white;
                width: 21cm;
                height: 29.7cm;
                display: block;
                margin: 0 auto;
                margin-bottom: 0.5cm;
              }
              @media print {
                body,
                page[size="A4"] {
                  margin: 0;
                  box-shadow: 0;
                }
              }
              .vip-card {
                width: 100%;
                display: flex;
                justify-content: center;
                align-content: center;
                align-items: center;
                height: 10cm;
                flex-direction: column;
                margin-top: 1cm;
                text-align: center;
              }
              .image {
                height: 200px;
                width: 200px;
                border: solid 10px ${color};
                overflow: hidden;
                border-radius: 100%;
                margin-bottom: 12px;
              }
              .top-line {
                height: 1px;
                background-color: ${color};
                width: 65%;
                margin-bottom: 6px;
              }
              .bottom-line {
                height: 1px;
                background-color: ${color};
                width: 65%;
                margin-top: 6px;
                margin-bottom: 6px;
              }
              .vip-label {
                color: black;
                text-align: center;
                margin-bottom: 6px;
              }
              .vip-notes {
                color: ${color};
                font-size: 14px;
                text-align: center;
                font-style: italic;
              }
              .vip-details {
                color: ${color};
                width: 50%;
                text-align: center;
              }
              .vip-location {
                color: ${color}
                font-size: 14px;
                text-align: center;
                font-weight: bold;
                font-style: italic;
                text-align: center;
              }
              .arrival-departure {
                font-size: 12px;
                text-align: center;
                margin-bottom: 2px;
              }
              .arrival-departure {
                font-size: 12px;
                text-align: center;
              }
              .vip-stays {
                font-size: 12px;
                text-align: center;
              }
              .vip-room {
                font-size: 11px;
                text-transform: uppercase;
                text-align: center;
              }
              .arrival-departure {
                font-size: 12px;
                text-align: center;
              }
              .vip-status {
                font-weight: bold;
                text-transform: uppercase;
                font-size: 14px;
              }
              .GLOB {
                color: #2f75b5;
              }
              .LGLO {
                color: #2f75b5;
              }
              .V2 {
                color: #90cb80;
              }
              .V3 {
                color: #ffdf7f;
              }
              .V6 {
                color: #588dca;
              }
              .MP {
                color: #90cb80;
              }
              .header-page-title {
                color: black;
              }
              .vip-name {
                color: black;
                font-weight: bold;
                font-size: 14px;
              }
              .header-page-number {
                color: white;
                font-weight: bold;
                background-color: ${color};
                height: 32px;
                width: 72px;
                display: flex;
                justify-content: center;
                text-align: center;
                align-content: center;
                align-items: center;
                margin-right: 8px;
                padding-left: 8px;
              }
              .header {
                font-size: 22px;
                height: 2cm;
                width: 100%;
                display: flex;
                justify-content: left;
                text-align: center;
                align-content: center;
                align-items: center;
                padding-top: 24px;
              }
              .header-center {
                width: 100%;
                display: flex;
                justify-content: left;
                text-align: center;
                align-content: center;
                align-items: center;
              }
            </style>
          </head>
          <html>
            <body>
              ${pageLoop(vipData)}
            </body>
          </html>`;

        await fs.appendFile(
          `/tmp/html-${accessToken}.html`,
          HTML,
          function (err: any) {
            if (err) throw reject({ url: null, success: false, error: err });
            console.log("Saved! HTML");
          }
        );

        const input = await PDFServicesSdk.FileRef.createFromLocalFile(
          `/tmp/html-${accessToken}.html`
        );
        htmlToPDFOperation.setInput(input);
        // Provide any custom configuration options for the operation.
        setCustomOptions(htmlToPDFOperation);

        // Execute the operation and Save the result to the specified location.
        await htmlToPDFOperation
          .execute(executionContext)
          .then(async (result: any) => {
            //await result.saveAsFile('createPDFFromHTMLWithInlineCSSOutput.pdf')
            //fs.createReadStream('createPDFFromHTMLWithInlineCSSOutput.pdf')
            await result.saveAsFile(`/tmp/VIP's Detailed - ${accessToken}.pdf`);

            const bucket = admin.storage().bucket();

            const options = {
              destination: `tommie/detailedVIPs/VIP's Detailed - ${accessToken}.pdf`,
              public: true,
              metadata: {
                contentType: "application/pdf",
                metadata: {
                  firebaseStorageDownloadTokens: accessToken,
                },
              },
            };
            await bucket
              .upload(`/tmp/VIP's Detailed - ${accessToken}.pdf`, options)
              .then(async (data: any) => {
                console.log("uploaded");
                const url = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/${replaceWhitespace(
                  options.destination
                )}?alt=media&token=${accessToken}`;
                return resolve({ url, success: true, error: null });
              })
              .catch((err: any) => {
                console.log("Error uploading to storage", err);
                reject(err);
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `Error uploading to storage: ${err}`
                );
              });
          })
          .catch((err: any) => {
            if (
              err instanceof PDFServicesSdk.Error.ServiceApiError ||
              err instanceof PDFServicesSdk.Error.ServiceUsageError
            ) {
              console.log(
                "Exception encountered while executing operation 1",
                err
              );
              return reject({ url: null, success: false, error: err });
            } else {
              console.log(
                "Exception encountered while executing operation 2",
                err
              );
              return reject({ url: null, success: false, error: err });
            }
          });
      } catch (err) {
        console.log("Exception encountered while executing operation 3", err);
        return reject({ url: null, success: false, error: err });
      }
    }
  );
  return _url;
});
//            <div class="vip-location">${vip?.details || "No Location"}</div>
//firebase deploy --only functions:updateVIPs_LAXTH
exports.updateVIPs_LAXTH = functions.https.onCall(async () => {
  //const accessTokenHTML = uuid.v4();
  const x = "reservationStatus";
  const y = ["DUEIN", "CHECKEDIN", "DUEOUT", "RESERVED"];
  const db = admin.firestore();
  const batch = db.batch();
  const vipRef = db.collection(`LAXTH_VIPs`);
  const vipSnapshot = await vipRef.where(x, "in", y).get();
  const vipChanges: VIPClass[] = [];
  if (!vipSnapshot.empty) {
    vipSnapshot.forEach((doc) => {
      const vip: VIPClass = doc.data(),
        vipDuplicate = { ...vip },
        arrDate: Date = unformatDate(`${vip["arrival"]}`),
        depDate: Date = unformatDate(`${vip["departure"]}`),
        todDate: Date = new Date(),
        a = dayOfYear(arrDate),
        d = dayOfYear(depDate),
        t = dayOfYear(todDate);
      vipDuplicate[x] =
        t < a
          ? `RESERVED`
          : t === a
          ? `DUEIN`
          : t > a && t === d
          ? `DUEOUT`
          : t > a && t < d
          ? `CHECKEDIN`
          : t > a && t > d
          ? `CHECKEDOUT`
          : `ERROR`;
      //compare with orginal and see if change
      if (vipDuplicate[x] !== vip[x]) {
        vipChanges.push(vipDuplicate);
        batch.set(
          vipRef.doc(`${vipDuplicate.id}`),
          { [x]: vipDuplicate[x] },
          { merge: true }
        );
      }
    });
  }
  try {
    batch.commit();
    return {
      //form: completeVIP,
      success: true,
      //id,
    };
  } catch (error: any) {
    console.log(`${error.message || error || "Error: updating vips"}`);
    throw new functions.https.HttpsError(
      "unimplemented",
      `${error.message || error || "Error: updating vips"}`
    );
  }
});
//firebase deploy --only functions:exportAdobeRHVip_LAXTH
exports.exportAdobeRHVip_LAXTH = functions.https.onCall(async () => {
  const _url = await new Promise<{ url: any; success: boolean; error: any }>(
    async (resolve, reject) => {
      const accessToken = uuid.v4();
      const accessTokenHTML = uuid.v4();
      const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
      /**
       * Get VIP Arrivals.
       */
      const db = admin.firestore();
      const vipRef = db
        .collection(`LAXTH_VIPs`)
        .where("reservationStatus", "in", ["DUEIN", "CHECKEDIN", "DUEOUT"]);
      const vipSnapshot = await vipRef.get();
      const vipData: VIPClass[] = [],
        vipArr: VIPClass[] = [],
        vipInh: VIPClass[] = [],
        vipOut: VIPClass[] = [];
      if (!vipSnapshot.empty) {
        vipSnapshot.forEach((doc) => {
          const docData: VIPClass = doc.data();

          vipData.push(docData);

          if (docData.reservationStatus === "DUEIN") {
            vipArr.push(docData);
          }
          if (
            docData.reservationStatus === "CHECKEDIN" ||
            docData.reservationStatus === "DUEOUT"
          ) {
            vipInh.push(docData);
          }
          if (docData.reservationStatus === "DUEOUT") {
            vipOut.push(docData);
          }
        });
      }

      /**
       * This sample illustrates how to create a PDF file from a HTML file with inline CSS.
       * <p>
       * Refer to README.md for instructions on how to run the samples.
       */

      /**
       * Sets any custom options for the operation.
       *
       * @param htmlToPDFOperation operation instance for which the options are provided.
       */
      const setCustomOptions = (htmlToPDFOperation: any) => {
        // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
        const pageLayout =
          new PDFServicesSdk.CreatePDF.options.html.PageLayout();
        pageLayout.setPageSize(20, 25);

        // Set the desired HTML-to-PDF conversion options.
        const htmlToPdfOptions =
          new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
            .includesHeaderFooter(true)
            .withPageLayout(pageLayout)
            .build();
        htmlToPDFOperation.setOptions(htmlToPdfOptions);
      };
      try {
        // Initial setup, create credentials instance.
        const credentials =
          await PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
            .fromFile("pdfservices-api-credentials.json")
            .build();
        // Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext =
            PDFServicesSdk.ExecutionContext.create(credentials),
          htmlToPDFOperation = PDFServicesSdk.CreatePDF.Operation.createNew();
        // Set operation input from a source file.
        // const A4pages: string[] = [];
        // //const totalVips: number = _vipData.length;
        // const totalArrVips: number = vipArr.length;
        // const totalInhVips: number = vipInh.length;

        const pageLoop = (
          arrVIP: VIPClass[],
          inhVIP: VIPClass[],
          outVIP: VIPClass[]
        ): string => {
          const A4pages: string[] = [];
          //const totalArrVIPs: number = arrVIP.length;
          //const totalInhVIPs: number = inhVIP.length;
          //const totalOutVIPs: number = outVIP.length;
          const tables: string[] = ["Arriving", "In House", "Departing"];

          let currentHeight = 0;
          let heightBreak = 28;
          //let page = 1;

          A4pages.push(`<page size="A4">`);
          A4pages.push(`<div class="header">`);
          A4pages.push(`<div class="left-logo">
          <svg
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 293.97 104.88"
            height="200px"
          >
            <defs>
              <style>
                .cls-200 {
                  fill: #221f1f;
                }
              </style>
            </defs>
            <g id="Layer_12">
              <rect class="cls-200" x="92.2" width="10.03" height="17.48" />
              <rect class="cls-200" x="106.33" width="10.03" height="17.48" />
              <rect class="cls-200" x="92.2" y="20.95" width="24.16" height="9.98" />
              <rect
                class="cls-200"
                x="134.7"
                y="13.45"
                width="10.03"
                height="17.48"
                transform="translate(279.44 44.39) rotate(180)"
              />
              <rect
                class="cls-200"
                x="120.58"
                y="13.45"
                width="10.03"
                height="17.48"
                transform="translate(251.19 44.39) rotate(180)"
              />
              <rect
                class="cls-200"
                x="120.58"
                width="24.16"
                height="9.98"
                transform="translate(265.31 9.98) rotate(180)"
              />
              <rect class="cls-200" x="148.95" width="10.03" height="17.48" />
              <rect class="cls-200" x="163.08" width="10.03" height="17.48" />
              <rect class="cls-200" x="148.95" y="20.95" width="24.16" height="9.98" />
              <rect
                class="cls-200"
                x="191.45"
                y="13.45"
                width="10.03"
                height="17.48"
                transform="translate(392.94 44.39) rotate(180)"
              />
              <rect
                class="cls-200"
                x="177.33"
                y="13.45"
                width="10.03"
                height="17.48"
                transform="translate(364.69 44.39) rotate(180)"
              />
              <rect
                class="cls-200"
                x="177.33"
                width="24.16"
                height="9.98"
                transform="translate(378.81 9.98) rotate(180)"
              />
              <polygon
                class="cls-200"
                points="0 63.7 19 63.7 19 66.58 11.25 66.58 11.25 80.14 7.56 80.14 7.56 66.7 0 66.64 0 63.7"
              />
              <polygon
                class="cls-200"
                points="37.78 63.7 37.78 80.2 41.41 80.2 41.41 73.17 53.19 73.2 53.19 80.2 56.75 80.2 56.75 63.7 53.16 63.7 53.17 70.27 41.38 70.23 41.44 63.7 37.78 63.7"
              />
              <polygon
                class="cls-200"
                points="117.31 80.19 117.33 63.72 121.73 63.72 128.31 75.67 134.98 63.72 139.2 63.72 139.2 80.19 135.62 80.19 135.62 69.19 129.42 80.19 127.2 80.19 120.94 68.94 120.93 80.19 117.31 80.19"
              />
              <polygon
                class="cls-200"
                points="274.59 63.67 277.56 63.67 290.25 74.61 290.25 63.67 293.97 63.67 293.97 80.23 291.12 80.23 278.16 69.17 278.16 80.23 274.59 80.23 274.59 63.67"
              />
              <polygon
                class="cls-200"
                points="83.22 96.52 85.03 96.52 85.03 99.8 90.91 99.8 90.91 96.52 92.69 96.52 92.69 104.86 90.88 104.86 90.91 101.42 85.03 101.39 85.03 104.86 83.22 104.86 83.22 96.52"
              />
              <path
                class="cls-200"
                d="M97.29,96.52v8.34h9.96v-8.34h-9.96Zm7.99,6.7h-6.04v-5.22h6.04v5.22Z"
              />
              <polygon
                class="cls-200"
                points="111.64 96.53 113.6 96.53 113.6 103.22 120.95 103.22 120.95 104.85 111.64 104.85 111.64 96.53"
              />
              <polygon
                class="cls-200"
                points="125.52 96.53 127.48 96.53 127.48 103.22 134.83 103.22 134.83 104.85 125.52 104.85 125.52 96.53"
              />
              <path
                class="cls-200"
                d="M171.56,96.53v8.34h9.96v-8.34h-9.96Zm7.99,6.7h-6.04v-5.22h6.04v5.22Z"
              />
              <path
                class="cls-200"
                d="M185.94,96.53v8.34h9.96v-8.34h-9.96Zm7.99,6.7h-6.04v-5.22h6.04v5.22Z"
              />
              <polygon
                class="cls-200"
                points="139.23 96.53 141.52 96.53 144.11 99.62 146.75 96.53 149.05 96.53 145.11 101.26 145.11 104.85 143.15 104.85 143.15 101.26 139.23 96.53"
              />
              <polygon
                class="cls-200"
                points="153.52 96.52 155.57 96.52 157.26 102.07 159.33 96.52 161.27 96.52 163.32 101.91 165.04 96.52 167.09 96.52 164.55 104.85 162.41 104.85 160.33 99.46 158.18 104.85 156.06 104.85 153.52 96.52"
              />
              <path
                class="cls-200"
                d="M208.13,96.52h-7.67v8.33h7.51l2.44-1.14v-6.04l-2.28-1.14Zm.49,6.04l-1.56,.65h-4.65v-5.23h4.84l1.37,.66v3.92Z"
              />
              <polygon
                class="cls-200"
                points="215.96 63.71 198.01 63.71 198.01 73.17 212.37 73.17 212.37 76.93 198.01 76.93 198.01 80.19 215.96 80.19 215.96 70.24 201.6 70.24 201.6 66.64 215.96 66.64 215.96 63.71"
              />
              <path
                class="cls-200"
                d="M159.97,63.7v16.48h3.6v-6.36h13.71v-10.12h-17.31Zm13.71,7.03h-10.11v-4.09h10.11v4.09Z"
              />
              <path
                class="cls-200"
                d="M235.56,63.71v16.48h19.59v-16.48h-19.59Zm16,13.23h-12.42v-10.28h12.42v10.28Z"
              />
              <path
                class="cls-200"
                d="M77.52,63.71v16.48h19.59v-16.48h-19.59Zm16,13.23h-12.42v-10.28h12.42v10.28Z"
              />
            </g>
          </svg>
          </div>`);
          A4pages.push(`<div class="right-date">${formatDate(
            new Date(),
            " EEE dd MMM"
          )}</div>`);
          A4pages.push(`</div>`);
          currentHeight = currentHeight + 1.7;
          A4pages.push(`<div class="rh-table-title">VIP List</div>`);
          currentHeight = currentHeight + 1.5;
          tables.map((title, index) => {
            if (currentHeight + 1.2 < heightBreak) {
              A4pages.push(`<div class="rh-table-header">${title}</div>`);
              currentHeight = currentHeight + 1.2;
            } else {
              A4pages.push(`</page>`);
              A4pages.push(`<div style="height:12px"></div>`);
              A4pages.push(`<page size="A4">`);
              currentHeight = 0;
              A4pages.push(`<div class="rh-table-header">${title}</div>`);
              currentHeight = currentHeight + 1.2;
            }
            if (currentHeight + 1 < heightBreak) {
              A4pages.push(`<div class="rh-title-row">
                <div class="rh-title-cell rh-name">Name</div>
                <div class="rh-title-cell rh-room">Room</div>
                <div class="rh-title-cell rh-arrival">Arrival</div>
                <div class="rh-title-cell rh-departure">Departure</div>
                <div class="rh-title-cell rh-notes">Notes</div>
                <div class="rh-title-cell rh-rate-code">Rate Code</div>
                <div class="rh-title-cell rh-vip-status end">Status</div>
              </div>`);
              currentHeight = currentHeight + 1;
            } else {
              A4pages.push(`</page>`);
              A4pages.push(`<div style="height:12px"></div>`);
              A4pages.push(`<page size="A4">`);
              currentHeight = 0;
              A4pages.push(`<div class="rh-title-row">
                <div class="rh-title-cell rh-name">Name</div>
                <div class="rh-title-cell rh-room">Room</div>
                <div class="rh-title-cell rh-arrival">Arrival</div>
                <div class="rh-title-cell rh-departure">Departure</div>
                <div class="rh-title-cell rh-notes">Notes</div>
                <div class="rh-title-cell rh-rate-code">Rate Code</div>
                <div class="rh-title-cell rh-vip-status end">Status</div>
              </div>`);
              currentHeight = currentHeight + 1;
            }
            if (title === "Arriving") {
              if(!arrVIP.length){
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`<div class="rh-row bottom"> No Arriving Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`<div class="rh-row top bottom"> No Arriving Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                }     
              } 
              arrVIP.map((vip) => {
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`
                    <div class="rh-row">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                      }</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`
                    <div class="rh-row top">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                      }</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                }
              });
            }
            if (title === "In House") {
              if(!inhVIP.length){
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`<div class="rh-row bottom"> No In-House Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`<div class="rh-row top bottom"> No In-House Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                }     
              } 
              inhVIP.map((vip) => {
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`
                    <div class="rh-row">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                      }</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`
                    <div class="rh-row top">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                      }</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                }
              });
            }
            if (title === "Departing") {              
              if(!outVIP.length){
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`<div class="rh-row bottom"> No Departing Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`<div class="rh-row top bottom"> No Departing Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                }     
              } 
              outVIP.map((vip) => {
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`
                    <div class="rh-row">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                      }</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`
                    <div class="rh-row top">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                      }</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                }
              });
            }
          });
          A4pages.push(`</page>`);
          return A4pages.join(" ");
        };

        const HTML = `
    <!DOCTYPE html>
    <head>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <style>
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        html,
        body {
          width: 210mm;
          height: 297mm;
        }
      }
      body {
        background: white;
        font-family:  Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif;
      }
      page[size="A4"] {
        background: white;
        width: 21cm;
        height: 29.7cm;
        display: block;
        padding: 0.5cm;
        padding-bottom: 0.5cm;
        margin: 0;
      }
      @media print {
        body,
        page[size="A4"] {
          padding: 0.4cm;
          padding-bottom: 0.5cm;
          margin: 0;
        }
      }
      .header{
        width:100%;
        display:flex;
        height: 100%;
        justify-content:space-between;
        padding: 24px 2px;
        height: 1.7cm;
      }
      .left-logo{
        height: 60px;
        font-weight: bold;
        width:140px;
        padding: 6px 18px;
        justify-content: center;
        align-items: center;
        align-content: center;
        justify-content:center;
        display:flex;
        border-radius: 8px;
      }
      .right-date{
        height: 25px;
        background-color:#16365c;
        color: white;
        font-weight: bold;
        width:86px;
        padding: 6px 18px;
        justify-content: center;
        align-items: center;
        align-content: center;
        justify-content:center;
        display:flex;
        border-radius: 8px;
  
      }
      .bottom{
        border-bottom: solid 1px #4a5d23 !important; 
      }
      .rh-table-title{
        width:100%;
        display:flex;
        height: 100%;
        justify-content:center;
        background-color:#16365c;
        color: white;
        justify-content: center;
        align-items: center;
        align-content: center;
        font-weight: bold; 
        height: 1.5cm;
        border-right: solid 1px #16365c;
        border-left: solid 1px #16365c;
        border-top: solid 1px #16365c;
      }
      .rh-table-header{
        width:100%;
        display:flex;
        height: 100%;
        justify-content:center;
        background-color:#c5d9f1;
        color: black;
        justify-content: center;
        align-items: center;
        align-content: center;
        font-weight: bold;
        border-right: solid 1px #16365c;
        border-left: solid 1px #16365c;
        border-bottom: solid 1px #16365c; 
        height: 1.2cm;
      }
      .rh-table{
        border-right: solid 1px #16365c;
        width:100%;
        display: flex;
        border-left: solid 1px #16365c;
        border-top: solid 1px #16365c;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        align-content: center;
      }
      .rh-row{
        width:100%;
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
        height: 1.5cm;
        font-size: 10px;
        border-left: solid 1px #16365c;
        border-right: solid 1px #16365c;
      }
      .rh-title-row{
        width:100%;
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
        background-color: #F6F6F6;
        height: 1cm;
        font-size: 12px;
        border-right: solid 1px #16365c;
        border-left: solid 1px #16365c;
      }
      .rh-title-cell{
        border-bottom: solid 1px #16365c;
        border-right: solid 1px #16365c;
        justify-content: center;
        align-items: center;
        align-content: center;
        display: flex;
        height:100%;
        text-align: center;
      }
      .rh-name{
        flex:2;
      }
      .rh-room{
        flex:1;
      }
      .rh-arrival{
        flex:1;
      }
      .rh-departure{
        flex:1;
      }
      .rh-notes{
        flex:3;
      }
      .rh-rate-code{
        flex:1;
      }
      .rh-vip-status{
        flex:1;
      }
      .rh-cell{
        border-bottom: solid 1px #16365c;
        border-right: solid 1px #16365c;
        justify-content: center;
        align-items: center;
        align-content: center;
        display: flex;
        height:100%;
        font-size:10px;
        text-align: center;
      }
      .top{
       border-top: solid 1px #16365c;
      }
      .end{
        border-right: none!important;
      }
  </style>
    </head>
<html>
<body>
  ${pageLoop(vipArr, vipInh, vipOut)} 
</body>
</html>`;
        await fs.appendFile(
          `/tmp/html-${accessToken}.html`,
          HTML,
          function (err: any) {
            if (err) throw reject({ url: null, success: false, error: err });
            console.log("Saved! HTML");
          }
        );

        const input = await PDFServicesSdk.FileRef.createFromLocalFile(
          `/tmp/html-${accessToken}.html`
        );
        htmlToPDFOperation.setInput(input);
        // Provide any custom configuration options for the operation.
        setCustomOptions(htmlToPDFOperation);

        // Execute the operation and Save the result to the specified location.
        await htmlToPDFOperation
          .execute(executionContext)
          .then(async (result: any) => {
            //await result.saveAsFile('createPDFFromHTMLWithInlineCSSOutput.pdf')
            //fs.createReadStream('createPDFFromHTMLWithInlineCSSOutput.pdf')
            await result.saveAsFile(`/tmp/VIP's Detailed - ${accessToken}.pdf`);

            const bucket = admin.storage().bucket();

            const options = {
              destination: `Thompson/RHVIP/RH VIP - ${accessToken}.pdf`,
              public: true,
              metadata: {
                contentType: "application/pdf",
                metadata: {
                  firebaseStorageDownloadTokens: accessToken,
                },
              },
            };
            const options2 = {
              destination: `Thompson/RHVIP/RH VIP - ${accessTokenHTML}.html`,
              public: true,
              metadata: {
                contentType: "html/txt",
                metadata: {
                  firebaseStorageDownloadTokens: accessTokenHTML,
                },
              },
            };
            await bucket.upload(`/tmp/html-${accessToken}.html`, options2);
            await bucket
              .upload(`/tmp/VIP's Detailed - ${accessToken}.pdf`, options)
              .then(async (data: any) => {
                //const file = data[0];
                //console.log('upload', file);
                console.log("uploaded");
                //resolve({success: true})
                //let file_name = `detailedVIPs/VIP's Detailed - ${accessToken}.pdf`;
                // const file = bucket.file(file_name);
                // const url = await file.getSignedUrl({
                //   version: "v4",
                //   action: "read",
                //   expires: Date.now() + 24 * 60 * 60 * 1000,
                // });
                const url = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/${replaceWhitespace(
                  options.destination
                )}?alt=media&token=${accessToken}`;

                //         return { url };
                return resolve({ url, success: true, error: null });
              })
              .catch((err: any) => {
                console.log("Error uploading to storage", err);
                reject(err);
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `Error uploading to storage: ${err}`
                );
              });
          })
          .catch((err: any) => {
            if (
              err instanceof PDFServicesSdk.Error.ServiceApiError ||
              err instanceof PDFServicesSdk.Error.ServiceUsageError
            ) {
              console.log(
                "Exception encountered while executing operation 1",
                err
              );
              return reject({ url: null, success: false, error: err });
            } else {
              console.log(
                "Exception encountered while executing operation 2",
                err
              );
              return reject({ url: null, success: false, error: err });
            }
          });
      } catch (err) {
        console.log("Exception encountered while executing operation 3", err);
        return reject({ url: null, success: false, error: err });
      }
    }
  );

  return _url;
});
//firebase deploy --only functions:createVIP_LAXTH
exports.createVIP_LAXTH = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const updateData: VIPClass = {};
    let x:
      | `firstName`
      | `lastName`
      | `rateCode`
      | `arrival`
      | `departure`
      | `image`
      | `fileName`
      | `vipStatus`
      | `roomStatus`
      | "roomNumber"
      | `notes`
      | `details`
      | `stays`
      | `reservationStatus`
      | `id`;
    const y: string = `VIP`;

    // firstName
    x = `firstName`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // lastName
    x = `lastName`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // rateCode
    x = `rateCode`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // arrival
    x = `arrival`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // departure
    x = `departure`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }

    x = `reservationStatus`;
    const arrDate: Date = unformatDate(`${updateData["arrival"]}`),
      depDate: Date = unformatDate(`${updateData["departure"]}`),
      todDate: Date = new Date(),
      a = dayOfYear(arrDate),
      d = dayOfYear(depDate),
      t = dayOfYear(todDate);
    updateData.reservationStatus =
      t < a
        ? `RESERVED`
        : t === a
        ? `DUEIN`
        : t > a && t === d
        ? `DUEOUT`
        : t > a && t < d
        ? `CHECKEDIN`
        : t > a && t > d
        ? `CHECKEDOUT`
        : `ERROR`;

    // image
    x = `image`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[
        x
      ] = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`;
    }
    // fileName
    x = `fileName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = `810-8105444_male-placeholder.png`;
    }
    // vipStatus
    x = `vipStatus`;
    if (!Array.isArray(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // roomStatus
    x = `roomStatus`;
    if (clientData[x] != undefined) {
      if (Array.isArray(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = [{ label: ``, id: `` }];
    }
    // roomNumber
    x = `roomNumber`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // notes
    x = `notes`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // details
    x = `details`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // stays
    x = `stays`;
    if (clientData[x] != undefined) {
      if (isValidNumber(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = 0;
    }
    // // reservationStatus
    // x = `reservationStatus`;
    // if (clientData[x] != undefined) {
    //   if (isValidString(clientData[x])) {
    //     updateData[x] = clientData[x];
    //   }
    // } else {
    //   updateData[x] = 'RESERVED';
    // }

    const _vip = new VIPClass(
      updateData.arrival, // arrival?: string,
      updateData.departure, // departure?: string,
      updateData.details, // details?: string,
      updateData.fileName, // fileName?: string
      updateData.firstName, // firstName?: string,
      null, // id?: string,
      updateData.image, // image?: string,
      updateData.lastName, // lastName?: string,
      updateData.notes, // notes?: string,
      updateData.rateCode, // rateCode?: string,
      updateData.reservationStatus, // reservationStatus?:'DUEIN'|'DUEOUT'|'CHECKEDIN'|'CHECKEDOUT'|'RESERVED'|'NOSHOW'|'CANCEL',
      updateData.roomNumber || null, // roomNumber?: string,
      updateData.roomStatus || [{ id: ``, label: `` }], // roomStatus?: [],
      updateData.vipStatus || [{ id: ``, label: `` }], // vipStatus?: [],
      updateData.stays || 0, // stays?:number,,
      "LAXTH" // stays?:number,
    );

    const completeVIP = { ..._vip };
    try {
      const ref = db.collection("LAXTH_VIPs").doc();
      const id = ref.id;
      completeVIP.id = id;
      await ref.set({ ...completeVIP });
      return {
        form: completeVIP,
        success: true,
        id,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || " error "}`
      );
    }
  }
);
//firebase deploy --only functions:updateVIP_LAXTH
exports.updateVIP_LAXTH = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const updateData: VIPClass = {};
    let x:
      | `firstName`
      | `lastName`
      | `rateCode`
      | `arrival`
      | `departure`
      | `image`
      | `fileName`
      | `vipStatus`
      | `roomStatus`
      | "roomNumber"
      | `notes`
      | `details`
      | `stays`
      | `reservationStatus`
      | `id`;
    const y: string = `VIP`;

    // firstName
    x = `firstName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // lastName
    x = `lastName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // rateCode
    x = `rateCode`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // arrival
    x = `arrival`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // departure
    x = `departure`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }

    // reservationStatus
    x = `reservationStatus`;
    if (
      clientData[`departure`] != undefined &&
      clientData[`arrival`] != undefined
    ) {
      const arrDate: Date = unformatDate(`${updateData["arrival"]}`),
        depDate: Date = unformatDate(`${updateData["departure"]}`),
        todDate: Date = new Date(),
        a = dayOfYear(arrDate),
        d = dayOfYear(depDate),
        t = dayOfYear(todDate);
      updateData.reservationStatus =
        t < a
          ? `RESERVED`
          : t === a
          ? `DUEIN`
          : t > a && t === d
          ? `DUEOUT`
          : t > a && t < d
          ? `CHECKEDIN`
          : t > a && t > d
          ? `CHECKEDOUT`
          : `ERROR`;
    }

    // image
    x = `image`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // fileName
    x = `fileName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // vipStatus
    x = `vipStatus`;
    if (clientData[x] != undefined) {
      if (!Array.isArray(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // roomStatus
    x = `roomStatus`;
    if (clientData[x] != undefined) {
      if (Array.isArray(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // roomNumber
    x = `roomNumber`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // notes
    x = `notes`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // details
    x = `details`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // stays
    x = `stays`;
    if (clientData[x] != undefined) {
      if (isValidNumber(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }

    // id
    x = `id`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }

    const updatedVIP = { ...updateData };
    try {
      const ref = db.collection("LAXTH_VIPs").doc(`${updatedVIP.id}`);
      await ref.set({ ...updatedVIP }, { merge: true });
      return {
        form: updatedVIP,
        success: true,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || ""}`
      );
    }
  }
);
//firebase deploy --only functions:deleteVIP_LAXTH
exports.deleteVIP_LAXTH = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const x = `id`;
    const y: string = `VIP`;
    const updateData: VIPClass = {};

    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    const filteredVIP: VIPClass = { ...updateData };

    const ref = db.collection("LAXTH_VIPs").doc(`${filteredVIP.id}`);
    const res = await ref.get();
    if (!res.exists) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "I couldn't find this VIP"
      );
    }
    try {
      await ref.delete();
      return {
        success: true,
        id: filteredVIP.id,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || ""}`
      );
    }
  }
);
//firebase deploy --only functions:onCreateVIP_LAXTH
exports.onCreateVIP_LAXTH = functions.firestore
  .document("LAXTH_VIPs/{id}")
  .onCreate(
    async (
      snap: FirebaseFirestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const _vip = snap.data() as VIPClass;
      const totalsUpdate: any = {};
      totalsUpdate["total"] = increment;
      totalsUpdate[`${_vip.reservationStatus}`] = increment;
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`inhouse`] = increment;
      }
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`arrivals+inhouse`] = increment;
      }

      const totalRef = db.collection("Totals").doc("LAXTH_VIPs");
      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (error: any) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${error?.message || error || ""}`
        );
      }
      return;
    }
  );
//firebase deploy --only functions:onUpdateVIP_LAXTH
exports.onUpdateVIP_LAXTH = functions.firestore
  .document("LAXTH_VIPs/{id}")
  .onUpdate(
    async (
      change: functions.Change<FirebaseFirestore.QueryDocumentSnapshot>,
      context: functions.EventContext
    ) => {
      const beforeCollection = change.before.data() as VIPClass;
      const afterCollection = change.after.data() as VIPClass;
      const totalsUpdate: any = {};
      if (
        beforeCollection.reservationStatus !== afterCollection.reservationStatus
      ) {
        totalsUpdate[`${beforeCollection.reservationStatus}`] = decrement;
        totalsUpdate[`${afterCollection.reservationStatus}`] = increment;
        const b4status = beforeCollection.reservationStatus;
        const afstatus = afterCollection.reservationStatus;
        if (
          b4status &&
          ["DUEOUT", "CHECKEDIN"].includes(b4status) &&
          afstatus &&
          !["DUEOUT", "CHECKEDIN"].includes(afstatus)
        ) {
          totalsUpdate[`inhouse`] = decrement;
        }
        if (
          afstatus &&
          ["DUEOUT", "CHECKEDIN"].includes(afstatus) &&
          b4status &&
          !["DUEOUT", "CHECKEDIN"].includes(b4status)
        ) {
          totalsUpdate[`inhouse`] = increment;
        }
        if (
          b4status &&
          ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(b4status) &&
          afstatus &&
          !["DUEOUT", "CHECKEDIN", "DUEIN"].includes(afstatus)
        ) {
          totalsUpdate[`arrivals+inhouse`] = decrement;
        }
        if (
          afstatus &&
          ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(afstatus) &&
          b4status &&
          !["DUEOUT", "CHECKEDIN", "DUEIN"].includes(b4status)
        ) {
          totalsUpdate[`arrivals+inhouse`] = increment;
        }
      }
      const totalRef = db.collection("Totals").doc("LAXTH_VIPs");
      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (e) {
        console.log("Error updating totals");
        console.log(e);
      }
      return;
    }
  );
//firebase deploy --only functions:onDeleteVIP_LAXTH
exports.onDeleteVIP_LAXTH = functions.firestore
  .document("LAXTH_VIPs/{id}")
  .onDelete(
    async (
      snap: FirebaseFirestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const totalsUpdate: any = {};
      totalsUpdate["total"] = decrement;
      const totalRef = db.collection("Totals").doc("LAXTH_VIPs");
      const _vip = snap.data() as VIPClass;

      totalsUpdate[`${_vip.reservationStatus}`] = decrement;
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`inhouse`] = decrement;
      }
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`arrivals+inhouse`] = decrement;
      }
      //archive the vip
      //to keep up with stays and id

      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (error: any) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${error?.message || error || ""}`
        );
      }
      return;
    }
  );
  //firebase deploy --only functions:onCreateForecasts_LAXTH
  exports.onCreateForecasts_LAXTH = functions.firestore
    .document("LAXTH_Forecasts/{id}")
    .onCreate(
      async (
        snap: FirebaseFirestore.QueryDocumentSnapshot,
        context: functions.EventContext
      ) => {
        const totalsUpdate: any = {};
        totalsUpdate["total"] = increment;
        const totalRef = db.collection("Totals").doc("LAXTH_Forecasts");
        try {
          await totalRef.set(totalsUpdate, { merge: true });
        } catch (error: any) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            `${error?.message || error || ""}`
          );
        }
        return;
      }
    );
  //firebase deploy --only functions:onDeleteForecasts_LAXTH
  exports.onDeleteForecasts_LAXTH = functions.firestore
    .document("LAXTH_Forecasts/{id}")
    .onDelete(
      async (
        snap: FirebaseFirestore.QueryDocumentSnapshot,
        context: functions.EventContext
      ) => {
        const totalsUpdate: any = {};
        totalsUpdate["total"] = decrement;
        const totalRef = db.collection("Totals").doc("LAXTH_Forecasts");
        try {
          await totalRef.set(totalsUpdate, { merge: true });
        } catch (error: any) {
          throw new functions.https.HttpsError(
            "failed-precondition",
            `${error?.message || error || ""}`
          );
        }
        return;
      }
    );




//**    LAXTE     **//
//firebase deploy --only functions:exportAdobeDetailedVip_LAXTE
exports.exportAdobeDetailedVip_LAXTE = functions.https.onCall(async () => {
  const _url = await new Promise<{ url: any; success: boolean; error: any }>(
    async (resolve, reject) => {
      const accessToken = uuid.v4();
      const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
      /* Get VIP Arrivals. */
      const db = admin.firestore();
      const vipRef = db
        .collection(`LAXTE_VIPs`)
        .where("reservationStatus", "in", ["DUEIN", "CHECKEDIN", "DUEOUT"]);
      const vipSnapshot = await vipRef.get();
      const vipData: VIPClass[] = [],
        vipArr: VIPClass[] = [],
        vipInh: VIPClass[] = [];
      !vipSnapshot.empty &&
        vipSnapshot.forEach((doc) => {
          const docData: VIPClass = doc.data();
          vipData.push(docData),
            docData.reservationStatus === "DUEIN" && vipArr.push(docData),
            (docData.reservationStatus === "CHECKEDIN" ||
              docData.reservationStatus === "DUEOUT") &&
              vipInh.push(docData);
        });
      /**
       * Sets any custom options for the operation.
       *
       * @param htmlToPDFOperation operation instance for which the options are provided.
       */
      const setCustomOptions = (htmlToPDFOperation: any) => {
        // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
        const pageLayout =
          new PDFServicesSdk.CreatePDF.options.html.PageLayout();
        pageLayout.setPageSize(20, 25);

        // Set the desired HTML-to-PDF conversion options.
        const htmlToPdfOptions =
          new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
            .includesHeaderFooter(true)
            .withPageLayout(pageLayout)
            .build();
        htmlToPDFOperation.setOptions(htmlToPdfOptions);
      };
      try {
        // Initial setup, create credentials instance.
        const credentials =
          await PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
            .fromFile("pdfservices-api-credentials.json")
            .build();
        // Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext =
            PDFServicesSdk.ExecutionContext.create(credentials),
          htmlToPDFOperation = PDFServicesSdk.CreatePDF.Operation.createNew();
        // Set operation input from a source file.
        const _header = (pageNumber: number, title:string) => `<div class="header">
        <div class="header-center">
          <span class="header-page-number">${`${pageNumber}`}</span>
            <span class="header-page-title"> ${title} - ${formatDate(
              new Date(),
              " EEE dd MMM"
            )}</span>           
          </div> 
        </div>`;
        const _card = (vip: VIPClass) => `<div class="vip-card">
        <style>
          .vip-image-${vip?.id} {
            background-image: url(${
              vip?.image ||
              `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`
            });
            background-repeat:no-repeat;
            background-position: center center;
            background-size: cover;
          }
        </style>            
        <div class="image vip-image-${vip?.id}"></div>
          <div class="vip-label">
            <span class="vip-name">${`${vip?.lastName}, ${vip?.firstName}`}</span>
            <span class="name-dash"> - </span>
            <span class="vip-status${
              Boolean(vip?.vipStatus && vip?.vipStatus.length)
                ? ` ${vip?.vipStatus ? vip?.vipStatus[0].label : ``}`
                : ``
            }">${`${vip?.vipStatus ? vip?.vipStatus[0].label : ``}`}</span>
          </div>  
          <div class="top-line"></div>
          <div class="vip-details"> 
            <div class="vip-notes">${vip?.notes || "No Notes"}</div>
          </div>
          <div class="bottom-line"></div>
          <div class="arrival-departure">
            <span class="vip-arrival">${vip?.arrival}</span>
            <span> - </span>
            <span class="vip-departure">${vip?.departure}</span>
          </div>
          <div class="vip-stays">Stays: ${(vip.stays===0)?`0`:(vip.stays||`N/A`)}</div>
          <div class="vip-room">RM: ${vip.roomNumber || `TBD`}</div>
        </div>`;
        const pageLoop = (_vipData: VIPClass[]): string => {
          const A4pages: string[] = [],
            totalArrVips: number = vipArr.length,
            totalInhVips: number = vipInh.length;
          let pageNumber = 1;
          vipArr.forEach((vip, index) => {
            let nIndex = index + 1;
            !(nIndex % 2 == 0) &&
              (A4pages.push(`<page size="A4">`),
              A4pages.push(_header(pageNumber, 'VIP Arrivals')),
              pageNumber++);
            A4pages.push(_card(vip));
            !(nIndex % 2 == 0) &&
              totalArrVips === nIndex &&
              A4pages.push(`</page>`);
            nIndex % 2 == 0 && A4pages.push(`</page>`);
          });
          vipInh.forEach((vip, index) => {
            let nIndex = index + 1;
            !(nIndex % 2 == 0) &&
              (A4pages.push(`<page size="A4">`),
              A4pages.push(_header(pageNumber, 'VIP In-house')),
              pageNumber++);
            A4pages.push(_card(vip));
            !(nIndex % 2 == 0) &&
              totalInhVips === nIndex &&
              A4pages.push(`</page>`);
            nIndex % 2 == 0 && A4pages.push(`</page>`);
          });
          return A4pages.join(" ");
        };
        const color = `#4a5d23`;
        const HTML = `<!DOCTYPE html>
          <head>
            <meta httpEquiv="x-ua-compatible" content="ie=edge" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              @media print {
                html,
                body {
                  width: 210mm;
                  height: 297mm;
                }
              }
              body {
                background: white;
                font-family: Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif;
              }
              page[size="A4"] {
                background: white;
                width: 21cm;
                height: 29.7cm;
                display: block;
                margin: 0 auto;
                margin-bottom: 0.5cm;
              }
              @media print {
                body,
                page[size="A4"] {
                  margin: 0;
                  box-shadow: 0;
                }
              }
              .vip-card {
                width: 100%;
                display: flex;
                justify-content: center;
                align-content: center;
                align-items: center;
                height: 10cm;
                flex-direction: column;
                margin-top: 1cm;
                text-align: center;
              }
              .image {
                height: 200px;
                width: 200px;
                border: solid 10px ${color};
                overflow: hidden;
                border-radius: 100%;
                margin-bottom: 12px;
              }
              .top-line {
                height: 1px;
                background-color: ${color};
                width: 65%;
                margin-bottom: 6px;
              }
              .bottom-line {
                height: 1px;
                background-color: ${color};
                width: 65%;
                margin-top: 6px;
                margin-bottom: 6px;
              }
              .vip-label {
                color: black;
                text-align: center;
                margin-bottom: 6px;
              }
              .vip-notes {
                color: ${color};
                font-size: 14px;
                text-align: center;
                font-style: italic;
              }
              .vip-details {
                color: ${color};
                width: 50%;
                text-align: center;
              }
              .vip-location {
                color: ${color}
                font-size: 14px;
                text-align: center;
                font-weight: bold;
                font-style: italic;
                text-align: center;
              }
              .arrival-departure {
                font-size: 12px;
                text-align: center;
                margin-bottom: 2px;
              }
              .arrival-departure {
                font-size: 12px;
                text-align: center;
              }
              .vip-stays {
                font-size: 12px;
                text-align: center;
              }
              .vip-room {
                font-size: 11px;
                text-transform: uppercase;
                text-align: center;
              }
              .arrival-departure {
                font-size: 12px;
                text-align: center;
              }
              .vip-status {
                font-weight: bold;
                text-transform: uppercase;
                font-size: 14px;
              }
              .GLOB {
                color: #2f75b5;
              }
              .LGLO {
                color: #2f75b5;
              }
              .V2 {
                color: #90cb80;
              }
              .V3 {
                color: #ffdf7f;
              }
              .V6 {
                color: #588dca;
              }
              .MP {
                color: #90cb80;
              }
              .header-page-title {
                color: black;
              }
              .vip-name {
                color: black;
                font-weight: bold;
                font-size: 14px;
              }
              .header-page-number {
                color: white;
                font-weight: bold;
                background-color: ${color};
                height: 32px;
                width: 72px;
                display: flex;
                justify-content: center;
                text-align: center;
                align-content: center;
                align-items: center;
                margin-right: 8px;
                padding-left: 8px;
              }
              .header {
                font-size: 22px;
                height: 2cm;
                width: 100%;
                display: flex;
                justify-content: left;
                text-align: center;
                align-content: center;
                align-items: center;
                padding-top: 24px;
              }
              .header-center {
                width: 100%;
                display: flex;
                justify-content: left;
                text-align: center;
                align-content: center;
                align-items: center;
              }
            </style>
          </head>
          <html>
            <body>
              ${pageLoop(vipData)}
            </body>
          </html>`;

        await fs.appendFile(
          `/tmp/html-${accessToken}.html`,
          HTML,
          function (err: any) {
            if (err) throw reject({ url: null, success: false, error: err });
            console.log("Saved! HTML");
          }
        );

        const input = await PDFServicesSdk.FileRef.createFromLocalFile(
          `/tmp/html-${accessToken}.html`
        );
        htmlToPDFOperation.setInput(input);
        // Provide any custom configuration options for the operation.
        setCustomOptions(htmlToPDFOperation);

        // Execute the operation and Save the result to the specified location.
        await htmlToPDFOperation
          .execute(executionContext)
          .then(async (result: any) => {
            //await result.saveAsFile('createPDFFromHTMLWithInlineCSSOutput.pdf')
            //fs.createReadStream('createPDFFromHTMLWithInlineCSSOutput.pdf')
            await result.saveAsFile(`/tmp/VIP's Detailed - ${accessToken}.pdf`);

            const bucket = admin.storage().bucket();

            const options = {
              destination: `tommie/detailedVIPs/VIP's Detailed - ${accessToken}.pdf`,
              public: true,
              metadata: {
                contentType: "application/pdf",
                metadata: {
                  firebaseStorageDownloadTokens: accessToken,
                },
              },
            };
            await bucket
              .upload(`/tmp/VIP's Detailed - ${accessToken}.pdf`, options)
              .then(async (data: any) => {
                console.log("uploaded");
                const url = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/${replaceWhitespace(
                  options.destination
                )}?alt=media&token=${accessToken}`;
                return resolve({ url, success: true, error: null });
              })
              .catch((err: any) => {
                console.log("Error uploading to storage", err);
                reject(err);
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `Error uploading to storage: ${err}`
                );
              });
          })
          .catch((err: any) => {
            if (
              err instanceof PDFServicesSdk.Error.ServiceApiError ||
              err instanceof PDFServicesSdk.Error.ServiceUsageError
            ) {
              console.log(
                "Exception encountered while executing operation 1",
                err
              );
              return reject({ url: null, success: false, error: err });
            } else {
              console.log(
                "Exception encountered while executing operation 2",
                err
              );
              return reject({ url: null, success: false, error: err });
            }
          });
      } catch (err) {
        console.log("Exception encountered while executing operation 3", err);
        return reject({ url: null, success: false, error: err });
      }
    }
  );
  return _url;
});
//firebase deploy --only functions:updateVIPs_LAXTE
exports.updateVIPs_LAXTE = functions.https.onCall(async () => {
  //const accessTokenHTML = uuid.v4();
  const x = "reservationStatus";
  const y = ["DUEIN", "CHECKEDIN", "DUEOUT", "RESERVED"];
  const db = admin.firestore();
  const batch = db.batch();
  const vipRef = db.collection(`LAXTE_VIPs`);
  const vipSnapshot = await vipRef.where(x, "in", y).get();
  const vipChanges: VIPClass[] = [];
  if (!vipSnapshot.empty) {
    vipSnapshot.forEach((doc) => {
      const vip: VIPClass = doc.data(),
        vipDuplicate = { ...vip },
        arrDate: Date = unformatDate(`${vip["arrival"]}`),
        depDate: Date = unformatDate(`${vip["departure"]}`),
        todDate: Date = new Date(),
        a = dayOfYear(arrDate),
        d = dayOfYear(depDate),
        t = dayOfYear(todDate);
      vipDuplicate[x] =
        t < a
          ? `RESERVED`
          : t === a
          ? `DUEIN`
          : t > a && t === d
          ? `DUEOUT`
          : t > a && t < d
          ? `CHECKEDIN`
          : t > a && t > d
          ? `CHECKEDOUT`
          : `ERROR`;
      //compare with orginal and see if change
      if (vipDuplicate[x] !== vip[x]) {
        vipChanges.push(vipDuplicate);
        batch.set(
          vipRef.doc(`${vipDuplicate.id}`),
          { [x]: vipDuplicate[x] },
          { merge: true }
        );
      }
    });
  }
  try {
    batch.commit();
    return {
      //form: completeVIP,
      success: true,
      //id,
    };
  } catch (error: any) {
    console.log(`${error.message || error || "Error: updating vips"}`);
    throw new functions.https.HttpsError(
      "unimplemented",
      `${error.message || error || "Error: updating vips"}`
    );
  }
});
//firebase deploy --only functions:exportAdobeRHVip_LAXTE
exports.exportAdobeRHVip_LAXTE = functions.https.onCall(async () => {
  const _url = await new Promise<{ url: any; success: boolean; error: any }>(
    async (resolve, reject) => {
      const accessToken = uuid.v4();
      const accessTokenHTML = uuid.v4();
      const PDFServicesSdk = require("@adobe/pdfservices-node-sdk");
      /**
       * Get VIP Arrivals.
       */
      const db = admin.firestore();
      const vipRef = db
        .collection(`LAXTE_VIPs`)
        .where("reservationStatus", "in", ["DUEIN", "CHECKEDIN", "DUEOUT"]);
      const vipSnapshot = await vipRef.get();
      const vipData: VIPClass[] = [],
        vipArr: VIPClass[] = [],
        vipInh: VIPClass[] = [],
        vipOut: VIPClass[] = [];
      if (!vipSnapshot.empty) {
        vipSnapshot.forEach((doc) => {
          const docData: VIPClass = doc.data();

          vipData.push(docData);

          if (docData.reservationStatus === "DUEIN") {
            vipArr.push(docData);
          }
          if (
            docData.reservationStatus === "CHECKEDIN" ||
            docData.reservationStatus === "DUEOUT"
          ) {
            vipInh.push(docData);
          }
          if (docData.reservationStatus === "DUEOUT") {
            vipOut.push(docData);
          }
        });
      }

      /**
       * This sample illustrates how to create a PDF file from a HTML file with inline CSS.
       * <p>
       * Refer to README.md for instructions on how to run the samples.
       */

      /**
       * Sets any custom options for the operation.
       *
       * @param htmlToPDFOperation operation instance for which the options are provided.
       */
      const setCustomOptions = (htmlToPDFOperation: any) => {
        // Define the page layout, in this case an 8 x 11.5 inch page (effectively portrait orientation).
        const pageLayout =
          new PDFServicesSdk.CreatePDF.options.html.PageLayout();
        pageLayout.setPageSize(20, 25);

        // Set the desired HTML-to-PDF conversion options.
        const htmlToPdfOptions =
          new PDFServicesSdk.CreatePDF.options.html.CreatePDFFromHtmlOptions.Builder()
            .includesHeaderFooter(true)
            .withPageLayout(pageLayout)
            .build();
        htmlToPDFOperation.setOptions(htmlToPdfOptions);
      };
      try {
        // Initial setup, create credentials instance.
        const credentials =
          await PDFServicesSdk.Credentials.serviceAccountCredentialsBuilder()
            .fromFile("pdfservices-api-credentials.json")
            .build();
        // Create an ExecutionContext using credentials and create a new operation instance.
        const executionContext =
            PDFServicesSdk.ExecutionContext.create(credentials),
          htmlToPDFOperation = PDFServicesSdk.CreatePDF.Operation.createNew();
        // Set operation input from a source file.
        // const A4pages: string[] = [];
        // //const totalVips: number = _vipData.length;
        // const totalArrVips: number = vipArr.length;
        // const totalInhVips: number = vipInh.length;

        const pageLoop = (
          arrVIP: VIPClass[],
          inhVIP: VIPClass[],
          outVIP: VIPClass[]
        ): string => {
          const A4pages: string[] = [];
          //const totalArrVIPs: number = arrVIP.length;
          //const totalInhVIPs: number = inhVIP.length;
          //const totalOutVIPs: number = outVIP.length;
          const tables: string[] = ["Arriving", "In House", "Departing"];

          let currentHeight = 0;
          let heightBreak = 28;
          //let page = 1;

          A4pages.push(`<page size="A4">`);
          A4pages.push(`<div class="header">`);          
          A4pages.push(`<div class="left-logo">
          <svg height='25px' id="Layer_2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 226.44 62.31">
          <g id="Layer_15">
            <path
              d="M0,0H7.83l-.16,13.53,10.69,.03v6.82H7.85l.02,34.12,6.99,.03v6.79h-5.47c-5.43,.39-8.54-2.36-9.38-8.2V0"
            />
            <path
              d="M31.47,21.97v31.68c0,11.48,21.8,11.48,21.8,0V21.97c0-12.5-21.8-12.5-21.8,0Zm7.87,32.5V20.37h6.15l.02,34.1h-6.17Z"
            />
            <path
              d="M70.82,13.57h34.06c2.7,.04,4.32,1.35,4.39,4.53V61.29h-6.97V19.56l-8.59,.11V61.29h-7.1V19.51l-8.63,.03V61.29h-7.14V13.57Z"
            />
            <path
              d="M126.12,13.57h34.06c2.7,.04,4.32,1.35,4.39,4.53V61.29h-6.97V19.56l-8.59,.11V61.29h-7.1V19.51l-8.63,.03V61.29h-7.14V13.57Z"
            />
            <rect x="182" y="13.57" width="7.87" height="47.72" />
            <rect x="182" y=".06" width="7.87" height="7.32" />
            <path
              d="M226.44,39.95V20.27c0-10.42-21.16-10.42-21.16,0V53.73c0,11.45,21.16,11.45,21.16,0v-5.48h-7.94v6.23h-6.12v-14.54h14.06Zm-14.06-19.67h6.99l.08,13.01h-7.08v-13.01Z"
            />
          </g>
        </svg>
          </div>`);
          A4pages.push(`<div class="right-date">${formatDate(
            new Date(),
            " EEE dd MMM"
          )}</div>`);
          A4pages.push(`</div>`);
          currentHeight = currentHeight + 1.7;
          A4pages.push(`<div class="rh-table-title">VIP List</div>`);
          currentHeight = currentHeight + 1.5;
          tables.map((title, index) => {
            if (currentHeight + 1.2 < heightBreak) {
              A4pages.push(`<div class="rh-table-header">${title}</div>`);
              currentHeight = currentHeight + 1.2;
            } else {
              A4pages.push(`</page>`);
              A4pages.push(`<div style="height:12px"></div>`);
              A4pages.push(`<page size="A4">`);
              currentHeight = 0;
              A4pages.push(`<div class="rh-table-header">${title}</div>`);
              currentHeight = currentHeight + 1.2;
            }
            if (currentHeight + 1 < heightBreak) {
              A4pages.push(`<div class="rh-title-row">
                <div class="rh-title-cell rh-name">Name</div>
                <div class="rh-title-cell rh-room">Room</div>
                <div class="rh-title-cell rh-arrival">Arrival</div>
                <div class="rh-title-cell rh-departure">Departure</div>
                <div class="rh-title-cell rh-notes">Notes</div>
                <div class="rh-title-cell rh-rate-code">Rate Code</div>
                <div class="rh-title-cell rh-vip-status end">Status</div>
              </div>`);
              currentHeight = currentHeight + 1;
            } else {
              A4pages.push(`</page>`);
              A4pages.push(`<div style="height:12px"></div>`);
              A4pages.push(`<page size="A4">`);
              currentHeight = 0;
              A4pages.push(`<div class="rh-title-row">
                <div class="rh-title-cell rh-name">Name</div>
                <div class="rh-title-cell rh-room">Room</div>
                <div class="rh-title-cell rh-arrival">Arrival</div>
                <div class="rh-title-cell rh-departure">Departure</div>
                <div class="rh-title-cell rh-notes">Notes</div>
                <div class="rh-title-cell rh-rate-code">Rate Code</div>
                <div class="rh-title-cell rh-vip-status end">Status</div>
              </div>`);
              currentHeight = currentHeight + 1;
            }
            if (title === "Arriving") {
              if(!arrVIP.length){
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`<div class="rh-row bottom"> No Arriving Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`<div class="rh-row top bottom"> No Arriving Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                }     
              } 
              arrVIP.map((vip) => {
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`
                    <div class="rh-row">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                      }</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`
                    <div class="rh-row top">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${`${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                  }`}</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                }
              });
            }
            if (title === "In House") {
              if(!inhVIP.length){
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`<div class="rh-row bottom"> No In-House Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`<div class="rh-row top bottom"> No In-House Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                }     
              } 
              inhVIP.map((vip) => {
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`
                    <div class="rh-row">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                      }</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`
                    <div class="rh-row top">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${`${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                  }`}</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                }
              });
            }
            if (title === "Departing") {
              if(!outVIP.length){
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`<div class="rh-row bottom"> No Departing Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`<div class="rh-row top bottom"> No Departing Vip's </div>`);
                  currentHeight = currentHeight + 1.5;
                }     
              } 
              outVIP.map((vip) => {
                if (currentHeight + 1.5 < heightBreak) {
                  A4pages.push(`
                    <div class="rh-row">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                      }</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                } else {
                  A4pages.push(`</page>`);
                  A4pages.push(`<div style="height:12px"></div>`);
                  A4pages.push(`<page size="A4">`);
                  currentHeight = 0;
                  A4pages.push(`
                    <div class="rh-row top">
                      <div class="rh-cell rh-name">${`${vip?.lastName}, ${vip?.firstName}`}</div>
                      <div class="rh-cell rh-room">${
                        vip?.roomNumber || "TBD"
                      }</div>
                      <div class="rh-cell rh-arrival">${
                        vip?.arrival || `N/A`
                      }</div>
                      <div class="rh-cell rh-departure">${
                        vip?.departure || `N/A`
                      }</div>
                      <div class="rh-cell rh-notes">${
                        vip?.notes || `No Notes`
                      }</div>
                      <div class="rh-cell rh-rate-code">${
                        vip?.rateCode || `N/A`
                      }</div>
                      <div class="rh-cell rh-vip-status end ${vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`}">${`${
                        getIcon(vip?.vipStatus ? vip?.vipStatus[0].label : `N/A`)
                  }`}</div>
                    </div>
                  `);
                  currentHeight = currentHeight + 1.5;
                }
              });
            }
          });
          A4pages.push(`</page>`);
          return A4pages.join(" ");
        };

        const HTML = `
    <!DOCTYPE html>
    <head>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <style>
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        html,
        body {
          width: 210mm;
          height: 297mm;
        }
      }
      body {
        background: white;
        font-family:  Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif;
      }
      page[size="A4"] {
        background: white;
        width: 21cm;
        height: 29.7cm;
        display: block;
        padding: 0.5cm;
        padding-bottom: 0.5cm;
        margin: 0;
      }
      @media print {
        body,
        page[size="A4"] {
          padding: 0.4cm;
          padding-bottom: 0.5cm;
          margin: 0;
        }
      }
      .header{
        width:100%;
        display:flex;
        height: 100%;
        justify-content:space-between;
        padding: 24px 2px;
        height: 1.7cm;
      }
      .left-logo{
        height: 60px;
        font-weight: bold;
        width:140px;
        padding: 6px 18px;
        justify-content: center;
        align-items: center;
        align-content: center;
        justify-content:center;
        display:flex;
        border-radius: 8px;
      }
      .right-date{
        height: 25px;
        background-color:#4a5d23;
        color: white;
        font-weight: bold;
        width:86px;
        padding: 6px 18px;
        justify-content: center;
        align-items: center;
        align-content: center;
        justify-content:center;
        display:flex;
        border-radius: 8px;
        /* flex:1; */
  
      }
      .bottom{
        border-bottom: solid 1px #4a5d23 !important; 
      }
      .rh-table-title{
        width:100%;
        display:flex;
        height: 100%;
        justify-content:center;
        background-color:#4a5d23;
        color: white;
        justify-content: center;
        align-items: center;
        align-content: center;
        font-weight: bold; 
        height: 1.5cm;
        border-right: solid 1px #4a5d23;
        border-left: solid 1px #4a5d23;
        border-top: solid 1px #4a5d23;
      }
      .rh-table-header{
        width:100%;
        display:flex;
        height: 100%;
        justify-content:center;
        /* margin: 36px; 
        min-height: 34px;*/
        background-color:#a9ba9d;
        color: black;
        justify-content: center;
        align-items: center;
        align-content: center;
        font-weight: bold;
        border-right: solid 1px #4a5d23;
        border-left: solid 1px #4a5d23;
        border-bottom: solid 1px #4a5d23; 
        height: 1.2cm;
      }
      .rh-table{
        border-right: solid 1px #4a5d23;
        width:100%;
        display: flex;
        border-left: solid 1px #4a5d23;
        border-top: solid 1px #4a5d23;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        align-content: center;
      }
      .rh-row{
        width:100%;
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
        height: 1.5cm;
        font-size: 10px;
        border-left: solid 1px #4a5d23;
        border-right: solid 1px #4a5d23;
      }
      .rh-title-row{
        width:100%;
        display: flex;
        justify-content: center;
        align-items: center;
        align-content: center;
        background-color: #F6F6F6;
        height: 1cm;
        font-size: 12px;
        border-right: solid 1px #4a5d23;
        border-left: solid 1px #4a5d23;
      }
      .rh-title-cell{
        border-bottom: solid 1px #4a5d23;
        border-right: solid 1px #4a5d23;
        justify-content: center;
        align-items: center;
        align-content: center;
        display: flex;
        height:100%;
        text-align: center;
      }
      .rh-name{
        flex:2;
      }
      .rh-room{
        flex:1;
      }
      .rh-arrival{
        flex:1;
      }
      .rh-departure{
        flex:1;
      }
      .rh-notes{
        flex:3;
      }
      .rh-rate-code{
        flex:1;
      }
      .rh-vip-status{
        flex:1;
      }
      .rh-cell{
        border-bottom: solid 1px #4a5d23;
        border-right: solid 1px #4a5d23;
        justify-content: center;
        align-items: center;
        align-content: center;
        display: flex;
        height:100%;
        font-size:10px;
        text-align: center;
      }
      .top{
       border-top: solid 1px #4a5d23;
      }
      .end{
        border-right: none!important;
      }
  </style>
    </head>
<html>
<body>
  ${pageLoop(vipArr, vipInh, vipOut)} 
</body>
</html>`;
        await fs.appendFile(
          `/tmp/html-${accessToken}.html`,
          HTML,
          function (err: any) {
            if (err) throw reject({ url: null, success: false, error: err });
            console.log("Saved! HTML");
          }
        );

        const input = await PDFServicesSdk.FileRef.createFromLocalFile(
          `/tmp/html-${accessToken}.html`
        );
        htmlToPDFOperation.setInput(input);
        // Provide any custom configuration options for the operation.
        setCustomOptions(htmlToPDFOperation);

        // Execute the operation and Save the result to the specified location.
        await htmlToPDFOperation
          .execute(executionContext)
          .then(async (result: any) => {
            //await result.saveAsFile('createPDFFromHTMLWithInlineCSSOutput.pdf')
            //fs.createReadStream('createPDFFromHTMLWithInlineCSSOutput.pdf')
            await result.saveAsFile(`/tmp/VIP's Detailed - ${accessToken}.pdf`);

            const bucket = admin.storage().bucket();

            const options = {
              destination: `Thompson/RHVIP/RH VIP - ${accessToken}.pdf`,
              public: true,
              metadata: {
                contentType: "application/pdf",
                metadata: {
                  firebaseStorageDownloadTokens: accessToken,
                },
              },
            };
            const options2 = {
              destination: `Thompson/RHVIP/RH VIP - ${accessTokenHTML}.html`,
              public: true,
              metadata: {
                contentType: "html/txt",
                metadata: {
                  firebaseStorageDownloadTokens: accessTokenHTML,
                },
              },
            };
            await bucket.upload(`/tmp/html-${accessToken}.html`, options2);
            await bucket
              .upload(`/tmp/VIP's Detailed - ${accessToken}.pdf`, options)
              .then(async (data: any) => {
                //const file = data[0];
                //console.log('upload', file);
                console.log("uploaded");
                //resolve({success: true})
                //let file_name = `detailedVIPs/VIP's Detailed - ${accessToken}.pdf`;
                // const file = bucket.file(file_name);
                // const url = await file.getSignedUrl({
                //   version: "v4",
                //   action: "read",
                //   expires: Date.now() + 24 * 60 * 60 * 1000,
                // });
                const url = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/${replaceWhitespace(
                  options.destination
                )}?alt=media&token=${accessToken}`;

                //         return { url };
                return resolve({ url, success: true, error: null });
              })
              .catch((err: any) => {
                console.log("Error uploading to storage", err);
                reject(err);
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `Error uploading to storage: ${err}`
                );
              });
          })
          .catch((err: any) => {
            if (
              err instanceof PDFServicesSdk.Error.ServiceApiError ||
              err instanceof PDFServicesSdk.Error.ServiceUsageError
            ) {
              console.log(
                "Exception encountered while executing operation 1",
                err
              );
              return reject({ url: null, success: false, error: err });
            } else {
              console.log(
                "Exception encountered while executing operation 2",
                err
              );
              return reject({ url: null, success: false, error: err });
            }
          });
      } catch (err) {
        console.log("Exception encountered while executing operation 3", err);
        return reject({ url: null, success: false, error: err });
      }
    }
  );

  return _url;
});
//firebase deploy --only functions:createVIP_LAXTE
exports.createVIP_LAXTE = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const updateData: VIPClass = {};
    let x:
      | `firstName`
      | `lastName`
      | `rateCode`
      | `arrival`
      | `departure`
      | `image`
      | `fileName`
      | `vipStatus`
      | `roomStatus`
      | "roomNumber"
      | `notes`
      | `details`
      | `stays`
      | `reservationStatus`
      | `id`;
    const y: string = `VIP`;

    // firstName
    x = `firstName`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // lastName
    x = `lastName`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // rateCode
    x = `rateCode`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // arrival
    x = `arrival`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // departure
    x = `departure`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }

    x = `reservationStatus`;
    const arrDate: Date = unformatDate(`${updateData["arrival"]}`),
      depDate: Date = unformatDate(`${updateData["departure"]}`),
      todDate: Date = new Date(),
      a = dayOfYear(arrDate),
      d = dayOfYear(depDate),
      t = dayOfYear(todDate);
    updateData.reservationStatus =
      t < a
        ? `RESERVED`
        : t === a
        ? `DUEIN`
        : t > a && t === d
        ? `DUEOUT`
        : t > a && t < d
        ? `CHECKEDIN`
        : t > a && t > d
        ? `CHECKEDOUT`
        : `ERROR`;

    // image
    x = `image`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[
        x
      ] = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`;
    }
    // fileName
    x = `fileName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = `810-8105444_male-placeholder.png`;
    }
    // vipStatus
    x = `vipStatus`;
    if (!Array.isArray(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    // roomStatus
    x = `roomStatus`;
    if (clientData[x] != undefined) {
      if (Array.isArray(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = [{ label: ``, id: `` }];
    }
    // roomNumber
    x = `roomNumber`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // notes
    x = `notes`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // details
    x = `details`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = null;
    }
    // stays
    x = `stays`;
    if (clientData[x] != undefined) {
      if (isValidNumber(clientData[x])) {
        updateData[x] = clientData[x];
      }
    } else {
      updateData[x] = 0;
    }
    // // reservationStatus
    // x = `reservationStatus`;
    // if (clientData[x] != undefined) {
    //   if (isValidString(clientData[x])) {
    //     updateData[x] = clientData[x];
    //   }
    // } else {
    //   updateData[x] = 'RESERVED';
    // }

    const _vip = new VIPClass(
      updateData.arrival, // arrival?: string,
      updateData.departure, // departure?: string,
      updateData.details, // details?: string,
      updateData.fileName, // fileName?: string
      updateData.firstName, // firstName?: string,
      null, // id?: string,
      updateData.image, // image?: string,
      updateData.lastName, // lastName?: string,
      updateData.notes, // notes?: string,
      updateData.rateCode, // rateCode?: string,
      updateData.reservationStatus, // reservationStatus?:'DUEIN'|'DUEOUT'|'CHECKEDIN'|'CHECKEDOUT'|'RESERVED'|'NOSHOW'|'CANCEL',
      updateData.roomNumber || null, // roomNumber?: string,
      updateData.roomStatus || [{ id: ``, label: `` }], // roomStatus?: [],
      updateData.vipStatus || [{ id: ``, label: `` }], // vipStatus?: [],
      updateData.stays || 0, // stays?:number,
      'LAXTE'
    );

    const completeVIP = { ..._vip };
    try {
      const ref = db.collection("LAXTE_VIPs").doc();
      const id = ref.id;
      completeVIP.id = id;
      await ref.set({ ...completeVIP });
      return {
        form: completeVIP,
        success: true,
        id,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || " error "}`
      );
    }
  }
);
//firebase deploy --only functions:updateVIP_LAXTE
exports.updateVIP_LAXTE = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const updateData: VIPClass = {};
    let x:
      | `firstName`
      | `lastName`
      | `rateCode`
      | `arrival`
      | `departure`
      | `image`
      | `fileName`
      | `vipStatus`
      | `roomStatus`
      | "roomNumber"
      | `notes`
      | `details`
      | `stays`
      | `reservationStatus`
      | `id`;
    const y: string = `VIP`;

    // firstName
    x = `firstName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // lastName
    x = `lastName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // rateCode
    x = `rateCode`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // arrival
    x = `arrival`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // departure
    x = `departure`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }

    // reservationStatus
    x = `reservationStatus`;
    if (
      clientData[`departure`] != undefined &&
      clientData[`arrival`] != undefined
    ) {
      const arrDate: Date = unformatDate(`${updateData["arrival"]}`),
        depDate: Date = unformatDate(`${updateData["departure"]}`),
        todDate: Date = new Date(),
        a = dayOfYear(arrDate),
        d = dayOfYear(depDate),
        t = dayOfYear(todDate);
      updateData.reservationStatus =
        t < a
          ? `RESERVED`
          : t === a
          ? `DUEIN`
          : t > a && t === d
          ? `DUEOUT`
          : t > a && t < d
          ? `CHECKEDIN`
          : t > a && t > d
          ? `CHECKEDOUT`
          : `ERROR`;
    }

    // image
    x = `image`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // fileName
    x = `fileName`;
    if (clientData[x] != undefined) {
      if (!isValidString(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // vipStatus
    x = `vipStatus`;
    if (clientData[x] != undefined) {
      if (!Array.isArray(clientData[x])) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Invalid/Missing: ${y} '${x}' data.`
        );
      } else {
        updateData[x] = clientData[x];
      }
    }
    // roomStatus
    x = `roomStatus`;
    if (clientData[x] != undefined) {
      if (Array.isArray(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // roomNumber
    x = `roomNumber`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // notes
    x = `notes`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // details
    x = `details`;
    if (clientData[x] != undefined) {
      if (isValidString(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }
    // stays
    x = `stays`;
    if (clientData[x] != undefined) {
      if (isValidNumber(clientData[x])) {
        updateData[x] = clientData[x];
      }
    }

    // id
    x = `id`;
    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }

    const updatedVIP = { ...updateData };
    try {
      const ref = db.collection("LAXTE_VIPs").doc(`${updatedVIP.id}`);
      await ref.set({ ...updatedVIP }, { merge: true });
      return {
        form: updatedVIP,
        success: true,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || ""}`
      );
    }
  }
);
//firebase deploy --only functions:deleteVIP_LAXTE
exports.deleteVIP_LAXTE = functions.https.onCall(
  async (_form: VIPClass, context: CallableContext) => {
    const clientData = { ..._form };
    const x = `id`;
    const y: string = `VIP`;
    const updateData: VIPClass = {};

    if (!isValidString(clientData[x])) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Invalid/Missing: ${y} '${x}' data.`
      );
    } else {
      updateData[x] = clientData[x];
    }
    const filteredVIP: VIPClass = { ...updateData };

    const ref = db.collection("LAXTE_VIPs").doc(`${filteredVIP.id}`);
    const res = await ref.get();
    if (!res.exists) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "I couldn't find this VIP"
      );
    }
    try {
      await ref.delete();
      return {
        success: true,
        id: filteredVIP.id,
      };
    } catch (error: any) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `${error?.message || error || ""}`
      );
    }
  }
);
//firebase deploy --only functions:onCreateVIP_LAXTE
exports.onCreateVIP_LAXTE = functions.firestore
  .document("LAXTE_VIPs/{id}")
  .onCreate(
    async (
      snap: FirebaseFirestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const _vip = snap.data() as VIPClass;
      const totalsUpdate: any = {};
      totalsUpdate["total"] = increment;
      totalsUpdate[`${_vip.reservationStatus}`] = increment;
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`inhouse`] = increment;
      }
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`arrivals+inhouse`] = increment;
      }

      const totalRef = db.collection("Totals").doc("LAXTE_VIPs");
      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (error: any) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${error?.message || error || ""}`
        );
      }
      return;
    }
  );
//firebase deploy --only functions:onUpdateVIP_LAXTE
exports.onUpdateVIP_LAXTE = functions.firestore
  .document("LAXTE_VIPs/{id}")
  .onUpdate(
    async (
      change: functions.Change<FirebaseFirestore.QueryDocumentSnapshot>,
      context: functions.EventContext
    ) => {
      const beforeCollection = change.before.data() as VIPClass;
      const afterCollection = change.after.data() as VIPClass;
      const totalsUpdate: any = {};
      if (
        beforeCollection.reservationStatus !== afterCollection.reservationStatus
      ) {
        totalsUpdate[`${beforeCollection.reservationStatus}`] = decrement;
        totalsUpdate[`${afterCollection.reservationStatus}`] = increment;
        const b4status = beforeCollection.reservationStatus;
        const afstatus = afterCollection.reservationStatus;
        if (
          b4status &&
          ["DUEOUT", "CHECKEDIN"].includes(b4status) &&
          afstatus &&
          !["DUEOUT", "CHECKEDIN"].includes(afstatus)
        ) {
          totalsUpdate[`inhouse`] = decrement;
        }
        if (
          afstatus &&
          ["DUEOUT", "CHECKEDIN"].includes(afstatus) &&
          b4status &&
          !["DUEOUT", "CHECKEDIN"].includes(b4status)
        ) {
          totalsUpdate[`inhouse`] = increment;
        }
        if (
          b4status &&
          ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(b4status) &&
          afstatus &&
          !["DUEOUT", "CHECKEDIN", "DUEIN"].includes(afstatus)
        ) {
          totalsUpdate[`arrivals+inhouse`] = decrement;
        }
        if (
          afstatus &&
          ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(afstatus) &&
          b4status &&
          !["DUEOUT", "CHECKEDIN", "DUEIN"].includes(b4status)
        ) {
          totalsUpdate[`arrivals+inhouse`] = increment;
        }
      }
      const totalRef = db.collection("Totals").doc("LAXTE_VIPs");
      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (e) {
        console.log("Error updating totals");
        console.log(e);
      }
      return;
    }
  );
//firebase deploy --only functions:onDeleteVIP_LAXTE
exports.onDeleteVIP_LAXTE = functions.firestore
  .document("LAXTE_VIPs/{id}")
  .onDelete(
    async (
      snap: FirebaseFirestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const totalsUpdate: any = {};
      totalsUpdate["total"] = decrement;
      const totalRef = db.collection("Totals").doc("LAXTE_VIPs");
      const _vip = snap.data() as VIPClass;

      totalsUpdate[`${_vip.reservationStatus}`] = decrement;
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`inhouse`] = decrement;
      }
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`arrivals+inhouse`] = decrement;
      }
      //archive the vip
      //to keep up with stays and id

      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (error: any) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${error?.message || error || ""}`
        );
      }
      return;
    }
  );
//firebase deploy --only functions:onCreateForecasts_LAXTE
exports.onCreateForecasts_LAXTE = functions.firestore
  .document("LAXTE_Forecasts/{id}")
  .onCreate(
    async (
      snap: FirebaseFirestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const totalsUpdate: any = {};
      totalsUpdate["total"] = increment;
      const totalRef = db.collection("Totals").doc("LAXTE_Forecasts");
      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (error: any) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${error?.message || error || ""}`
        );
      }
      return;
    }
  );
//firebase deploy --only functions:onDeleteForecasts_LAXTE
exports.onDeleteForecasts_LAXTE = functions.firestore
  .document("LAXTE_Forecasts/{id}")
  .onDelete(
    async (
      snap: FirebaseFirestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const totalsUpdate: any = {};
      totalsUpdate["total"] = decrement;
      const totalRef = db.collection("Totals").doc("LAXTE_Forecasts");
      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (error: any) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${error?.message || error || ""}`
        );
      }
      return;
    }
  );

  


//**    OPERA     **//
//firebase deploy --only functions:onCreateVIP_Opera
exports.onCreateVIP_Opera = functions.firestore
  .document("Opera_VIPs/{id}")
  .onCreate(
    async (
      snap: FirebaseFirestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const _vip = snap.data() as VIPClass;
      const totalsUpdate: any = {};
      totalsUpdate["total"] = increment;
      totalsUpdate[`${_vip.reservationStatus}`] = increment;
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`inhouse`] = increment;
      }
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`arrivals+inhouse`] = increment;
      }

      const totalRef = db.collection("Totals").doc("Opera_VIPs");
      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (error: any) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${error?.message || error || ""}`
        );
      }
      return;
    }
  );
//firebase deploy --only functions:onUpdateVIP_Opera
exports.onUpdateVIP_Opera = functions.firestore
  .document("Opera_VIPs/{id}")
  .onUpdate(
    async (
      change: functions.Change<FirebaseFirestore.QueryDocumentSnapshot>,
      context: functions.EventContext
    ) => {
      const beforeCollection = change.before.data() as VIPClass;
      const afterCollection = change.after.data() as VIPClass;
      const totalsUpdate: any = {};
      if (
        beforeCollection.reservationStatus !== afterCollection.reservationStatus
      ) {
        totalsUpdate[`${beforeCollection.reservationStatus}`] = decrement;
        totalsUpdate[`${afterCollection.reservationStatus}`] = increment;
        const b4status = beforeCollection.reservationStatus;
        const afstatus = afterCollection.reservationStatus;
        if (
          b4status &&
          ["DUEOUT", "CHECKEDIN"].includes(b4status) &&
          afstatus &&
          !["DUEOUT", "CHECKEDIN"].includes(afstatus)
        ) {
          totalsUpdate[`inhouse`] = decrement;
        }
        if (
          afstatus &&
          ["DUEOUT", "CHECKEDIN"].includes(afstatus) &&
          b4status &&
          !["DUEOUT", "CHECKEDIN"].includes(b4status)
        ) {
          totalsUpdate[`inhouse`] = increment;
        }
        if (
          b4status &&
          ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(b4status) &&
          afstatus &&
          !["DUEOUT", "CHECKEDIN", "DUEIN"].includes(afstatus)
        ) {
          totalsUpdate[`arrivals+inhouse`] = decrement;
        }
        if (
          afstatus &&
          ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(afstatus) &&
          b4status &&
          !["DUEOUT", "CHECKEDIN", "DUEIN"].includes(b4status)
        ) {
          totalsUpdate[`arrivals+inhouse`] = increment;
        }
      }
      const totalRef = db.collection("Totals").doc("Opera_VIPs");
      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (e) {
        console.log("Error updating totals");
        console.log(e);
      }
      return;
    }
  );
//firebase deploy --only functions:onDeleteVIP_Opera
exports.onDeleteVIP_Opera = functions.firestore
  .document("Opera_VIPs/{id}")
  .onDelete(
    async (
      snap: FirebaseFirestore.QueryDocumentSnapshot,
      context: functions.EventContext
    ) => {
      const totalsUpdate: any = {};
      totalsUpdate["total"] = decrement;
      const totalRef = db.collection("Totals").doc("Opera_VIPs");
      const _vip = snap.data() as VIPClass;

      totalsUpdate[`${_vip.reservationStatus}`] = decrement;
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`inhouse`] = decrement;
      }
      if (
        _vip.reservationStatus &&
        ["DUEOUT", "CHECKEDIN", "DUEIN"].includes(_vip.reservationStatus)
      ) {
        totalsUpdate[`arrivals+inhouse`] = decrement;
      }
      //archive the vip
      //to keep up with stays and id

      try {
        await totalRef.set(totalsUpdate, { merge: true });
      } catch (error: any) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `${error?.message || error || ""}`
        );
      }
      return;
    }
  );

//firebase deploy --only functions:readVIPs
exports.readVIPs = functions.storage
  .bucket()
  .object()
  .onFinalize(async (object) => {
    // ...
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
    //const accessToken = uuid.v4();
    console.log(filePath);
    console.log(contentType);
    console.log(metageneration);
    console.log(fileBucket);
    //const uploadFolder = `${filePath||''}`.toString().split("/")[0];
    const fileName = `${filePath || ""}`.toString().split("/")[1];
    const xml2js = require("xml2js");
    const parser = new xml2js.Parser({ attrkey: "ATTR" });

    if (contentType === "text/xml" || contentType === "file/xml") {
      // Download file from bucket.
      const bucket = admin.storage().bucket(fileBucket);
      const tempFilePath = `/tmp/${fileName}`;

      await bucket
        .file(`${filePath || ``}`)
        .download({ destination: tempFilePath });
      functions.logger.log("XML downloaded locally to", tempFilePath);

      let xml_file = fs.readFileSync(tempFilePath, "utf8");

      parser.parseString(xml_file, (error: any, result: any) => {
        if (error === null) {
          console.log("parsedXML");
          console.log("5.5");

          console.log(
            result.RES_DETAIL.LIST_G_GROUP_BY1[0].G_GROUP_BY1[0]
              .LIST_G_RESERVATION[0].G_RESERVATION
          );
          console.log(
            result.RES_DETAIL.LIST_G_GROUP_BY1[0].G_GROUP_BY1[0]
              .LIST_G_RESERVATION[0].G_RESERVATION.length
          );

          const parsedVIPs: VIPClass[] = [];
          result.RES_DETAIL.LIST_G_GROUP_BY1[0].G_GROUP_BY1[0].LIST_G_RESERVATION[0].G_RESERVATION.map(
            (reservation: any, index: any) => {
              console.log("index");
              console.log(index);

              console.log("reservation");
              console.log(reservation);

              const updateData: VIPClass = {};
              const operaData: VIPClass = {};
              const vip = reservation;

              operaData.firstName = vip.FULL_NAME[0].split(",")[1];

              operaData.lastName = vip.FULL_NAME[0].split(",")[0];

              operaData.rateCode = vip.RATE_CODE[0];

              operaData.resort = vip.RESORT[0];

              const operaDataArrival = new Date(vip.ARRIVAL[0]);

              const operaDataDeparture = new Date(vip.DEPARTURE[0]);

              // operaData.arrival = new Date(vip.ARRIVAL[0])
              // operaData.departure = new Date(vip.DEPARTURE[0])
              const status = `${
                vip.VIP[0] === "GB"
                  ? `GLOB`
                  : vip.VIP[0] === "LG"
                  ? `LGLO`
                  : vip.VIP[0]
              }`;
              operaData.vipStatus = [{ id: status, label: status }];

              operaData.roomNumber = vip.ROOM_NO[0];

              operaData.details = vip.BILL_TO_ADDRESS[0];

              operaData.stays = vip.NO_OF_STAYS[0];

              let x:
                | `firstName`
                | `lastName`
                | `rateCode`
                | `arrival`
                | `departure`
                | `image`
                | `fileName`
                | `vipStatus`
                | `roomStatus`
                | "roomNumber"
                | `notes`
                | `details`
                | `stays`
                | `reservationStatus`
                | `resort`
                | `id`;
              const y: string = `VIP`;

              // firstName
              x = `firstName`;
              if (operaData[x] != undefined) {
                if (!isValidString(operaData[x])) {
                  throw new functions.https.HttpsError(
                    "failed-precondition",
                    `Invalid/Missing: ${y} '${x}' data.`
                  );
                } else {
                  updateData[x] = operaData[x];
                }
              } // lastName
              x = `lastName`;
              if (operaData[x] != undefined) {
                if (!isValidString(operaData[x])) {
                  throw new functions.https.HttpsError(
                    "failed-precondition",
                    `Invalid/Missing: ${y} '${x}' data.`
                  );
                } else {
                  updateData[x] = operaData[x];
                }
              }
              // rateCode
              x = `rateCode`;
              if (operaData[x] != undefined) {
                if (!isValidString(operaData[x])) {
                  throw new functions.https.HttpsError(
                    "failed-precondition",
                    `Invalid/Missing: ${y} '${x}' data.`
                  );
                } else {
                  updateData[x] = operaData[x];
                }
              }

              // arrival
              x = `arrival`;
              if (!(operaDataArrival instanceof Date)) {
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `Invalid/Missing: ${y} '${x}' data.`
                );
              }
              operaData[x] = formatDate(operaDataArrival, " EEE dd MMM");
              if (!isValidString(operaData[x])) {
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `Failed to Convert: ${y} '${x}' data.`
                );
              } else {
                updateData[x] = operaData[x];
              }
              // departure
              x = `departure`;
              if (!(operaDataDeparture instanceof Date)) {
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `Invalid/Missing: ${y} '${x}' data.`
                );
              }
              operaData[x] = formatDate(operaDataDeparture, " EEE dd MMM");
              if (!isValidString(operaData[x])) {
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `Failed to Convert: ${y} '${x}' data.`
                );
              } else {
                updateData[x] = operaData[x];
              }

              // reservationStatus
              x = `reservationStatus`;
              if (
                operaData[`departure`] != undefined &&
                operaData[`arrival`] != undefined
              ) {
                const arrDate: Date = unformatDate(`${updateData["arrival"]}`),
                  depDate: Date = unformatDate(`${updateData["departure"]}`),
                  todDate: Date = new Date(),
                  a = dayOfYear(arrDate),
                  d = dayOfYear(depDate),
                  t = dayOfYear(todDate);
                updateData.reservationStatus =
                  t < a
                    ? `RESERVED`
                    : t === a
                    ? `DUEIN`
                    : t > a && t === d
                    ? `DUEOUT`
                    : t > a && t < d
                    ? `CHECKEDIN`
                    : t > a && t > d
                    ? `CHECKEDOUT`
                    : `ERROR`;
              }

              // image
              x = `image`;
              updateData[
                x
              ] = `https://firebasestorage.googleapis.com/v0/b/thompson-hollywood.appspot.com/o/810-8105444_male-placeholder.png?alt=media&token=a206d607-c609-4d46-9a9a-0fc14a8053f1`;

              // fileName
              x = `fileName`;
              updateData[x] = `810-8105444_male-placeholder.png`;

              // vipStatus
              x = `vipStatus`;
              if (operaData[x] != undefined) {
                if (!Array.isArray(operaData[x])) {
                  throw new functions.https.HttpsError(
                    "failed-precondition",
                    `Invalid/Missing: ${y} '${x}' data.`
                  );
                } else {
                  updateData[x] = operaData[x];
                }
              }

              // resort
              // x = `resort`;
              // if (operaData[x] != undefined) {
              //   if (!Array.isArray(operaData[x])) {
              //     throw new functions.https.HttpsError(
              //       "failed-precondition",
              //       `Invalid/Missing: ${y} '${x}' data.`
              //     );
              //   } else {
              //     updateData[x] = operaData[x];
              //   }
              // }
              // roomStatus
              x = `roomStatus`;
              updateData[x] = [{ id: "INSPECTED", label: "INSPECTED" }];

              // roomNumber
              x = `roomNumber`;
              if (operaData[x] != undefined && operaData[x] != "") {
                if (isValidString(operaData[x])) {
                  updateData[x] = operaData[x];
                }
              } else {
                updateData[x] = `TBD`;
              }

              // notes
              x = `notes`;
              updateData[x] = `No Notes`;

              // details
              x = `details`;
              if (operaData[x] != undefined) {
                if (isValidString(operaData[x])) {
                  updateData[x] = operaData[x];
                }
              }
              // stays
              x = `stays`;
              updateData[x] = Number(operaData.stays);

              // id
              x = `id`;
              updateData[x] = ``;

              const fireVip = new VIPClass(
                updateData[`arrival`], // arrival?: string,
                updateData[`departure`], // departure?: string,
                updateData[`details`], // details?: string,
                updateData[`fileName`], // fileName?: string
                updateData[`firstName`], // firstName?: string,
                updateData[`id`], // id?: string,
                updateData[`image`], // image?: string,
                updateData[`lastName`], // lastName?: string,
                updateData[`notes`], // notes?: string,
                updateData[`rateCode`], // rateCode?: string,
                updateData[`reservationStatus`] as
                  | "DUEIN"
                  | "DUEOUT"
                  | "CHECKEDIN"
                  | "CHECKEDOUT"
                  | "RESERVED"
                  | "NOSHOW"
                  | "CANCEL", // reservationStatus?:'DUEIN'|'DUEOUT'|'CHECKEDIN'|'CHECKEDOUT'|'RESERVED'|'NOSHOW'|'CANCEL',
                updateData[`roomNumber`], // roomNumber?: string,
                updateData[`roomStatus`] as [{ id: string; label: string }], // roomStatus?: [],
                updateData[`vipStatus`] as [{ id: string; label: string }], // vipStatus?: [],
                updateData[`stays`], // stays?:number,
                operaData.resort as "LAXTH" | "LAXTE",
              );

              functions.logger.log(fireVip);

              parsedVIPs.push(fireVip);
            }
          );

          if (parsedVIPs.length > 0) {
            (parsedVIPs || []).map(async (vip: VIPClass) => {
              console.log(`vip1`);
              //console.log(vip)
              const completeVIP: VIPClass = { ...vip };
              try {
                const ref = db.collection(`${completeVIP.resort}_VIPs`).doc();
                const id = ref.id;
                completeVIP.id = id;
                await ref.set({ ...completeVIP });
                console.log(`added ${completeVIP.id || ``}`);
              } catch (error: any) {
                throw new functions.https.HttpsError(
                  "failed-precondition",
                  `${error?.message || error || " error "}`
                );
              }
            });
          } else {
            console.log("No Vips to push");
          }
        } else {
          console.log("errorparsedXML");
          console.log(error);
        }
      });
    }

    return;
  });

//firebase deploy --only functions:readXLS
exports.readXLS = functions.storage
  .bucket()
  .object()
  .onFinalize(async (object) => {
    // ...
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
    //const accessToken = uuid.v4();
    console.log(filePath);
    console.log(contentType);
    console.log(metageneration);
    console.log(fileBucket);
    //const uploadFolder = `${filePath||''}`.toString().split("/")[0];
    const fileName = `${filePath || ""}`.toString().split("/")[1];

    if (contentType === "application/vnd.ms-excel") {
      console.log("excel forecast")
      const bucket = admin.storage().bucket(fileBucket);
      const tempFilePath = `/tmp/${fileName}`;
      //const accessToken = uuid.v4();
      //const outputFilePath = `/tmp/forecast-${accessToken}.json`;
      await bucket
        .file(`${filePath || ``}`)
        .download({ destination: tempFilePath });
      functions.logger.log("XLS downloaded locally to", tempFilePath);

      //let xls_file = fs.readFileSync(tempFilePath, "utf8");
      const result = await excelToJson({
        sourceFile: tempFilePath
      });
      // console.log(result);
      console.log(result['Master']);

      // sort some info
      const dateRow = result['Master'][4],
      dayRow = result['Master'][5],
      titleRow = result['Master'][0]['H'],
      roomForecastRow = result['Master'][6],
      occupancyForecastRow = result['Master'][8],
      forecastedGuests = result['Master'][9],
      forecastedArrivals = result['Master'][10],
      forecastedDeparture = result['Master'][11],
      actualRoomsOnBooks = result['Master'][12],
      // groupsInHouse = result['Master'][13],
      // transientInHouse = result['Master'][14],
      // OOORooms = result['Master'][15],
      // availableRooms = result['Master'][16],
      property = titleRow==='Thompson Hollywood'?'LAXTH':titleRow==='tommie Hollywood'?'LAXTE':`undefined_Property`;
      
      console.log('forecastedGuests');
      console.log(forecastedGuests);
      console.log('forecastedArrivals');
      console.log(forecastedArrivals);
      console.log('forecastedDeparture');
      console.log(forecastedDeparture);
      console.log('forecastedDeparture');
      console.log(forecastedDeparture);
      console.log('property');
      console.log(property);
      console.log('actualRoomsOnBooks');
      console.log(actualRoomsOnBooks);
      // console.log('groupsInHouse');
      // console.log(groupsInHouse);
      // console.log('transientInHouse');
      // console.log(transientInHouse);
      // console.log('OOORooms');
      // console.log(OOORooms);
      // console.log('availableRooms');
      // console.log(availableRooms);
      console.log('titleRow');
      console.log(titleRow);
      console.log('dayRow');
      console.log(dayRow);


      for (const key in roomForecastRow) {
        console.log(`${key}: ${roomForecastRow[key]}`);
        if (
          roomForecastRow[key] &&
          roomForecastRow[key] !== "ROOMS FORECAST" &&
          roomForecastRow[key] !== "#REF!"
        ) {
          //console.log(`${key}: ${roomForecastRow[key]}`);
          console.log({
            roomsForecast: roomForecastRow[key],
            occupancyForecast: occupancyForecastRow[key],
            date: dateRow[key],
            formatedDate: formatDate(new Date(dateRow[key]), " EEE dd MMM"),
          });
          await db
            .collection(`${property}_Forecast`)
            .doc(`${dateRow[key]}`)
            .set({
              roomsForecast: roomForecastRow[key],
              occupancyForecast: occupancyForecastRow[key],
              date: dateRow[key],
              formatedDate: formatDate(new Date(dateRow[key]), " EEE dd MMM"),
              forecastedGuests: forecastedGuests[key],
              forecastedArrivals:forecastedArrivals[key],
              forecastedDeparture:forecastedDeparture[key],
              actualRoomsOnBooks:actualRoomsOnBooks[key],
              day:dayRow[key],
              property,
            });
        }
      }
      



    }

    return;
  });
// firebase deploy --only functions:updateDateDaily
exports.updateDateDaily = functions.pubsub.schedule('0 13 * * *')
  .timeZone('America/Los_Angeles') // Users can choose timezone - default is America/Los_Angeles
  .onRun( async (context) => {
  console.log('This will be run every day at 11:05 AM Eastern!');
    //update date
    await db
    .collection(`PROPERTY`)
    .doc(`LAXTE`)
    .set({
      date: formatDate(new Date(), "MM.dd.yy"),
      
    });
    await db
    .collection(`PROPERTY`)
    .doc(`LAXTH`)
    .set({
      date: formatDate(new Date(), "MM.dd.yy"),
      
    });
  return null;
});