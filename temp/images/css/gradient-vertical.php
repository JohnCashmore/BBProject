<?php

$fromColor = isset($_GET['from']) ? $_GET['from'] : '#ffffff';
$toColor = isset($_GET['to']) ? $_GET['to'] : '#000000';
$colorStop1 = isset($_GET['fromStop']) ? $_GET['fromStop'] : '0';
$colorStop2 = isset($_GET['toStop']) ? $_GET['toStop'] : '100';

header('Content-type: image/svg+xml; charset=utf-8');

echo '<?xml version="1.0"?>';

?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="100%">
    <defs>
        <linearGradient id="linear-gradient" x1="<?php echo $colorStop1; ?>%" y1="0%" x2="0%" y2="<?php echo $colorStop2; ?>%">
            <stop offset="0%" stop-color="#<?php echo $fromColor; ?>" stop-opacity="1"/>
            <stop offset="100%" stop-color="#<?php echo $toColor; ?>" stop-opacity="1"/>
        </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#linear-gradient)"/>
</svg>
