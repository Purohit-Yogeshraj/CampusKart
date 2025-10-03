<?php
session_start();
session_destroy(); // Destroys all session data
header("Location: index.php"); // Redirect to homepage
exit;
?>