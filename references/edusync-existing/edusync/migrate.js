const fs = require('fs');
const path = require('path');

function migratePage(sourceName, destFolder) {
    const sourcePath = path.join(__dirname, '..', 'edusync-babu', sourceName + '.html');
    const htmlContent = fs.readFileSync(sourcePath, 'utf8');

    // Extract style
    const styleMatches = [...htmlContent.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
    const styles = styleMatches.map(m => m[1]).join('\n\n');

    // Extract scripts
    const scriptMatches = [...htmlContent.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)];
    const scripts = scriptMatches.map(m => m[1]).join('\n\n');

    // Get body content
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let body = bodyMatch ? bodyMatch[1] : '';

    // Remove scripts from body
    body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Fix common HTML attributes to JSX
    body = body.replace(/onclick=/g, 'onClick=')
               .replace(/onchange=/g, 'onChange=')
               .replace(/onsubmit=/g, 'onSubmit=')
               .replace(/oninput=/g, 'onInput=')
               .replace(/onkeyup=/g, 'onKeyUp=')
               .replace(/onkeydown=/g, 'onKeyDown=')
               .replace(/style="([^"]*)"/g, (match, p1) => {
                   // A very crude inline style converter or just return empty to avoid errors
                   // Actually, it's safer to strip inline styles or ignore them to prevent compilation errors
                   // But let's try a crude one
                   return ``; 
               })
               .replace(/<!--[\s\S]*?-->/g, ''); // remove comments

    // Handle void elements
    const voidElements = ['img', 'br', 'hr', 'input', 'link', 'meta'];
    voidElements.forEach(tag => {
        const regex = new RegExp(`<${tag}\\b([^>]*?)(?<!/)>`, 'gi');
        body = body.replace(regex, `<${tag}$1 />`);
    });

    const destDir = path.join(__dirname, 'src', 'app', destFolder);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    // Write CSS
    fs.writeFileSync(path.join(destDir, 'styles.css'), styles);

    // Write JS
    // We will attach everything to window to keep it global as the old HTML did
    const wrappedScript = `
        export function initScripts() {
            if (typeof window === 'undefined') return;
            try {
                ${scripts}
            } catch (e) {
                console.error(e);
            }
        }
    `;
    fs.writeFileSync(path.join(destDir, 'logic.js'), wrappedScript);

    // Write TSX
    // Using dangerouslySetInnerHTML to avoid endless JSX syntax errors
    const tsxContent = '"use client";\n' +
'import React, { useEffect } from "react";\n' +
'import "./styles.css";\n\n' +
'export default function Dashboard() {\n' +
'    useEffect(() => {\n' +
'        const script = document.createElement("script");\n' +
'        script.src = "/static/js/' + destFolder + '.js";\n' +
'        document.body.appendChild(script);\n' +
'        return () => {\n' +
'            if (script.parentNode) script.parentNode.removeChild(script);\n' +
'        };\n' +
'    }, []);\n\n' +
'    return (\n' +
'        <div className="dashboard-wrapper" dangerouslySetInnerHTML={{ __html: ' + JSON.stringify(body) + ' }} />\n' +
'    );\n' +
'}\n';

    fs.writeFileSync(path.join(destDir, 'page.tsx'), tsxContent);
    
    // Write the actual js to public dir so it can be loaded
    const publicDir = path.join(__dirname, 'public', 'static', 'js');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, destFolder + '.js'), scripts);

    console.log('Migrated', sourceName, 'to', destFolder);
}

migratePage('student_dashboard', 'student_dashboard');
migratePage('hod_dashboard', 'hod_dashboard');
migratePage('faculty_dashboard', 'faculty_dashboard');
