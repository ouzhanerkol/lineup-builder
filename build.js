const fs = require('fs');
const path = require('path');

// BOM kaldırma fonksiyonu
function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
        return content.slice(1);
    }
    return content;
}

// Dosya yollarını tanımlama
const SRC_DIR = path.join(__dirname, 'src');
const TEMPLATES_DIR = path.join(SRC_DIR, 'templates');
const PAGES_DIR = path.join(SRC_DIR, 'pages');
const DIST_DIR = path.join(__dirname, 'dist'); // Nihai dosyaların kaydedileceği yer

// Varlıklar için kaynak ve hedef yollar
const ASSETS_SRC_DIR = path.join(__dirname, 'assets'); // Ana dizindeki assets
const ASSETS_DIST_DIR = path.join(DIST_DIR, 'assets');

const JS_SRC_DIR = path.join(__dirname, 'js'); // Ana dizindeki js klasörü
const JS_DIST_DIR = path.join(DIST_DIR, 'js');

const SCRIPT_JS_SRC = path.join(__dirname, 'script.js'); // Ana dizindeki script.js
const SCRIPT_JS_DIST = path.join(DIST_DIR, 'script.js');

const STYLE_CSS_SRC = path.join(__dirname, 'style.css'); // Ana dizindeki style.css
const STYLE_CSS_DIST = path.join(DIST_DIR, 'style.css');


// Dist klasörünü temizle ve yeniden oluştur
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Varlıkları dist klasörüne kopyalama (Güncellenmiş Kısım)
try {
    fs.cpSync(ASSETS_SRC_DIR, ASSETS_DIST_DIR, { recursive: true });
    console.log('Assets copied to dist folder.');
} catch (error) {
    console.error('Error copying assets:', error);
}

try {
    fs.cpSync(JS_SRC_DIR, JS_DIST_DIR, { recursive: true });
    console.log('JS folder copied to dist.');
} catch (error) {
    console.error('Error copying js folder:', error);
}

try {
    fs.copyFileSync(SCRIPT_JS_SRC, SCRIPT_JS_DIST);
    console.log('script.js copied to dist.');
} catch (error) {
    console.error('Error copying script.js:', error);
}

try {
    fs.copyFileSync(STYLE_CSS_SRC, STYLE_CSS_DIST);
    console.log('style.css copied to dist.');
} catch (error) {
    console.error('Error copying style.css:', error);
}


// Temel HTML parçalarını oku ve BOM'u kaldır
const layoutTemplate = stripBOM(fs.readFileSync(path.join(TEMPLATES_DIR, 'layout.html'), 'utf8'));
const headerPartial = stripBOM(fs.readFileSync(path.join(TEMPLATES_DIR, 'header.html'), 'utf8'));
const footerPartial = stripBOM(fs.readFileSync(path.join(TEMPLATES_DIR, 'footer.html'), 'utf8'));

// Her sayfayı işle
fs.readdirSync(PAGES_DIR).forEach(pageFile => {
    if (pageFile.endsWith('.html')) {
        const pagePath = path.join(PAGES_DIR, pageFile);
        const pageContent = stripBOM(fs.readFileSync(pagePath, 'utf8'));

        // Sayfa başlığı ve ek head içeriği için değişkenleri ayarla
        let pageTitle = '';
        let headContent = '';

        if (pageFile === 'index.html') {
            pageTitle = 'Ana Sayfa';
        } else if (pageFile === 'kadro-kur.html') {
            pageTitle = 'Kadro Kur';
            headContent = '<link rel="preload" as="image" href="/assets/images/pitch-background.png">';
        } else if (pageFile === 'hali-saha.html') {
            pageTitle = 'Halı Saha Kadro Kur';
        }

        let finalHtml = layoutTemplate;

        // Placeholder'ları doldur
        finalHtml = finalHtml.replace('PAGE_TITLE_PLACEHOLDER', pageTitle);
        finalHtml = finalHtml.replace('HEAD_CONTENT_PLACEHOLDER', headContent);
        finalHtml = finalHtml.replace('HEADER_PARTIAL_PLACEHOLDER', headerPartial);
        finalHtml = finalHtml.replace('FOOTER_PARTIAL_PLACEHOLDER', footerPartial);
        finalHtml = finalHtml.replace('PAGE_CONTENT_PLACEHOLDER', pageContent);

        // Nihai dosyayı dist klasörüne yaz
        fs.writeFileSync(path.join(DIST_DIR, pageFile), finalHtml, { encoding: 'utf8' });
        console.log(`Generated ${pageFile} in ${DIST_DIR}`);
    }
});

console.log('Build complete! Your static HTML files are in the "dist" folder.');