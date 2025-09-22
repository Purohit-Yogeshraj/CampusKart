<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$username = $_POST['username'] ?? '';
$gender = $_POST['gender'] ?? '';
$dob = $_POST['dob'] ?? '';
$email = $_POST['email'] ?? '';
$contact = $_POST['contact'] ?? '';
$pass1 = $_POST['pass1'] ?? '';
$pass2 = $_POST['pass2'] ?? '';

// Validate password match
if ($pass1 !== $pass2) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
    exit;
}

// Database connection — $con NOT $conn
$con = new mysqli('localhost', 'root', '', 'college_project');

if ($con->connect_error) {
    die('Connection failed: ' . $con->connect_error);
} else {
    // Remove extra comma in VALUES (..., ?, ?, ?, ?, ?, ?, ?) — was 8 placeholders for 7 values
    $stmt = $con->prepare("INSERT INTO registration(username, gender, dob, email, contact, pass1, pass2) VALUES(?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssisiss", $username, $gender, $dob, $email, $contact, $pass1, $pass2);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registration successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $stmt->error]);
    }

    $stmt->close();
    $con->close();
}
?>