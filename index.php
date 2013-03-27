<?php

	$client = "Client Name - Project";

?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
		<meta name="robots" content="noindex, nofollow" />
		<title><?php echo $client ?> - Prototype HTML</title>

		<!-- Icons -->
		<link rel="icon" href="bb/favicon.ico" type="image/x-icon" />
		<link rel="shortcut icon" href="bb/favicon.ico" type="image/x-icon" />

		<!-- Fonts.com -->
		<link rel="stylesheet" href="http://fast.fonts.com/cssapi/ccdd0b94-9df3-4cbd-bbed-eb52122f887c.css" />

		<!-- Javascript -->
		<script src="bb/modernizr.js"></script>
		<script src="bb/selectivizr.js"></script>

		<!-- CSS -->
		<link rel="stylesheet" href="bb/style.css" />

	</head>
	<body>
		<?php
		function removeExt($filename) {
			$file = substr($filename, 0,strrpos($filename,'.'));
			return $file;
		}
		if ($handle = opendir('.')) {
			$filelist = "";
			$ziplist = "";
			while (false !== ($file = readdir($handle))){
				$class = "version";
				if(strtolower(substr(removeExt($file), -2)) === "so"){
					$class = "signed-off";
				}
				if ( $file != "." && $file != ".." && strpos($file, ".html") !== false && (strpos($_SERVER["SERVER_NAME"], ".local") !== false || strpos($file, "-hidden") == false)){
					$filelist .= '<li class="'.$class.'"><a href="'.$file.'">'.$file.'</a> <b class="lastedit">'.date("F d Y", filemtime($file)).'</b></li>';
				}else if ( $file != "." && $file != ".." && strpos($file, ".zip") !== false ){
					$ziplist .= '<li class="'.$class.'"><a href="'.$file.'">'.$file.'</a> <b class="lastedit">'.date("F d Y", filemtime($file)).'</b></li>';
				}
			}
			closedir($handle);
		}
		
		?>
		<div id="page">
			<!-- Header  -->
			<header role="banner">
				<a href="#" class="logo"><img src="bb/bb_logo.png" alt="Building Blocks" /></a>
				<h1><?php echo $client ?> - Prototype HTML</h1>
			</header>
			<!-- /Header -->
			<!-- Main Content -->
			<div id="main" role="main">
				<?php if($filelist != ''){ ?>
				<ul class="file-list">
					<?php echo $filelist ?>
				</ul>
				<?php } ?>
				<?php if($ziplist != ''){ ?>
				<h2>Compiled HTML</h2>
				<ul class="file-list">
					<?php echo $ziplist ?>
				</ul>
				<?php } ?>
				<h2>Responsive Layouts <span>(Test prototype at multiple break points)</span></h2>
				<p class="responsive-link"><a href="responsive.php">Responsive Design Testing Tool</a> <b>The responsive design testing tool is best used in <a href="http://www.google.com/chrome" target="_blank">Google Chrome</a> on a desktop</b></p>
			</div>
			<!-- /Main Content -->
			<!-- Footer -->
			<footer role="contentinfo">
				<p>&copy; Copyright Building Blocks Ltd <?php echo date('Y'); ?></p>
			</footer>
			<!-- /Footer -->
		</div>
	</body>
</html>