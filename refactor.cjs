const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

console.log("Starting refactor...");

// 1. Move firebase
ensureDir(path.join(srcDir, 'services'));
if (fs.existsSync(path.join(srcDir, 'firebase.ts'))) {
  fs.renameSync(path.join(srcDir, 'firebase.ts'), path.join(srcDir, 'services', 'firebase.ts'));
  console.log("Moved firebase.ts to src/services/");
}

// 2. Move layouts
ensureDir(path.join(srcDir, 'components', 'layout'));
['Navbar.tsx', 'Footer.tsx'].forEach(file => {
  const oldPath = path.join(srcDir, 'components', file);
  const newPath = path.join(srcDir, 'components', 'layout', file);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${file} to src/components/layout/`);
  }
});

// Update all imports inside .tsx and .ts files
function updateImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      updateImports(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We will blindly fix all common layout/firebase imports globally where they match typical src/ structures
      
      // Inside App.tsx or top level files
      content = content.replace(/['"]\.\/firebase['"]/g, "'./services/firebase'");
      content = content.replace(/['"]\.\/components\/Navbar['"]/g, "'./components/layout/Navbar'");
      content = content.replace(/['"]\.\/components\/Footer['"]/g, "'./components/layout/Footer'");
      
      // Inside pages/ or hooks/ or components/ (1 level deep)
      content = content.replace(/['"]\.\.\/firebase['"]/g, "'../services/firebase'");
      content = content.replace(/['"]\.\.\/components\/Navbar['"]/g, "'../components/layout/Navbar'");
      content = content.replace(/['"]\.\.\/components\/Footer['"]/g, "'../components/layout/Footer'");

      // Inside layout dir specifically (if it previously needed '../firebase' it now needs '../../services/firebase')
      if (fullPath.includes(path.join('components', 'layout'))) {
        content = content.replace(/['"]\.\.\/services\/firebase['"]/g, "'../../services/firebase'"); // correct if it just got rewritten by the above rule
        content = content.replace(/['"]\.\.\/App\.css['"]/g, "'../../App.css'");
        content = content.replace(/['"]\.\.\/hooks\/useSearchData['"]/g, "'../../hooks/useSearchData'");
      }

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}
updateImports(srcDir);
console.log("Updated import paths in all source files.");

// 3. Setup Error Boundary component
const ebPath = path.join(srcDir, 'components', 'ErrorBoundary.tsx');
if (!fs.existsSync(ebPath)) {
  fs.writeFileSync(ebPath, `
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props { children?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React rendering error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '100px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '12px' }}>Oops, something went wrong!</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', cursor: 'pointer', background: '#2874f0', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
  `.trim());
  console.log("Created generic ErrorBoundary component.");
}

// 4. Update App.tsx for React.lazy, Suspense, and ErrorBoundary
const appPath = path.join(srcDir, 'App.tsx');
if (fs.existsSync(appPath)) {
  let appContent = fs.readFileSync(appPath, 'utf8');
  if (!appContent.includes('Suspense')) {
    // Replace standard page imports with React.lazy
    appContent = appContent.replace(/import ([A-Za-z0-9_]+) from ['"]\.\/pages\/([^'"]+)['"];/g, "const $1 = React.lazy(() => import('./pages/$2'));");
    
    // Check if React comes in initially
    if (!appContent.includes("import React")) {
      appContent = "import React, { Suspense } from 'react';\n" + appContent;
    } else {
      appContent = appContent.replace("import React", "import React, { Suspense }");
    }
    
    appContent = appContent.replace("import { BrowserRouter", "import ErrorBoundary from './components/ErrorBoundary';\nimport { BrowserRouter");
    
    // Wrap Routes in ErrorBoundary and Suspense
    appContent = appContent.replace('<Routes>', '<ErrorBoundary>\n        <Suspense fallback={<div style={{height: \"100vh\", display: \"flex\", justifyContent: \"center\", alignItems: \"center\"}}><div className=\"spinner\"></div></div>}>\n          <Routes>');
    appContent = appContent.replace('</Routes>', '</Routes>\n        </Suspense>\n      </ErrorBoundary>');
    fs.writeFileSync(appPath, appContent, 'utf8');
    console.log("Injected React Suspense logic into App.tsx");
  } else {
    console.log("Suspense already present in App.tsx");
  }
}

console.log("Refactoring complete.");
