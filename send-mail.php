<?php
function sendMail($email, $key)
{
    $subject = "Dein Zugang zum Dashboard";
    $message = "
    Hallo,

    hier ist dein persönlicher Zugangsschlüssel:

    $key

    Login:
    https://deinedomain.de/login.php
    ";

    $headers = "From: noreply@deinedomain.de";

    mail($email, $subject, $message, $headers);
}
