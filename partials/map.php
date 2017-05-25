<div id="map">
  <div id="background-pattern-holder">
    <?php
      echo url_get_contents(get_template_directory_uri() . '/dist/static/patterns/pattern-1.svg');
      echo url_get_contents(get_template_directory_uri() . '/dist/static/patterns/pattern-2.svg');
      echo url_get_contents(get_template_directory_uri() . '/dist/static/patterns/pattern-3.svg');
      echo url_get_contents(get_template_directory_uri() . '/dist/static/patterns/pattern-4.svg');
      echo url_get_contents(get_template_directory_uri() . '/dist/static/patterns/pattern-5.svg');
    ?>
  </div>

<?php
  global $grid_group, $group_length, $used_items;
  $grid_group = IGV_get_option('_igv_image_options','_igv_map_grid_group');
  $group_length = count($grid_group);
  $used_items = array();

  function make_map_grid($item) {
    global $grid_group, $used_items;

    // push $item (group index) into used items array
    array_push($used_items, $item);

    // shorten the variable name
    $item = $grid_group[$item];
?>
<div class="map-block">
  <div class="map-block-content">
    <?php
      if (empty($item['mp4'])) {
        // just show the image
        echo wp_get_attachment_image($item['image_id'], 'map');
      } else if (!empty($item['mp4']) && !empty($item['webm'])) {
        // show the video
        $poster = wp_get_attachment_image_src($item['image_id'], 'map');
    ?>
    <video autoplay muted poster="<?php echo $poster[0]; ?>">
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
      }
    ?>
  </div>
</div>
<?php
  }

  function call_map_grid() {
    global $grid_group, $group_length, $used_items;

    // get a random index from grid group
    $item = mt_rand(0, $group_length - 1);

    if (!in_array($item, $used_items) && !empty($grid_group[$item]['image_id'])) {
      // item index is unused, and has image
      // make the grid item
      make_map_grid($item);
    } else {
      // get a new item index and try again
      call_map_grid();
    }
  }

  for ($i = 0; $i < $group_length; $i++) {
    // for each item in group, make grid
    call_map_grid();
  }
?>
</div>

<div id="lat-long">
  37° 47' 12.484", -122° 24' 0.9223"
</div>
