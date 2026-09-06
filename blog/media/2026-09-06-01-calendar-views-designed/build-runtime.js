// Renders a Claude Design .dc.html file standalone: a minimal runtime for its {{ }} / sc-if / sc-for template and DCLogic class.
const fs = require('fs');
const [,, inFile = 'prototype.dc.html', outFile = 'runtime.html'] = process.argv;
const src = fs.readFileSync(inFile, 'utf8');
const helmet = src.match(/<helmet>([\s\S]*?)<\/helmet>/)[1];
const template = src.match(/<\/helmet>\s*([\s\S]*?)\s*<\/x-dc>/)[1];
const logic = src.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
const propsAttr = src.match(/data-props="([^"]*)"/)[1].replace(/&quot;/g, '"');
const defaults = Object.fromEntries(Object.entries(JSON.parse(propsAttr)).map(([k, v]) => [k, v.default]));
const shim = String.raw`
const __props = ${JSON.stringify(defaults)};
const __params = new URLSearchParams(location.search);
for (const k of Object.keys(__props)) if (__params.has(k)) __props[k] = isNaN(+__params.get(k)) ? __params.get(k) : +__params.get(k);
let __render = () => {};
class DCLogic {
  constructor(props) { this.props = props; this.state = {}; }
  setState(patch) { Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch); __render(); }
}
${logic}
const RE = /\{\{\s*([^}]+?)\s*\}\}/g;
function resolve(expr, scopes) {
  if (expr === 'true') return true; if (expr === 'false') return false;
  const parts = expr.split('.');
  for (let i = scopes.length - 1; i >= 0; i--) {
    if (scopes[i] != null && parts[0] in scopes[i]) { let v = scopes[i][parts[0]]; for (let j = 1; j < parts.length && v != null; j++) v = v[parts[j]]; return v; }
  }
  return undefined;
}
function interp(str, scopes) {
  const m = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(str);
  if (m) return resolve(m[1], scopes);
  return str.replace(RE, (_, e) => { const v = resolve(e, scopes); return v == null ? '' : String(v); });
}
function renderNode(node, scopes, parent) {
  if (node.nodeType === 3) { const v = interp(node.nodeValue, scopes); parent.appendChild(document.createTextNode(v == null ? '' : String(v))); return; }
  if (node.nodeType !== 1) return;
  const tag = node.tagName.toLowerCase();
  if (tag === 'sc-if') { if (interp(node.getAttribute('value'), scopes)) for (const c of node.childNodes) renderNode(c, scopes, parent); return; }
  if (tag === 'sc-for') { const list = interp(node.getAttribute('list'), scopes) || []; const as = node.getAttribute('as'); for (const item of list) { const sc = scopes.concat([{ [as]: item }]); for (const c of node.childNodes) renderNode(c, sc, parent); } return; }
  const el = document.createElement(tag);
  let selectValue;
  for (const attr of node.attributes) {
    const name = attr.name, raw = attr.value;
    if (name.startsWith('hint-')) continue;
    if (/^on[a-z]+$/.test(name)) { const fn = interp(raw, scopes); if (typeof fn === 'function') el.addEventListener(name.slice(2), fn); continue; }
    const v = interp(raw, scopes);
    if (name === 'style' && v && typeof v === 'object') { for (const [k, val] of Object.entries(v)) el.style.setProperty(k, val); continue; }
    if (name === 'value' && tag === 'select') { selectValue = v; continue; }
    if (name === 'checked') { el.checked = !!v; continue; }
    if (v === false || v == null) continue;
    el.setAttribute(name, String(v));
  }
  parent.appendChild(el);
  for (const c of node.childNodes) renderNode(c, scopes, el);
  if (selectValue !== undefined) el.value = selectValue;
}
const __tpl = document.getElementById('dc-template').content.firstElementChild;
const __root = document.getElementById('app');
const __comp = new Component(__props);
__render = () => { const vals = __comp.renderVals(); __root.replaceChildren(); renderNode(__tpl, [vals], __root); };
__render();
if (__comp.componentDidMount) __comp.componentDidMount();
`;
const html = `<!DOCTYPE html>\n<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>PhD TV calendar prototype (local render)</title>\n${helmet}\n</head><body>\n<div id="app"></div>\n<template id="dc-template">${template}</template>\n<script>${shim}</script>\n</body></html>`;
fs.writeFileSync(outFile, html);
console.log(`${outFile}: ${html.length} bytes from ${inFile}`);
