<?php
/**
 * Deploy Script for Monstter Site on UOL Hosting
 * Access: https://monstter.com.br/deploy.php?token=YOUR_SECRET_TOKEN
 */

// Security token (change this to something secure)
$SECRET_TOKEN = 'monstter-deploy-2026';
$token = $_GET['token'] ?? '';

if ($token !== $SECRET_TOKEN) {
    http_response_code(403);
    die('Unauthorized');
}

// Set execution time limit
set_time_limit(300);

// Get the project root
$projectRoot = dirname(__FILE__);
$publicHtmlPath = dirname($projectRoot) . '/public_html';
$docsPath = $projectRoot . '/docs';

echo "<!DOCTYPE html>
<html>
<head>
    <title>Monstter Deploy</title>
    <style>
        body { font-family: monospace; margin: 20px; background: #f5f5f5; }
        .container { background: white; padding: 20px; border-radius: 5px; max-width: 800px; margin: 0 auto; }
        .log { background: #222; color: #0f0; padding: 15px; border-radius: 3px; margin: 10px 0; min-height: 200px; overflow-y: auto; }
        .success { color: #0f0; }
        .error { color: #f00; }
        .info { color: #0ff; }
    </style>
</head>
<body>
<div class='container'>
    <h1>🚀 Monstter Site Deploy</h1>
    <div class='log'>";

function log_message($msg, $type = 'info') {
    $class = $type === 'error' ? 'error' : ($type === 'success' ? 'success' : 'info');
    echo "<div class='$class'>[" . date('H:i:s') . "] $msg</div>";
    flush();
}

try {
    log_message('Starting deployment...', 'info');
    
    // Step 1: Pull latest changes from Git
    log_message('Pulling latest changes from Git...', 'info');
    $output = shell_exec("cd $projectRoot && git pull origin main 2>&1");
    if (strpos($output, 'error') !== false || strpos($output, 'fatal') !== false) {
        log_message('Git pull failed: ' . $output, 'error');
    } else {
        log_message('Git pull successful', 'success');
    }
    
    // Step 2: Install dependencies
    log_message('Installing dependencies with pnpm...', 'info');
    $output = shell_exec("cd $projectRoot && pnpm install 2>&1");
    if (strpos($output, 'error') !== false) {
        log_message('pnpm install had issues: ' . substr($output, -200), 'error');
    } else {
        log_message('Dependencies installed', 'success');
    }
    
    // Step 3: Build the project
    log_message('Building the project...', 'info');
    $output = shell_exec("cd $projectRoot && pnpm build 2>&1");
    if (strpos($output, 'error') !== false) {
        log_message('Build failed: ' . $output, 'error');
    } else {
        log_message('Build completed successfully', 'success');
    }
    
    // Step 4: Copy files to public_html
    log_message('Copying files to public_html...', 'info');
    
    if (!is_dir($docsPath)) {
        throw new Exception("Docs directory not found at: $docsPath");
    }
    
    // Clear public_html
    if (is_dir($publicHtmlPath)) {
        shell_exec("rm -rf $publicHtmlPath/*");
        log_message('Cleared public_html directory', 'info');
    } else {
        mkdir($publicHtmlPath, 0755, true);
        log_message('Created public_html directory', 'info');
    }
    
    // Copy files
    $output = shell_exec("cp -r $docsPath/* $publicHtmlPath/ 2>&1");
    if (!empty($output) && strpos($output, 'error') !== false) {
        log_message('Copy had issues: ' . $output, 'error');
    } else {
        log_message('Files copied to public_html', 'success');
    }
    
    // Step 5: Set permissions
    log_message('Setting permissions...', 'info');
    shell_exec("chmod -R 755 $publicHtmlPath 2>&1");
    shell_exec("find $publicHtmlPath -type f -exec chmod 644 {} \\; 2>&1");
    log_message('Permissions set', 'success');
    
    // Step 6: Verify deployment
    log_message('Verifying deployment...', 'info');
    $indexFile = $publicHtmlPath . '/index.html';
    if (file_exists($indexFile)) {
        $size = filesize($indexFile);
        log_message("✅ Deployment successful! index.html found ($size bytes)", 'success');
    } else {
        log_message('⚠️ Warning: index.html not found in public_html', 'error');
    }
    
    log_message('Deployment completed!', 'success');
    
} catch (Exception $e) {
    log_message('Error: ' . $e->getMessage(), 'error');
}

echo "    </div>
    <p>
        <a href='https://monstter.com.br' style='color: #0ff; text-decoration: none;'>
            ➜ Visit Site
        </a>
    </p>
</div>
</body>
</html>";
?>
