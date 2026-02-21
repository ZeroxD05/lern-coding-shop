<?php
session_start();

if (!isset($_SESSION['loggedin'])) {
    header("Location: login.php");
    exit();
}
?>

<h1>Willkommen im Dashboard</h1>
<a href="logout.php">Logout</a>