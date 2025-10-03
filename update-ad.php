<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Login required']);
    exit;
}

$id = $_GET['id'] ?? 0;
$con = new mysqli("localhost", "root", "", "college_project");

if ($con->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

// Verify ownership
$stmt = $con->prepare("SELECT image_path FROM listings WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}
$oldImage = $result->fetch_assoc()['image_path'];
$stmt->close();

// Handle image
$imagePath = $oldImage;
if (!empty($_FILES['image']['name'])) {
    $uploadDir = 'uploads/';
    $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
    $targetPath = $uploadDir . $fileName;

    $allowedTypes = ['jpg', 'jpeg', 'png'];
    $fileExt = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));
    if (!in_array($fileExt, $allowedTypes) || $_FILES['image']['size'] > 5*1024*1024) {
        echo json_encode(['success' => false, 'message' => 'Invalid image']);
        exit;
    }

    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        $imagePath = $targetPath;
        if ($oldImage && file_exists($oldImage)) {
            unlink($oldImage);
        }
    }
}

// ✅ CORRECTED: 9 variables total (7 SET + 2 WHERE)
$update = $con->prepare("UPDATE listings SET title=?, category=?, price=?, phone=?, location=?, description=?, image_path=? WHERE id=? AND user_id=?");

// Type string: s=string, d=double/float, i=integer
// title (s), category (s), price (d), phone (s), location (s), description (s), image_path (s), id (i), user_id (i)
$update->bind_param(
    "ssdssssii",  // ✅ 9 characters: 7 strings + 1 double + 2 integers
    $_POST['title'],
    $_POST['category'],
    $_POST['price'],
    $_POST['phone'],
    $_POST['location'],
    $_POST['description'],
    $imagePath,
    $id,
    $_SESSION['user_id']
);

if ($update->execute()) {
    echo json_encode(['success' => true, 'message' => 'Ad updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Update failed: ' . $update->error]);
}

$update->close();
$con->close();
?>