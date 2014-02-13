<?php

	$client = "Client Name - Project";

?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="description" content="Responsive design testing for <?php echo $client; ?>">
	<title>Responsive Design Testing: <?php echo $client; ?></title>

	<!-- Icons -->
	<link rel="icon" href="bb/favicon.ico" type="image/x-icon" />
	<link rel="shortcut icon" href="bb/favicon.ico" type="image/x-icon" />

	<!-- Javascript -->
	<script src="bb/modernizr.js"></script>
	<script src="bb/selectivizr.js"></script>

	<!-- CSS -->
	<link rel="stylesheet" href="bb/style.css" />

</head>
<body class="responsive" id="container">
	<?php
	function removeExt($filename) {
		$file = substr($filename, 0,strrpos($filename,'.'));
		return $file;
	}
	$actualLink = "http://$_SERVER[HTTP_HOST]";
	if ($handle = opendir('.')) {
		$filelist = "";
		while (false !== ($file = readdir($handle))){
			if ( $file != "." && $file != ".." && strpos($file, ".html") !== false && (strpos($_SERVER["SERVER_NAME"], ".local") !== false || strpos($file, "-hidden") == false)){
				$filelist .= '<option value="'.$actualLink.'/'.$file.'">'.$file.' (Last Edited: '.date("F d Y", filemtime($file)).')</option>';
			}
		}
		closedir($handle);
	}
	?>
	<p><a href="index.php">&larr; Back to file list</a></p>
	<div id="url">
		<?php if($filelist != ''){ ?>
		<select id="files">
			<option value="">Select a file to test&hellip;</option>
			<?php echo $filelist ?>
		</select>
		<div id="options">
			<label for="normal"><input id="normal" type="radio" name="option" value="1" checked>Width only</label>
			<label for="accurate"><input id="accurate" type="radio" name="option" value="2">Device sizes</label>
		</div>
		<?php }else{ ?>
		<p>No files</p>
		<?php } ?>
	</div>
	<div id="frames" class="widthOnly">
		<div id="inner">
			<div id="f1" class="frame">
				<h2>240<b> x 320</b> <span class="small">(small phone)</span> <img src="bb/loader.gif" /></h2>
				<iframe sandbox="allow-same-origin allow-forms allow-scripts" seamless width="255" height="320"></iframe>
			</div>
			<div id="f2" class="frame">
				<h2>320<b> x 480</b> <span class="small">(iPhone)</span> <img src="bb/loader.gif" /></h2>
				<iframe sandbox="allow-same-origin allow-forms allow-scripts" seamless width="335" height="480"></iframe>
			</div>
			<div id="f3" class="frame">
				<h2>480<b> x 640</b> <span class="small">(small tablet)</span> <img src="bb/loader.gif" /></h2>
				<iframe sandbox="allow-same-origin allow-forms allow-scripts" seamless width="495" height="640"></iframe>
			</div>
			<div id="f4" class="frame">
				<h2>600<b> x 800</b> <span class="small">(small tablet)</span> <img src="bb/loader.gif" /></h2>
				<iframe sandbox="allow-same-origin allow-forms allow-scripts" seamless width="615" height="800"></iframe>
			</div>
			<div id="f5" class="frame">
				<h2>768<b> x 1024</b> <span class="small">(iPad - Portrait)</span> <img src="bb/loader.gif" /></h2>
				<iframe sandbox="allow-same-origin allow-forms allow-scripts" seamless width="783" height="1024"></iframe>
			</div>
			<div id="f6" class="frame">
				<h2>1024<b> x 768</b> <span class="small">(iPad - Landscape)</span> <img src="bb/loader.gif" /></h2>
				<iframe sandbox="allow-same-origin allow-forms allow-scripts" seamless width="1039" height="768"></iframe>
			</div>
		</div>
	</div>

	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
	<script src="bb/responsive.js"></script>

</body>
</html>
