<?php
get_header();
?>
<main id="main-content-container">
  <div id="main-content">

<?php
$grid_group = IGV_get_option('_igv_image_options','_igv_map_grid_group');

if ($grid_group) {
  $grid_group = prepare_grid_data_array($grid_group);
  $grid_group_length = count($grid_group);
}

$args = array(
  'post_type'      => array( 'page' ),
  'posts_per_page' => '-1',
  'orderby'        => 'menu_order',
  'order'          => 'ASC',
);

$query = new WP_Query( $args );
$grid_index = 0;

if ( $query->have_posts() ) {

  $post_count = $query->post_count;
  $post_index = 0;

  while ( $query->have_posts() ) {
    $query->the_post();
?>

        <article <?php post_class('page-content'); ?> id="post-<?php the_ID(); ?>" data-slug="<?php echo $post->post_name; ?>">

          <h3 class="font-calibre-bold margin-bottom-small mobile-only"><?php the_title(); ?></h3>

          <?php the_content(); ?>

        </article>

<?php
  $post_index++;

  if ($grid_group) {
    if ($grid_index < $grid_group_length && $post_index < $post_count) {
?>
        <div class="mobile-visual mobile-only">
          <?php render_grid_unit_visuals($grid_group[$grid_index]); ?>
        </div>
<?php
    }
  }

  $grid_index++;
  }
}

wp_reset_postdata();
?>

  </div>
</main>
<?php
get_footer();
?>
