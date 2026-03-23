// netlify/functions/sync.js
// Pośrednik między dashboardem a Google Apps Script
// Działa bez CORS bo to serwer-do-serwera

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZn6c4mhWJfYmgP9Gg0A1n-trL5cX045SdTgB3nfeRAKudZYeE_3O9aAsjRUhEqkFbgA/exec';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Read data from Apps Script
      const res  = await fetch(APPS_SCRIPT_URL, {
        redirect: 'follow',
        headers: { 'Accept': 'application/json' },
      });
      const text = await res.text();
      return {
        statusCode: 200,
        headers,
        body: text || '{}',
      };
    }

    if (event.httpMethod === 'POST') {
      // Write data to Apps Script
      const res = await fetch(APPS_SCRIPT_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'text/plain' },
        body:    event.body,
      });
      const text = await res.text();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, response: text }),
      };
    }

    return { statusCode: 405, headers, body: 'Method not allowed' };

  } catch (err) {
    console.error('Sync error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
