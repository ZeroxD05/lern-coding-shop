if($result->num_rows === 1){
$_SESSION['loggedin'] = true;

echo "<script>
    sessionStorage.setItem('loggedIn', 'true');
    window.location.href = 'index.html';
</script>";
exit();
}