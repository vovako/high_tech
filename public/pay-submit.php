<?php

require_once 'func.php';

if (isset($_POST)) {
	$data = file_get_contents('php://input');
	$json = json_decode($data, true);
	$conn = connect();

	$name = $json['name'];
	$email = $json['email'];
	$phone = $json['phone'];
	$service_id = $json['service_id'];
	$rent_id = $json['rent_id'] ?? 'NULL';
	$rate_id = $json['rate_id'] ?? 'NULL';

	$sql = "INSERT INTO `orders` (`id`, `name`, `email`, `phone`, `service_id`, `rent_id`, `rate_id`) VALUES (NULL, '$name', '$email', '$phone', $service_id, $rent_id, $rate_id)";
	$success = mysqli_query($conn, $sql);
	if ($success) {
		$resp['msg'] = 'success';
		$resp['error'] = null;
		echo json_encode($resp);
	} else {
		echo null;
	}
}