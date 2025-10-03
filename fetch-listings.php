<?php
header('Content-Type: application/json');
$con = new mysqli("localhost", "root", "", "college_project");

// Join with registration to get seller name
$sql = "SELECT l.*, r.username as seller_name 
        FROM listings l 
        JOIN registration r ON l.user_id = r.id 
        ORDER BY l.posted_at DESC";

$result = $con->query($sql);
$listings = [];
while ($row = $result->fetch_assoc()) {
    $listings[] = $row;
}
echo json_encode($listings);
$con->close();
?>