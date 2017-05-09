<?php
get_header();
?>
<main id="main-content-container">
  <div id="main-content">

<?php
$args = array(
  'post_type'      => array( 'page' ),
  'posts_per_page' => '-1',
);

$query = new WP_Query( $args );

if ( $query->have_posts() ) {
  while ( $query->have_posts() ) {
    $query->the_post();
?>

        <article <?php post_class('page-content'); ?> id="post-<?php the_ID(); ?>" data-slug="<?php echo $post->post_name; ?>">

          <?php the_content(); ?>

        </article>

<?php
  }
}

wp_reset_postdata();
?>

  </div>
</main>
<?php
get_footer();
?>
