<?php
get_header();
?>

<svg xmlns="http://www.w3.org/2000/svg" class="background-shape" viewBox="0 0 910.54 912.51"><path d="M303.55 911.84H.61V608.1l302.94 303.74zM.97 304.95V1.21h302.94L.97 304.95zM606.89 304.95H303.95V1.21l302.94 303.74zM303.95 608.7V304.96h302.94L303.95 608.7zM910 304.42c-.19-84-67.9-153.12-151.41-153.12s-151.17 69.12-151.36 153.12zM303.32 607.42c-.19-84-67.9-153.12-151.41-153.12S.7 523.42.5 607.42zM909 607.42c-.19-84-67.9-153.12-151.41-153.12s-151.17 69.12-151.37 153.12zM908.54 608.39c-85 .19-152.71 68.08-152.71 151.81S823.54 911.81 908.54 912z"/><path d="M303.86 607.42c.19 85 67.9 153.12 151.41 153.12s151.21-68.12 151.41-153.12z"/></svg>

<?php /*
<main id="main-content">
  <?php get_template_part('partials/map'); ?>

<?php
/*
  <section id="posts">
    <div class="container">
      <div class="grid-row">

<?php
if( have_posts() ) {
  while( have_posts() ) {
    the_post();
?>

        <article <?php post_class('grid-item item-s-12'); ?> id="post-<?php the_ID(); ?>">

          <a href="<?php the_permalink() ?>"><?php the_title(); ?></a>

          <?php the_content(); ?>

        </article>

<?php
  }
} else {
?>
        <article class="u-alert grid-item item-s-12"><?php _e('Sorry, no posts matched your criteria :{'); ?></article>
<?php
} ?>

      </div>
    </div>
  </section>

  <?php get_template_part('partials/pagination'); ?>
 */
?>

</main>
*/ ?>

<?php
get_footer();
?>
