<?php
$hex = isset($_GET['hex']) ? $_GET['hex'] : 'ffffff';
$alpha = isset($_GET['alpha']) ? $_GET['alpha'] : '0';

define('COLORDIR', 'colors/');

$dir = substr(COLORDIR,0,strlen(COLORDIR)-1);
if(!is_writable($dir)){
	die("The directory '$dir' either doesn't exist or isn't writable.");
}

// Send headers
header('Content-type: image/png');
header('Expires: Sun, 1 Jan 2026 00:00:00 GMT');
header('Cache-control: max-age=2903040000');

if(strlen($hex) == 3){
	$r = hexdec(substr($hex,0,1).substr($hex,0,1));
	$g = hexdec(substr($hex,1,1).substr($hex,1,1));
	$b = hexdec(substr($hex,2,1).substr($hex,2,1));
}else{
	$r = hexdec(substr($hex,0,2));
	$g = hexdec(substr($hex,2,2));
	$b = hexdec(substr($hex,4,2));
}

$a = round(127 - ($alpha * 127));

// Replace default parameters with user input
$p = $_GET + array(
    'r' => $r,
    'g' => $g,
    'b' => $b,
    'a' => $a
);

// Does it already exist?
$filepath = COLORDIR . "color_r{$r}_g{$g}_b{$b}_a$a.png";


if(file_exists($filepath)){

	if (array_key_exists("HTTP_IF_MODIFIED_SINCE",$_SERVER)) {
		// We don't need to check if it actually was modified since then as it never changes.
		header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($filepath)).' GMT', true, 304);
		exit();
	}else{
		header('Last-Modified: '.gmdate('D, d M Y H:i:s', filemtime($filepath)).' GMT', true, 200);
        header('Content-Length: '.filesize($filepath));
		echo file_get_contents($filepath);
		exit();
	}
}else{


	// Make sure they are within limits
	// (colors: 0-255, alpha: 0-127)
	array_walk($p, function (&$val, $key) {
	    $val = min(max(0, $val), $key == 'a' ? 127 : 255);
	});

	// Create image
	$img = imagecreatetruecolor(5, 5)
		or die('Cannot Initialize new GD image stream');

	// Use full alpha channel information
	imagesavealpha($img, true);

	// Fill image
	$color = imagecolorallocatealpha($img,
	    $p['r'],
	    $p['g'],
	    $p['b'],
	    $p['a']);
	imagefill($img, 0, 0, $color);

	// Output result
	imagepng($img, $filepath, 9, NULL);
	imagepng($img);
	imagedestroy($img);

}
?>