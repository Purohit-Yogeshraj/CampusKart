<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: auth.html");
    exit();
}
// Fetch user info
$con = new mysqli("localhost", "root", "", "college_project");
$user = $con->query("SELECT * FROM registration WHERE id = {$_SESSION['user_id']}")->fetch_assoc();
$con->close();
?>