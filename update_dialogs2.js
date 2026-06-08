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
                
                // Ensure modal is true
                if (replaced.includes('[modal]="false"')) {
                    replaced = replaced.replace(/\[modal\]="false"/g, '[modal]="true"');
                    updated = true;
                } else if (!replaced.includes('[modal]="true"')) {
                    replaced = replaced.replace(/<p-dialog/, '<p-dialog [modal]="true"');
                    updated = true;
                }

                // Add dismissableMask="true"
                if (!replaced.includes('[dismissableMask]="true"')) {
                    replaced = replaced.replace(/<p-dialog/, '<p-dialog [dismissableMask]="true"');
                    updated = true;
                }

                // Replace maskStyleClass
                if (replaced.includes('maskStyleClass="')) {
                    replaced = replaced.replace(/maskStyleClass="[^"]*"/, 'maskStyleClass="transparent-mask"');
                    updated = true;
                } else {
                    replaced = replaced.replace(/<p-dialog/, '<p-dialog maskStyleClass="transparent-mask"');
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
