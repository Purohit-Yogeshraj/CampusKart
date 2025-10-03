<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Login required']);
    exit;
}

$id = $_GET['id'] ?? 0;
$con = new mysqli("localhost", "root", "", "college_project");

// Verify the ad belongs to the user
$stmt = $con->prepare("SELECT id FROM listings WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Ad not found or access denied']);
} else {
    $del = $con->prepare("DELETE FROM listings WHERE id = ?");
    $del->bind_param("i", $id);
    if ($del->execute()) {
        echo json_encode(['success' => true, 'message' => 'Ad deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete ad']);
    }
    $del->close();
}

$stmt->close();
$con->close();
?>