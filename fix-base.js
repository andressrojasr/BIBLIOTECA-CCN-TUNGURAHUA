const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'www/index.html');

try {
  let html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('<base href="/">')) {
    html = html.replace('<base href="/">', '<base href="./">');
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('✅ Reemplazo de <base href="/"> por <base href="./"> realizado con éxito.');
  } else {
    console.warn('⚠️ No se encontró <base href="/"> en www/index.html');
  }
} catch (err) {
  console.error('❌ Error al procesar www/index.html:', err);
}
