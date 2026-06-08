const fs = require('fs');
const path = require('path');

const directoryPath = '/Users/karlprada/Library/CloudStorage/OneDrive-Personal/Documentos/DIEGO/frontend-proyecto/src/app/presentation';

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.component.ts') && !fullPath.includes('roles.component.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;
            
            let newContent = content.replace(/<p-dialog[^>]+>/g, (match) => {
                let replaced = match;
                
                if (replaced.includes('[modal]="true"')) {
                    replaced = replaced.replace(/\[modal\]="true"/g, '[modal]="false"');
                    updated = true;
                }
                
                if (replaced.includes('[draggable]="false"')) {
                    replaced = replaced.replace(/\[draggable\]="false"/g, '[draggable]="true"');
                    updated = true;
                } else if (!replaced.includes('draggable')) {
                    replaced = replaced.replace(/<p-dialog/, '<p-dialog [draggable]="true"');
                    updated = true;
                }
                
                if (replaced.includes('styleClass="')) {
                     if (!replaced.includes('shadow-[0_0_40px_rgba(0,0,0,0.2)]') && !replaced.includes('shadow-2xl')) {
                         replaced = replaced.replace(/styleClass="([^"]+)"/, 'styleClass="$1 shadow-2xl border border-slate-200"');
                         updated = true;
                     }
                } else {
                     replaced = replaced.replace(/<p-dialog/, '<p-dialog styleClass="shadow-2xl border border-slate-200"');
                     updated = true;
                }
                
                return replaced;
            });
            
            if (updated) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Updated: ' + fullPath);
            }
        }
    });
}
traverse(directoryPath);
