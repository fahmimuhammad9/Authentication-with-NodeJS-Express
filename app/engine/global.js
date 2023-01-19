"use strict";

const { camelCase } = require('lodash');

const GENERATE_CODE = (n) => {
    let add = 1;
    let max = 12 - add;

    if (n > max) return code(max) + code(n - max);
    
    max = Math.pow(10, n + add);
    let min    = max / 10; 
    let number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
}

const PAGINATION = (total, page, limit) => {
    return {
        total: parseInt(total),
        page: (page) ? parseInt(page) : 0,
        prev: (page) 
            ? (parseInt(page) !== 0) 
                ? (parseInt(page)+1 < parseInt(limit) && parseInt(limit) < parseInt(total)) 
                    ? parseInt(page)-1 : false
                : false 
            : false,
        next: (page && ((parseInt(limit) * (parseInt(page)+1)) < parseInt(total))) 
            ?  (parseInt(limit) < parseInt(total)) 
                ? parseInt(page)+1 : false 
            : false
    }   
}

const VALIDATION = (payload) => {
    const checkValue = Object.values(payload).map((val) => {return (val) ? false : true});
    let required = checkValue.find((val) => {if (val===true) return val})
    return (required!==undefined) ? true : false;   
}

const CAMEL_CASE = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => CAMEL_CASE(v));
    } else if (obj != null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => ({
            ...result,
            [camelCase(key)]: CAMEL_CASE(obj[key]),
        }), {},);
    }
    return obj;
}

const CURRENCY_RUPIAH = (money, prefix) => {
    let number = money.replace(/[^,\d]/g, '').toString(),
    split      = number.split(','),
    rest       = split[0].length % 3,
    rupiah     = split[0].substr(0, rest),
    thousand   = split[0].substr(rest).match(/\d{3}/gi);

    if (thousand) {
        separator = rest ? '.' : '';
        rupiah += separator + thousand.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    return prefix == undefined ? rupiah : (rupiah ? 'Rp. ' + rupiah : '');
}

const PREFIX_PHONE_NUMBER = (phone) => {
    return (phone.trim().substr(0,1) === '0' || phone.trim().substr(0,2) === '62') 
        ? (phone.trim().substr(0,2) === '62') 
            ? '+62'+phone.substr(2) 
            : '+62'+phone.substr(1)
        : phone;
}

const CLEAR_PREFIX_PHONE_NUMBER = (phone) => {
    phone = phone.trim().replace(/^\s+|\s+$/g,'')
    phone = phone.trim().replace('+','');    
    return (phone.trim().substr(0,2) === '62') ? '0'+phone.trim().substr(2) : phone;
}


module.exports = {
    GENERATE_CODE,
    PAGINATION,
    VALIDATION,
    CAMEL_CASE,
    CURRENCY_RUPIAH,
    PREFIX_PHONE_NUMBER,
    CLEAR_PREFIX_PHONE_NUMBER
}