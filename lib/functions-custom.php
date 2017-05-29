<?php
require "dbip-client.class.php";

// Custom functions (like special queries, etc)

function get_client_geolocation() {
  $api_key = IGV_get_option('_igv_site_options', '_igv_dbip_api_key');

  if ($api_key) {
    $dbip = new DBIP_Client($api_key);
    $client_ip = get_client_ip();

    return $dbip->Get_Address_Info($client_ip);
  } else {
    return false;
  }

}

// Return a string of the client ip
function get_client_ip() {
  if (!empty( $_SERVER['HTTP_CLIENT_IP'])) { //check ip from share internet

    $ip = $_SERVER['HTTP_CLIENT_IP'];

  } elseif ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) { //to check ip is pass from proxy

    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];

  } else {

    $ip = $_SERVER['REMOTE_ADDR'];

  }

  return apply_filters( 'wpb_get_ip', $ip );
}

function prepare_grid_data_array($array) {

    shuffle($array);

    return array_slice($array, 0, 9);

}

function make_map_grid_unit($item) {
?>
<div class="map-block">
  <div class="map-block-content">
    <?php render_grid_unit_visuals($item); ?>
  </div>
</div>
<?php
}

function render_grid_unit_visuals($item) {
  if (!empty($item['image_id'])) {
      if (!empty($item['mp4']) && !empty($item['webm'])) {
        // show the video
        $poster = wp_get_attachment_image_src($item['image_id'], 'map');
  ?>
  <video autoplay muted loop poster="<?php echo $poster[0]; ?>">
    <source src="<?php echo $item['mp4']; ?>" type="video/mp4" />
    <source src="<?php echo $item['webm']; ?>" type="video/webm" />
  <?php
        if (!empty($item['ovg'])) {
  ?>
    <source src="<?php echo $item['ovg']; ?>" type="video/ogv" />
  <?php
        }
  ?>
  </video>
  <?php
      } else {
        // just show the image
        echo wp_get_attachment_image($item['image_id'], 'map');
      }
    }
}