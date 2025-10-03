<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Please login first']);
    exit;
}

// Validate text fields
$title = $_POST['title'] ?? '';
$category = $_POST['category'] ?? '';
$price = $_POST['price'] ?? '';
$location = $_POST['location'] ?? '';
$description = $_POST['description'] ?? '';
$phone = $_POST['phone'] ?? '';

if (!$title || !$category || !$price || !$location || !$description || !$phone) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// Handle image upload
$imagePath = null;
if (!empty($_FILES['image']['name'])) {
    $uploadDir = 'uploads/';
    $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
    $targetPath = $uploadDir . $fileName;

    $allowedTypes = ['jpg', 'jpeg', 'png'];
    $fileExt = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));

    if (!in_array($fileExt, $allowedTypes)) {
        echo json_encode(['success' => false, 'message' => 'Only JPG/PNG images allowed']);
        exit;
    }

    if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
        echo json_encode(['success' => false, 'message' => 'Image must be under 5MB']);
        exit;
    }

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        echo json_encode(['success' => false, 'message' => 'Image upload failed']);
        exit;
    }
    $imagePath = $targetPath;
}

// Save to DB
$con = new mysqli("localhost", "root", "", "college_project");
if ($con->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
    exit;
}

$stmt = $con->prepare("INSERT INTO listings (user_id, title, category, price, location, description, phone, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("isssdsss", $_SESSION['user_id'], $title, $category, $price, $location, $description, $phone, $imagePath);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Ad posted successfully!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to post ad. Try again.']);
}

$stmt->close();
$con->close();
?>