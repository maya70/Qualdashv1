<?php
$log = $_POST['sessionLog'];
$file = './session-logs.txt';
 $existing = file_get_contents($file);
 $jsonLog = json_encode($log);
 $output = $existing . $jsonLog; 
 
 $ret = file_put_contents($file, $output);
 echo($ret);
?>
