<?php

require_once 'func.php';

if (isset($_POST)) {
	$data = file_get_contents('php://input');
	$json = json_decode($data, true);
	$conn = connect();

	$services = getServices($conn);
	$rates = getRates($conn);
	$rents = getRents($conn);

	foreach ($services as $key => &$service) {
		$service['rents'] = array_values(array_filter($rents, function ($rent) use ($service) {
			return $rent['service_id'] == $service['id'];
		}));

		$f = array_map(function ($rent) {
			return $rent['rate_id'];
		}, $service['rents']);
		$f = array_values(array_unique($f));

		$b = array_map(function ($v) use ($rates) {
			$r = array_filter($rates, function ($rate) use ($v) {
				return $rate['id'] == $v;
			});
			return count($r) > 0 ? array_shift($r) : [];
		}, $f);

		$service['rates'] = count($b[0]) > 0 ? $b : null;
	}


	if ($services) {
		echo json_encode($services);
	} else {
		echo '0';
	}
}

function getServices($conn)
{
	$sql = 'SELECT * FROM `services`';
	$result = mysqli_query($conn, $sql);

	if (mysqli_num_rows($result) > 0) {
		$out = array();
		while ($row = mysqli_fetch_assoc($result)) {
			array_push($out, $row);
		}
		return $out;
	} else {
		return null;
	}
}
function getRates($conn)
{
	$sql = 'SELECT * FROM `rates`';
	$result = mysqli_query($conn, $sql);

	if (mysqli_num_rows($result) > 0) {
		$out = array();
		while ($row = mysqli_fetch_assoc($result)) {
			array_push($out, $row);
		}
		return $out;
	} else {
		return null;
	}
}
function getRents($conn)
{
	$sql = 'SELECT * FROM `rents`';
	$result = mysqli_query($conn, $sql);

	if (mysqli_num_rows($result) > 0) {
		$out = array();
		while ($row = mysqli_fetch_assoc($result)) {
			array_push($out, $row);
		}
		return $out;
	} else {
		return null;
	}
}