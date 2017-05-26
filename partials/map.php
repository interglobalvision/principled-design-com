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
  $grid_group = IGV_get_option('_igv_image_options','_igv_map_grid_group');

  if ($grid_group) {
    // randomize grid items array
    shuffle($grid_group);

    $grid_group = array_slice($grid_group, 0, 9);

    $group_length = count($grid_group);

    $i = 0;

    while($i < $group_length) {
      // for each item in group, make grid unit
      make_map_grid_unit($grid_group[$i]);

      $i++;
    }
  }
?>
</div>

<div id="lat-long"></div>
