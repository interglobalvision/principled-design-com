<?php

// Custom functions (like special queries, etc)

function make_map_grid_unit($item) {
?>
<div class="map-block">
  <div class="map-block-content">
    <?php
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
    ?>
  </div>
</div>
<?php
}
