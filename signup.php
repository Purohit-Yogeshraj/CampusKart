<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$username = $_POST['username'] ?? '';
$gender = $_POST['gender'] ?? '';
$dob = $_POST['dob'] ?? '';
$email = $_POST['email'] ?? '';
$contact = $_POST['contact'] ?? '';
$pass1 = $_POST['pass1'] ?? '';
$pass2 = $_POST['pass2'] ?? '';

if ($pass1 !== $pass2) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match']);
    exit;
}

$con = new mysqli('localhost', 'root', '', 'college_project');
if ($con->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

$check = $con->prepare("SELECT id FROM registration WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already registered']);
    $check->close();
    $con->close();
    exit;
}
$check->close();

$stmt = $con->prepare("INSERT INTO registration(username, gender, dob, email, contact, pass1, pass2) VALUES(?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssss", $username, $gender, $dob, $email, $contact, $pass1, $pass2);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Registration successful']);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed. Try again.']);
}

$stmt->close();
$con->close();
?>