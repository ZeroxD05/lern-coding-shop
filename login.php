<?php
session_start();
require_once "db.php";

// Wenn bereits eingeloggt, weiter zum Dashboard
if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
    header('Location: dashboard.php');
    exit();
}

// Formular verarbeiten
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $key = isset($_POST['key']) ? trim($_POST['key']) : '';

    if ($email === '' || $key === '') {
        $error = 'Bitte E‑Mail und Zugangsschlüssel eingeben.';
    } else {
        $stmt = $conn->prepare('SELECT id FROM users WHERE email = ? AND license_key = ? LIMIT 1');
        $stmt->bind_param('ss', $email, $key);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $result->num_rows === 1) {
            $_SESSION['loggedin'] = true;
            $_SESSION['email'] = $email;

            // Browser-seitigen state setzen und weiterleiten
            echo "<script>
                                sessionStorage.setItem('loggedIn', 'true');
                                window.location.href = 'dashboard.php';
                        </script>";
            exit();
        } else {
            $error = 'Ungültige E‑Mail oder Schlüssel.';
        }
    }
}

// Formular anzeigen
?>
<!doctype html>
<html lang="de">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Login</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <main style="max-width:420px;margin:40px auto;padding:16px;">
        <h1>Login</h1>
        <?php if (!empty($error)): ?>
            <div style="color:#b00;margin-bottom:12px;"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="post">
            <label for="email">E‑Mail</label><br>
            <input id="email" name="email" type="email" required style="width:100%;padding:8px;margin:6px 0;">

            <label for="key">Zugangsschlüssel</label><br>
            <input id="key" name="key" type="text" required style="width:100%;padding:8px;margin:6px 0;">

            <button type="submit" style="margin-top:8px;padding:8px 12px;">Anmelden</button>
        </form>

        <p style="margin-top:12px;"><a href="index.html">Zurück zur Startseite</a></p>
    </main>
</body>

</html>