<?php
require_once "db.php";
require_once "create-key.php";
require_once "send-mail.php";

$data = json_decode(file_get_contents("php://input"), true);

if ($data['event_type'] == "PAYMENT.CAPTURE.COMPLETED") {

    $email = $data['resource']['payer']['email_address'];

    $key = generateKey();

    $stmt = $conn->prepare("INSERT INTO users (email, license_key) VALUES (?, ?)");
    $stmt->bind_param("ss", $email, $key);
    $stmt->execute();

    sendMail($email, $key);
}
